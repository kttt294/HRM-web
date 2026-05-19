const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');

// Mock dependencies - phải khai báo trước khi require controller
jest.mock('../../config/database');
jest.mock('../../utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: jest.fn()
}));
jest.mock('../../utils/permissions', () => ({
  getUserPermissions: jest.fn().mockResolvedValue(['view_self'])
}));

const authController = require('../../controllers/authController');
const db = require('../../config/database');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');

// Tạo test app
const app = express();
app.use(express.json());
app.use(cookieParser());
app.post('/login', authController.login);
app.post('/logout', authController.logout);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('Đăng nhập thành công với thông tin hợp lệ', async () => {
      const hashedPwd = await bcrypt.hash('admin123', 10);
      const mockUser = {
        id: 1,
        username: 'admin',
        password: hashedPwd,
        role_name: 'admin',
        status: 'active',
        employee_id: 1,
        name: 'Admin'
      };

      // 3 queries: SELECT user, UPDATE last_login, INSERT refresh_token
      db.query
        .mockResolvedValueOnce([[mockUser]])
        .mockResolvedValueOnce([[]])
        .mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request(app)
        .post('/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken', 'mock-access-token');
      // Refresh token được gửi qua cookie HttpOnly, không có trong body
      expect(response.body).not.toHaveProperty('refreshToken');
      expect(generateAccessToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
    });

    it('Thất bại khi tên đăng nhập không tồn tại', async () => {
      db.query.mockResolvedValue([[]]); // Không tìm thấy user

      const response = await request(app)
        .post('/login')
        .send({ username: 'wronguser', password: 'admin123' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('Thất bại khi mật khẩu không đúng', async () => {
      const hashedPwd = await bcrypt.hash('admin123', 10);
      const mockUser = {
        id: 1,
        username: 'admin',
        password: hashedPwd,
        role_name: 'admin',
        status: 'active'
      };

      db.query.mockResolvedValue([[mockUser]]);

      const response = await request(app)
        .post('/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('Thất bại khi tài khoản bị khóa', async () => {
      const hashedPwd = await bcrypt.hash('admin123', 10);
      const mockUser = {
        id: 1,
        username: 'admin',
        password: hashedPwd,
        role_name: 'admin',
        status: 'locked'
      };

      db.query.mockResolvedValue([[mockUser]]);

      const response = await request(app)
        .post('/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('message');
    });

    it('Thất bại khi thiếu username hoặc password', async () => {
      const response = await request(app)
        .post('/login')
        .send({ username: '' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /logout', () => {
    it('Đăng xuất thành công với refresh token hợp lệ', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .post('/logout')
        .send({ refreshToken: 'some-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('Đăng xuất thành công khi không có refresh token', async () => {
      const response = await request(app)
        .post('/logout')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});
