const db = require('../config/database');

const candidateController = {
    // GET /api/recruitment/candidates
    async getAll(req, res, next) {
        try {
            const { status, vacancy_id, source } = req.query;
            
            let query = 'SELECT * FROM candidates WHERE 1=1';
            const params = [];

            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            if (vacancy_id) {
                query += ' AND vacancy_id = ?';
                params.push(vacancy_id);
            }
            if (source) {
                query += ' AND source = ?';
                params.push(source);
            }

            query += ' ORDER BY applied_at DESC';

            const [candidates] = await db.query(query, params);
            res.json(candidates);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/recruitment/candidates/:id
    async getById(req, res, next) {
        try {
            const [candidates] = await db.query(
                'SELECT * FROM candidates WHERE id = ?',
                [req.params.id]
            );

            if (candidates.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy ứng viên' 
                });
            }

            res.json(candidates[0]);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/recruitment/candidates
    async create(req, res, next) {
        try {
            const { 
                vacancy_id,
                full_name, 
                email, 
                phone, 
                address,
                date_of_birth,
                education,
                experience,
                skills,
                resume_url,
                cover_letter,
                source,
                status
            } = req.body;

            if (!vacancy_id || !full_name || !email || !phone) {
                return res.status(400).json({ 
                    message: 'Thiếu thông tin bắt buộc: vacancy_id, full_name, email, phone' 
                });
            }

            // Kiểm tra vacancy có tồn tại không
            const [vacancies] = await db.query(
                'SELECT id FROM vacancies WHERE id = ?',
                [vacancy_id]
            );

            if (vacancies.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy vị trí tuyển dụng' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO candidates (
                    vacancy_id, full_name, email, phone, address, date_of_birth,
                    education, experience, skills, resume_url, cover_letter,
                    source, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    vacancy_id, full_name, email, phone, address, date_of_birth,
                    education, experience, skills, resume_url, cover_letter,
                    source || 'website', status || 'new'
                ]
            );

            const [newCandidate] = await db.query(
                'SELECT * FROM candidates WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(newCandidate[0]);
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/recruitment/candidates/:id
    async update(req, res, next) {
        try {
            const updates = req.body;
            const allowedFields = [
                'full_name', 'email', 'phone', 'address', 'date_of_birth',
                'education', 'experience', 'skills', 'resume_url', 'cover_letter',
                'source', 'status', 'notes'
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
                `UPDATE candidates SET ${updateFields.join(', ')} WHERE id = ?`,
                params
            );

            const [updatedCandidate] = await db.query(
                'SELECT * FROM candidates WHERE id = ?',
                [req.params.id]
            );

            if (updatedCandidate.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy ứng viên' 
                });
            }

            res.json(updatedCandidate[0]);
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/recruitment/candidates/:id
    async delete(req, res, next) {
        try {
            const [result] = await db.query(
                'DELETE FROM candidates WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy ứng viên' 
                });
            }

            res.json({ message: 'Xóa ứng viên thành công' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = candidateController;
