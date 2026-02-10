const db = require('../config/database');
const { toCamelCase } = require('../utils/formatters');

const interviewController = {
    // GET /api/recruitment/interviews
    async getAll(req, res, next) {
        try {
            const { status, date } = req.query;
            
            let query = `
                SELECT i.*, c.full_name as candidate_name, v.title as vacancy_title
                FROM interviews i
                JOIN candidates c ON i.candidate_id = c.id
                LEFT JOIN vacancies v ON i.vacancy_id = v.id
                WHERE 1=1
            `;
            const params = [];

            if (status) {
                query += ' AND i.status = ?';
                params.push(status);
            }
            if (date) {
                query += ' AND DATE(i.interview_date) = ?';
                params.push(date);
            }

            query += ' ORDER BY i.interview_date ASC';

            const [interviews] = await db.query(query, params);
            res.json(toCamelCase(interviews));
        } catch (error) {
            next(error);
        }
    },

    // GET /api/recruitment/interviews/:id
    async getById(req, res, next) {
        try {
            const [interviews] = await db.query(
                `SELECT i.*, c.full_name as candidate_name, v.title as vacancy_title
                 FROM interviews i
                 JOIN candidates c ON i.candidate_id = c.id
                 LEFT JOIN vacancies v ON i.vacancy_id = v.id
                 WHERE i.id = ?`,
                [req.params.id]
            );

            if (interviews.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy lịch phỏng vấn' 
                });
            }

            res.json(toCamelCase(interviews[0]));
        } catch (error) {
            next(error);
        }
    },

    // POST /api/recruitment/interviews
    async create(req, res, next) {
        try {
            const { 
                candidateId, 
                vacancyId, 
                title, 
                interviewDate, 
                location, 
                interviewerId, 
                interviewerName, 
                notes 
            } = req.body;

            if (!candidateId || !interviewDate) {
                return res.status(400).json({ 
                    message: 'Ứng viên và ngày phỏng vấn là bắt buộc' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO interviews (
                    candidate_id, vacancy_id, title, interview_date, 
                    location, interviewer_id, interviewer_name, 
                    status, result, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, 'scheduled', 'pending', ?)`,
                [
                    candidateId, vacancyId, title, interviewDate, 
                    location, interviewerId, interviewerName, notes
                ]
            );

            // Cập nhật trạng thái ứng viên thành 'interview'
            await db.query(
                'UPDATE candidates SET status = ? WHERE id = ?',
                ['interview', candidateId]
            );

            const [newInterview] = await db.query(
                'SELECT * FROM interviews WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(toCamelCase(newInterview[0]));
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/recruitment/interviews/:id
    async update(req, res, next) {
        try {
            const updates = req.body;
            const fieldMapping = {
                title: 'title',
                interviewDate: 'interview_date',
                location: 'location',
                interviewerId: 'interviewer_id',
                interviewerName: 'interviewer_name',
                status: 'status',
                result: 'result',
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
                `UPDATE interviews SET ${updateFields.join(', ')} WHERE id = ?`,
                params
            );

            const [updatedInterview] = await db.query(
                'SELECT * FROM interviews WHERE id = ?',
                [req.params.id]
            );

            if (updatedInterview.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy lịch phỏng vấn' 
                });
            }

            res.json(toCamelCase(updatedInterview[0]));
        } catch (error) {
            next(error);
        }
    },

    // DELETE /api/recruitment/interviews/:id
    async delete(req, res, next) {
        try {
            const [result] = await db.query(
                'DELETE FROM interviews WHERE id = ?',
                [req.params.id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy lịch phỏng vấn' 
                });
            }

            res.json({ message: 'Xóa lịch phỏng vấn thành công' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = interviewController;
