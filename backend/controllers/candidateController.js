const db = require('../config/database');
const { toCamelCase } = require('../utils/formatters');

const candidateController = {
    // GET /api/recruitment/candidates
    async getAll(req, res, next) {
        try {
            const { vacancyId, status, search } = req.query;
            
            let query = `
                SELECT c.*, v.title as vacancy_title 
                FROM candidates c
                LEFT JOIN vacancies v ON c.vacancy_id = v.id
                WHERE 1=1
            `;
            const params = [];

            if (vacancyId) {
                query += ' AND c.vacancy_id = ?';
                params.push(vacancyId);
            }
            if (status) {
                query += ' AND c.status = ?';
                params.push(status);
            }
            if (search) {
                query += ' AND (c.full_name LIKE ? OR c.email LIKE ?)';
                params.push(`%${search}%`, `%${search}%`);
            }

            query += ' ORDER BY c.created_at DESC';

            const [candidates] = await db.query(query, params);
            res.json(toCamelCase(candidates));
        } catch (error) {
            next(error);
        }
    },

    // GET /api/recruitment/candidates/:id
    async getById(req, res, next) {
        try {
            const [candidates] = await db.query(
                `SELECT c.*, v.title as vacancy_title 
                 FROM candidates c
                 LEFT JOIN vacancies v ON c.vacancy_id = v.id
                 WHERE c.id = ?`,
                [req.params.id]
            );

            if (candidates.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy ứng viên' 
                });
            }

            res.json(toCamelCase(candidates[0]));
        } catch (error) {
            next(error);
        }
    },

    // POST /api/recruitment/candidates
    // Public route for application
    async create(req, res, next) {
        try {
            const { 
                fullName, 
                email, 
                phone, 
                vacancyId, 
                resumeUrl, 
                notes 
            } = req.body;

            if (!fullName || !email) {
                return res.status(400).json({ 
                    message: 'Họ tên và email là bắt buộc' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO candidates (
                    full_name, email, phone, vacancy_id, 
                    resume_url, notes, status, applied_at
                ) VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
                [
                    fullName, email, phone, vacancyId, 
                    resumeUrl, notes
                ]
            );

            const [newCandidate] = await db.query(
                'SELECT * FROM candidates WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(toCamelCase(newCandidate[0]));
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/recruitment/candidates/:id
    // HR only - update status or notes
    async update(req, res, next) {
        try {
            const updates = req.body;
            const fieldMapping = {
                fullName: 'full_name',
                email: 'email',
                phone: 'phone',
                vacancyId: 'vacancy_id',
                resumeUrl: 'resume_url',
                status: 'status',
                notes: 'notes'
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

            res.json(toCamelCase(updatedCandidate[0]));
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
