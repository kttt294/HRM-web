const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const employeeController = {
  // GET /api/employees
  async getAll(req, res, next) {
    try {
      const { name, id, jobTitle, status } = req.query;

      let query = `SELECT e.*, d.name as department_name 
                         FROM employees e 
                         LEFT JOIN departments d ON e.department_id = d.id 
                         WHERE 1=1`;
      const params = [];

      if (name) {
        query += " AND e.full_name LIKE ?";
        params.push(`%${name}%`);
      }
      if (id) {
        query += " AND e.id LIKE ?";
        params.push(`%${id}%`);
      }
      if (jobTitle) {
        query += " AND e.job_title LIKE ?";
        params.push(`%${jobTitle}%`);
      }
      if (status) {
        query += " AND e.status = ?";
        params.push(status);
      }

      const [employees] = await db.query(query, params);
      res.json(toCamelCase(employees));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/employees/me - Lấy thông tin nhân viên của user hiện tại
  async getMe(req, res, next) {
    try {
      const [employees] = await db.query(
        `SELECT e.*, d.name as department_name 
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE e.user_id = ?`,
        [req.user.id],
      );

      if (employees.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin nhân viên",
        });
      }

      res.json(toCamelCase(employees[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/employees/me - Nhân viên tự cập nhật thông tin cá nhân
  async updateMe(req, res, next) {
    try {
      // Chỉ cho phép cập nhật các trường cá nhân
      const allowedFields = {
        fullName: "full_name",
        dateOfBirth: "date_of_birth",
        gender: "gender",
        nationalId: "national_id",
        address: "address",
        phone: "phone",
      };

      const updates = req.body;
      const updateFields = [];
      const params = [];

      // Date fields that need special handling
      const dateFields = ['date_of_birth'];

      Object.keys(updates).forEach((key) => {
        if (allowedFields[key] && updates[key] !== undefined) {
          updateFields.push(`${allowedFields[key]} = ?`);
          let value = updates[key] === '' ? null : updates[key];
          // Convert ISO date strings to YYYY-MM-DD for MySQL DATE columns
          if (value && dateFields.includes(allowedFields[key])) {
            try {
              const d = new Date(value);
              if (!isNaN(d.getTime())) {
                value = d.toISOString().split('T')[0];
              } else {
                value = null;
              }
            } catch {
              value = null;
            }
          }
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          message: "Không có trường nào để cập nhật",
        });
      }

      const [existing] = await db.query(
        "SELECT id FROM employees WHERE user_id = ?",
        [req.user.id],
      );

      if (existing.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy thông tin nhân viên",
        });
      }

      const employeeId = existing[0].id;
      params.push(employeeId);

      await db.query(
        `UPDATE employees SET ${updateFields.join(", ")} WHERE id = ?`,
        params,
      );

      const [updatedEmployee] = await db.query(
        `SELECT e.*, d.name as department_name 
         FROM employees e
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE e.id = ?`,
        [employeeId],
      );

      res.json(toCamelCase(updatedEmployee[0]));
    } catch (error) {
      console.error('updateMe error:', error.code, error.message);
      console.error('updateMe body was:', JSON.stringify(req.body));
      next(error);
    }
  },

  // GET /api/employees/:id
  async getById(req, res, next) {
    try {
      const [employees] = await db.query(
        "SELECT * FROM employees WHERE id = ?",
        [req.params.id],
      );

      if (employees.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy nhân viên",
        });
      }

      res.json(toCamelCase(employees[0]));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/employees
  async create(req, res, next) {
    try {
      const {
        id,
        fullName,
        dateOfBirth,
        gender,
        nationalId,
        address,
        phone,
        departmentId,
        jobTitle,
        supervisorId,
        hireDate,
        status,
        baseSalary,
        allowance,
        employeeType,
      } = req.body;

      if (!id || !fullName) {
        return res.status(400).json({
          message: "Mã nhân viên và họ tên là bắt buộc",
        });
      }

      await db.query(
        `INSERT INTO employees (id, full_name, date_of_birth, gender, national_id, address, phone, department_id, job_title, supervisor_id, hire_date, status, base_salary, allowance, employee_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          fullName,
          dateOfBirth || null,
          gender || null,
          nationalId || null,
          address || null,
          phone || null,
          departmentId || null,
          jobTitle || null,
          supervisorId || null,
          hireDate || null,
          status || "active",
          baseSalary || 0,
          allowance || 0,
          employeeType || "full_time",
        ],
      );

      const [newEmployee] = await db.query(
        "SELECT * FROM employees WHERE id = ?",
        [id],
      );

      res.status(201).json(toCamelCase(newEmployee[0]));
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          message: "Mã nhân viên đã tồn tại",
        });
      }
      next(error);
    }
  },

  // PATCH /api/employees/:id
  async update(req, res, next) {
    try {
      const updates = req.body;
      // Map frontend camelCase fields to DB snake_case columns
      const fieldMapping = {
        fullName: "full_name",
        dateOfBirth: "date_of_birth",
        gender: "gender",
        nationalId: "national_id",
        address: "address",
        email: "email",
        phone: "phone",
        jobTitle: "job_title",
        departmentId: "department_id",
        supervisorId: "supervisor_id",
        hireDate: "hire_date",
        status: "status",
        baseSalary: "base_salary",
        allowance: "allowance",
        employeeType: "employee_type",
      };

      const updateFields = [];
      const params = [];
      const dateFields = ['date_of_birth', 'hire_date'];

      Object.keys(updates).forEach((key) => {
        if (fieldMapping[key]) {
          updateFields.push(`${fieldMapping[key]} = ?`);
          let value = updates[key] === '' ? null : updates[key];
          // Convert ISO date strings to YYYY-MM-DD for MySQL DATE columns
          if (value && dateFields.includes(fieldMapping[key])) {
            try {
              const d = new Date(value);
              if (!isNaN(d.getTime())) {
                value = d.toISOString().split('T')[0];
              } else {
                value = null;
              }
            } catch {
              value = null;
            }
          }
          params.push(value);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          message: "Không có trường nào để cập nhật hoặc trường không hợp lệ",
        });
      }

      params.push(req.params.id);

      await db.query(
        `UPDATE employees SET ${updateFields.join(", ")} WHERE id = ?`,
        params,
      );

      const [updatedEmployee] = await db.query(
        "SELECT * FROM employees WHERE id = ?",
        [req.params.id],
      );

      if (updatedEmployee.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy nhân viên",
        });
      }

      res.json(toCamelCase(updatedEmployee[0]));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/employees/:id
  async delete(req, res, next) {
    try {
      const [result] = await db.query("DELETE FROM employees WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy nhân viên",
        });
      }

      res.json({ message: "Xóa nhân viên thành công" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = employeeController;
