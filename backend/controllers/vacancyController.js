const db = require('../config/database');
const { toCamelCase } = require('../utils/formatters');

const vacancyController = {
    // GET /api/recruitment/vacancies
    // Public route - anyone can view
    async getAll(req, res, next) {
        try {
            const { department, status, search } = req.query;
            
            let query = 'SELECT * FROM vacancies WHERE 1=1';
            const params = [];

            if (department) {
                query += ' AND department = ?';
                params.push(department);
            }
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            if (search) {
                query += ' AND (title LIKE ? OR description LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            // Default order: Open first, then by date descending
            query += ` ORDER BY 
                CASE WHEN status = 'open' THEN 1 ELSE 2 END,
                created_at DESC`;

            const [vacancies] = await db.query(query, params);
            res.json(toCamelCase(vacancies));
        } catch (error) {
            next(error);
        }
    },

    // GET /api/recruitment/vacancies/:id
    async getById(req, res, next) {
        try {
            const [vacancies] = await db.query(
                'SELECT * FROM vacancies WHERE id = ?',
                [req.params.id]
            );

            if (vacancies.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy vị trí tuyển dụng' 
                });
            }

            res.json(toCamelCase(vacancies[0]));
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
                department, 
                description, 
                requirements, 
                numberOfPositions, 
                minSalary, 
                maxSalary, 
                deadline,
                status 
            } = req.body;

            if (!title) {
                return res.status(400).json({ 
                    message: 'Tiêu đề vị trí là bắt buộc' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO vacancies (
                    title, department, description, requirements, 
                    number_of_positions, min_salary, max_salary, 
                    deadline, status, posted_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)`,
                [
                    title, department, description, requirements, 
                    numberOfPositions || 1, minSalary, maxSalary, 
                    deadline, status || 'draft'
                ]
            );

            const [newVacancy] = await db.query(
                'SELECT * FROM vacancies WHERE id = ?',
                [result.insertId]
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
                title: 'title',
                department: 'department',
                description: 'description',
                requirements: 'requirements',
                numberOfPositions: 'number_of_positions',
                minSalary: 'min_salary',
                maxSalary: 'max_salary',
                deadline: 'deadline',
                status: 'status'
            };
            
            const updateFields = [];
            const params = [];

            Object.keys(updates).forEach(key => {
                if (fieldMapping[key]) {
                    updateFields.push(`${fieldMapping[key]} = ?`);
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
                `UPDATE vacancies SET ${updateFields.join(', ')} WHERE id = ?`,
                params
            );

            const [updatedVacancy] = await db.query(
                'SELECT * FROM vacancies WHERE id = ?',
                [req.params.id]
            );

            if (updatedVacancy.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy vị trí tuyển dụng' 
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
            const [result] = await db.query(
                'DELETE FROM vacancies WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy vị trí tuyển dụng' 
                });
            }

            res.json({ message: 'Xóa vị trí tuyển dụng thành công' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = vacancyController;
