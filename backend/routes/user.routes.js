const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");
const { requirePermission } = require("../middleware/checkPermission");

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/users - Lấy danh sách user (chỉ Admin)
router.get("/", requirePermission("manage_users"), userController.getAll);

// GET /api/users/:id - Chi tiết user (chỉ Admin)
router.get("/:id", requirePermission("manage_users"), userController.getById);

// POST /api/users - Tạo user mới (chỉ Admin)
router.post("/", requirePermission("manage_users"), userController.create);

// PATCH /api/users/:id - Cập nhật user (chỉ Admin)
router.patch("/:id", requirePermission("manage_users"), userController.update);

// DELETE /api/users/:id - Xóa user (chỉ Admin)
router.delete(
  "/:id",
  requirePermission("manage_users"),
  userController.delete,
);

// POST /api/users/:id/reset-password - Reset mật khẩu (chỉ Admin)
router.post(
  "/:id/reset-password",
  requirePermission("manage_users"),
  userController.resetPassword,
);

// PATCH /api/users/:id/toggle-lock - Khóa/mở khóa tài khoản (chỉ Admin)
router.patch(
  "/:id/toggle-lock",
  requirePermission("manage_users"),
  userController.toggleLock,
);

module.exports = router;
