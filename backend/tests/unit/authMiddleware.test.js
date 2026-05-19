const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    // =====================================================
    // Trường hợp thiếu token
    // =====================================================
    test('trả về 401 nếu không có Authorization header', async () => {
        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy token xác thực' });
        expect(next).not.toHaveBeenCalled();
    });

    test('trả về 401 nếu Authorization header không bắt đầu bằng "Bearer "', async () => {
        req.headers.authorization = 'Token some_token_value';

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy token xác thực' });
        expect(next).not.toHaveBeenCalled();
    });

    // =====================================================
    // Token hợp lệ
    // =====================================================
    test('gọi next() và gán req.user nếu token hợp lệ', async () => {
        const mockDecoded = {
            id: 1,
            username: 'admin',
            role: 'admin',
            permissions: ['manage_users']
        };
        req.headers.authorization = 'Bearer valid_token_string';
        jwt.verify.mockReturnValue(mockDecoded);

        await authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid_token_string', process.env.JWT_ACCESS_SECRET);
        expect(req.user).toEqual(mockDecoded);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // =====================================================
    // Token hết hạn
    // =====================================================
    test('trả về 401 nếu token đã hết hạn (TokenExpiredError)', async () => {
        req.headers.authorization = 'Bearer expired_token';

        const expiredError = new Error('jwt expired');
        expiredError.name = 'TokenExpiredError';
        jwt.verify.mockImplementation(() => { throw expiredError; });

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token đã hết hạn' });
        expect(next).not.toHaveBeenCalled();
    });

    // =====================================================
    // Token không hợp lệ
    // =====================================================
    test('trả về 401 nếu token không hợp lệ (chữ ký sai)', async () => {
        req.headers.authorization = 'Bearer invalid_signature_token';

        const invalidError = new Error('invalid signature');
        invalidError.name = 'JsonWebTokenError';
        jwt.verify.mockImplementation(() => { throw invalidError; });

        await authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Token không hợp lệ' });
        expect(next).not.toHaveBeenCalled();
    });
});
