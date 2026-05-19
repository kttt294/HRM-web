const authController = require('../../controllers/authController');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('../../utils/jwt');

// Mock Dependencies
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

// Mock permissions util (được gọi bên trong login khi thành công)
jest.mock('../../utils/permissions', () => ({
    getUserPermissions: jest.fn().mockResolvedValue(['view_self', 'update_self'])
}));

describe('Auth Controller - Login', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: { username: 'testuser', password: 'password123' },
            cookies: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            cookie: jest.fn(),
            clearCookie: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    // Test Case 1: Login thành công
    test('should login successfully with valid credentials', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashed_password',
            role_name: 'admin',
            role_id: 1,
            status: 'active',
            employee_id: 1,
            name: 'Test User',
        };

        // Query 1: SELECT user | Query 2: UPDATE last_login_at | Query 3: INSERT refresh_token
        db.query
            .mockResolvedValueOnce([[mockUser]])   // SELECT user
            .mockResolvedValueOnce([[]])            // UPDATE last_login_at
            .mockResolvedValueOnce([{ affectedRows: 1 }]); // INSERT refresh_token

        bcrypt.compare.mockResolvedValue(true);
        jwt.generateAccessToken.mockReturnValue('mock_access_token');
        jwt.generateRefreshToken.mockReturnValue('mock_refresh_token');

        await authController.login(req, res, next);

        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            accessToken: 'mock_access_token',
            user: expect.objectContaining({ username: 'testuser' })
        }));
        // Refresh token được gửi qua cookie, không qua body
        expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'mock_refresh_token', expect.any(Object));
    });

    // Test Case 2: Login thất bại - User không tồn tại
    test('should return 401 if user not found', async () => {
        db.query.mockResolvedValueOnce([[]]); // Không tìm thấy user

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    });

    // Test Case 3: Login thất bại - Sai mật khẩu
    test('should return 401 if password incorrect', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashed_password',
            role_name: 'admin',
            status: 'active'
        };
        db.query.mockResolvedValueOnce([[mockUser]]);
        bcrypt.compare.mockResolvedValue(false);

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
    });

    // Test Case 4: Login thất bại - Tài khoản bị khóa
    test('should return 403 if account is locked', async () => {
        const mockUser = {
            id: 1,
            username: 'testuser',
            password: 'hashed_password',
            role_name: 'admin',
            status: 'locked'
        };
        db.query.mockResolvedValueOnce([[mockUser]]);
        bcrypt.compare.mockResolvedValue(true);

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining('khóa')
        }));
    });

    // Test Case 5: Login thiếu username/password
    test('should return 400 if username or password missing', async () => {
        req.body = { username: '', password: '' };

        await authController.login(req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.any(String)
        }));
    });
});

describe('Auth Controller - Logout', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            body: {},
            cookies: {}
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
            clearCookie: jest.fn(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    test('should logout successfully', async () => {
        req.cookies.refreshToken = 'valid_refresh_token';
        db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

        await authController.logout(req, res, next);

        expect(db.query).toHaveBeenCalledWith(
            expect.stringContaining('DELETE FROM refresh_tokens'),
            ['valid_refresh_token']
        );
        expect(res.clearCookie).toHaveBeenCalledWith('refreshToken');
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.any(String)
        }));
    });

    test('should logout successfully even without refresh token', async () => {
        // Không có refresh token trong cookie hoặc body
        await authController.logout(req, res, next);

        // Vẫn trả về success, chỉ không xóa DB
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.any(String)
        }));
    });
});
