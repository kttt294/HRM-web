const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Không tìm thấy token xác thực",
      });
    }

    const token = authHeader.substring(7); // Bỏ "Bearer "

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // Gắn thông tin user vào request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token đã hết hạn",
      });
    }
    return res.status(401).json({
      message: "Token không hợp lệ",
    });
  }
};

module.exports = authMiddleware;
