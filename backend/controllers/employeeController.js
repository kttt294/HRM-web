const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const employeeController = {
  // GET /api/employees
  async getAll(req, res, next) {
    try {
        const { 
          name, id, jobTitle, status, departmentId, educationLevel, englishCertificate, schoolName, tenure,
          totalLeaveDays, totalLeaveDaysOp,
          remainingLeaveDays, remainingLeaveDaysOp,
          baseSalary, baseSalaryOp
        } = req.query;

      let query = `SELECT e.*, jt.name as job_title, d.name as department_name, 
                           u.id as user_id, u.username, u.avatar,
                           m.full_name as supervisor_name,
                           (
                             SELECT JSON_ARRAYAGG(
                               JSON_OBJECT(
                                 'id', ed.id,
                                 'educationLevel', ed.education_level,
                                 'major', ed.major,
                                 'schoolName', ed.school_name,
                                 'degreeClassification', ed.degree_classification,
                                 'graduationYear', ed.graduation_year,
                                 'certificateFileUrl', ed.certificate_file_url
                               )
                             )
                             FROM employee_degrees ed 
                             WHERE ed.employee_id = e.id
                           ) as degrees,
                           (
                             SELECT JSON_ARRAYAGG(
                               JSON_OBJECT(
                                 'id', ec.id,
                                 'certificateType', ec.certificate_type,
                                 'score', ec.score,
                                 'issueDate', ec.issue_date,
                                 'expiryDate', ec.expiry_date,
                                 'provider', ec.provider,
                                 'certificateFileUrl', ec.certificate_file_url
                               )
                             )
                             FROM employee_certificates ec
                             WHERE ec.employee_id = e.id
                           ) as certificates
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
      if (educationLevel) {
        query += " AND EXISTS (SELECT 1 FROM employee_degrees ed WHERE ed.employee_id = e.id AND ed.education_level = ?)";
        params.push(educationLevel);
      }
      if (englishCertificate) {
        query += " AND EXISTS (SELECT 1 FROM employee_certificates ec WHERE ec.employee_id = e.id AND ec.certificate_type = ?)";
        params.push(englishCertificate);
      }
      if (schoolName) {
        query += " AND EXISTS (SELECT 1 FROM employee_degrees ed WHERE ed.employee_id = e.id AND ed.school_name LIKE ?)";
        params.push(`%${schoolName}%`);
      }
      if (tenure) {
        // tenure check (in years)
        query += " AND e.hire_date IS NOT NULL";
        if (tenure === '<1') {
          query += " AND TIMESTAMPDIFF(YEAR, e.hire_date, NOW()) < 1";
        } else if (tenure === '1-3') {
          query += " AND TIMESTAMPDIFF(YEAR, e.hire_date, NOW()) >= 1 AND TIMESTAMPDIFF(YEAR, e.hire_date, NOW()) <= 3";
        } else if (tenure === '3-5') {
          query += " AND TIMESTAMPDIFF(YEAR, e.hire_date, NOW()) > 3 AND TIMESTAMPDIFF(YEAR, e.hire_date, NOW()) <= 5";
        } else if (tenure === '>5') {
          query += " AND TIMESTAMPDIFF(YEAR, e.hire_date, NOW()) > 5";
        }
      }
      if (totalLeaveDays) {
        const op = totalLeaveDaysOp === 'lte' ? '<=' : '>=';
        query += ` AND e.total_leave_days ${op} ?`;
        params.push(totalLeaveDays);
      }
      if (remainingLeaveDays) {
        const op = remainingLeaveDaysOp === 'lte' ? '<=' : '>=';
        query += ` AND e.remaining_leave_days ${op} ?`;
        params.push(remainingLeaveDays);
      }
      if (baseSalary) {
        const op = baseSalaryOp === 'lte' ? '<=' : '>=';
        query += ` AND e.base_salary ${op} ?`;
        params.push(baseSalary);
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
                m.full_name as supervisor_name,
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', ed.id,
                      'educationLevel', ed.education_level,
                      'major', ed.major,
                      'schoolName', ed.school_name,
                      'degreeClassification', ed.degree_classification,
                      'graduationYear', ed.graduation_year,
                      'certificateFileUrl', ed.certificate_file_url
                    )
                  )
                  FROM employee_degrees ed 
                  WHERE ed.employee_id = e.id
                ) as degrees,
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', ec.id,
                      'certificateType', ec.certificate_type,
                      'score', ec.score,
                      'issueDate', ec.issue_date,
                      'expiryDate', ec.expiry_date,
                      'provider', ec.provider,
                      'certificateFileUrl', ec.certificate_file_url
                    )
                  )
                  FROM employee_certificates ec
                  WHERE ec.employee_id = e.id
                ) as certificates
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

  // PATCH /api/employees/me - Nhân viên tự gửi yêu cầu cập nhật thông tin cá nhân
  async updateMe(req, res, next) {
    try {
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
        experience: "experience",
        workProcess: "work_process",
        bankName: "bank_name",
        bankAccount: "bank_account",
        degrees: "degrees",
        certificates: "certificates"
      };


      const updates = req.body;
      const dataToUpdate = {};
      
      Object.keys(updates).forEach((key) => {
        if (allowedFields[key] && updates[key] !== undefined) {
          dataToUpdate[key] = updates[key];
        }
      });

      if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: "Không có thông tin thay đổi" });
      }

      const employeeId = req.user.employeeId;

      // Lưu vào bảng profile_updates
      await db.query(
        "INSERT INTO profile_updates (employee_id, data, status) VALUES (?, ?, 'pending')",
        [employeeId, JSON.stringify(dataToUpdate)]
      );

      // Cập nhật trạng thái profile_status của nhân viên thành pending
      await db.query("UPDATE employees SET profile_status = 'pending' WHERE id = ?", [employeeId]);

      // Lấy thông tin nhân viên mới nhất sau khi đã đổi profile_status
      const [newProfile] = await db.query(
        `SELECT e.*, jt.name as job_title, d.name as department_name, 
                m.full_name as supervisor_name
         FROM employees e
         LEFT JOIN job_titles jt ON e.job_title_id = jt.id
         LEFT JOIN departments d ON e.department_id = d.id
         LEFT JOIN employees m ON e.supervisor_id = m.id
         WHERE e.id = ?`,
        [employeeId],
      );

      res.json(toCamelCase(newProfile[0]));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/employees/:id
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const [employees] = await db.query(
        `SELECT e.*, jt.name as job_title, d.name as department_name,
                m.full_name as supervisor_name, u.role_id,
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', ed.id,
                      'educationLevel', ed.education_level,
                      'major', ed.major,
                      'schoolName', ed.school_name,
                      'degreeClassification', ed.degree_classification,
                      'graduationYear', ed.graduation_year,
                      'certificateFileUrl', ed.certificate_file_url
                    )
                  )
                  FROM employee_degrees ed 
                  WHERE ed.employee_id = e.id
                ) as degrees,
                (
                  SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                      'id', ec.id,
                      'certificateType', ec.certificate_type,
                      'score', ec.score,
                      'issueDate', ec.issue_date,
                      'expiryDate', ec.expiry_date,
                      'provider', ec.provider,
                      'certificateFileUrl', ec.certificate_file_url
                    )
                  )
                  FROM employee_certificates ec
                  WHERE ec.employee_id = e.id
                ) as certificates
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

      const employee = employees[0];

      // Security check for Managers
      if (req.user.role === 'manager') {
          const [mgrs] = await db.query("SELECT department_id FROM employees WHERE id = ?", [req.user.employeeId]);
          if (mgrs.length > 0 && employee.department_id !== mgrs[0].department_id) {
              // Manager vẫn có thể xem chính mình ngay cả khi department_id khác (nếu có trường hợp đó)
              if (employee.id !== req.user.employeeId) {
                  return res.status(403).json({ message: "Bạn không có quyền xem nhân viên ngoài phòng ban" });
              }
          }
      }

      res.json(toCamelCase(employee));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/employees
  async create(req, res, next) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const {
        fullName, personalEmail, phone, dateOfBirth, gender, maritalStatus,
        nationalId, taxId, insuranceId, permanentAddress, currentAddress,
        emergencyContactName, emergencyContactRelationship, emergencyContactPhone,
        departmentId, jobTitleId, hireDate, status, employeeType,
        experience, workProcess, baseSalary, allowance, dependents_count,
        bankName, bankAccount, totalLeaveDays, avatarUrl, id,
        degrees, // Mảng bằng cấp
        certificates // Mảng chứng chỉ
      } = req.body;

      if (!fullName) {
        return res.status(400).json({ message: "Không được để trống Họ tên" });
      }

      const [result] = await connection.query(
        `INSERT INTO employees (
          full_name, personal_email, avatar_url, phone, date_of_birth, gender, marital_status,
          national_id, tax_id, insurance_id, permanent_address, current_address,
          emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
          department_id, job_title_id, hire_date, status, employee_type,
          experience, work_process, base_salary, allowance, dependents_count,
          bank_name, bank_account, total_leave_days, remaining_leave_days${id ? ', id' : ''}
        ) VALUES (${id ? '?,'.repeat(30).slice(0,-1) : '?,'.repeat(29).slice(0,-1)})`,
        [
          fullName, personalEmail || null, avatarUrl || null, phone || null, dateOfBirth || null, gender || null, maritalStatus || 'single',
          nationalId || null, taxId || null, insuranceId || null, permanentAddress || null, currentAddress || null,
          emergencyContactName || null, emergencyContactRelationship || null, emergencyContactPhone || null,
          departmentId || null, jobTitleId || null, hireDate || null, status || "active", employeeType || "full_time",
          experience || null, workProcess || null, baseSalary || 0, allowance || 0, dependents_count || 0,
          bankName || null, bankAccount || null, totalLeaveDays || 12, totalLeaveDays || 12,
          ...(id ? [id] : [])
        ],
      );

      const newEmployeeId = id || result.insertId;

      // Chèn bằng cấp nếu có
      if (degrees && Array.isArray(degrees) && degrees.length > 0) {
        for (const deg of degrees) {
          await connection.query(
            `INSERT INTO employee_degrees (
              employee_id, education_level, major, school_name, 
              degree_classification, graduation_year, certificate_file_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              newEmployeeId, deg.educationLevel, deg.major, deg.schoolName,
              deg.degreeClassification, deg.graduationYear || null, deg.certificateFileUrl || null
            ]
          );
        }
      }

      // Chèn chứng chỉ nếu có
      if (certificates && Array.isArray(certificates) && certificates.length > 0) {
        for (const cert of certificates) {
          await connection.query(
            `INSERT INTO employee_certificates (
              employee_id, certificate_type, score, issue_date, expiry_date, provider, certificate_file_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              newEmployeeId, cert.certificateType,
              cert.score || null, cert.issueDate || null, cert.expiryDate || null, cert.provider || null,
              cert.certificateFileUrl || null
            ]
          );
        }
      }

      await connection.commit();
      res.status(201).json({ id: newEmployeeId, message: "Tạo nhân viên thành công" });
    } catch (error) {
      await connection.rollback();
      if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ message: "Mã nhân viên đã tồn tại" });
      }
      next(error);
    } finally {
      connection.release();
    }
  },

  // PATCH /api/employees/:id
  async update(req, res, next) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const updates = req.body;
      const { degrees, certificates } = updates;
      
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

      if (updateFields.length > 0) {
        params.push(req.params.id);
        await connection.query(`UPDATE employees SET ${updateFields.join(", ")} WHERE id = ?`, params);
      }

      // Xử lý bằng cấp (Xóa hết cũ - Chèn mới)
      if (degrees && Array.isArray(degrees)) {
        await connection.query("DELETE FROM employee_degrees WHERE employee_id = ?", [req.params.id]);
        for (const deg of degrees) {
          await connection.query(
            `INSERT INTO employee_degrees (
              employee_id, education_level, major, school_name, 
              degree_classification, graduation_year
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              req.params.id, deg.educationLevel, deg.major, deg.schoolName,
              deg.degreeClassification, deg.graduationYear || null
            ]
          );
        }
      }
      
      // Xử lý chứng chỉ
      if (certificates && Array.isArray(certificates)) {
        await connection.query("DELETE FROM employee_certificates WHERE employee_id = ?", [req.params.id]);
        for (const cert of certificates) {
          await connection.query(
            `INSERT INTO employee_certificates (
              employee_id, certificate_type, score, issue_date, expiry_date, provider, certificate_file_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              req.params.id, cert.certificateType,
              cert.score || null, cert.issueDate || null, cert.expiryDate || null, cert.provider || null,
              cert.certificateFileUrl || null
            ]
          );
        }
      }

      await connection.commit();
      res.json({ message: "Cập nhật nhân viên thành công" });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
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
  },

  // GET /api/employees/pending-updates
  async getPendingUpdates(req, res, next) {
    try {
      const { role, employeeId } = req.user;
      let query = `
        SELECT pu.*, e.full_name as employee_name, e.department_id
        FROM profile_updates pu
        JOIN employees e ON pu.employee_id = e.id
      `;
      const params = [];

      // Nếu là Manager, chỉ lấy yêu cầu của nhân viên trong phòng ban của họ
      if (role === 'manager') {
        const [depts] = await db.query("SELECT id FROM departments WHERE manager_id = ?", [employeeId]);
        if (depts.length > 0) {
          const deptIds = depts.map(d => d.id);
          query += ` WHERE e.department_id IN (?)`;
          params.push(deptIds);
        } else {
          // Manager không phụ trách phòng ban nào thì không thấy gì
          return res.json([]);
        }
      }

      // Chỉ lấy các yêu cầu đang chờ duyệt (status = 'pending')
      if (query.includes('WHERE')) {
          query += " AND pu.status = 'pending'";
      } else {
          query += " WHERE pu.status = 'pending'";
      }

      query += ` ORDER BY pu.requested_at DESC`;
      
      const [updates] = await db.query(query, params);
      res.json(toCamelCase(updates));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/employees/updates/:updateId/approve
  async approveUpdate(req, res, next) {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const { updateId } = req.params;
      const { role, employeeId: processedBy } = req.user;

      const [updates] = await connection.query(`
        SELECT pu.*, e.department_id 
        FROM profile_updates pu
        JOIN employees e ON pu.employee_id = e.id
        WHERE pu.id = ?
      `, [updateId]);

      if (updates.length === 0) throw new Error("Không tìm thấy yêu cầu cập nhật");
      
      const updateRequest = updates[0];

      // Security Check: Manager only manages their department
      if (role === 'manager') {
          const [depts] = await connection.query("SELECT id FROM departments WHERE manager_id = ?", [processedBy]);
          const deptIds = depts.map(d => d.id);
          if (!deptIds.includes(updateRequest.department_id)) {
              return res.status(403).json({ message: "Bạn không có quyền duyệt hồ sơ của nhân viên ngoài phòng ban" });
          }
      }

      const updateData = typeof updateRequest.data === 'string' ? JSON.parse(updateRequest.data) : updateRequest.data;
      const { degrees, certificates } = updateData; // Lấy danh sách bằng cấp/chứng chỉ rừ yêu cầu

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
        experience: "experience",
        workProcess: "work_process",
        bankName: "bank_name",
        bankAccount: "bank_account"
      };

      const setClausesArr = ["profile_status = 'verified'", "verified_by = ?"];
      const employeeParams = [processedBy];
      const dateFields = ['date_of_birth'];

      Object.keys(updateData).forEach(key => {
        if (fieldMapping[key]) {
          setClausesArr.push(`${fieldMapping[key]} = ?`);
          let value = updateData[key];
          if (value && dateFields.includes(fieldMapping[key])) {
            value = new Date(value).toISOString().split('T')[0];
          }
          employeeParams.push(value);
        }
      });

      employeeParams.push(updateRequest.employee_id);
      await connection.query(`UPDATE employees SET ${setClausesArr.join(", ")} WHERE id = ?`, employeeParams);

      // Xử lý đồng bộ bằng cấp nếu có trong yêu cầu
      if (degrees && Array.isArray(degrees)) {
        await connection.query("DELETE FROM employee_degrees WHERE employee_id = ?", [updateRequest.employee_id]);
        for (const deg of degrees) {
          await connection.query(
            `INSERT INTO employee_degrees (
              employee_id, education_level, major, school_name, 
              degree_classification, graduation_year
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              updateRequest.employee_id, deg.educationLevel, deg.major, deg.schoolName,
              deg.degreeClassification, deg.graduationYear || null
            ]
          );
        }
      }

      // Xử lý đồng bộ chứng chỉ
      if (certificates && Array.isArray(certificates)) {
        await connection.query("DELETE FROM employee_certificates WHERE employee_id = ?", [updateRequest.employee_id]);
        for (const cert of certificates) {
          if (cert.certificateType === 'none') continue; // Bỏ qua nếu là "Không có"
          await connection.query(
            `INSERT INTO employee_certificates (
              employee_id, certificate_type, score, issue_date, expiry_date, provider, certificate_file_url
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              updateRequest.employee_id, cert.certificateType,
              cert.score || null, cert.issueDate || null, cert.expiryDate || null, cert.provider || null,
              cert.certificateFileUrl || null
            ]
          );
        }
      }

      // Cập nhật trạng thái yêu cầu
      await connection.query(
        "UPDATE profile_updates SET status = 'approved', processed_at = NOW(), processed_by = ? WHERE id = ?",
        [processedBy, updateId]
      );

      await connection.commit();
      res.json({ message: "Đã duyệt và cập nhật hồ sơ thành công" });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  },

  // POST /api/employees/updates/:updateId/reject
  async rejectUpdate(req, res, next) {
    try {
      const { updateId } = req.params;
      const { role, employeeId: processedBy } = req.user;

      const [updates] = await db.query(`
        SELECT pu.*, e.department_id 
        FROM profile_updates pu
        JOIN employees e ON pu.employee_id = e.id
        WHERE pu.id = ?
      `, [updateId]);

      if (updates.length > 0 && role === 'manager') {
          const [depts] = await db.query("SELECT id FROM departments WHERE manager_id = ?", [processedBy]);
          const deptIds = depts.map(d => d.id);
          if (!deptIds.includes(updates[0].department_id)) {
              return res.status(403).json({ message: "Bạn không có quyền từ chối yêu cầu ngoài phòng ban" });
          }
      }

      // Cập nhật trạng thái yêu cầu và reset trạng thái hồ sơ nhân viên
      const connection = await db.getConnection();
      try {
          await connection.beginTransaction();
          
          await connection.query(
              "UPDATE profile_updates SET status = 'rejected', processed_at = NOW(), processed_by = ? WHERE id = ?",
              [processedBy, updateId]
          );

          // Reset trạng thái hồ sơ nhân viên về verified (vì bản cũ vẫn đang đúng)
          await connection.query("UPDATE employees SET profile_status = 'verified' WHERE id = ?", [updates[0].employee_id]);

          await connection.commit();
          res.json({ message: "Đã từ chối yêu cầu cập nhật hồ sơ" });
      } catch (err) {
          await connection.rollback();
          throw err;
      } finally {
          connection.release();
      }
    } catch (error) {
      next(error);
    }
  }
};

module.exports = employeeController;
