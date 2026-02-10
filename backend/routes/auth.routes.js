const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes (không cần authentication)
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protected routes (cần authentication)
router.get('/me', authMiddleware, authController.me);
router.post('/refresh', authMiddleware, authController.refreshToken);
router.post('/change-password', authMiddleware, authController.changePassword);

module.exports = router;
