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

// Rate limit chung cho toàn bộ API (nhẹ nhàng hơn)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100, // 100 requests / 15 phút
  message: {
    message: "Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit cho đổi mật khẩu (nghiêm ngặt hơn) - Chỉ dùng cho User tự đổi pass
const changePasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 giờ
  max: 5, // Giới hạn 5 lần đổi pass/giờ
  message: {
    message: "Bạn đã yêu cầu đổi mật khẩu quá nhiều lần. Vui lòng thử lại sau 1 giờ",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
    loginLimiter,
    apiLimiter,
    changePasswordLimiter,
};
