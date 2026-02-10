const express = require('express');
const router = express.Router();
const interviewController = require('../controllers/interviewController');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/checkPermission');

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/recruitment/interviews - Lấy danh sách lịch phỏng vấn
router.get('/', requirePermission('manage_recruitment'), interviewController.getAll);

// GET /api/recruitment/interviews/:id - Chi tiết lịch phỏng vấn
router.get('/:id', requirePermission('manage_recruitment'), interviewController.getById);

// POST /api/recruitment/interviews - Tạo lịch phỏng vấn mới (chỉ HR)
router.post('/', requirePermission('manage_recruitment'), interviewController.create);

// PATCH /api/recruitment/interviews/:id - Cập nhật lịch phỏng vấn (chỉ HR)
router.patch('/:id', requirePermission('manage_recruitment'), interviewController.update);

// DELETE /api/recruitment/interviews/:id - Xóa lịch phỏng vấn (chỉ HR)
router.delete('/:id', requirePermission('manage_recruitment'), interviewController.delete);

module.exports = router;
