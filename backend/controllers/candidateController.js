const bcrypt = require("bcryptjs");
const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const candidateController = {
  // GET /api/recruitment/candidates
  async getAll(req, res, next) {
    try {
      const { vacancyId, status, search } = req.query;

      let query = `
                SELECT c.id, c.vacancy_id, c.full_name, c.email, 
                       c.phone, c.resume_url, c.status, c.applied_at,
                       v.title as vacancy_title 
                FROM candidates c
                LEFT JOIN vacancies v ON c.vacancy_id = v.id
                WHERE 1=1
            `;
      const params = [];

      if (vacancyId) {
        query += " AND c.vacancy_id = ?";
        params.push(vacancyId);
      }
      if (status) {
        query += " AND c.status = ?";
        params.push(status);
      }
      if (search) {
        query += " AND (c.full_name LIKE ? OR c.email LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      query += " ORDER BY c.applied_at DESC";

      const [candidates] = await db.query(query, params);
      res.json(toCamelCase(candidates));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/recruitment/candidates/:id
  async getById(req, res, next) {
    try {
      const [candidates] = await db.query(
        `SELECT c.*, v.title as vacancy_title 
                 FROM candidates c
                 LEFT JOIN vacancies v ON c.vacancy_id = v.id
                 WHERE c.id = ?`,
        [req.params.id],
      );

      if (candidates.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy ứng viên",
        });
      }

      res.json(toCamelCase(candidates[0]));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/recruitment/candidates
  // Public route for application
  async create(req, res, next) {
    try {
      const { fullName, email, phone, vacancyId, resumeUrl, notes } = req.body;

      if (!fullName || !email) {
        return res.status(400).json({
          message: "Họ tên và email là bắt buộc",
        });
      }

      const [result] = await db.query(
        `INSERT INTO candidates (
                    full_name, email, phone, vacancy_id, 
                    resume_url, notes, status, applied_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'new', NOW())`,
        [fullName, email, phone, vacancyId, resumeUrl, notes],
      );

      const [newCandidate] = await db.query(
        "SELECT * FROM candidates WHERE id = ?",
        [result.insertId],
      );

      if (!newCandidate || newCandidate.length === 0) {
        return res.status(500).json({ message: 'Lỗi hệ thống: Không thể lấy thông tin ứng viên vừa tạo' });
      }

      res.status(201).json(toCamelCase(newCandidate[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/recruitment/candidates/:id
  // HR only - update status or notes
  async update(req, res, next) {
    try {
      const updates = req.body;
      const fieldMapping = {
        fullName: "full_name",
        email: "email",
        phone: "phone",
        vacancyId: "vacancy_id",
        resumeUrl: "resume_url",
        status: "status",
        notes: "notes",
      };

      const updateFields = [];
      const params = [];

      Object.keys(updates).forEach((key) => {
        if (fieldMapping[key]) {
          updateFields.push(`${fieldMapping[key]} = ?`);
          params.push(updates[key]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          message: "Không có trường nào để cập nhật",
        });
      }

      params.push(req.params.id);

      await db.query(
        `UPDATE candidates SET ${updateFields.join(", ")} WHERE id = ?`,
        params,
      );

      const [updatedCandidate] = await db.query(
        "SELECT * FROM candidates WHERE id = ?",
        [req.params.id],
      );

      if (updatedCandidate.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy ứng viên",
        });
      }

      res.json(toCamelCase(updatedCandidate[0]));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/recruitment/candidates/:id
  async delete(req, res, next) {
    try {
      const [result] = await db.query("DELETE FROM candidates WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy ứng viên",
        });
      }

      res.json({ message: "Xóa ứng viên thành công" });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/recruitment/candidates/:id/status
  async updateStatus(req, res, next) {
    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      const { status } = req.body;
      const candidateId = req.params.id;

      if (!status) {
        await conn.rollback();
        return res.status(400).json({
          message: "Trạng thái là bắt buộc",
        });
      }

      // 1. Lấy thông tin ứng viên và kỳ tuyển dụng liên quan để onboarding
      const [candidates] = await conn.query(
        `SELECT c.*, v.department_id, v.job_title_id
         FROM candidates c
         JOIN vacancies v ON c.vacancy_id = v.id
         WHERE c.id = ?`,
        [candidateId]
      );

      if (candidates.length === 0) {
        await conn.rollback();
        return res.status(404).json({
          message: "Không tìm thấy ứng viên hoặc thông tin kỳ tuyển dụng liên quan",
        });
      }

      const candidate = candidates[0];

      // 2. Nếu chuyển trạng thái sang 'hired', thực hiện tự động tạo tài khoản và hồ sơ nhân viên
      if (status === 'hired' && candidate.status !== 'hired') {
        const [existingUsers] = await conn.query("SELECT id FROM users WHERE username = ?", [candidate.email]);
        
        if (existingUsers.length === 0) {
          const hashedPassword = await bcrypt.hash("123456", 10);
          const [userResult] = await conn.query(
            "INSERT INTO users (username, password, full_name, role_id, status) VALUES (?, ?, ?, 4, 'active')",
            [candidate.email, hashedPassword, candidate.full_name]
          );

          const userId = userResult.insertId;

          await conn.query(
            `INSERT INTO employees (
              user_id, full_name, personal_email, phone, 
              department_id, job_title_id, hire_date, status, profile_status
            ) VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'active', 'pending')`,
            [
              userId,
              candidate.full_name,
              candidate.email,
              candidate.phone,
              candidate.department_id,
              candidate.job_title_id
            ]
          );
        }
      }

      // 3. Cập nhật trạng thái ứng viên
      await conn.query("UPDATE candidates SET status = ? WHERE id = ?", [status, candidateId]);

      await conn.commit();

      const [updatedCandidate] = await db.query(
        "SELECT * FROM candidates WHERE id = ?",
        [candidateId]
      );

      res.json(toCamelCase(updatedCandidate[0]));
    } catch (error) {
      if (conn) await conn.rollback();
      next(error);
    } finally {
      if (conn) conn.release();
    }
  },
};

module.exports = candidateController;
