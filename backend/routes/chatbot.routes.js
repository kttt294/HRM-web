const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/auth");

// POST /api/chatbot/ask - Yêu cầu đăng nhập (cá nhân hóa theo user)
router.post("/ask", authMiddleware, chatbotController.ask);

// POST /api/chatbot/ask-public - Không cần đăng nhập (cho trang landing page)
router.post("/ask-public", chatbotController.askPublic);

module.exports = router;
