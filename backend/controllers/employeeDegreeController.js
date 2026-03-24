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
        return res.json([]); // User không có employee record
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

      // Nếu là employee, chỉ xem được bằng cấp của mình
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
        // Manager chỉ xem được bằng cấp của nhân viên cùng phòng ban
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
        englishCertificate,
        englishScore,
        major,
        graduationYear,
        certificateFileUrl,
        englishIssueDate,
        englishExpiryDate
      } = req.body;

      if (!employeeId || !educationLevel) {
        return res.status(400).json({ message: "Mã nhân viên và trình độ học vấn là bắt buộc" });
      }

      // Check if employee exists
      const [employees] = await db.query("SELECT id FROM employees WHERE id = ?", [employeeId]);
      if (employees.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy nhân viên" });
      }

      const [result] = await db.query(
        `INSERT INTO employee_degrees (
          employee_id, education_level, school_name, degree_classification, 
          english_certificate, english_score, major, graduation_year, 
          certificate_file_url, english_issue_date, english_expiry_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          employeeId, educationLevel, schoolName || null, degreeClassification || null,
          englishCertificate || 'none', englishScore || null, major || null, graduationYear || null,
          certificateFileUrl || null, englishIssueDate || null, englishExpiryDate || null
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
        englishCertificate: "english_certificate",
        englishScore: "english_score",
        major: "major",
        graduationYear: "graduation_year",
        certificateFileUrl: "certificate_file_url",
        englishIssueDate: "english_issue_date",
        englishExpiryDate: "english_expiry_date"
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
        return res.status(404).json({ message: "Không tìm thấy bằng cấp/chứng chỉ" });
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
        return res.status(404).json({ message: "Không tìm thấy bằng cấp/chứng chỉ" });
      }

      res.json({ message: "Xóa bằng cấp thành công" });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/employee-degrees/enums/add
  async addEnumValue(req, res, next) {
    try {
      const { column, newValue } = req.body;
      
      if (!['english_certificate', 'degree_classification', 'education_level'].includes(column)) {
        return res.status(400).json({ message: "Cột không hợp lệ" });
      }
      
      if (!newValue || typeof newValue !== 'string') {
        return res.status(400).json({ message: "Giá trị mới không hợp lệ" });
      }

      // Lấy definition hiện tại của cột ENUM
      const [columns] = await db.query(
        "SHOW COLUMNS FROM employee_degrees LIKE ?", 
        [column]
      );

      if (columns.length === 0) {
        return res.status(404).json({ message: "Không tìm thấy cột" });
      }

      const columnType = columns[0].Type; 
      
      const match = columnType.match(/^enum\((.*)\)$/);
      if (!match) {
        return res.status(500).json({ message: "Không thể lấy danh sách ENUM hiện tại" });
      }

      const currentValuesStr = match[1];
      const currentValues = currentValuesStr.split(',').map(v => v.replace(/'/g, ''));

      // Check xem đã tồn tại chưa
      if (currentValues.includes(newValue)) {
        return res.status(400).json({ message: "Giá trị này đã tồn tại trong danh sách" });
      }

      // Thêm value mới vào list
      currentValues.push(newValue);

      // Render lại chuỗi ENUM mới
      const newEnumDefinition = currentValues.map(v => `'${v}'`).join(',');

      // Cấu hình tính DEFAULT hoặc NULL dựa vào cột
      let alterQuery = `ALTER TABLE employee_degrees MODIFY COLUMN ${column} ENUM(${newEnumDefinition})`;
      if (column === 'english_certificate') {
          alterQuery += " DEFAULT 'none'";
      } else if (column === 'degree_classification') {
          alterQuery += " NULL";
      } else if (column === 'education_level') {
          alterQuery += " NOT NULL";
      }

      await db.query(alterQuery);

      res.json({ 
        message: "Cập nhật danh sách " + column + " thành công", 
        new_values: currentValues 
      });
    } catch (error) {
      next(error);
    }
  },

  // PUT /api/employee-degrees/enums/update
  // Đổi tên một kiểu ENUM (sẽ tự thay đổi các record cũ đang dùng kiểu đó thành kiểu mới)
  async updateEnumValue(req, res, next) {
    try {
      const { column, oldValue, newValue } = req.body;
      
      if (!['english_certificate', 'degree_classification', 'education_level'].includes(column)) {
        return res.status(400).json({ message: "Cột không hợp lệ" });
      }
      
      if (!oldValue || !newValue || typeof oldValue !== 'string' || typeof newValue !== 'string') {
        return res.status(400).json({ message: "Giá trị không hợp lệ" });
      }

      if (oldValue === newValue) {
        return res.status(400).json({ message: "Giá trị mới phải khác giá trị cũ" });
      }

      const [columns] = await db.query("SHOW COLUMNS FROM employee_degrees LIKE ?", [column]);
      if (columns.length === 0) return res.status(404).json({ message: "Không tìm thấy cột" });

      const match = columns[0].Type.match(/^enum\((.*)\)$/);
      if (!match) return res.status(500).json({ message: "Không thể lấy danh sách ENUM" });

      let currentValues = match[1].split(',').map(v => v.replace(/'/g, ''));

      if (!currentValues.includes(oldValue)) {
        return res.status(400).json({ message: "Giá trị cũ không tồn tại trong danh sách" });
      }

      if (currentValues.includes(newValue)) {
        return res.status(400).json({ message: "Giá trị mới đã tồn tại, không thể đổi tên trùng" });
      }

      // Step 1: Add new value to ENUM list temporarily
      currentValues.push(newValue);
      let newEnumDefinition = currentValues.map(v => `'${v}'`).join(',');
      
      let alterQuery1 = `ALTER TABLE employee_degrees MODIFY COLUMN ${column} ENUM(${newEnumDefinition})`;
      if (column === 'english_certificate') alterQuery1 += " DEFAULT 'none'";
      else if (column === 'degree_classification') alterQuery1 += " NULL";
      else if (column === 'education_level') alterQuery1 += " NOT NULL";
      
      await db.query(alterQuery1);

      // Step 2: Update existing records
      await db.query(`UPDATE employee_degrees SET ${column} = ? WHERE ${column} = ?`, [newValue, oldValue]);

      // Step 3: Remove old value from ENUM list
      currentValues = currentValues.filter(v => v !== oldValue);
      newEnumDefinition = currentValues.map(v => `'${v}'`).join(',');
      
      let alterQuery2 = `ALTER TABLE employee_degrees MODIFY COLUMN ${column} ENUM(${newEnumDefinition})`;
      if (column === 'english_certificate') alterQuery2 += " DEFAULT 'none'";
      else if (column === 'degree_classification') alterQuery2 += " NULL";
      else if (column === 'education_level') alterQuery2 += " NOT NULL";

      await db.query(alterQuery2);

      res.json({ message: "Đổi tên thuộc tính thành công", new_values: currentValues });
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/employee-degrees/enums/delete
  async deleteEnumValue(req, res, next) {
    try {
      const { column, valueToDelete } = req.body;
      
      if (!['english_certificate', 'degree_classification', 'education_level'].includes(column)) {
        return res.status(400).json({ message: "Cột không hợp lệ" });
      }

      if (!valueToDelete || typeof valueToDelete !== 'string') {
        return res.status(400).json({ message: "Giá trị cần xóa không hợp lệ" });
      }

      // Không cho phép xóa giá trị mặc định hệ thống
      if (column === 'english_certificate' && valueToDelete === 'none') {
        return res.status(400).json({ message: "Không thể xóa giá trị mặc định 'none'" });
      }

      // Check xem có ai đang dùng không
      const [usageCheck] = await db.query(
        `SELECT COUNT(*) as count FROM employee_degrees WHERE ${column} = ?`, 
        [valueToDelete]
      );

      if (usageCheck[0].count > 0) {
        return res.status(400).json({ 
          message: `Không thể xóa vì đang có ${usageCheck[0].count} bằng cấp sử dụng giá trị này. Vui lòng chuyển đổi dữ liệu trước khi xóa.`
        });
      }

      const [columns] = await db.query("SHOW COLUMNS FROM employee_degrees LIKE ?", [column]);
      if (columns.length === 0) return res.status(404).json({ message: "Không tìm thấy cột" });

      const match = columns[0].Type.match(/^enum\((.*)\)$/);
      if (!match) return res.status(500).json({ message: "Không thể lấy danh sách ENUM" });

      const currentValues = match[1].split(',').map(v => v.replace(/'/g, ''));

      if (!currentValues.includes(valueToDelete)) {
        return res.status(400).json({ message: "Giá trị này không tồn tại trong danh sách" });
      }

      if (currentValues.length <= 1) {
         return res.status(400).json({ message: "Không thể xóa giá trị duy nhất còn lại của danh sách" });
      }

      const newValues = currentValues.filter(v => v !== valueToDelete);
      const newEnumDefinition = newValues.map(v => `'${v}'`).join(',');
      
      let alterQuery = `ALTER TABLE employee_degrees MODIFY COLUMN ${column} ENUM(${newEnumDefinition})`;
      if (column === 'english_certificate') alterQuery += " DEFAULT 'none'";
      else if (column === 'degree_classification') alterQuery += " NULL";
      else if (column === 'education_level') alterQuery += " NOT NULL";

      await db.query(alterQuery);

      res.json({ message: "Xóa thuộc tính thành công", new_values: newValues });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = employeeDegreeController;
