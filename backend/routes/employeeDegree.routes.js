const express = require("express");
const router = express.Router();
const employeeDegreeController = require("../controllers/employeeDegreeController");
const authMiddleware = require("../middleware/auth");
const { requirePermission, requireAnyPermission } = require("../middleware/checkPermission");
const PERMISSIONS = require("../constants/permissions");

// Tất cả routes đều cần authentication
router.use(authMiddleware);

// GET - Lấy danh sách bằng cấp của user hiện tại
router.get("/my", employeeDegreeController.getMy);

// GET - Lấy danh sách bằng cấp của 1 nhân viên (Phân quyền chi tiết trong Controller)
router.get("/employee/:employeeId", employeeDegreeController.getByEmployee);

// POST - Bổ sung danh mục ENUM mới (Dành cho HR/Admin)
router.post(
  "/enums/add",
  requirePermission(PERMISSIONS.MANAGE_EMPLOYEES),
  employeeDegreeController.addEnumValue
);


// PUT - Đổi tên danh mục ENUM (Dành cho HR/Admin)
router.put(
  "/enums/update",
  requirePermission(PERMISSIONS.MANAGE_EMPLOYEES),
  employeeDegreeController.updateEnumValue
);


// DELETE - Có mục ENUM (Dành cho HR/Admin)
router.delete(
  "/enums/delete",
  requirePermission(PERMISSIONS.MANAGE_EMPLOYEES),
  employeeDegreeController.deleteEnumValue
);


// POST - Thêm bằng cấp mới
router.post(
  "/", 
  requirePermission(PERMISSIONS.UPDATE_EMPLOYEES), 
  employeeDegreeController.create
);


// PATCH - Cập nhật thông tin bằng cấp
router.patch(
  "/:id", 
  requirePermission(PERMISSIONS.UPDATE_EMPLOYEES), 
  employeeDegreeController.update
);


// DELETE - Xóa bằng cấp
router.delete(
  "/:id", 
  requirePermission(PERMISSIONS.UPDATE_EMPLOYEES), 
  employeeDegreeController.delete
);


module.exports = router;
