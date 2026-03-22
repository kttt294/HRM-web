const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const jobTitleController = {
  // GET /api/job-titles
  async getAll(req, res, next) {
    try {
      const [rows] = await db.query("SELECT * FROM job_titles ORDER BY name ASC");
      res.json(toCamelCase(rows));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/job-titles/:id
  async getById(req, res, next) {
    try {
      const [rows] = await db.query("SELECT * FROM job_titles WHERE id = ?", [req.params.id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy chức vụ" });
      }
      res.json(toCamelCase(rows[0]));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/job-titles
  async create(req, res, next) {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ message: "Tên chức vụ là bắt buộc" });

      const [result] = await db.query(
        "INSERT INTO job_titles (name, description) VALUES (?, ?)", 
        [name, description]
      );
      
      const [newRow] = await db.query("SELECT * FROM job_titles WHERE id = ?", [result.insertId]);
      res.status(201).json(toCamelCase(newRow[0]));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Tên chức vụ đã tồn tại" });
      next(error);
    }
  },

  // PATCH /api/job-titles/:id
  async update(req, res, next) {
    try {
      const { name, description } = req.body;
      const updates = [];
      const params = [];

      if (name !== undefined) { updates.push("name = ?"); params.push(name); }
      if (description !== undefined) { updates.push("description = ?"); params.push(description); }

      if (updates.length === 0) return res.status(400).json({ message: "Không có thông tin thay đổi" });

      params.push(req.params.id);
      await db.query(`UPDATE job_titles SET ${updates.join(", ")} WHERE id = ?`, params);

      const [updatedRow] = await db.query("SELECT * FROM job_titles WHERE id = ?", [req.params.id]);
      res.json(toCamelCase(updatedRow[0]));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Tên chức vụ đã tồn tại" });
      next(error);
    }
  },

  // DELETE /api/job-titles/:id
  async delete(req, res, next) {
    try {
      // Kiểm tra có nhân viên nào đang giữ chức vụ này không
      const [emps] = await db.query("SELECT COUNT(*) as count FROM employees WHERE job_title_id = ?", [req.params.id]);
      if (emps[0].count > 0) {
        return res.status(400).json({ message: "Không thể xóa chức vụ đang có nhân viên đảm nhiệm" });
      }

      // Kiểm tra có tin tuyển dụng nào đang dùng chức vụ này không
      const [vacs] = await db.query("SELECT COUNT(*) as count FROM vacancies WHERE job_title_id = ?", [req.params.id]);
      if (vacs[0].count > 0) {
        return res.status(400).json({ message: "Không thể xóa chức vụ đang được đăng tuyển dụng" });
      }

      const [result] = await db.query("DELETE FROM job_titles WHERE id = ?", [req.params.id]);
      if (result.affectedRows === 0) return res.status(404).json({ message: "Không tìm thấy chức vụ" });

      res.json({ message: "Xóa chức vụ thành công" });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = jobTitleController;
