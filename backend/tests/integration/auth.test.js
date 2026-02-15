const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');

// Mock dependencies
jest.mock('../../config/database');
jest.mock('../../utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'mock-access-token'),
  generateRefreshToken: jest.fn(() => 'mock-refresh-token'),
  verifyRefreshToken: jest.fn()
}));

const authController = require('../../controllers/authController');
const db = require('../../config/database');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwt');

// Create test app
const app = express();
app.use(express.json());
app.post('/login', authController.login);
app.post('/logout', authController.logout);

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /login', () => {
    it('Đăng nhập thành công với thông tin hợp lệ', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role_name: 'admin',
        status: 'active'
      };

      // Mock database query
      db.query.mockResolvedValue([[mockUser]]);

      const response = await request(app)
        .post('/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken', 'mock-access-token');
      expect(response.body).toHaveProperty('refreshToken', 'mock-refresh-token');
      expect(generateAccessToken).toHaveBeenCalled();
      expect(generateRefreshToken).toHaveBeenCalled();
    });

    it('Thất bại khi tên đăng nhập không tồn tại', async () => {
      // Mock empty result (user not found)
      db.query.mockResolvedValue([[]]);

      const response = await request(app)
        .post('/login')
        .send({ username: 'wronguser', password: 'admin123' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message');
    });

    it('Thất bại khi mật khẩu không đúng', async () => {
      const mockUser = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
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
      const mockUser = {
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
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
  });

  describe('POST /logout', () => {
    it('Đăng xuất thành công', async () => {
      db.query.mockResolvedValue([{ affectedRows: 1 }]);

      const response = await request(app)
        .post('/logout')
        .send({ refreshToken: 'some-refresh-token' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });
  });
});
