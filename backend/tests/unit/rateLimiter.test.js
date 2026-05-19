const request = require('supertest');
const express = require('express');
const { loginLimiter, apiLimiter, changePasswordLimiter } = require('../../middleware/rateLimiter');

describe('Rate Limiter Middlewares', () => {
  const createTestApp = (limiter, statusCode = 200) => {
    const app = express();
    // Trust proxy for testing IP rate limits
    app.set('trust proxy', 1);
    
    app.use('/test', limiter, (req, res) => {
      res.status(statusCode).send('OK');
    });
    return app;
  };

  beforeEach(() => {
    // Reset rate limiter (in-memory) cho mỗi test
    loginLimiter.resetKey('::ffff:127.0.0.1');
    apiLimiter.resetKey('::ffff:127.0.0.1');
    changePasswordLimiter.resetKey('::ffff:127.0.0.1');
  });

  describe('loginLimiter', () => {
    it('cho phép request khi dưới giới hạn', async () => {
      // Setup mock app to return 401 (login thất bại)
      const app = createTestApp(loginLimiter, 401);
      
      for (let i = 0; i < 5; i++) {
        const res = await request(app).get('/test');
        expect(res.status).toBe(401);
      }
    });

    it('chặn request khi vượt quá giới hạn đăng nhập thất bại', async () => {
      const app = createTestApp(loginLimiter, 401);
      
      // 5 requests fail liên tiếp
      for (let i = 0; i < 5; i++) {
        await request(app).get('/test');
      }

      // Lần thứ 6 sẽ bị chặn bởi rate limiter (429 Too Many Requests)
      const res = await request(app).get('/test');
      expect(res.status).toBe(429);
      expect(res.status).toBe(429);
    });
  });

  describe('apiLimiter', () => {
    it('cho phép request khi dưới giới hạn', async () => {
      const app = createTestApp(apiLimiter, 200);
      
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
      expect(res.headers).toHaveProperty('ratelimit-limit', '100');
    });
  });

  describe('changePasswordLimiter', () => {
    it('chặn request khi vượt quá 5 lần/giờ', async () => {
      const app = createTestApp(changePasswordLimiter, 200);
      
      // 5 requests đầu tiên
      for (let i = 0; i < 5; i++) {
        const res = await request(app).get('/test');
        expect(res.status).toBe(200);
      }

      // Lần thứ 6 sẽ bị chặn
      const res = await request(app).get('/test');
      expect(res.status).toBe(429);
      expect(res.body.message).toMatch(/yêu cầu đổi mật khẩu quá nhiều lần/);
    });
  });
});
