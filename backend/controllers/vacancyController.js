const db = require('../config/database');

const vacancyController = {
    // GET /api/recruitment/vacancies
    async getAll(req, res, next) {
        try {
            const { status, department_id } = req.query;
            
            let query = 'SELECT * FROM vacancies WHERE 1=1';
            const params = [];

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            if (department_id) {
                query += ' AND department_id = ?';
                params.push(department_id);
            }

            query += ' ORDER BY created_at DESC';

            const [vacancies] = await db.query(query, params);
            res.json(vacancies);
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

            res.json(vacancies[0]);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/recruitment/vacancies
    async create(req, res, next) {
        try {
            const { 
                title, 
                department_id, 
                description, 
                requirements, 
                salary_range,
                location,
                employment_type,
                experience_level,
                number_of_positions,
                deadline,
                status
            } = req.body;

            if (!title || !department_id) {
                return res.status(400).json({ 
                    message: 'Thiếu thông tin bắt buộc: title, department_id' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO vacancies (
                    title, department_id, description, requirements, salary_range,
                    location, employment_type, experience_level, number_of_positions,
                    deadline, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    title, department_id, description, requirements, salary_range,
                    location, employment_type, experience_level, number_of_positions || 1,
                    deadline, status || 'open'
                ]
            );

            const [newVacancy] = await db.query(
                'SELECT * FROM vacancies WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(newVacancy[0]);
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/recruitment/vacancies/:id
    async update(req, res, next) {
        try {
            const updates = req.body;
            const allowedFields = [
                'title', 'department_id', 'description', 'requirements', 'salary_range',
                'location', 'employment_type', 'experience_level', 'number_of_positions',
                'deadline', 'status'
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

            res.json(updatedVacancy[0]);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/recruitment/vacancies/:id
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
