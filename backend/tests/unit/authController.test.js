const authController = require('../../controllers/authController');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('../../utils/jwt');

// Mock Dependencies với Factory (An toàn nhất)
jest.mock('../../config/database', () => ({
    query: jest.fn()
}));

jest.mock('../../utils/jwt', () => ({
    generateAccessToken: jest.fn(),
    generateRefreshToken: jest.fn(),
    verifyRefreshToken: jest.fn()
}));

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash: jest.fn()
}));

describe('Auth Controller - Login', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: { username: 'testuser', password: 'password123' } };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    // Test Case 1: Login thành công
    test('should login successfully with valid credentials', async () => {
        // Mock DB: Tìm thấy user
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashed_password', // Giả lập mật khẩu đã hash trong DB
            role_name: 'admin',
            role_id: 1,
            status: 'active'
        };
        db.query.mockResolvedValueOnce([[mockUser]]); // Mock query SELECT user

        // Mock Bcrypt: So sánh mật khẩu đúng
        bcrypt.compare.mockResolvedValue(true);

        // Mock JWT: Tạo token giả
        jwt.generateAccessToken.mockReturnValue('mock_access_token');
        jwt.generateRefreshToken.mockReturnValue('mock_refresh_token');

        // Mock DB: Lưu refresh token thành công
        db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // Mock query INSERT token

        try {
            await authController.login(req, res, next);
        } catch (e) {
            console.error('TEST ERROR:', e);
        }

        // Verify:
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            accessToken: 'mock_access_token',
            refreshToken: 'mock_refresh_token',
            user: expect.objectContaining({ username: 'testuser' })
        }));
    });

    // Test Case 2: Login thất bại - User không tồn tại
    test('should return 401 if user not found', async () => {
        // Mock DB: Không tìm thấy user (mảng rỗng)
        db.query.mockResolvedValueOnce([[]]); 

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Tài khoản hoặc mật khẩu không đúng' });
    });

    // Test Case 3: Login thất bại - Sai mật khẩu
    test('should return 401 if password incorrect', async () => {
        // Mock DB: Tìm thấy user
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashed_password',
            status: 'active'
        };
        db.query.mockResolvedValueOnce([[mockUser]]);

        // Mock Bcrypt: So sánh mật khẩu SAI
        bcrypt.compare.mockResolvedValue(false);

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Tài khoản hoặc mật khẩu không đúng' });
    });

    // Test Case 4: Login thất bại - Tài khoản bị khóa
    test('should return 403 if account is locked', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashed_password',
            status: 'locked' // Trạng thái khóa
        };
        db.query.mockResolvedValueOnce([[mockUser]]);
        
        // Dù đúng mật khẩu vẫn bị chặn
        bcrypt.compare.mockResolvedValue(true);

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Tài khoản đã bị vô hiệu hóa' });
    });
});
