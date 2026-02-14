const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require("../utils/jwt");

const authController = {
  // POST /api/auth/login
  async login(req, res, next) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          message: "Vui lòng nhập tên đăng nhập và mật khẩu",
        });
      }

      // Tìm user trong database và JOIN với roles
      const [users] = await db.query(
        `SELECT u.*, r.name as role_name 
                 FROM users u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE u.username = ?`,
        [username],
      );

      if (users.length === 0) {
        return res.status(401).json({
          message: "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      }

      const user = users[0];

      // Kiểm tra trạng thái tài khoản
      if (user.status === 'locked') {
        return res.status(403).json({
          message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin để được hướng dẫn.",
        });
      }



      // Kiểm tra password
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          message: "Tên đăng nhập hoặc mật khẩu không đúng",
        });
      }

      // Cập nhật thời gian đăng nhập gần nhất
      await db.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [user.id]);

      // Tạo payload chung cho cả 2 loại token
      const tokenPayload = {
        id: user.id,
        username: user.username,
        role: user.role_name,
      };

      // Tạo Access Token (15 phút) và Refresh Token (7 ngày)
      const accessToken = generateAccessToken(tokenPayload);
      const refreshToken = generateRefreshToken(tokenPayload);

      // Lưu refresh token vào database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày
      
      await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [user.id, refreshToken, expiresAt]
      );

      // Lấy permissions từ database
      const { getUserPermissions } = require("../utils/permissions");
      const permissions = await getUserPermissions(user.id);

      // Trả về user info và cả 2 tokens
      res.json({
        user: {
          id: user.id.toString(),
          username: user.username,
          role: user.role_name,
          avatar: user.avatar,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          permissions,
        },
        accessToken,
        refreshToken,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      
      // Xóa refresh token khỏi database nếu có
      if (refreshToken) {
        await db.query(
          `DELETE FROM refresh_tokens WHERE token = ?`,
          [refreshToken]
        );
      }
      
      res.json({ message: "Đăng xuất thành công" });
    } catch (error) {
      next(error);
    }
  },

  // GET /api/auth/me
  async me(req, res, next) {
    try {
      const [users] = await db.query(
        `SELECT u.*, r.name as role_name 
                 FROM users u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE u.id = ?`,
        [req.user.id],
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy người dùng",
        });
      }

      const user = users[0];
      const { getUserPermissions } = require("../utils/permissions");
      const permissions = await getUserPermissions(user.id);

      res.json({
        id: user.id.toString(),
        username: user.username,
        role: user.role_name,
        avatar: user.avatar,
        createdAt: user.created_at,
        permissions,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/refresh
  // Endpoint này KHÔNG cần authMiddleware vì refresh token tự verify
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          message: "Refresh token là bắt buộc",
        });
      }

      // Verify refresh token
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
      } catch (error) {
        return res.status(401).json({
          message: error.message || "Refresh token không hợp lệ",
        });
      }

      // Kiểm tra refresh token có tồn tại trong database không
      const [tokens] = await db.query(
        `SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()`,
        [refreshToken, decoded.id]
      );

      if (tokens.length === 0) {
        return res.status(401).json({
          message: "Refresh token không hợp lệ hoặc đã hết hạn",
        });
      }

      // Tạo access token mới
      const newAccessToken = generateAccessToken({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
      });

      res.json({ 
        accessToken: newAccessToken 
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/change-password
  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;

      if (!oldPassword || !newPassword) {
        return res.status(400).json({
          message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới",
        });
      }

      // Lấy thông tin user
      const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
        req.user.id,
      ]);

      if (users.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy người dùng",
        });
      }

      const user = users[0];

      // Kiểm tra mật khẩu cũ
      const isValidPassword = await bcrypt.compare(oldPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          message: "Mật khẩu cũ không đúng",
        });
      }

      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật password
      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        req.user.id,
      ]);

      // Xóa tất cả refresh tokens của user để bắt buộc đăng nhập lại
      await db.query(
        `DELETE FROM refresh_tokens WHERE user_id = ?`,
        [userId]
      );

      res.json({ message: "Đổi mật khẩu thành công và đã đăng xuất khỏi tất cả thiết bị" });
    } catch (error) {
      next(error);
    }
  },

  // Phương thức revokeUserTokens (đã bỏ UI nhưng giữ lại function để dùng nội bộ hoặc API)
  async revokeUserTokens(req, res, next) {
    try {
      const { userId } = req.params;
      const [result] = await db.query(
        `DELETE FROM refresh_tokens WHERE user_id = ?`,
        [userId]
      );
      res.json({ message: "Đã thu hồi phiên đăng nhập" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
