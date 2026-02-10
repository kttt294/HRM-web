const jwt = require('jsonwebtoken');

// Tạo JWT token
const generateToken = (payload) => {
    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Token không hợp lệ');
    }
};

module.exports = {
    generateToken,
    verifyToken
};
