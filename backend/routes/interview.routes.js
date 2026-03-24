const express = require("express");
const router = express.Router();
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/auth");
const { requirePermission } = require("../middleware/checkPermission");
const PERMISSIONS = require("../constants/permissions");

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/recruitment/interviews - Lấy danh sách lịch phỏng vấn
router.get(
  "/",
  requirePermission(PERMISSIONS.MANAGE_RECRUITMENT),
  interviewController.getAll,
);

// GET /api/recruitment/interviews/:id - Chi tiết lịch phỏng vấn
router.get(
  "/:id",
  requirePermission(PERMISSIONS.MANAGE_RECRUITMENT),
  interviewController.getById,
);

// POST /api/recruitment/interviews - Tạo lịch phỏng vấn mới (chỉ HR)
router.post(
  "/",
  requirePermission(PERMISSIONS.MANAGE_RECRUITMENT),
  interviewController.create,
);

// PATCH /api/recruitment/interviews/:id - Cập nhật lịch phỏng vấn (chỉ HR)
router.patch(
  "/:id",
  requirePermission(PERMISSIONS.MANAGE_RECRUITMENT),
  interviewController.update,
);

// PATCH /api/recruitment/interviews/:id/result - Cập nhật kết quả phỏng vấn (chỉ HR)
router.patch(
  "/:id/result",
  requirePermission(PERMISSIONS.MANAGE_RECRUITMENT),
  interviewController.updateResult,
);

// DELETE /api/recruitment/interviews/:id - Xóa lịch phỏng vấn (chỉ HR)
router.delete(
  "/:id",
  requirePermission(PERMISSIONS.MANAGE_RECRUITMENT),
  interviewController.delete,
);

module.exports = router;
