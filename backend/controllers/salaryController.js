const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const salaryController = {
  // GET /api/salary/my - Lấy bảng lương của user hiện tại (dùng cho My Payroll page)
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

      const [salaries] = await db.query(
        `SELECT sr.*, 
                e.full_name as employee_name,
                d.name as department_name
         FROM salary_records sr
         LEFT JOIN employees e ON sr.employee_id = e.id
         LEFT JOIN departments d ON e.department_id = d.id
         WHERE sr.employee_id = ?
         ORDER BY sr.year DESC, sr.month DESC`,
        [employeeId],
      );

      res.json(toCamelCase(salaries));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/salary
  async getAll(req, res, next) {
    try {
      const { employeeId, month, year, status } = req.query;

      let query = `
                SELECT sr.id, sr.employee_id, sr.month, sr.year, 
                       sr.base_salary, sr.allowance, sr.deduction, 
                       sr.net_salary, sr.status,
                       e.full_name as employee_name,
                       d.name as department_name
                FROM salary_records sr
                LEFT JOIN employees e ON sr.employee_id = e.id
                LEFT JOIN departments d ON e.department_id = d.id
                WHERE 1=1
            `;
      const params = [];

      // Nếu là employee, chỉ xem lương của mình
      if (req.user.role === "employee") {
        query +=
          " AND sr.employee_id = (SELECT id FROM employees WHERE user_id = ?)";
        params.push(req.user.id);
      } else {
        // HR/Admin có thể filter theo employee_id
        if (employeeId) {
          query += " AND sr.employee_id = ?";
          params.push(employeeId);
        }
      }

      if (month) {
        query += " AND sr.month = ?";
        params.push(month);
      }
      if (year) {
        query += " AND sr.year = ?";
        params.push(year);
      }
      if (status) {
        query += " AND sr.status = ?";
        params.push(status);
      }

      query += " ORDER BY sr.year DESC, sr.month DESC";

      const [salaries] = await db.query(query, params);
      res.json(toCamelCase(salaries));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/salary/:id
  async getById(req, res, next) {
    try {
      const [salaries] = await db.query(
        "SELECT * FROM salary_records WHERE id = ?",
        [req.params.id],
      );

      if (salaries.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy bảng lương",
        });
      }

      const salary = salaries[0];

      // Nếu là employee, chỉ xem được lương của mình
      if (req.user.role === "employee") {
        const [employees] = await db.query(
          "SELECT id FROM employees WHERE user_id = ?",
          [req.user.id],
        );

        if (employees.length === 0 || employees[0].id !== salary.employee_id) {
          return res.status(403).json({
            message: "Bạn không có quyền xem bảng lương này",
          });
        }
      }

      res.json(toCamelCase(salary));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/salary/employee/:employeeId
  async getByEmployeeId(req, res, next) {
    try {
      const { employeeId } = req.params;

      // Nếu là employee, chỉ xem được lương của mình
      if (req.user.role === "employee") {
        const [employees] = await db.query(
          "SELECT id FROM employees WHERE user_id = ?",
          [req.user.id],
        );

        if (
          employees.length === 0 ||
          employees[0].id.toString() !== employeeId
        ) {
          return res.status(403).json({
            message: "Bạn không có quyền xem lịch sử lương này",
          });
        }
      }

      const [salaries] = await db.query(
        "SELECT * FROM salary_records WHERE employee_id = ? ORDER BY year DESC, month DESC",
        [employeeId],
      );

      res.json(toCamelCase(salaries));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/salary
  async create(req, res, next) {
    try {
      const {
        employeeId,
        month,
        year,
        baseSalary,
        allowance,
        deduction,
        netSalary,
        status,
      } = req.body;

      if (!employeeId || !month || !year || baseSalary === undefined) {
        return res.status(400).json({
          message:
            "Thiếu thông tin bắt buộc: employeeId, month, year, baseSalary",
        });
      }

      // Kiểm tra employee có tồn tại không
      const [employees] = await db.query(
        "SELECT id FROM employees WHERE id = ?",
        [employeeId],
      );

      if (employees.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy nhân viên",
        });
      }

      // Kiểm tra đã có bảng lương cho tháng này chưa
      const [existing] = await db.query(
        "SELECT id FROM salary_records WHERE employee_id = ? AND month = ? AND year = ?",
        [employeeId, month, year],
      );

      if (existing.length > 0) {
        return res.status(400).json({
          message: "Đã tồn tại bảng lương cho nhân viên này trong tháng này",
        });
      }

      const [result] = await db.query(
        `INSERT INTO salary_records (
                    employee_id, month, year, base_salary,
                    allowance, deduction, net_salary, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId,
          month,
          year,
          baseSalary,
          allowance || 0,
          deduction || 0,
          netSalary,
          status || "draft",
        ],
      );

      const [newSalary] = await db.query(
        "SELECT * FROM salary_records WHERE id = ?",
        [result.insertId],
      );

      res.status(201).json(toCamelCase(newSalary[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/salary/:id
  async update(req, res, next) {
    try {
      const updates = req.body;
      // Mapping frontend fields to DB columns
      const fieldMapping = {
        baseSalary: "base_salary",
        allowance: "allowance",
        deduction: "deduction",
        netSalary: "net_salary",
        status: "status",
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
        `UPDATE salary_records SET ${updateFields.join(", ")} WHERE id = ?`,
        params,
      );

      const [updatedSalary] = await db.query(
        "SELECT * FROM salary_records WHERE id = ?",
        [req.params.id],
      );

      if (updatedSalary.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy bảng lương",
        });
      }

      res.json(toCamelCase(updatedSalary[0]));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/salary/:id
  async delete(req, res, next) {
    try {
      const [result] = await db.query(
        "DELETE FROM salary_records WHERE id = ?",
        [req.params.id],
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy bảng lương",
        });
      }

      res.json({ message: "Xóa bảng lương thành công" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = salaryController;
