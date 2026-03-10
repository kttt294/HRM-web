const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const employeeController = {
  // GET /api/employees
  async getAll(req, res, next) {
    try {
      const { name, id, jobTitle, status, departmentId } = req.query;

      let query = `SELECT e.*, jt.name as job_title, d.name as department_name, 
                           u.id as user_id, u.username, u.avatar,
                           m.full_name as supervisor_name
                    FROM employees e 
                    LEFT JOIN job_titles jt ON e.job_title_id = jt.id
                    LEFT JOIN departments d ON e.department_id = d.id
                    LEFT JOIN users u ON e.user_id = u.id
                    LEFT JOIN employees m ON e.supervisor_id = m.id
                    WHERE 1=1`;
      const params = [];

      // Áp dụng Data Scoping cho Manager
      if (req.queryScope && req.queryScope.filterByDept) {
        // Lấy dept của manager
        const [mgrs] = await db.query("SELECT department_id FROM employees WHERE id = ?", [req.user.employeeId]);
        if (mgrs.length > 0) {
          query += " AND e.department_id = ?";
          params.push(mgrs[0].department_id);
        }
      }

      if (name) {
        query += " AND e.full_name LIKE ?";
        params.push(`%${name}%`);
      }
      if (id) {
        query += " AND e.id = ?";
        params.push(id);
      }
      if (jobTitle) {
        query += " AND jt.name LIKE ?";
        params.push(`%${jobTitle}%`);
      }
      if (status) {
        query += " AND e.status = ?";
        params.push(status);
      }
      if (departmentId) {
        query += " AND e.department_id = ?";
        params.push(departmentId);
      }
      if (req.query.profileStatus) {
        query += " AND e.profile_status = ?";
        params.push(req.query.profileStatus);
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
        `SELECT e.*, jt.name as job_title, d.name as department_name, 
                m.full_name as supervisor_name
         FROM employees e
         LEFT JOIN job_titles jt ON e.job_title_id = jt.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN employees m ON e.supervisor_id = m.id
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
      // Các trường nhân viên được phép tự sửa
      const allowedFields = {
        fullName: "full_name",
        personalEmail: "personal_email",
        avatarUrl: "avatar_url",
        phone: "phone",
        dateOfBirth: "date_of_birth",
        gender: "gender",
        maritalStatus: "marital_status",
        nationalId: "national_id",
        taxId: "tax_id",
        insuranceId: "insurance_id",
        permanentAddress: "permanent_address",
        currentAddress: "current_address",
        emergencyContactName: "emergency_contact_name",
        emergencyContactRelationship: "emergency_contact_relationship",
        emergencyContactPhone: "emergency_contact_phone",
        education: "education",
        experience: "experience",
        workProcess: "work_process",
        bankName: "bank_name",
        bankAccount: "bank_account"
      };

      const updates = req.body;
      const updateFields = ["profile_status = 'pending'"]; // Luôn đưa về trạng thái chờ duyệt
      const params = [];
      const dateFields = ['date_of_birth'];

      Object.keys(updates).forEach((key) => {
        if (allowedFields[key] && updates[key] !== undefined) {
          updateFields.push(`${allowedFields[key]} = ?`);
          let value = updates[key] === '' ? null : updates[key];
          if (value && dateFields.includes(allowedFields[key])) {
            value = new Date(value).toISOString().split('T')[0];
          }
          params.push(value);
        }
      });

      if (updateFields.length === 1) { // Chỉ có profile_status
        return res.status(400).json({ message: "Không có thông tin thay đổi" });
      }

      params.push(req.user.id);
      await db.query(`UPDATE employees SET ${updateFields.join(", ")} WHERE user_id = ?`, params);

      res.json({ message: "Cập nhật hồ sơ thành công, vui lòng chờ duyệt." });
    } catch (error) {
      console.error('updateMe error:', error.code, error.message);
      console.error('updateMe body was:', JSON.stringify(req.body));
      next(error);
    }
  },

  // GET /api/employees/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const [employees] = await db.query(
        `SELECT e.*, jt.name as job_title, d.name as department_name,
                m.full_name as supervisor_name, u.role_id
         FROM employees e
         LEFT JOIN job_titles jt ON e.job_title_id = jt.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN employees m ON e.supervisor_id = m.id
         LEFT JOIN users u ON e.user_id = u.id
         WHERE e.id = ?`,
        [id],
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
        fullName,
        personalEmail,
        phone,
        dateOfBirth,
        gender,
        maritalStatus,
        nationalId,
        taxId,
        insuranceId,
        permanentAddress,
        currentAddress,
        emergencyContactName,
        emergencyContactRelationship,
        emergencyContactPhone,
        departmentId,
        jobTitleId,
        hireDate,
        status,
        employeeType,
        education,
        experience,
        workProcess,
        baseSalary,
        allowance,
        dependentsCount,
        bankName,
        bankAccount,
        totalLeaveDays,
        avatarUrl,
        id // Nếu Client gửi ID cụ thể (Mã NV)
      } = req.body;

      if (!fullName) {
        return res.status(400).json({ message: "Không được để trống Họ tên" });
      }

    const [result] = await db.query(
        `INSERT INTO employees (
          full_name, personal_email, avatar_url, phone, date_of_birth, gender, marital_status,
          national_id, tax_id, insurance_id, permanent_address, current_address,
          emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
          department_id, job_title_id, hire_date, status, employee_type,
          education, experience, work_process, base_salary, allowance, dependents_count,
          bank_name, bank_account, total_leave_days, remaining_leave_days${id ? ', id' : ''}
        ) VALUES (${id ? '?,'.repeat(31).slice(0,-1) : '?,'.repeat(30).slice(0,-1)})`,
        [
          fullName, personalEmail || null, avatarUrl || null, phone || null, dateOfBirth || null, gender || null, maritalStatus || 'single',
          nationalId || null, taxId || null, insuranceId || null, permanentAddress || null, currentAddress || null,
          emergencyContactName || null, emergencyContactRelationship || null, emergencyContactPhone || null,
          departmentId || null, jobTitleId || null, hireDate || null, status || "active", employeeType || "full_time",
          education || null, experience || null, workProcess || null, baseSalary || 0, allowance || 0, dependentsCount || 0,
          bankName || null, bankAccount || null, totalLeaveDays || 12, totalLeaveDays || 12,
          ...(id ? [id] : [])
        ],
      );

      res.status(201).json({ id: result.insertId, message: "Tạo nhân viên thành công" });
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
      const fieldMapping = {
        fullName: "full_name",
        personalEmail: "personal_email",
        avatarUrl: "avatar_url",
        phone: "phone",
        dateOfBirth: "date_of_birth",
        gender: "gender",
        maritalStatus: "marital_status",
        nationalId: "national_id",
        taxId: "tax_id",
        insuranceId: "insurance_id",
        permanentAddress: "permanent_address",
        currentAddress: "current_address",
        emergencyContactName: "emergency_contact_name",
        emergencyContactRelationship: "emergency_contact_relationship",
        emergencyContactPhone: "emergency_contact_phone",
        education: "education",
        experience: "experience",
        workProcess: "work_process",
        departmentId: "department_id",
        jobTitleId: "job_title_id",
        hireDate: "hire_date",
        status: "status",
        baseSalary: "base_salary",
        allowance: "allowance",
        employeeType: "employee_type",
        totalLeaveDays: "total_leave_days",
        remainingLeaveDays: "remaining_leave_days",
        profileStatus: "profile_status",
        dependentsCount: "dependents_count",
        bankName: "bank_name",
        bankAccount: "bank_account",
        userId: "user_id"
      };

      const updateFields = [];
      const params = [];
      const dateFields = ['date_of_birth', 'hire_date'];

      Object.keys(updates).forEach((key) => {
        if (fieldMapping[key]) {
          updateFields.push(`${fieldMapping[key]} = ?`);
          let value = updates[key] === '' ? null : updates[key];
          if (value && dateFields.includes(fieldMapping[key])) {
            value = new Date(value).toISOString().split('T')[0];
          }
          params.push(value);
        }
      });

      if (updateFields.length === 0) return res.status(400).json({ message: "No fields to update" });

      params.push(req.params.id);
      await db.query(`UPDATE employees SET ${updateFields.join(", ")} WHERE id = ?`, params);

      res.json({ message: "Cập nhật nhân viên thành công" });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/employees/:id/verify
  async verifyProfile(req, res, next) {
    try {
      const { id } = req.params;
      const verifiedBy = req.user.employeeId;

      await db.query(
        "UPDATE employees SET profile_status = 'verified', verified_by = ? WHERE id = ?",
        [verifiedBy, id]
      );

      res.json({ message: "Đã xác thực hồ sơ nhân viên" });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/employees/:id/role
  async updateRole(req, res, next) {
    try {
      const { id } = req.params;
      const { roleId } = req.body;

      // Chỉ cho phép chuyển đổi giữa HR (2), Manager (3), Employee (4)
      const allowedRoles = [2, 3, 4];
      if (!allowedRoles.includes(Number(roleId))) {
        return res.status(400).json({
          message: "Vai trò không hợp lệ hoặc không được phép thay đổi sang vai trò này."
        });
      }

      // Lấy user_id từ employee
      const [employees] = await db.query("SELECT user_id FROM employees WHERE id = ?", [id]);
      if (employees.length === 0 || !employees[0].user_id) {
        return res.status(404).json({ message: "Không tìm thấy người dùng liên kết với nhân viên này" });
      }

      const userId = employees[0].user_id;

      // Cập nhật role_id trong bảng users
      await db.query("UPDATE users SET role_id = ? WHERE id = ?", [roleId, userId]);

      res.json({ message: "Cập nhật vai trò hệ thống thành công" });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = employeeController;
