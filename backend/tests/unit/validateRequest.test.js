const validate = require('../../middleware/validate');
const { loginSchema, changePasswordSchema } = require('../../utils/auth.validation');

describe('Validate Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        next = jest.fn();
    });

    // =====================================================
    // loginSchema
    // =====================================================
    describe('Validate loginSchema', () => {
        const loginValidate = validate(loginSchema);

        test('gọi next() nếu dữ liệu hợp lệ', () => {
            req.body = { username: 'admin', password: 'admin123' };

            loginValidate(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu thiếu username', () => {
            req.body = { password: 'admin123' };

            loginValidate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('đăng nhập')
            }));
            expect(next).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu thiếu password', () => {
            req.body = { username: 'admin' };

            loginValidate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.any(String)
            }));
            expect(next).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu password quá ngắn (< 5 ký tự)', () => {
            req.body = { username: 'admin', password: 'abc' };

            loginValidate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu body rỗng hoàn toàn', () => {
            req.body = {};

            loginValidate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });

    // =====================================================
    // changePasswordSchema
    // =====================================================
    describe('Validate changePasswordSchema', () => {
        const changePasswordValidate = validate(changePasswordSchema);

        test('gọi next() nếu mật khẩu mới khác mật khẩu cũ và đủ dài', () => {
            req.body = { currentPassword: 'oldpass123', newPassword: 'newpass456' };

            changePasswordValidate(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu thiếu currentPassword', () => {
            req.body = { newPassword: 'newpass456' };

            changePasswordValidate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu newPassword quá ngắn (< 5 ký tự)', () => {
            req.body = { currentPassword: 'oldpass123', newPassword: 'new' };

            changePasswordValidate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });

        test('trả về 400 nếu mật khẩu mới trùng mật khẩu cũ', () => {
            req.body = { currentPassword: 'samepass123', newPassword: 'samepass123' };

            changePasswordValidate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
