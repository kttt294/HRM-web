/**
 * Unit Tests: userController.js
 *
 * Kiểm tra các chức năng:
 * - getAll: Lấy danh sách tài khoản (filter theo role, status, search)
 * - getById: Lấy chi tiết tài khoản
 * - create: Tạo tài khoản mới (kiểm tra trùng username, hash password)
 * - update: Cập nhật thông tin tài khoản
 * - delete: Xóa tài khoản (không xóa được admin)
 * - resetPassword: Reset mật khẩu, trả về temp password
 * - toggleLock: Khóa/mở khóa tài khoản (không khóa được admin)
 */
const userController = require('../../controllers/userController');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

jest.mock('../../config/database', () => ({
    query: jest.fn(),
}));

jest.mock('../../utils/formatters', () => ({
    toCamelCase: jest.fn((data) => data),
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('User Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: { id: 1, role: 'admin' },
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    // =====================================================
    // getAll
    // =====================================================
    describe('getAll()', () => {
        test('lấy toàn bộ danh sách tài khoản', async () => {
            const mockUsers = [
                { id: 1, username: 'admin', role: 'admin', status: 'active' },
                { id: 2, username: 'hruser', role: 'hr', status: 'active' },
            ];
            db.query.mockResolvedValueOnce([mockUsers]);

            await userController.getAll(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('FROM users'),
                []
            );
            expect(res.json).toHaveBeenCalledWith(mockUsers);
        });

        test('lọc theo role, status và search', async () => {
            req.query = { role: 'hr', status: 'active', search: 'hruser' };
            db.query.mockResolvedValueOnce([[{ id: 2 }]]);

            await userController.getAll(req, res, next);

            const callArgs = db.query.mock.calls[0];
            expect(callArgs[0]).toContain('r.name = ?');
            expect(callArgs[0]).toContain('u.status = ?');
            expect(callArgs[0]).toContain('u.username LIKE ?');
            expect(callArgs[1]).toEqual(['hr', 'active', '%hruser%']);
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);
            await userController.getAll(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getById
    // =====================================================
    describe('getById()', () => {
        test('lấy chi tiết tài khoản theo ID', async () => {
            req.params.id = '2';
            const mockUser = { id: 2, username: 'hruser', role: 'hr' };
            db.query.mockResolvedValueOnce([[mockUser]]);

            await userController.getById(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockUser);
        });

        test('trả về 404 nếu không tìm thấy tài khoản', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await userController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy tài khoản' });
        });
    });

    // =====================================================
    // create
    // =====================================================
    describe('create()', () => {
        test('tạo tài khoản mới thành công và hash password', async () => {
            req.body = { username: 'newuser', password: 'Pass123!', roleId: 4, name: 'New User' };

            const mockNewUser = { id: 10, username: 'newuser', role: 'employee' };

            db.query
                .mockResolvedValueOnce([[]])                  // SELECT check username (chưa tồn tại)
                .mockResolvedValueOnce([{ insertId: 10 }])    // INSERT users
                .mockResolvedValueOnce([[mockNewUser]]);       // SELECT mới

            await userController.create(req, res, next);

            expect(bcrypt.hash).toHaveBeenCalledWith('Pass123!', 10);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockNewUser);
            expect(req._auditAction).toBe('CREATE_USER');
        });

        test('trả về 400 nếu thiếu username, password hoặc roleId', async () => {
            req.body = { username: 'newuser' }; // Thiếu password và roleId

            await userController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('bắt buộc') })
            );
        });

        test('trả về 400 nếu username đã tồn tại', async () => {
            req.body = { username: 'existinguser', password: 'Pass123!', roleId: 4 };

            db.query.mockResolvedValueOnce([[{ id: 1 }]]); // Username đã tồn tại

            await userController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Tên đăng nhập đã tồn tại' });
        });
    });

    // =====================================================
    // update
    // =====================================================
    describe('update()', () => {
        test('cập nhật thông tin tài khoản thành công', async () => {
            req.params.id = '2';
            req.body = { roleId: 3, status: 'active' };

            const mockUpdated = { id: 2, username: 'hruser', role_id: 3, status: 'active' };
            db.query
                .mockResolvedValueOnce([{}])           // UPDATE
                .mockResolvedValueOnce([[mockUpdated]]); // SELECT sau UPDATE

            await userController.update(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockUpdated);
        });

        test('trả về 400 nếu không có trường hợp lệ', async () => {
            req.params.id = '2';
            req.body = { unknownField: 'value' };

            await userController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không có trường nào để cập nhật' });
        });

        test('trả về 404 nếu không tìm thấy tài khoản', async () => {
            req.params.id = '999';
            req.body = { status: 'locked' };

            db.query
                .mockResolvedValueOnce([{}])    // UPDATE
                .mockResolvedValueOnce([[]]); // SELECT - không tìm thấy

            await userController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // =====================================================
    // delete
    // =====================================================
    describe('delete()', () => {
        test('xóa tài khoản thành công', async () => {
            req.params.id = '5';
            const mockUser = [{ id: 5, role_name: 'employee' }];

            db.query
                .mockResolvedValueOnce([mockUser])         // SELECT user + role
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE

            await userController.delete(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ message: 'Xóa tài khoản thành công' });
            expect(req._auditAction).toBe('DELETE_USER');
        });

        test('trả về 404 nếu không tìm thấy tài khoản', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await userController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('trả về 400 nếu cố xóa tài khoản Admin', async () => {
            req.params.id = '1';
            const mockUser = [{ id: 1, role_name: 'admin' }];

            db.query.mockResolvedValueOnce([mockUser]); // SELECT user - là admin

            await userController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không thể xóa tài khoản Admin' });
        });
    });

    // =====================================================
    // resetPassword
    // =====================================================
    describe('resetPassword()', () => {
        test('reset mật khẩu thành công và trả về temp password', async () => {
            req.params.id = '5';
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE users SET password

            await userController.resetPassword(req, res, next);

            expect(bcrypt.hash).toHaveBeenCalled();
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET password = ?'),
                expect.arrayContaining(['hashed_password', '5'])
            );
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: expect.stringContaining('Reset'),
                tempPassword: expect.any(String),
            }));
            expect(req._auditAction).toBe('RESET_PASSWORD');
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.params.id = '5';
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);
            await userController.resetPassword(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // toggleLock
    // =====================================================
    describe('toggleLock()', () => {
        test('khóa tài khoản đang active thành công', async () => {
            req.params.id = '5';
            const mockUser = { id: 5, username: 'empuser', status: 'active', role_name: 'employee' };
            const mockUpdated = { id: 5, username: 'empuser', status: 'locked' };

            db.query
                .mockResolvedValueOnce([[mockUser]])   // SELECT user + role
                .mockResolvedValueOnce([{}])           // UPDATE users SET status='locked'
                .mockResolvedValueOnce([[mockUpdated]]); // SELECT updated

            await userController.toggleLock(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET status = ?'),
                ['locked', '5']
            );
            expect(res.json).toHaveBeenCalledWith(mockUpdated);
            expect(req._auditDetails).toEqual({ oldStatus: 'active', newStatus: 'locked' });
        });

        test('mở khóa tài khoản đang locked thành công', async () => {
            req.params.id = '5';
            const mockUser = { id: 5, status: 'locked', role_name: 'employee' };
            const mockUpdated = { id: 5, status: 'active' };

            db.query
                .mockResolvedValueOnce([[mockUser]])
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([[mockUpdated]]);

            await userController.toggleLock(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET status = ?'),
                ['active', '5']
            );
        });

        test('trả về 400 nếu cố khóa tài khoản Admin', async () => {
            req.params.id = '1';
            const mockUser = { id: 1, status: 'active', role_name: 'admin' };

            db.query.mockResolvedValueOnce([[mockUser]]);

            await userController.toggleLock(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không thể khóa tài khoản Admin' });
        });

        test('trả về 404 nếu không tìm thấy tài khoản', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await userController.toggleLock(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
