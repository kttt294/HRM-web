const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const authMiddleware = require("../middleware/auth");
const {
  requirePermission,
  requireAnyPermission,
} = require("../middleware/checkPermission");

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/salary/my - Lấy bảng lương của user hiện tại (tất cả role)
router.get("/my", salaryController.getMy);

// GET /api/salary - Lấy danh sách bảng lương
// HR: xem tất cả, Employee: chỉ xem của mình
router.get("/", salaryController.getAll);

// GET /api/salary/:id - Lấy chi tiết 1 bảng lương
router.get("/:id", salaryController.getById);

// GET /api/salary/employee/:employeeId - Lịch sử lương của 1 nhân viên
router.get("/employee/:employeeId", salaryController.getByEmployeeId);

// POST /api/salary - Tạo bảng lương mới (chỉ HR)
router.post(
  "/",
  requirePermission("manage_employees"),
  salaryController.create,
);

// PATCH /api/salary/:id - Cập nhật bảng lương (chỉ HR)
router.patch(
  "/:id",
  requirePermission("manage_employees"),
  salaryController.update,
);

// DELETE /api/salary/:id - Xóa bảng lương (chỉ HR)
router.delete(
  "/:id",
  requirePermission("manage_employees"),
  salaryController.delete,
);

module.exports = router;
