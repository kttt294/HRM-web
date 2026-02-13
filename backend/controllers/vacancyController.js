const db = require("../config/database");
const { toCamelCase } = require("../utils/formatters");

const vacancyController = {
  // GET /api/recruitment/vacancies
  // Public route - anyone can view
  async getAll(req, res, next) {
    try {
      const { department, status, search } = req.query;

      let query = `SELECT v.*, 
                v.job_title AS job_title,
                d.name AS department
                FROM vacancies v
                LEFT JOIN departments d ON v.department_id = d.id
                WHERE 1=1`;
      const params = [];

      if (department) {
        query += " AND v.department_id = ?";
        params.push(department);
      }
      if (status) {
        query += " AND v.status = ?";
        params.push(status);
      }
      if (search) {
        query += " AND (v.title LIKE ? OR v.description LIKE ?)";
        params.push(`%${search}%`, `%${search}%`);
      }

      // Default order: Open first, then by date descending
      query += ` ORDER BY 
                CASE WHEN v.status = 'open' THEN 1 ELSE 2 END,
                v.created_at DESC`;

      const [vacancies] = await db.query(query, params);
      
      // Parse requirements from JSON string to array
      const parsedVacancies = vacancies.map(v => {
        if (v.requirements) {
          try {
            v.requirements = JSON.parse(v.requirements);
          } catch (e) {
            // If not JSON, keep as is or split by comma
            v.requirements = v.requirements.includes(',') 
              ? v.requirements.split(',').map(r => r.trim())
              : [v.requirements];
          }
        }
        return v;
      });
      
      res.json(toCamelCase(parsedVacancies));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/recruitment/vacancies/:id
  async getById(req, res, next) {
    try {
      const [vacancies] = await db.query(
        `SELECT v.*, 
                    v.job_title AS job_title,
                    d.name AS department
                FROM vacancies v
                LEFT JOIN departments d ON v.department_id = d.id
                WHERE v.id = ?`,
        [req.params.id],
      );

      if (vacancies.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy vị trí tuyển dụng",
        });
      }

      const vacancy = vacancies[0];
      
      // Parse requirements from JSON string to array
      if (vacancy.requirements) {
        try {
          vacancy.requirements = JSON.parse(vacancy.requirements);
        } catch (e) {
          // If not JSON, keep as is or split by comma
          vacancy.requirements = vacancy.requirements.includes(',') 
            ? vacancy.requirements.split(',').map(r => r.trim())
            : [vacancy.requirements];
        }
      }

      res.json(toCamelCase(vacancy));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/recruitment/vacancies
  // HR only
  async create(req, res, next) {
    try {
      const {
        title,
        jobTitle,
        department,
        description,
        requirements,
        numberOfPositions,
        minSalary,
        maxSalary,
        deadline,
        status,
      } = req.body;

      if (!title) {
        return res.status(400).json({
          message: "Tiêu đề vị trí là bắt buộc",
        });
      }

      // Convert requirements array to JSON string
      const requirementsStr = Array.isArray(requirements)
        ? JSON.stringify(requirements)
        : requirements;

      // Get department_id from department name if provided
      let departmentId = null;
      if (department) {
        const [depts] = await db.query(
          "SELECT id FROM departments WHERE name = ? LIMIT 1",
          [department]
        );
        if (depts.length > 0) {
          departmentId = depts[0].id;
        }
      }

      const [result] = await db.query(
        `INSERT INTO vacancies (
                    title, job_title, department_id, description, requirements, 
                    number_of_positions, min_salary, max_salary, 
                    deadline, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          jobTitle,
          departmentId,
          description,
          requirementsStr,
          numberOfPositions || 1,
          minSalary,
          maxSalary,
          deadline,
          status || "draft",
        ],
      );

      const [newVacancy] = await db.query(
        `SELECT v.*, 
                v.job_title AS job_title,
                d.name AS department
         FROM vacancies v
         LEFT JOIN departments d ON v.department_id = d.id
         WHERE v.id = ?`,
        [result.insertId],
      );

      res.status(201).json(toCamelCase(newVacancy[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/recruitment/vacancies/:id
  // HR only
  async update(req, res, next) {
    try {
      const updates = req.body;
      const fieldMapping = {
        title: "title",
        jobTitle: "job_title",
        department: "department_id",
        description: "description",
        requirements: "requirements",
        numberOfPositions: "number_of_positions",
        minSalary: "min_salary",
        maxSalary: "max_salary",
        deadline: "deadline",
        status: "status",
      };

      const updateFields = [];
      const params = [];

      // Handle department conversion
      if (updates.department) {
        const [depts] = await db.query(
          "SELECT id FROM departments WHERE name = ? LIMIT 1",
          [updates.department]
        );
        if (depts.length > 0) {
          updates.department = depts[0].id;
        } else {
          updates.department = null;
        }
      }

      // Handle requirements array conversion
      if (Array.isArray(updates.requirements)) {
        updates.requirements = JSON.stringify(updates.requirements);
      }

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
        `UPDATE vacancies SET ${updateFields.join(", ")} WHERE id = ?`,
        params,
      );

      const [updatedVacancy] = await db.query(
        `SELECT v.*, 
                v.job_title AS job_title,
                d.name AS department
         FROM vacancies v
         LEFT JOIN departments d ON v.department_id = d.id
         WHERE v.id = ?`,
        [req.params.id],
      );

      if (updatedVacancy.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy vị trí tuyển dụng",
        });
      }

      res.json(toCamelCase(updatedVacancy[0]));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/recruitment/vacancies/:id
  // HR only
  async delete(req, res, next) {
    try {
      const [result] = await db.query("DELETE FROM vacancies WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          message: "Không tìm thấy vị trí tuyển dụng",
        });
      }

      res.json({ message: "Xóa vị trí tuyển dụng thành công" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = vacancyController;
