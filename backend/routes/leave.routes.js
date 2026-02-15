const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/leaveController");
const authMiddleware = require("../middleware/auth");
const { requirePermission } = require("../middleware/checkPermission");

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET /api/leaves/my - Lấy đơn nghỉ phép của user hiện tại
router.get("/my", leaveController.getMy);

// GET /api/leaves/my/balance - Lấy số ngày phép còn lại của user hiện tại
router.get("/my/balance", leaveController.getMyBalance);

// GET /api/leaves - Lấy danh sách đơn nghỉ phép (HR: xem tất cả, Employee: chỉ của mình)
router.get("/", leaveController.getAll);

// GET /api/leaves/employee/:employeeId - Lấy đơn nghỉ phép của 1 nhân viên
router.get("/employee/:employeeId", leaveController.getByEmployee);

// GET /api/leaves/balance/:employeeId - Lấy số ngày phép còn lại
router.get("/balance/:employeeId", leaveController.getBalance);

// POST /api/leaves - Tạo đơn nghỉ phép mới
router.post("/", leaveController.create);

// PATCH /api/leaves/:id/approve - Duyệt đơn (chỉ HR)
router.patch(
  "/:id/approve",
  requirePermission("manage_employees"),
  leaveController.approve,
);

// PATCH /api/leaves/:id/reject - Từ chối đơn (chỉ HR)
router.patch(
  "/:id/reject",
  requirePermission("manage_employees"),
  leaveController.reject,
);

// DELETE /api/leaves/:id - Hủy đơn (Employee chỉ hủy được đơn pending)
router.delete("/:id", leaveController.delete);

module.exports = router;
