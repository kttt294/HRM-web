const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/checkPermission');

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/recruitment/vacancies - Lấy danh sách vị trí tuyển dụng
router.get('/', vacancyController.getAll);

// GET /api/recruitment/vacancies/:id - Chi tiết vị trí tuyển dụng
router.get('/:id', vacancyController.getById);

// POST /api/recruitment/vacancies - Tạo vị trí mới (chỉ HR)
router.post('/', requirePermission('manage_recruitment'), vacancyController.create);

// PATCH /api/recruitment/vacancies/:id - Cập nhật vị trí (chỉ HR)
router.patch('/:id', requirePermission('manage_recruitment'), vacancyController.update);

// DELETE /api/recruitment/vacancies/:id - Xóa vị trí (chỉ HR)
router.delete('/:id', requirePermission('manage_recruitment'), vacancyController.delete);

module.exports = router;
