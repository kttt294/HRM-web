const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const leaveController = {
  // GET /api/leaves
  async getAll(req, res, next) {
    try {
      const { status, leaveType, employeeId } = req.query;

      let query = `
                SELECT lr.*, e.full_name as employee_name 
                FROM leave_requests lr
                LEFT JOIN employees e ON lr.employee_id = e.id
                WHERE 1=1
            `;
      const params = [];

      if (status) {
        query += " AND lr.status = ?";
        params.push(status);
      }
      if (leaveType) {
        query += " AND lr.leave_type = ?";
        params.push(leaveType);
      }
      if (employeeId) {
        query += " AND lr.employee_id = ?";
        params.push(employeeId);
      }

      query += " ORDER BY lr.created_at DESC";

      const [requests] = await db.query(query, params);
      res.json({
        requests: toCamelCase(requests),
        total: requests.length,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/leaves/employee/:employeeId
  async getByEmployee(req, res, next) {
    try {
      const [requests] = await db.query(
        `SELECT lr.*, e.full_name as employee_name 
                 FROM leave_requests lr
                 LEFT JOIN employees e ON lr.employee_id = e.id
                 WHERE lr.employee_id = ?
                 ORDER BY lr.created_at DESC`,
        [req.params.employeeId],
      );

      res.json(toCamelCase(requests));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/leaves/balance/:employeeId
  async getBalance(req, res, next) {
    try {
      // Lấy số ngày nghỉ phép đã dùng trong năm hiện tại
      const currentYear = new Date().getFullYear();

      const [annualUsed] = await db.query(
        `SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) as used
                 FROM leave_requests
                 WHERE employee_id = ? 
                 AND leave_type = 'annual'
                 AND status = 'approved'
                 AND YEAR(start_date) = ?`,
        [req.params.employeeId, currentYear],
      );

      const [sickUsed] = await db.query(
        `SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) as used
                 FROM leave_requests
                 WHERE employee_id = ? 
                 AND leave_type = 'sick'
                 AND status = 'approved'
                 AND YEAR(start_date) = ?`,
        [req.params.employeeId, currentYear],
      );

      res.json({
        employeeId: req.params.employeeId,
        annualLeave: 12,
        sickLeave: 10,
        usedAnnualLeave: annualUsed[0].used || 0,
        usedSickLeave: sickUsed[0].used || 0,
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/leaves/my - Lấy đơn nghỉ phép của user hiện tại
  async getMy(req, res, next) {
    try {
      const [employees] = await db.query(
        "SELECT id FROM employees WHERE user_id = ?",
        [req.user.id],
      );

      if (employees.length === 0) {
        return res.json([]); // User không có employee record
      }

      const employeeId = employees[0].id;

      const [requests] = await db.query(
        `SELECT lr.*, e.full_name as employee_name 
         FROM leave_requests lr
         LEFT JOIN employees e ON lr.employee_id = e.id
         WHERE lr.employee_id = ?
         ORDER BY lr.created_at DESC`,
        [employeeId],
      );

      res.json(toCamelCase(requests));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/leaves/my/balance - Lấy số ngày phép còn lại của user hiện tại
  async getMyBalance(req, res, next) {
    try {
      const [employees] = await db.query(
        "SELECT id FROM employees WHERE user_id = ?",
        [req.user.id],
      );

      if (employees.length === 0) {
        return res.json({
          employeeId: null,
          annualLeave: 12,
          sickLeave: 10,
          usedAnnualLeave: 0,
          usedSickLeave: 0,
        });
      }

      const employeeId = employees[0].id;
      const currentYear = new Date().getFullYear();

      const [annualUsed] = await db.query(
        `SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) as used
         FROM leave_requests
         WHERE employee_id = ? 
         AND leave_type = 'annual'
         AND status = 'approved'
         AND YEAR(start_date) = ?`,
        [employeeId, currentYear],
      );

      const [sickUsed] = await db.query(
        `SELECT COALESCE(SUM(DATEDIFF(end_date, start_date) + 1), 0) as used
         FROM leave_requests
         WHERE employee_id = ? 
         AND leave_type = 'sick'
         AND status = 'approved'
         AND YEAR(start_date) = ?`,
        [employeeId, currentYear],
      );

      res.json({
        employeeId: employeeId,
        annualLeave: 12,
        sickLeave: 10,
        usedAnnualLeave: Number(annualUsed[0].used) || 0,
        usedSickLeave: Number(sickUsed[0].used) || 0,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/leaves
  async create(req, res, next) {
    try {
      let { employeeId, leaveType, startDate, endDate, reason } = req.body;

      // Luôn ưu tiên lấy employeeId từ user đang đăng nhập để tránh lỗi Foreign Key
      const [employees] = await db.query(
        "SELECT id FROM employees WHERE user_id = ?",
        [req.user.id],
      );
      
      if (employees.length === 0) {
        return res.status(400).json({
          message: "Tài khoản của bạn chưa được liên kết với hồ sơ nhân viên.",
        });
      }
      
      employeeId = employees[0].id; // Ghi đè luôn kể cả FE có gửi nhầm


      if (!leaveType || !startDate || !endDate) {
        return res.status(400).json({
          message: "Thiếu thông tin bắt buộc",
        });
      }

      const [result] = await db.query(
        `INSERT INTO leave_requests (
                    employee_id, leave_type, start_date, end_date, 
                    reason, status, created_at
                ) VALUES (?, ?, ?, ?, ?, 'pending', NOW())`,
        [employeeId, leaveType, startDate, endDate, reason],
      );

      const [newRequest] = await db.query(
        "SELECT * FROM leave_requests WHERE id = ?",
        [result.insertId],
      );

      res.status(201).json(toCamelCase(newRequest[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/leaves/:id/approve
  async approve(req, res, next) {
    try {
      // Lấy tên người duyệt từ employee
      const [employees] = await db.query(
        "SELECT full_name FROM employees WHERE user_id = ?",
        [req.user.id],
      );
      const approverName =
        employees.length > 0 ? employees[0].full_name : req.user.username;

      await db.query(
        `UPDATE leave_requests 
                 SET status = 'approved', 
                     approved_by = ?, 
                     approved_at = NOW(),
                     updated_at = NOW()
                 WHERE id = ? AND status = 'pending'`,
        [approverName, req.params.id],
      );

      const [updated] = await db.query(
        "SELECT * FROM leave_requests WHERE id = ?",
        [req.params.id],
      );

      if (updated.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy đơn nghỉ phép hoặc đơn đã được xử lý",
        });
      }

      res.json(toCamelCase(updated[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/leaves/:id/reject
  async reject(req, res, next) {
    try {
      // Lấy tên người từ chối từ employee
      const [employees] = await db.query(
        "SELECT full_name FROM employees WHERE user_id = ?",
        [req.user.id],
      );
      const approverName =
        employees.length > 0 ? employees[0].full_name : req.user.username;

      await db.query(
        `UPDATE leave_requests 
                 SET status = 'rejected', 
                     approved_by = ?, 
                     approved_at = NOW(),
                     updated_at = NOW()
                 WHERE id = ? AND status = 'pending'`,
        [approverName, req.params.id],
      );

      const [updated] = await db.query(
        "SELECT * FROM leave_requests WHERE id = ?",
        [req.params.id],
      );

      if (updated.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy đơn nghỉ phép hoặc đơn đã được xử lý",
        });
      }

      res.json(toCamelCase(updated[0]));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/leaves/:id
  async delete(req, res, next) {
    try {
      const [result] = await db.query(
        `DELETE FROM leave_requests 
                 WHERE id = ? AND status = 'pending'`,
        [req.params.id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy đơn hoặc chỉ có thể hủy đơn đang chờ duyệt",
        });
      }

      res.json({ message: "Hủy đơn nghỉ phép thành công" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = leaveController;
