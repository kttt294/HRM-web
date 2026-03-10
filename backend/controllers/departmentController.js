const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const departmentController = {
  // GET /api/departments
  async getAll(req, res, next) {
    try {
      const [departments] = await db.query(
        `SELECT d.*, e.full_name as manager_name 
         FROM departments d
         LEFT JOIN employees e ON d.manager_id = e.id
         ORDER BY d.name ASC`,
      );

      res.json(toCamelCase(departments));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/departments/:id
  async getById(req, res, next) {
    try {
      const [departments] = await db.query(
        "SELECT * FROM departments WHERE id = ?",
        [req.params.id],
      );

      if (departments.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy phòng ban",
        });
      }

      res.json(toCamelCase(departments[0]));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/departments
  async create(req, res, next) {
    try {
      const { name, description, location, managerId } = req.body;

      if (!name) {
        return res.status(400).json({
          message: "Tên phòng ban là bắt buộc",
        });
      }

      const [result] = await db.query(
        `INSERT INTO departments (name, description, location, manager_id, created_at) 
                 VALUES (?, ?, ?, ?, NOW())`,
        [name, description, location, managerId],
      );

      const [newDepartment] = await db.query(
        "SELECT * FROM departments WHERE id = ?",
        [result.insertId],
      );

      // Nếu có managerId, tự động cập nhật role cho người đó lên manager (ID 3) nếu đang là employee (ID 4)
      if (managerId) {
        await db.query(
          `UPDATE users u
           JOIN employees e ON u.id = e.user_id
           SET u.role_id = 3
           WHERE e.id = ? AND u.role_id = 4`,
          [managerId]
        );
      }

      res.status(201).json(toCamelCase(newDepartment[0]));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Tên phòng ban đã tồn tại",
        });
      }
      next(error);
    }
  },

  // PATCH /api/departments/:id
  async update(req, res, next) {
    try {
      const updates = req.body;
      const fieldMapping = {
        name: "name",
        description: "description",
        location: "location",
        managerId: "manager_id"
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
        `UPDATE departments SET ${updateFields.join(", ")} WHERE id = ?`,
        params,
      );

      const [updatedDepartment] = await db.query(
        "SELECT * FROM departments WHERE id = ?",
        [req.params.id],
      );

      if (updatedDepartment.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy phòng ban",
        });
      }

      // Nếu managerId vừa được cập nhật, tự động nâng role lên manager (ID 3) nếu đang là employee (ID 4)
      if (updates.managerId) {
        await db.query(
          `UPDATE users u
           JOIN employees e ON u.id = e.user_id
           SET u.role_id = 3
           WHERE e.id = ? AND u.role_id = 4`,
          [updates.managerId]
        );
      }

      res.json(toCamelCase(updatedDepartment[0]));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Tên phòng ban đã tồn tại",
        });
      }
      next(error);
    }
  },

  // DELETE /api/departments/:id
  async delete(req, res, next) {
    try {
      // Kiểm tra xem có nhân viên nào trong phòng ban không
      const [employees] = await db.query(
        "SELECT COUNT(*) as count FROM employees WHERE department_id = ?",
        [req.params.id],
      );

      if (employees[0].count > 0) {
        return res.status(400).json({
          message: "Không thể xóa phòng ban đang có nhân viên",
        });
      }

      const [result] = await db.query("DELETE FROM departments WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy phòng ban",
        });
      }

      res.json({ message: "Xóa phòng ban thành công" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = departmentController;
