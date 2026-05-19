/**
 * Unit Tests: leaveController.js
 *
 * Kiểm tra các chức năng:
 * - create: Nhân viên gửi đơn xin nghỉ phép
 * - approve: HR/Manager duyệt đơn nghỉ phép và trừ ngày phép
 * - reject: HR/Manager từ chối đơn nghỉ phép
 * - delete: Hủy đơn nghỉ phép đang chờ duyệt
 * - getMy: Lấy danh sách đơn của nhân viên hiện tại
 * - getBalance / getMyBalance: Lấy số ngày phép còn lại
 */
const leaveController = require('../../controllers/leaveController');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
    query: jest.fn(),
}));

jest.mock('../../utils/formatters', () => ({
    toCamelCase: jest.fn((data) => data),
}));

// Mock email service để không gửi email thật
jest.mock('../../utils/emailService', () => ({
    sendLeaveStatusUpdate: jest.fn().mockResolvedValue(true),
}));

describe('Leave Controller', () => {
    let req, res, next;

    beforeEach(() => {
        jest.clearAllMocks();
        db.query.mockReset(); // Clear any unconsumed mockResolvedValueOnce

        req = {
            params: {},
            body: {},
            query: {},
            user: { id: 1, role: 'hr', employeeId: 10, username: 'hruser', name: 'HR User' },
        };
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
    });

    // =====================================================
    // create
    // =====================================================
    describe('create()', () => {
        test('nhân viên gửi đơn nghỉ phép thành công', async () => {
            req.user = { id: 2, role: 'employee', employeeId: 5 };
            req.body = { leaveType: 'annual', startDate: '2025-06-01', endDate: '2025-06-03', reason: 'Du lịch' };

            const mockEmp = [{ id: 5 }];
            const mockInsertResult = { insertId: 100 };
            const mockNewLeave = { id: 100, employee_id: 5, status: 'pending', leave_type: 'annual' };

            db.query
                .mockResolvedValueOnce([mockEmp])               // SELECT employees WHERE user_id
                .mockResolvedValueOnce([mockInsertResult])       // INSERT leave_requests
                .mockResolvedValueOnce([[mockNewLeave]]);        // SELECT leave WHERE id

            await leaveController.create(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO leave_requests"),
                expect.arrayContaining([5, 'annual', '2025-06-01', '2025-06-03'])
            );
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockNewLeave);
            expect(req._auditAction).toBe('CREATE_LEAVE_REQUEST');
        });

        test('trả về 400 nếu tài khoản chưa liên kết với hồ sơ nhân viên', async () => {
            req.body = { leaveType: 'annual', startDate: '2025-06-01', endDate: '2025-06-03' };

            // SELECT employees WHERE user_id → [] (không có employee)
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy employee

            await leaveController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('chưa được liên kết') })
            );
        });

        test('trả về 400 nếu thiếu leaveType, startDate hoặc endDate', async () => {
            req.body = { reason: 'Lý do gì đó' }; // Thiếu các trường bắt buộc

            // employee tồn tại
            db.query.mockResolvedValueOnce([[{ id: 5 }]]); // employee tồn tại

            await leaveController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Thiếu thông tin bắt buộc' });
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.body = { leaveType: 'annual', startDate: '2025-06-01', endDate: '2025-06-03' };
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await leaveController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // approve
    // =====================================================
    describe('approve()', () => {
        test('HR duyệt đơn nghỉ phép thành công và trừ ngày phép của nhân viên', async () => {
            req.user = { id: 1, role: 'hr', employeeId: 10 };
            req.params.id = '100';

            const mockLeave = {
                id: 100,
                employee_id: 5,
                start_date: new Date('2025-06-01'),
                end_date: new Date('2025-06-03'),
                leave_type: 'annual',
            };

            db.query
                .mockResolvedValueOnce([[mockLeave]])       // SELECT leave
                .mockResolvedValueOnce([{}])                // UPDATE employees remaining_leave_days
                .mockResolvedValueOnce([{}])                // UPDATE leave_requests SET status
                .mockResolvedValueOnce([[{ personal_email: 'emp@test.com', full_name: 'EmpA' }]])  // email data
                .mockResolvedValueOnce([[{ full_name: 'HR User' }]]);                              // approver name

            await leaveController.approve(req, res, next);

            // Kiểm tra trừ ngày phép (3 ngày: 1, 2, 3 June)
            const updateEmpCall = db.query.mock.calls.find(call =>
                typeof call[0] === 'string' && call[0].includes('remaining_leave_days')
            );
            expect(updateEmpCall).toBeDefined();
            expect(res.json).toHaveBeenCalledWith({ message: 'Đã duyệt đơn nghỉ phép' });
            expect(req._auditAction).toBe('APPROVE_LEAVE');
        });

        test('Manager duyệt đơn nghỉ phép thành công', async () => {
            req.user = { id: 3, role: 'manager', employeeId: 20 };
            req.params.id = '101';

            const mockLeave = {
                id: 101,
                employee_id: 5,
                start_date: new Date('2025-07-01'),
                end_date: new Date('2025-07-01'),
                leave_type: 'sick',
            };

            db.query
                .mockResolvedValueOnce([[mockLeave]])
                .mockResolvedValueOnce([{}])   // UPDATE employees
                .mockResolvedValueOnce([{}])   // UPDATE leave_requests
                .mockResolvedValueOnce([[]])   // email data (no email)
                .mockResolvedValueOnce([[]]);  // approver data

            await leaveController.approve(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ message: 'Đã duyệt đơn nghỉ phép' });
        });

        test('trả về 404 nếu không tìm thấy đơn', async () => {
            req.params.id = '999';
            // SELECT * FROM leave_requests WHERE id=? → [[]] (empty)
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await leaveController.approve(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy đơn' });
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.params.id = '100';
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await leaveController.approve(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // reject
    // =====================================================
    describe('reject()', () => {
        test('HR từ chối đơn nghỉ phép thành công - không trừ ngày phép', async () => {
            req.user = { id: 1, role: 'hr', employeeId: 10 };
            req.params.id = '100';

            // reject() calls: UPDATE leave_requests, then SELECT for email, SELECT emp email, SELECT approver
            db.query
                .mockResolvedValueOnce([{ affectedRows: 1 }])   // UPDATE leave_requests status='rejected'
                .mockResolvedValueOnce([[{ id: 100, employee_id: 5, leave_type: 'annual', start_date: '2025-06-01', end_date: '2025-06-03' }]])  // SELECT leave for email
                .mockResolvedValueOnce([[{ personal_email: 'emp@test.com', full_name: 'EmpA' }]])
                .mockResolvedValueOnce([[{ full_name: 'HR User' }]]);

            await leaveController.reject(req, res, next);

            // Không nên gọi UPDATE employees (không trừ ngày phép)
            const updateEmpCalls = db.query.mock.calls.filter(call =>
                typeof call[0] === 'string' && call[0].includes('remaining_leave_days')
            );
            expect(updateEmpCalls.length).toBe(0);
            expect(res.json).toHaveBeenCalledWith({ message: 'Đã từ chối đơn nghỉ phép' });
            expect(req._auditAction).toBe('REJECT_LEAVE');
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.params.id = '100';
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await leaveController.reject(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // delete
    // =====================================================
    describe('delete()', () => {
        test('hủy đơn nghỉ phép đang chờ duyệt thành công', async () => {
            req.params.id = '100';
            // delete() calls: DELETE FROM leave_requests WHERE id=? AND status='pending'
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await leaveController.delete(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("status = 'pending'"),
                ['100']
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Hủy đơn nghỉ phép thành công' });
        });

        test('trả về 404 nếu đơn không tồn tại hoặc đã được duyệt/từ chối', async () => {
            req.params.id = '101';
            db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            await leaveController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.params.id = '102';
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await leaveController.delete(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getMy
    // =====================================================
    describe('getMy()', () => {
        test('lấy danh sách đơn nghỉ phép của nhân viên hiện tại', async () => {
            req.user = { id: 2, role: 'employee' };

            const mockLeaves = [
                { id: 100, employee_id: 5, status: 'pending' },
                { id: 101, employee_id: 5, status: 'approved' },
            ];

            // getMy() flow:
            // 1. const [employees] = await db.query('SELECT id FROM employees WHERE user_id=?', [id])
            //    → db.query returns [[{ id: 5 }]] so [employees] = [{ id: 5 }]
            //    employees[0].id = 5
            // 2. const [requests] = await db.query(SELECT from leave_requests WHERE employee_id=5)
            //    → db.query returns [mockLeaves] so [requests] = mockLeaves
            db.query
                .mockResolvedValueOnce([[{ id: 5 }]])   // SELECT employee
                .mockResolvedValueOnce([mockLeaves]);    // SELECT leave_requests

            await leaveController.getMy(req, res, next);

            // toCamelCase is pass-through, receives mockLeaves (already an array), returns same
            expect(res.json).toHaveBeenCalledWith(mockLeaves);
        });

        test('trả về mảng rỗng nếu user chưa có hồ sơ nhân viên', async () => {
            req.user = { id: 999, role: 'employee' };
            // getMy() calls: SELECT id FROM employees WHERE user_id=999 → empty
            db.query.mockResolvedValueOnce([[]]); // Không có employee

            await leaveController.getMy(req, res, next);

            expect(res.json).toHaveBeenCalledWith([]);
        });
    });

    // =====================================================
    // getMyBalance
    // =====================================================
    describe('getMyBalance()', () => {
        test('trả về số ngày phép còn lại của nhân viên', async () => {
            req.user = { id: 2, role: 'employee' };

            // getMyBalance(): SELECT employee → SELECT annual used → SELECT sick used
            db.query
                .mockResolvedValueOnce([[{ id: 5 }]])            // SELECT employee
                .mockResolvedValueOnce([[{ used: 5 }]])           // SELECT annual leave used
                .mockResolvedValueOnce([[{ used: 2 }]]);          // SELECT sick leave used

            await leaveController.getMyBalance(req, res, next);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                annualLeave: 12,
                sickLeave: 10,
                usedAnnualLeave: 5,
                usedSickLeave: 2,
            }));
        });

        test('trả về 0 ngày đã dùng nếu chưa có hồ sơ nhân viên', async () => {
            req.user = { id: 999 };
            // getMyBalance(): SELECT employee WHERE user_id=999 → empty array → early return
            db.query.mockResolvedValueOnce([[]]); // Không có employee

            await leaveController.getMyBalance(req, res, next);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                employeeId: null,
                usedAnnualLeave: 0,
                usedSickLeave: 0,
            }));
        });
    });
});
