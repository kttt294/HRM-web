const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/checkPermission');

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/recruitment/candidates - Lấy danh sách ứng viên
router.get('/', requirePermission('view_candidates'), candidateController.getAll);

// GET /api/recruitment/candidates/:id - Chi tiết ứng viên
router.get('/:id', requirePermission('view_candidates'), candidateController.getById);

// POST /api/recruitment/candidates - Tạo ứng viên mới (chỉ HR)
router.post('/', requirePermission('manage_recruitment'), candidateController.create);

// PATCH /api/recruitment/candidates/:id - Cập nhật ứng viên (chỉ HR)
router.patch('/:id', requirePermission('manage_recruitment'), candidateController.update);

// DELETE /api/recruitment/candidates/:id - Xóa ứng viên (chỉ HR)
router.delete('/:id', requirePermission('manage_recruitment'), candidateController.delete);

module.exports = router;
