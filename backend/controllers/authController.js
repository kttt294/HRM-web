const db = require("../config/database.js");
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

      // Tìm user và lấy luôn employeeId (nếu có)
      const [users] = await db.query(
        `SELECT u.*, r.name as role_name, e.id as employee_id
                 FROM users u 
                 JOIN roles r ON u.role_id = r.id 
                 LEFT JOIN employees e ON u.id = e.user_id
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

      // Lấy permissions từ database
      const { getUserPermissions } = require("../utils/permissions");
      const permissions = await getUserPermissions(user.id);

      // Tạo payload cho Access Token (bao gồm cả permissions và employeeId)
      const accessTokenPayload = {
        id: user.id,
        employeeId: user.employee_id,
        username: user.username,
        role: user.role_name,
        permissions: permissions
      };

      // Tạo payload cho Refresh Token (chỉ thông tin cơ bản)
      const refreshTokenPayload = {
        id: user.id
      };

      // Tạo Access Token (15 phút) và Refresh Token (7 ngày)
      const accessToken = generateAccessToken(accessTokenPayload);
      const refreshToken = generateRefreshToken(refreshTokenPayload);

      // Lưu refresh token vào database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày
      
      await db.query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [user.id, refreshToken, expiresAt]
      );

      // Gửi Refresh Token qua HttpOnly Cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở prod
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
      });

      // Trả về user info và Access Token (KHÔNG trả về permissions ở body nhạy cảm)
      res.json({
        user: {
          id: user.id.toString(),
          username: user.username,
          role: user.role_name,
          avatar: user.avatar,
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          // permissions nằm trong accessToken, FE sẽ decode nếu cần Render UI
        },
        accessToken
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      
      // Xóa refresh token khỏi database nếu có
      if (refreshToken) {
        await db.query(
          `DELETE FROM refresh_tokens WHERE token = ?`,
          [refreshToken]
        );
      }
      
      // Xóa cookie
      res.clearCookie('refreshToken');
      
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
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/refresh
  // Endpoint này KHÔNG cần authMiddleware vì refresh token tự verify
  async refreshToken(req, res, next) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          message: "Phiên đăng nhập hết hạn (No Refresh Token)",
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

      // Lấy lại thông tin user kèm employeeId
      const [users] = await db.query(
        `SELECT u.*, r.name as role_name, e.id as employee_id
         FROM users u 
         JOIN roles r ON u.role_id = r.id 
         LEFT JOIN employees e ON u.id = e.user_id
         WHERE u.id = ?`,
        [decoded.id]
      );

      if (users.length === 0) {
        return res.status(401).json({ message: "Người dùng không tồn tại" });
      }

      const user = users[0];
      const { getUserPermissions } = require("../utils/permissions");
      const permissions = await getUserPermissions(user.id);

      // Tạo access token mới với đầy đủ payload
      const newAccessToken = generateAccessToken({
        id: user.id,
        employeeId: user.employee_id,
        username: user.username,
        role: user.role_name,
        permissions: permissions
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
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id; // Lấy userId từ token

      // Validation đã được thực hiện bởi middleware, nhưng check lại cho chắc
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          message: "Vui lòng nhập mật khẩu cũ và mật khẩu mới",
        });
      }

      // Lấy thông tin user (để lấy password hash cũ)
      const [users] = await db.query("SELECT * FROM users WHERE id = ?", [
        userId,
      ]);

      if (users.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy người dùng",
        });
      }

      const user = users[0];

      // Kiểm tra mật khẩu cũ
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        return res.status(401).json({
          message: "Mật khẩu cũ không đúng",
        });
      }

      // Hash mật khẩu mới
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Cập nhật password mới vào database
      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        userId,
      ]);

      // Xóa tất cả refresh tokens của user để bắt buộc đăng nhập lại
      // Đây là behavior bảo mật tốt: Đổi pass xong thì kick hết các session khác ra
      await db.query(
        `DELETE FROM refresh_tokens WHERE user_id = ?`,
        [userId]
      );

      res.json({ message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
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
