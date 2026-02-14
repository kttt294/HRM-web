const rateLimit = require('express-rate-limit');

/**
 * Rate Limiter cho Login endpoint
 * Giới hạn: 5 lần đăng nhập thất bại / 15 phút / IP
 * Chống brute force attack
 */
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 5, // Tối đa 5 requests
    message: {
        message: 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau 15 phút.',
    },
    standardHeaders: true, // Trả về rate limit info trong headers
    legacyHeaders: false,
    // Chỉ đếm khi đăng nhập thất bại (status 401)
    skipSuccessfulRequests: true,
});

/**
 * Rate Limiter chung cho tất cả API
 * Giới hạn: 100 requests / 15 phút / IP
 * Chống DDoS attack
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Tối đa 100 requests
    message: {
        message: 'Hệ thống quá tải... Vui lòng thử lại sau.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate Limiter nghiêm ngặt cho các endpoint nhạy cảm
 * Giới hạn: 3 requests / 15 phút / IP
 */
const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 3,
    message: {
        message: 'Vui lòng thử lại sau 15 phút.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    apiLimiter,
    strictLimiter,
};
