const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { loginLimiter, strictLimiter } = require('../middleware/rateLimiter');

// Public routes (không cần authentication)
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);

// Protected routes (cần authentication)
router.get('/me', authMiddleware, authController.me);
router.post('/change-password', authMiddleware, strictLimiter, authController.changePassword);

// Refresh token endpoint - KHÔNG cần authMiddleware vì tự verify refresh token
router.post('/refresh', authController.refreshToken);

// Admin endpoint - Thu hồi tất cả tokens của user (khi bị hack)
router.post('/revoke-user-tokens/:userId', authMiddleware, strictLimiter, authController.revokeUserTokens);

module.exports = router;
