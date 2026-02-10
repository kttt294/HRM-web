const db = require('../config/database');

const salaryController = {
    // GET /api/salary
    async getAll(req, res, next) {
        try {
            const { employeeId, month, year, status } = req.query;
            
            let query = 'SELECT * FROM salary_records WHERE 1=1';
            const params = [];

            // Nếu là employee, chỉ xem lương của mình
            if (req.user.role === 'employee') {
                query += ' AND employee_id = (SELECT id FROM employees WHERE user_id = ?)';
                params.push(req.user.id);
            } else {
                // HR/Admin có thể filter theo employee_id
                if (employeeId) {
                    query += ' AND employee_id = ?';
                    params.push(employeeId);
                }
            }

            if (month) {
                query += ' AND month = ?';
                params.push(month);
            }
            if (year) {
                query += ' AND year = ?';
                params.push(year);
            }
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }

            query += ' ORDER BY year DESC, month DESC';

            const [salaries] = await db.query(query, params);
            res.json(salaries);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/salary/:id
    async getById(req, res, next) {
        try {
            const [salaries] = await db.query(
                'SELECT * FROM salary_records WHERE id = ?',
                [req.params.id]
            );

            if (salaries.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy bảng lương' 
                });
            }

            const salary = salaries[0];

            // Nếu là employee, chỉ xem được lương của mình
            if (req.user.role === 'employee') {
                const [employees] = await db.query(
                    'SELECT id FROM employees WHERE user_id = ?',
                    [req.user.id]
                );
                
                if (employees.length === 0 || employees[0].id !== salary.employee_id) {
                    return res.status(403).json({ 
                        message: 'Bạn không có quyền xem bảng lương này' 
                    });
                }
            }

            res.json(salary);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/salary/employee/:employeeId
    async getByEmployeeId(req, res, next) {
        try {
            const { employeeId } = req.params;

            // Nếu là employee, chỉ xem được lương của mình
            if (req.user.role === 'employee') {
                const [employees] = await db.query(
                    'SELECT id FROM employees WHERE user_id = ?',
                    [req.user.id]
                );
                
                if (employees.length === 0 || employees[0].id.toString() !== employeeId) {
                    return res.status(403).json({ 
                        message: 'Bạn không có quyền xem lịch sử lương này' 
                    });
                }
            }

            const [salaries] = await db.query(
                'SELECT * FROM salary_records WHERE employee_id = ? ORDER BY year DESC, month DESC',
                [employeeId]
            );

            res.json(salaries);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/salary
    async create(req, res, next) {
        try {
            const { 
                employee_id, 
                month, 
                year, 
                base_salary,
                allowance_housing,
                allowance_transport,
                allowance_meal,
                allowance_other,
                deduction_insurance,
                deduction_tax,
                deduction_other,
                net_salary,
                status,
                paid_at
            } = req.body;

            if (!employee_id || !month || !year || base_salary === undefined) {
                return res.status(400).json({ 
                    message: 'Thiếu thông tin bắt buộc: employee_id, month, year, base_salary' 
                });
            }

            // Kiểm tra employee có tồn tại không
            const [employees] = await db.query(
                'SELECT id FROM employees WHERE id = ?',
                [employee_id]
            );

            if (employees.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy nhân viên' 
                });
            }

            // Kiểm tra đã có bảng lương cho tháng này chưa
            const [existing] = await db.query(
                'SELECT id FROM salary_records WHERE employee_id = ? AND month = ? AND year = ?',
                [employee_id, month, year]
            );

            if (existing.length > 0) {
                return res.status(400).json({ 
                    message: 'Đã tồn tại bảng lương cho nhân viên này trong tháng này' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO salary_records (
                    employee_id, month, year, base_salary,
                    allowance_housing, allowance_transport, allowance_meal, allowance_other,
                    deduction_insurance, deduction_tax, deduction_other,
                    net_salary, status, paid_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    employee_id, month, year, base_salary,
                    allowance_housing || 0, allowance_transport || 0, allowance_meal || 0, allowance_other || 0,
                    deduction_insurance || 0, deduction_tax || 0, deduction_other || 0,
                    net_salary, status || 'draft', paid_at
                ]
            );

            const [newSalary] = await db.query(
                'SELECT * FROM salary_records WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(newSalary[0]);
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/salary/:id
    async update(req, res, next) {
        try {
            const updates = req.body;
            const allowedFields = [
                'base_salary', 'allowance_housing', 'allowance_transport', 'allowance_meal', 'allowance_other',
                'deduction_insurance', 'deduction_tax', 'deduction_other', 'net_salary', 'status', 'paid_at'
            ];
            
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
                `UPDATE salary_records SET ${updateFields.join(', ')} WHERE id = ?`,
                params
            );

            const [updatedSalary] = await db.query(
                'SELECT * FROM salary_records WHERE id = ?',
                [req.params.id]
            );

            if (updatedSalary.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy bảng lương' 
                });
            }

            res.json(updatedSalary[0]);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/salary/:id
    async delete(req, res, next) {
        try {
            const [result] = await db.query(
                'DELETE FROM salary_records WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy bảng lương' 
                });
            }

            res.json({ message: 'Xóa bảng lương thành công' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = salaryController;
