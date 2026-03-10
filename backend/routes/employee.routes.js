const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/auth");
const { requirePermission, requireAnyPermission } = require("../middleware/checkPermission");
const { dataScope } = require("../middleware/dataScope");

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// GET /api/employees/me - Lấy thông tin nhân viên của user hiện tại
router.get("/me", employeeController.getMe);

// PATCH /api/employees/me - Nhân viên tự cập nhật thông tin cá nhân
router.patch("/me", employeeController.updateMe);

// GET routes - cần quyền view (Tích hợp Data Scoping cho Manager)
router.get(
  "/",
  requireAnyPermission(["view_employees", "view_dept_employees"]),
  dataScope("employee"),
  employeeController.getAll
);

router.get("/:id", requireAnyPermission(["view_employees", "view_dept_employees"]), employeeController.getById);

// POST - cần quyền create
router.post("/", requirePermission("create_employees"), employeeController.create);

// PATCH - cần quyền update
router.patch("/:id", requirePermission("update_employees"), employeeController.update);

// POST - Xác thực hồ sơ (Manager/HR)
router.post(
  "/:id/verify",
  requirePermission("manage_employees"),
  employeeController.verifyProfile
);// PATCH - Cập nhật vai trò hệ thống (HR/Admin)
router.patch(
  "/:id/role",
  requirePermission("manage_employees"),
  employeeController.updateRole
);


module.exports = router;
