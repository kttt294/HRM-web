const db = require('../config/database');

const employeeController = {
    // GET /api/employees
    async getAll(req, res, next) {
        try {
            const { name, id, jobTitle, status } = req.query;
            
            let query = 'SELECT * FROM employees WHERE 1=1';
            const params = [];

            if (name) {
                query += ' AND full_name LIKE ?';
                params.push(`%${name}%`);
            }
            if (id) {
                query += ' AND employee_id LIKE ?';
                params.push(`%${id}%`);
            }
            if (jobTitle) {
                query += ' AND job_title LIKE ?';
                params.push(`%${jobTitle}%`);
            }
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            const [employees] = await db.query(query, params);
            res.json(employees);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/employees/:id
    async getById(req, res, next) {
        try {
            const [employees] = await db.query(
                'SELECT * FROM employees WHERE id = ?',
                [req.params.id]
            );

            if (employees.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy nhân viên' 
                });
            }

            res.json(employees[0]);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/employees
    async create(req, res, next) {
        try {
            const { employee_id, full_name, email, phone, job_title, department, hire_date, status } = req.body;

            if (!employee_id || !full_name) {
                return res.status(400).json({ 
                    message: 'Mã nhân viên và họ tên là bắt buộc' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO employees (employee_id, full_name, email, phone, job_title, department, hire_date, status) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [employee_id, full_name, email, phone, job_title, department, hire_date, status || 'active']
            );

            const [newEmployee] = await db.query(
                'SELECT * FROM employees WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(newEmployee[0]);
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ 
                    message: 'Mã nhân viên đã tồn tại' 
                });
            }
            next(error);
        }
    },

    // PATCH /api/employees/:id
    async update(req, res, next) {
        try {
            const updates = req.body;
            const allowedFields = ['full_name', 'email', 'phone', 'job_title', 'department', 'hire_date', 'status'];
            
            const updateFields = [];
            const params = [];

            Object.keys(updates).forEach(key => {
                if (allowedFields.includes(key)) {
                    updateFields.push(`${key} = ?`);
                    params.push(updates[key]);
                }
            });

            if (updateFields.length === 0) {
                return res.status(400).json({ 
                    message: 'Không có trường nào để cập nhật' 
                });
            }

            params.push(req.params.id);

            await db.query(
                `UPDATE employees SET ${updateFields.join(', ')} WHERE id = ?`,
                params
            );

            const [updatedEmployee] = await db.query(
                'SELECT * FROM employees WHERE id = ?',
                [req.params.id]
            );

            if (updatedEmployee.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy nhân viên' 
                });
            }

            res.json(updatedEmployee[0]);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/employees/:id
    async delete(req, res, next) {
        try {
            const [result] = await db.query(
                'DELETE FROM employees WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy nhân viên' 
                });
            }

            res.json({ message: 'Xóa nhân viên thành công' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = employeeController;
