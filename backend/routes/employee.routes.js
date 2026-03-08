const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/auth");
const {
  requirePermission,
  requireAnyPermission,
} = require("../middleware/checkPermission");

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// GET /api/employees/me - Lấy thông tin nhân viên của user hiện tại
router.get("/me", employeeController.getMe);

// PATCH /api/employees/me - Nhân viên tự cập nhật thông tin cá nhân
router.patch("/me", employeeController.updateMe);

// GET routes - cần quyền view
router.get("/", requirePermission("view_employees"), employeeController.getAll);
router.get(
  "/:id",
  requirePermission("view_employees"),
  employeeController.getById,
);

// POST - cần quyền create
router.post(
  "/",
  requirePermission("create_employees"),
  employeeController.create,
);

// PATCH - cần quyền update
router.patch(
  "/:id",
  requirePermission("update_employees"),
  employeeController.update,
);


module.exports = router;
