/**
 * Unit Tests: candidateController.js
 *
 * Kiểm tra các chức năng:
 * - getAll: Lấy danh sách ứng viên (filter theo vacancyId, status, search)
 * - getById: Lấy chi tiết ứng viên
 * - create: Tạo hồ sơ ứng viên mới
 * - update: Cập nhật thông tin ứng viên
 * - delete: Xóa ứng viên
 * - updateStatus: Cập nhật trạng thái ứng viên (gồm luồng 'hired' tự động tạo tài khoản)
 */
const candidateController = require('../../controllers/candidateController');
const db = require('../../config/database');
const bcrypt = require('bcryptjs');

jest.mock('../../config/database', () => ({
    query: jest.fn(),
    getConnection: jest.fn(),
}));

jest.mock('../../utils/formatters', () => ({
    toCamelCase: jest.fn((data) => data),
}));

jest.mock('../../utils/emailService', () => ({
    sendCandidateStatusUpdate: jest.fn().mockResolvedValue(true),
    sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));

describe('Candidate Controller', () => {
    let req, res, next;

    beforeEach(() => {
        req = {
            params: {},
            body: {},
            query: {},
            user: { id: 1, role: 'hr', employeeId: 10 },
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
        test('lấy toàn bộ danh sách ứng viên', async () => {
            const mockCandidates = [
                { id: 1, full_name: 'Nguyen Van A', status: 'new' },
                { id: 2, full_name: 'Tran Thi B', status: 'interviewing' },
            ];
            db.query.mockResolvedValueOnce([mockCandidates]);

            await candidateController.getAll(req, res, next);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('FROM candidates'), []);
            expect(res.json).toHaveBeenCalledWith(mockCandidates);
        });

        test('lọc theo vacancyId, status và search', async () => {
            req.query = { vacancyId: '1', status: 'new', search: 'Nguyen' };
            db.query.mockResolvedValueOnce([[{ id: 1 }]]);

            await candidateController.getAll(req, res, next);

            const callArgs = db.query.mock.calls[0];
            expect(callArgs[0]).toContain('vacancy_id = ?');
            expect(callArgs[0]).toContain('status = ?');
            expect(callArgs[0]).toContain('full_name LIKE ?');
            expect(callArgs[1]).toEqual(expect.arrayContaining(['1', 'new', '%Nguyen%', '%Nguyen%']));
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);
            await candidateController.getAll(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getById
    // =====================================================
    describe('getById()', () => {
        test('lấy chi tiết ứng viên theo ID', async () => {
            req.params.id = '1';
            const mockCandidate = { id: 1, full_name: 'Nguyen Van A' };
            db.query.mockResolvedValueOnce([[mockCandidate]]);

            await candidateController.getById(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockCandidate);
        });

        test('trả về 404 nếu không tìm thấy ứng viên', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await candidateController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy ứng viên' });
        });
    });

    // =====================================================
    // create
    // =====================================================
    describe('create()', () => {
        test('tạo hồ sơ ứng viên mới thành công', async () => {
            req.body = {
                fullName: 'Nguyen Van C', email: 'nguyenvac@test.com',
                phone: '0123456789', vacancyId: 1,
            };

            const mockNewCandidate = { id: 3, full_name: 'Nguyen Van C', status: 'new' };
            db.query
                .mockResolvedValueOnce([{ insertId: 3 }])      // INSERT candidates
                .mockResolvedValueOnce([[mockNewCandidate]]);   // SELECT sau INSERT

            await candidateController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockNewCandidate);
            expect(req._auditAction).toBe('CREATE_CANDIDATE');
        });

        test('trả về 400 nếu thiếu fullName hoặc email', async () => {
            req.body = { phone: '0123456789' }; // Thiếu fullName và email

            await candidateController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Họ tên và email là bắt buộc' });
            expect(db.query).not.toHaveBeenCalled();
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.body = { fullName: 'Test', email: 'test@test.com' };
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);
            await candidateController.create(req, res, next);
            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // update
    // =====================================================
    describe('update()', () => {
        test('cập nhật thông tin ứng viên thành công', async () => {
            req.params.id = '1';
            req.body = { status: 'interviewing', notes: 'Phỏng vấn tuần tới' };

            const mockUpdated = { id: 1, status: 'interviewing', notes: 'Phỏng vấn tuần tới' };
            db.query
                .mockResolvedValueOnce([{}])           // UPDATE candidates
                .mockResolvedValueOnce([[mockUpdated]]); // SELECT sau UPDATE

            await candidateController.update(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockUpdated);
        });

        test('trả về 400 nếu không có trường hợp lệ nào để cập nhật', async () => {
            req.params.id = '1';
            req.body = { unknownField: 'value' };

            await candidateController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
        });

        test('trả về 404 nếu ứng viên không tồn tại sau update', async () => {
            req.params.id = '999';
            req.body = { status: 'rejected' };

            db.query
                .mockResolvedValueOnce([{}])   // UPDATE
                .mockResolvedValueOnce([[]]); // SELECT - không tìm thấy

            await candidateController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // =====================================================
    // delete
    // =====================================================
    describe('delete()', () => {
        test('xóa ứng viên thành công', async () => {
            req.params.id = '1';
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await candidateController.delete(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ message: 'Xóa ứng viên thành công' });
            expect(req._auditAction).toBe('DELETE_CANDIDATE');
        });

        test('trả về 404 nếu không tìm thấy ứng viên', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            await candidateController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // =====================================================
    // updateStatus - đặc biệt cho luồng 'hired'
    // =====================================================
    describe('updateStatus()', () => {
        const mockConn = {
            beginTransaction: jest.fn(),
            query: jest.fn(),
            commit: jest.fn(),
            rollback: jest.fn(),
            release: jest.fn(),
        };

        beforeEach(() => {
            db.getConnection.mockResolvedValue(mockConn);
        });

        test('cập nhật trạng thái ứng viên sang interviewing thành công', async () => {
            req.params.id = '1';
            req.body = { status: 'interviewing' };

            const mockCandidate = {
                id: 1, full_name: 'Nguyen Van A', email: 'a@test.com',
                phone: '0123', status: 'new', vacancy_id: 1,
                department_id: 2, job_title_id: 3,
            };

            mockConn.query.mockResolvedValueOnce([[mockCandidate]]); // SELECT candidate + vacancy
            mockConn.query.mockResolvedValueOnce([{}]); // UPDATE candidates status

            db.query.mockResolvedValueOnce([[mockCandidate]]); // SELECT after update
            db.query.mockResolvedValueOnce([[{ title: 'Dev' }]]); // vacancy title for email

            await candidateController.updateStatus(req, res, next);

            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE candidates SET status = ?'),
                ['interviewing', '1']
            );
            expect(mockConn.commit).toHaveBeenCalled();
            expect(req._auditDetails).toEqual(expect.objectContaining({ newStatus: 'interviewing' }));
        });

        test('khi trạng thái là "hired" - tự động tạo tài khoản và hồ sơ nhân viên mới', async () => {
            req.params.id = '1';
            req.body = { status: 'hired' };

            const mockCandidate = {
                id: 1, full_name: 'New Employee', email: 'newempl@test.com',
                phone: '0123', status: 'interviewing', vacancy_id: 1,
                department_id: 2, job_title_id: 3,
            };

            mockConn.query
                .mockResolvedValueOnce([[mockCandidate]])  // SELECT candidate + vacancy
                .mockResolvedValueOnce([[]])               // SELECT existing user (không tồn tại)
                .mockResolvedValueOnce([{ insertId: 50 }]) // INSERT users
                .mockResolvedValueOnce([{}])               // INSERT employees
                .mockResolvedValueOnce([{}]);              // UPDATE candidates status

            db.query.mockResolvedValueOnce([[mockCandidate]]); // SELECT after update

            await candidateController.updateStatus(req, res, next);

            // Phải tạo user mới
            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO users'),
                expect.arrayContaining(['newempl@test.com', 'hashed_password', 'New Employee'])
            );
            // Phải tạo employee mới
            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO employees'),
                expect.anything()
            );
            expect(mockConn.commit).toHaveBeenCalled();
        });

        test('trả về 400 nếu thiếu status', async () => {
            req.params.id = '1';
            req.body = {}; // Không có status

            mockConn.query.mockResolvedValueOnce([[]]); // rollback mock

            await candidateController.updateStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Trạng thái là bắt buộc' });
        });

        test('trả về 404 nếu không tìm thấy ứng viên', async () => {
            req.params.id = '999';
            req.body = { status: 'rejected' };

            mockConn.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await candidateController.updateStatus(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(mockConn.rollback).toHaveBeenCalled();
        });
    });
});
