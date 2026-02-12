const db = require("../config/database");
const bcrypt = require("bcryptjs");
const { toCamelCase } = require("../utils/formatters");

const userController = {
  // GET /api/users
  async getAll(req, res, next) {
    try {
      const { role, status, search } = req.query;

      let query = `
                SELECT u.id, u.username, u.full_name as name, u.role_id, u.avatar, u.status, u.last_login_at, u.created_at,
                       r.name as role
                FROM users u
                LEFT JOIN roles r ON u.role_id = r.id
                WHERE 1=1
            `;
      const params = [];

      if (role) {
        query += " AND r.name = ?";
        params.push(role);
      }
      if (search) {
        query += " AND u.username LIKE ?";
        params.push(`%${search}%`);
      }

      query += " ORDER BY u.created_at DESC";

      const [users] = await db.query(query, params);
      res.json(toCamelCase(users));
    } catch (error) {
      next(error);
    }
  },

  // GET /api/users/:id
  async getById(req, res, next) {
    try {
      const [users] = await db.query(
        `SELECT u.id, u.username, u.full_name as name, u.role_id, u.avatar, u.status, u.last_login_at, u.created_at,
                        r.name as role
                 FROM users u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ?`,
        [req.params.id],
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      res.json(toCamelCase(users[0]));
    } catch (error) {
      next(error);
    }
  },

  // POST /api/users
  async create(req, res, next) {
    try {
      const { username, password, name, roleId, avatar } = req.body;

      if (!username || !password || !roleId) {
        return res.status(400).json({
          message: "Tên đăng nhập, mật khẩu và vai trò là bắt buộc",
        });
      }

      // Kiểm tra username đã tồn tại chưa
      const [existing] = await db.query(
        "SELECT id FROM users WHERE username = ?",
        [username],
      );

      if (existing.length > 0) {
        return res.status(400).json({
          message: "Tên đăng nhập đã tồn tại",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await db.query(
        `INSERT INTO users (username, password, full_name, role_id, avatar, status) 
                 VALUES (?, ?, ?, ?, ?, 'active')`,
        [username, hashedPassword, name, roleId, avatar],
      );

      const [newUser] = await db.query(
        `SELECT u.id, u.username, u.full_name as name, u.role_id, u.avatar, u.status, u.last_login_at, u.created_at,
                        r.name as role
                 FROM users u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ?`,
        [result.insertId],
      );

      res.status(201).json(toCamelCase(newUser[0]));
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/users/:id
  async update(req, res, next) {
    try {
      const updates = req.body;
      const fieldMapping = {
        roleId: "role_id",
        avatar: "avatar",
        name: "full_name",
        status: "status"
      };

      const updateFields = [];
      const params = [];

      Object.keys(updates).forEach((key) => {
        if (fieldMapping[key] && updates[key] !== undefined) {
          updateFields.push(`${fieldMapping[key]} = ?`);
          params.push(updates[key]);
        }
      });

      if (updateFields.length === 0) {
        return res.status(400).json({
          message: "Không có trường nào để cập nhật",
        });
      }

      params.push(req.params.id);

      await db.query(
        `UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`,
        params,
      );

      const [updatedUser] = await db.query(
        `SELECT u.id, u.username, u.full_name as name, u.role_id, u.avatar, u.status, u.last_login_at, u.created_at,
                        r.name as role
                 FROM users u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ?`,
        [req.params.id],
      );

      if (updatedUser.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      res.json(toCamelCase(updatedUser[0]));
    } catch (error) {
      next(error);
    }
  },

  // DELETE /api/users/:id
  async delete(req, res, next) {
    try {
      // Kiểm tra không cho xóa admin
      const [user] = await db.query(
        `SELECT u.id, r.name as role_name 
                 FROM users u
                 LEFT JOIN roles r ON u.role_id = r.id
                 WHERE u.id = ?`,
        [req.params.id],
      );

      if (user.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      if (user[0].role_name === "admin") {
        return res.status(400).json({
          message: "Không thể xóa tài khoản Admin",
        });
      }

      const [result] = await db.query("DELETE FROM users WHERE id = ?", [
        req.params.id,
      ]);

      res.json({ message: "Xóa tài khoản thành công" });
    } catch (error) {
      next(error);
    }
  },

  // POST /api/users/:id/reset-password
  async resetPassword(req, res, next) {
    try {
      // Generate temp password
      const tempPassword = `Temp${Math.random().toString(36).slice(2, 10)}!`;
      const hashedPassword = await bcrypt.hash(tempPassword, 10);

      await db.query("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        req.params.id,
      ]);

      res.json({
        message: "Reset mật khẩu thành công",
        tempPassword,
      });
    } catch (error) {
      next(error);
    }
  },

  // PATCH /api/users/:id/toggle-lock
  async toggleLock(req, res, next) {
    try {
      const [users] = await db.query(
        `SELECT u.id, u.username, u.full_name, u.role_id, u.avatar, u.status, u.last_login_at, u.created_at, u.updated_at, r.name as role_name 
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = ?`,
        [req.params.id],
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      const user = users[0];

      // Không cho phép khóa tài khoản admin
      if (user.role_name === "admin") {
        return res.status(400).json({
          message: "Không thể khóa tài khoản Admin",
        });
      }

      // Toggle status between active and locked
      const newStatus = user.status === 'locked' ? 'active' : 'locked';

      await db.query("UPDATE users SET status = ? WHERE id = ?", [
        newStatus,
        req.params.id,
      ]);

      const [updatedUser] = await db.query(
        `SELECT u.id, u.username, u.full_name as name, u.avatar, u.status, u.last_login_at, u.created_at, u.updated_at,
                r.name as role
         FROM users u
         LEFT JOIN roles r ON u.role_id = r.id
         WHERE u.id = ?`,
        [req.params.id],
      );

      res.json(toCamelCase(updatedUser[0]));
    } catch (error) {
      next(error);
    }
  },
};

module.exports = userController;
