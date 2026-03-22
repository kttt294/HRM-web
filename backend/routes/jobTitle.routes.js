const express = require("express");
const router = express.Router();
const jobTitleController = require("../controllers/jobTitleController");
const authMiddleware = require("../middleware/auth");
const { requirePermission } = require("../middleware/checkPermission");

// Tất cả routes cần authentication
router.use(authMiddleware);

// GET / - Lấy danh sách chức vụ
router.get("/", jobTitleController.getAll);

// GET /:id - Chi tiết
router.get("/:id", jobTitleController.getById);

// POST / - Tạo mới (chỉ Admin/HR)
router.post("/", requirePermission("manage_employees"), jobTitleController.create);

// PATCH /:id - Cập nhật (chỉ Admin/HR)
router.patch("/:id", requirePermission("manage_employees"), jobTitleController.update);

// DELETE /:id - Xóa (chỉ Admin/HR)
router.delete("/:id", requirePermission("manage_employees"), jobTitleController.delete);

module.exports = router;
