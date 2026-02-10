const db = require('../config/database');

const interviewController = {
    // GET /api/recruitment/interviews
    async getAll(req, res, next) {
        try {
            const { candidate_id, status, interviewer_id } = req.query;
            
            let query = 'SELECT * FROM interviews WHERE 1=1';
            const params = [];

            if (candidate_id) {
                query += ' AND candidate_id = ?';
                params.push(candidate_id);
            }
            if (status) {
                query += ' AND status = ?';
                params.push(status);
            }
            if (interviewer_id) {
                query += ' AND interviewer_id = ?';
                params.push(interviewer_id);
            }

            query += ' ORDER BY interview_date DESC, interview_time DESC';

            const [interviews] = await db.query(query, params);
            res.json(interviews);
        } catch (error) {
            next(error);
        }
    },

    // GET /api/recruitment/interviews/:id
    async getById(req, res, next) {
        try {
            const [interviews] = await db.query(
                'SELECT * FROM interviews WHERE id = ?',
                [req.params.id]
            );

            if (interviews.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy lịch phỏng vấn' 
                });
            }

            res.json(interviews[0]);
        } catch (error) {
            next(error);
        }
    },

    // POST /api/recruitment/interviews
    async create(req, res, next) {
        try {
            const { 
                candidate_id,
                interviewer_id,
                interview_date, 
                interview_time, 
                location,
                interview_type,
                notes,
                status
            } = req.body;

            if (!candidate_id || !interviewer_id || !interview_date || !interview_time) {
                return res.status(400).json({ 
                    message: 'Thiếu thông tin bắt buộc: candidate_id, interviewer_id, interview_date, interview_time' 
                });
            }

            // Kiểm tra candidate có tồn tại không
            const [candidates] = await db.query(
                'SELECT id FROM candidates WHERE id = ?',
                [candidate_id]
            );

            if (candidates.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy ứng viên' 
                });
            }

            // Kiểm tra interviewer (employee) có tồn tại không
            const [interviewers] = await db.query(
                'SELECT id FROM employees WHERE id = ?',
                [interviewer_id]
            );

            if (interviewers.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy người phỏng vấn' 
                });
            }

            const [result] = await db.query(
                `INSERT INTO interviews (
                    candidate_id, interviewer_id, interview_date, interview_time,
                    location, interview_type, notes, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    candidate_id, interviewer_id, interview_date, interview_time,
                    location, interview_type || 'in-person', notes, status || 'scheduled'
                ]
            );

            const [newInterview] = await db.query(
                'SELECT * FROM interviews WHERE id = ?',
                [result.insertId]
            );

            res.status(201).json(newInterview[0]);
        } catch (error) {
            next(error);
        }
    },

    // PATCH /api/recruitment/interviews/:id
    async update(req, res, next) {
        try {
            const updates = req.body;
            const allowedFields = [
                'interview_date', 'interview_time', 'location', 'interview_type',
                'notes', 'status', 'result', 'feedback'
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

            res.json(updatedInterview[0]);
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
