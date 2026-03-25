const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const employeeDegreeController = {
  // GET /api/employee-degrees/my
  async getMy(req, res, next) {
    try {
      const [employees] = await db.query(
        "SELECT id FROM employees WHERE user_id = ?",
        [req.user.id]
      );

      if (employees.length === 0) {
        return res.json([]); 
      }

      const [degrees] = await db.query(
        "SELECT * FROM employee_degrees WHERE employee_id = ? ORDER BY created_at DESC",
        [employees[0].id]
      );
      res.json(toCamelCase(degrees));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/employee-degrees/employee/:employeeId
  async getByEmployee(req, res, next) {
    try {
      const { employeeId } = req.params;

      if (req.user.role === "employee") {
        const [employees] = await db.query(
          "SELECT id FROM employees WHERE user_id = ?",
          [req.user.id]
        );

        if (employees.length === 0 || employees[0].id.toString() !== employeeId.toString()) {
          return res.status(403).json({
            message: "Bạn không có quyền xem bằng cấp của nhân viên khác",
          });
        }
      } else if (req.user.role === "manager") {
        const [managerData] = await db.query(
          "SELECT department_id FROM employees WHERE user_id = ?",
          [req.user.id]
        );
        
        const [targetEmployee] = await db.query(
          "SELECT department_id FROM employees WHERE id = ?",
          [employeeId]
        );

        if (
          managerData.length === 0 || 
          targetEmployee.length === 0 || 
          managerData[0].department_id !== targetEmployee[0].department_id
        ) {
          return res.status(403).json({
            message: "Bạn chỉ có quyền xem bằng cấp của nhân viên thuộc chuyên môn phòng ban mình quản lý",
          });
        }
      }

      const [degrees] = await db.query(
        "SELECT * FROM employee_degrees WHERE employee_id = ? ORDER BY created_at DESC",
        [employeeId]
      );
      res.json(toCamelCase(degrees));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/employee-degrees
  async create(req, res, next) {
    try {
      const {
        employeeId,
        educationLevel,
        schoolName,
        degreeClassification,
        major,
        graduationYear,
        certificateFileUrl
      } = req.body;

      if (!employeeId || !educationLevel) {
        return res.status(400).json({ message: "Mã nhân viên và trình độ học vấn là bắt buộc" });
      }

      const [employees] = await db.query("SELECT id FROM employees WHERE id = ?", [employeeId]);
      if (employees.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }

      const [result] = await db.query(
        `INSERT INTO employee_degrees (
          employee_id, education_level, school_name, degree_classification, 
          major, graduation_year, certificate_file_url
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId, educationLevel, schoolName || null, degreeClassification || null,
          major || null, graduationYear || null, certificateFileUrl || null
        ]
      );

      const [newDegree] = await db.query(
        "SELECT * FROM employee_degrees WHERE id = ?",
        [result.insertId]
      );

      res.status(201).json(toCamelCase(newDegree[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/employee-degrees/:id
  async update(req, res, next) {
    try {
      const updates = req.body;
      const fieldMapping = {
        educationLevel: "education_level",
        schoolName: "school_name",
        degreeClassification: "degree_classification",
        major: "major",
        graduationYear: "graduation_year",
        certificateFileUrl: "certificate_file_url"
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
        return res.status(400).json({ message: "Không có trường nào để cập nhật" });
      }

      params.push(req.params.id);

      const [result] = await db.query(
        `UPDATE employee_degrees SET ${updateFields.join(", ")} WHERE id = ?`,
        params
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy bằng cấp" });
      }

      const [updatedDegree] = await db.query(
        "SELECT * FROM employee_degrees WHERE id = ?",
        [req.params.id]
      );

      res.json(toCamelCase(updatedDegree[0]));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/employee-degrees/:id
  async delete(req, res, next) {
    try {
      const [result] = await db.query("DELETE FROM employee_degrees WHERE id = ?", [req.params.id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy bằng cấp" });
      }

      res.json({ message: "Xóa bằng cấp thành công" });
    } catch (error) {
      next(error);
    }
  },

  // ENUM MANAGEMENT - CẬP NHẬT TRỎ SANG CẢ BẢNG CERTIFICATES MỚI
  async getEnumValues(req, res, next) {
    try {
      const { column } = req.query;
      let tableName = "employee_degrees";
      if (column === "certificate_type") {
        tableName = "employee_certificates";
      } else if (!["degree_classification", "education_level"].includes(column)) {
        return res.status(400).json({ message: "Cột không hợp lệ" });
      }
      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [column]);
      if (columns.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy cột" });
      }
      const match = columns[0].Type.match(/^enum\((.*)\)$/);
      if (!match) {
        return res.status(500).json({ message: "Không phải cột ENUM" });
      }
      const values = match[1].split(",").map((v) => v.replace(/'/g, ""));
      res.json({ column, values });
    } catch (error) {
      next(error);
    }
  },

  async addEnumValue(req, res, next) {
    try {
      const { column, newValue } = req.body;
      let tableName = "employee_degrees";

      if (column === "certificate_type") {
        tableName = "employee_certificates";
      } else if (!["degree_classification", "education_level"].includes(column)) {
        return res.status(400).json({ message: "Cột không hợp lệ" });
      }

      if (!newValue || typeof newValue !== "string") {
        return res.status(400).json({ message: "Giá trị mới không hợp lệ" });
      }

      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [column]);
      if (columns.length === 0) return res.status(404).json({ message: "Không tìm thấy cột" });

      const match = columns[0].Type.match(/^enum\((.*)\)$/);
      if (!match) return res.status(500).json({ message: "Không thể lấy danh sách ENUM" });

      const currentValues = match[1].split(",").map((v) => v.replace(/'/g, ""));
      if (currentValues.includes(newValue)) {
        return res.status(400).json({ message: "Giá trị này đã tồn tại" });
      }

      currentValues.push(newValue);
      const newEnumDefinition = currentValues.map((v) => `'${v}'`).join(",");
      let alterQuery = `ALTER TABLE ${tableName} MODIFY COLUMN ${column} ENUM(${newEnumDefinition})`;
      
      if (column === "certificate_type") alterQuery += " NOT NULL";
      else if (column === "degree_classification") alterQuery += " NULL";
      else if (column === "education_level") alterQuery += " NOT NULL";

      await db.query(alterQuery);
      res.json({ message: "Cập nhật thành công", new_values: currentValues });
    } catch (error) {
      next(error);
    }
  },

  async updateEnumValue(req, res, next) {
    try {
      const { column, oldValue, newValue } = req.body;
      let tableName = "employee_degrees";

      if (column === "certificate_type") {
        tableName = "employee_certificates";
      } else if (!["degree_classification", "education_level"].includes(column)) {
        return res.status(400).json({ message: "Cột không hợp lệ" });
      }

      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [column]);
      const match = columns[0].Type.match(/^enum\((.*)\)$/);
      let currentValues = match[1].split(",").map((v) => v.replace(/'/g, ""));

      currentValues.push(newValue);
      let alterQuery1 = `ALTER TABLE ${tableName} MODIFY COLUMN ${column} ENUM(${currentValues.map((v) => `'${v}'`).join(",")})`;
      if (column === "certificate_type") alterQuery1 += " NOT NULL";
      else if (column === "degree_classification") alterQuery1 += " NULL";
      else if (column === "education_level") alterQuery1 += " NOT NULL";
      
      await db.query(alterQuery1);
      await db.query(`UPDATE ${tableName} SET ${column} = ? WHERE ${column} = ?`, [newValue, oldValue]);

      currentValues = currentValues.filter((v) => v !== oldValue);
      let alterQuery2 = `ALTER TABLE ${tableName} MODIFY COLUMN ${column} ENUM(${currentValues.map((v) => `'${v}'`).join(",")})`;
      if (column === "certificate_type") alterQuery2 += " NOT NULL";
      else if (column === "degree_classification") alterQuery2 += " NULL";
      else if (column === "education_level") alterQuery2 += " NOT NULL";

      await db.query(alterQuery2);
      res.json({ message: "Đổi tên thành công", new_values: currentValues });
    } catch (error) {
      next(error);
    }
  },

  async deleteEnumValue(req, res, next) {
    try {
      const { column, valueToDelete } = req.body;
      let tableName = "employee_degrees";

      if (column === "certificate_type") {
        tableName = "employee_certificates";
      } else if (!["degree_classification", "education_level"].includes(column)) {
        return res.status(400).json({ message: "Cột không hợp lệ" });
      }

      const [usageCheck] = await db.query(`SELECT COUNT(*) as count FROM ${tableName} WHERE ${column} = ?`, [valueToDelete]);
      if (usageCheck[0].count > 0) {
        return res.status(400).json({ message: "Không thể xóa vì đang có dữ liệu sử dụng giá trị này" });
      }

      const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [column]);
      const currentValues = columns[0].Type.match(/^enum\((.*)\)$/)[1].split(",").map((v) => v.replace(/'/g, ""));
      const newValues = currentValues.filter((v) => v !== valueToDelete);
      
      let alterQuery = `ALTER TABLE ${tableName} MODIFY COLUMN ${column} ENUM(${newValues.map((v) => `'${v}'`).join(",")})`;
      if (column === "certificate_type") alterQuery += " NOT NULL";
      else if (column === "degree_classification") alterQuery += " NULL";
      else if (column === "education_level") alterQuery += " NOT NULL";

      await db.query(alterQuery);
      res.json({ message: "Xóa thành công", new_values: newValues });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = employeeDegreeController;
