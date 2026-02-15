const express = require("express");
const router = express.Router();
const candidateController = require("../controllers/candidateController");
const authMiddleware = require("../middleware/auth");
const { requirePermission } = require("../middleware/checkPermission");

// POST /api/recruitment/candidates - Tạo ứng viên mới (Public)
router.post(
  "/",
  candidateController.create,
);

// Tất cả routes DUOI DAY cần authentication
router.use(authMiddleware);

// GET /api/recruitment/candidates - Lấy danh sách ứng viên
router.get(
  "/",
  requirePermission("view_candidates"),
  candidateController.getAll,
);

// GET /api/recruitment/candidates/:id - Chi tiết ứng viên
router.get(
  "/:id",
  requirePermission("view_candidates"),
  candidateController.getById,
);

// PATCH /api/recruitment/candidates/:id - Cập nhật ứng viên (chỉ HR)
router.patch(
  "/:id",
  requirePermission("manage_recruitment"),
  candidateController.update,
);

// PATCH /api/recruitment/candidates/:id/status - Cập nhật trạng thái ứng viên (chỉ HR)
router.patch(
  "/:id/status",
  requirePermission("manage_recruitment"),
  candidateController.updateStatus,
);

// DELETE /api/recruitment/candidates/:id - Xóa ứng viên (chỉ HR)
router.delete(
  "/:id",
  requirePermission("manage_recruitment"),
  candidateController.delete,
);

module.exports = router;
