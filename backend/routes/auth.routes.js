const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { loginSchema, changePasswordSchema } = require('../utils/auth.validation');
const { loginLimiter, changePasswordLimiter } = require("../middleware/rateLimiter");

// Public routes (không cần authentication)
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

// Protected routes (cần authentication)
router.get('/me', authMiddleware, authController.me);
router.post("/change-password", authMiddleware, changePasswordLimiter, validate(changePasswordSchema), authController.changePassword);

// Refresh token endpoint - KHÔNG cần authMiddleware vì tự verify refresh token
router.post('/refresh', authController.refreshToken);

// Admin endpoint - Thu hồi tất cả tokens của user
router.post('/revoke-user-tokens/:userId', authMiddleware, authController.revokeUserTokens);

module.exports = router;
