const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwt");

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

      // Tạo JWT token với role_name
      const token = generateToken({
        id: user.id,
        username: user.username,
        role: user.role_name,
      });

      // Lấy permissions từ database
      const { getUserPermissions } = require("../utils/permissions");
      const permissions = await getUserPermissions(user.id);

      // Trả về user info (không bao gồm password)
      res.json({
        user: {
          id: user.id.toString(),
          username: user.username,
          role: user.role_name,
          avatar: user.avatar,
          status: user.status, // Bổ sung status để frontend biết
          lastLoginAt: new Date(), // Trả về thời gian hiện tại vừa update
          createdAt: user.created_at,
          updatedAt: user.updated_at,
          permissions,
        },
        token,
      });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/auth/logout
  async logout(req, res) {
    // Với JWT, logout chỉ cần client xóa token
    res.json({ message: "Đăng xuất thành công" });
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
  async refreshToken(req, res, next) {
    try {
      // Tạo token mới với thông tin user hiện tại
      const token = generateToken({
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      });

      res.json({ token });
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

      res.json({ message: "Đổi mật khẩu thành công" });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
