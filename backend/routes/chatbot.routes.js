const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/auth");

// POST /api/chatbot/ask
// Robot yêu cầu người dùng phải đăng nhập để biết danh tính (cá nhân hóa)
router.post("/ask", authMiddleware, chatbotController.ask);

module.exports = router;
