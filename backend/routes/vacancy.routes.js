const express = require('express');
const router = express.Router();
const vacancyController = require('../controllers/vacancyController');
const authMiddleware = require('../middleware/auth');
const { requirePermission } = require('../middleware/checkPermission');
const { dataScope } = require('../middleware/dataScope');

// GET /api/recruitment/vacancies - Lấy danh sách vị trí tuyển dụng
router.get('/', (req, res, next) => {
    if (req.headers.authorization) {
        return authMiddleware(req, res, next);
    }
    next();
}, dataScope('vacancy'), vacancyController.getAll);

// GET /api/recruitment/vacancies/:id - Chi tiết vị trí tuyển dụng
router.get('/:id', vacancyController.getById);

// Tất cả routes DUOI DAY cần authentication bắt buộc
router.use(authMiddleware);

// POST /api/recruitment/vacancies - Tạo vị trí mới (chỉ HR)
router.post('/', requirePermission('manage_recruitment'), vacancyController.create);

// PATCH /api/recruitment/vacancies/:id - Cập nhật vị trí (chỉ HR)
router.patch('/:id', requirePermission('manage_recruitment'), vacancyController.update);

// DELETE /api/recruitment/vacancies/:id - Xóa vị trí (chỉ HR)
router.delete('/:id', requirePermission('manage_recruitment'), vacancyController.delete);

module.exports = router;
