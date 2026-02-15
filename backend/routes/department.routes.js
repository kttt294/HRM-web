const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const authMiddleware = require("../middleware/auth");
const { requirePermission } = require("../middleware/checkPermission");

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/departments - Lấy danh sách phòng ban
router.get("/", departmentController.getAll);

// GET /api/departments/:id - Chi tiết phòng ban
router.get("/:id", departmentController.getById);

// POST /api/departments - Tạo phòng ban mới (chỉ Admin/HR)
router.post(
  "/",
  requirePermission("manage_employees"),
  departmentController.create,
);

// PATCH /api/departments/:id - Cập nhật phòng ban (chỉ Admin/HR)
router.patch(
  "/:id",
  requirePermission("manage_employees"),
  departmentController.update,
);

// DELETE /api/departments/:id - Xóa phòng ban (chỉ Admin/HR)
router.delete(
  "/:id",
  requirePermission("manage_employees"),
  departmentController.delete,
);

module.exports = router;
