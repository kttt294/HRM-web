const db = require('../config/database');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../utils/jwt');

const authController = {
    // POST /api/auth/login
    async login(req, res, next) {
        try {
            const { username, password } = req.body;

            if (!username || !password) {
                return res.status(400).json({ 
                    message: 'Vui lòng nhập tên đăng nhập và mật khẩu' 
                });
            }

            // Tìm user trong database
            const [users] = await db.query(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );

            if (users.length === 0) {
                return res.status(401).json({ 
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
                });
            }

            const user = users[0];

            // Kiểm tra password
            const isValidPassword = await bcrypt.compare(password, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({ 
                    message: 'Tên đăng nhập hoặc mật khẩu không đúng' 
                });
            }

            // Tạo JWT token
            const token = generateToken({
                id: user.id,
                username: user.username,
                role: user.role
            });

            // Trả về user info (không bao gồm password)
            const { password: _, created_at, updated_at, ...userWithoutPassword } = user;

            // Lấy permissions từ database
            const { getUserPermissions } = require('../utils/permissions');
            const permissions = await getUserPermissions(user.id);
            
            res.json({
                user: {
                    ...userWithoutPassword,
                    id: user.id.toString(),
                    createdAt: created_at,
                    updatedAt: updated_at,
                    permissions
                },
                token
            });
        } catch (error) {
            next(error);
        }
    },

    // POST /api/auth/logout
    async logout(req, res) {
        // Với JWT, logout chỉ cần client xóa token
        res.json({ message: 'Đăng xuất thành công' });
    },

    // GET /api/auth/me
    async me(req, res, next) {
        try {
            const [users] = await db.query(
                'SELECT id, username, email, name, role, created_at FROM users WHERE id = ?',
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy người dùng' 
                });
            }

            const user = users[0];
            const { getUserPermissions } = require('../utils/permissions');
            const permissions = await getUserPermissions(user.id);

            res.json({
                ...user,
                id: user.id.toString(),
                createdAt: user.created_at,
                permissions
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
                role: req.user.role
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
                    message: 'Vui lòng nhập mật khẩu cũ và mật khẩu mới' 
                });
            }

            // Lấy thông tin user
            const [users] = await db.query(
                'SELECT * FROM users WHERE id = ?',
                [req.user.id]
            );

            if (users.length === 0) {
                return res.status(404).json({ 
                    message: 'Không tìm thấy người dùng' 
                });
            }

            const user = users[0];

            // Kiểm tra mật khẩu cũ
            const isValidPassword = await bcrypt.compare(oldPassword, user.password);
            
            if (!isValidPassword) {
                return res.status(401).json({ 
                    message: 'Mật khẩu cũ không đúng' 
                });
            }

            // Hash mật khẩu mới
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Cập nhật password
            await db.query(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, req.user.id]
            );

            res.json({ message: 'Đổi mật khẩu thành công' });
        } catch (error) {
            next(error);
        }
    }
};

module.exports = authController;
