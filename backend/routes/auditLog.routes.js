const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { requirePermission } = require("../middleware/checkPermission");
const auditLogController = require("../controllers/auditLogController");

/**
 * ============================================
 * AUDIT LOG ROUTES — Chỉ dành cho Admin
 * ============================================
 * Tất cả endpoints yêu cầu:
 * 1. Đăng nhập (authMiddleware)
 * 2. Quyền manage_users (requirePermission)
 */

// GET /api/audit-logs/stats — Thống kê tổng quan (phải đặt TRƯỚC /:id)
router.get(
  "/stats",
  authMiddleware,
  requirePermission("manage_users"),
  auditLogController.getAuditLogStats
);

// GET /api/audit-logs — Danh sách có filter + phân trang
router.get(
  "/",
  authMiddleware,
  requirePermission("manage_users"),
  auditLogController.getAuditLogs
);

// GET /api/audit-logs/:id — Chi tiết 1 bản ghi
router.get(
  "/:id",
  authMiddleware,
  requirePermission("manage_users"),
  auditLogController.getAuditLogById
);

module.exports = router;
