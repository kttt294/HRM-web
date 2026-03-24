const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const authMiddleware = require("../middleware/auth");
const { requirePermission, requireAnyPermission } = require("../middleware/checkPermission");
const { dataScope } = require("../middleware/dataScope");
const PERMISSIONS = require("../constants/permissions");

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// GET /api/employees/me - Lấy thông tin nhân viên của user hiện tại
router.get("/me", employeeController.getMe);

// PATCH /api/employees/me - Nhân viên tự cập nhật thông tin cá nhân
router.patch("/me", employeeController.updateMe);

// Xử lý yêu cầu cập nhật hồ sơ (Manager/HR) - Đặt TRÊN các route :id để tránh bị bắt nhầm
router.get(
  "/pending-updates",
  requireAnyPermission([PERMISSIONS.MANAGE_EMPLOYEES, PERMISSIONS.VIEW_DEPT_EMPLOYEES]),
  employeeController.getPendingUpdates
);


router.post(
  "/updates/:updateId/approve",
  requireAnyPermission([PERMISSIONS.MANAGE_EMPLOYEES, PERMISSIONS.VIEW_DEPT_EMPLOYEES]),
  employeeController.approveUpdate
);


router.post(
  "/updates/:updateId/reject",
  requireAnyPermission([PERMISSIONS.MANAGE_EMPLOYEES, PERMISSIONS.VIEW_DEPT_EMPLOYEES]),
  employeeController.rejectUpdate
);


// GET routes - cần quyền view (Tích hợp Data Scoping cho Manager)
router.get(
  "/",
  requireAnyPermission([PERMISSIONS.VIEW_EMPLOYEES, PERMISSIONS.VIEW_DEPT_EMPLOYEES]),
  dataScope("employee"),
  employeeController.getAll
);


router.get("/:id", requireAnyPermission([PERMISSIONS.VIEW_EMPLOYEES, PERMISSIONS.VIEW_DEPT_EMPLOYEES]), employeeController.getById);

// POST - cần quyền create
router.post("/", requirePermission(PERMISSIONS.CREATE_EMPLOYEES), employeeController.create);

// PATCH - cần quyền update
router.patch("/:id", requirePermission(PERMISSIONS.UPDATE_EMPLOYEES), employeeController.update);

// POST - Xác thực hồ sơ (Manager/HR)
router.post(
  "/:id/verify",
  requirePermission(PERMISSIONS.MANAGE_EMPLOYEES),
  employeeController.verifyProfile
);


// PATCH - Cập nhật vai trò hệ thống (HR/Admin)
router.patch(
  "/:id/role",
  requirePermission(PERMISSIONS.MANAGE_EMPLOYEES),
  employeeController.updateRole
);


module.exports = router;
