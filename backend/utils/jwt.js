const jwt = require('jsonwebtoken');

/**
 * Tạo Access Token (thời hạn ngắn - 15 phút)
 * Access token chứa thông tin user và được gửi kèm mọi API request
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    });
};

/**
 * Tạo Refresh Token (thời hạn dài - 7 ngày)
 * Refresh token dùng để lấy access token mới khi hết hạn
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    });
};

/**
 * Verify Access Token
 */
const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Access token đã hết hạn');
        }
        throw new Error('Access token không hợp lệ');
    }
};

/**
 * Verify Refresh Token
 */
const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Refresh token đã hết hạn');
        }
        throw new Error('Refresh token không hợp lệ');
    }
};

// Backward compatibility - giữ lại hàm cũ
const generateToken = generateAccessToken;
const verifyToken = verifyAccessToken;

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    // Backward compatibility
    generateToken,
    verifyToken
};
