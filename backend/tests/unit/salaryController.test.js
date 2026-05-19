/**
 * Unit Tests: salaryController.js
 *
 * Kiểm tra các chức năng:
 * - getMy: Nhân viên lấy bảng lương của chính mình
 * - getAll: HR/Manager/Employee xem danh sách bảng lương (theo phạm vi)
 * - getById: Lấy chi tiết một bảng lương (có phân quyền)
 * - create: Tạo bảng lương tháng mới (chống trùng lặp)
 * - update: Cập nhật bảng lương (gửi email khi confirmed/paid)
 * - delete: Xóa bảng lương
 */
const salaryController = require('../../controllers/salaryController');
const db = require('../../config/database');

jest.mock('../../config/database', () => ({
    query: jest.fn(),
}));

jest.mock('../../utils/formatters', () => ({
    toCamelCase: jest.fn((data) => data),
}));

jest.mock('../../utils/emailService', () => ({
    sendSalaryNotification: jest.fn().mockResolvedValue(true),
}));

describe('Salary Controller', () => {
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
    // getMy
    // =====================================================
    describe('getMy()', () => {
        test('lấy danh sách bảng lương của nhân viên hiện tại', async () => {
            req.user = { id: 2, role: 'employee' };
            const mockEmp = [{ id: 5 }];
            const mockSalaries = [
                { id: 1, employee_id: 5, month: 5, year: 2025, net_salary: 10000000 },
                { id: 2, employee_id: 5, month: 4, year: 2025, net_salary: 10000000 },
            ];

            db.query
                .mockResolvedValueOnce([mockEmp])
                .mockResolvedValueOnce([mockSalaries]);

            await salaryController.getMy(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockSalaries);
        });

        test('trả về mảng rỗng nếu user không có hồ sơ nhân viên', async () => {
            req.user = { id: 999 };
            db.query.mockResolvedValueOnce([[]]); // Không có employee

            await salaryController.getMy(req, res, next);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await salaryController.getMy(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getAll
    // =====================================================
    describe('getAll()', () => {
        test('HR lấy được toàn bộ danh sách bảng lương', async () => {
            req.user = { role: 'hr', id: 1 };
            const mockSalaries = [{ id: 1 }, { id: 2 }];
            db.query.mockResolvedValueOnce([mockSalaries]);

            await salaryController.getAll(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockSalaries);
        });

        test('Employee chỉ xem được bảng lương của mình (query tự động filter)', async () => {
            req.user = { role: 'employee', id: 2 };
            const mockSalaries = [{ id: 1, employee_id: 5 }];
            db.query.mockResolvedValueOnce([mockSalaries]);

            await salaryController.getAll(req, res, next);

            // Query phải chứa điều kiện filter theo user_id
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('employee_id = (SELECT id FROM employees WHERE user_id = ?)'),
                expect.arrayContaining([2])
            );
            expect(res.json).toHaveBeenCalledWith(mockSalaries);
        });

        test('Manager chỉ xem được bảng lương của phòng ban mình', async () => {
            req.user = { role: 'manager', id: 3 };
            const mockMgrData = [{ department_id: 2 }];
            const mockSalaries = [{ id: 1, employee_id: 5 }];

            db.query
                .mockResolvedValueOnce([mockMgrData])   // SELECT department_id from employees
                .mockResolvedValueOnce([mockSalaries]); // SELECT salary_records filtered by dept

            await salaryController.getAll(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('department_id = ?'),
                expect.arrayContaining([2])
            );
        });

        test('HR có thể filter theo employeeId, month, year, status', async () => {
            req.user = { role: 'hr', id: 1 };
            req.query = { employeeId: '5', month: '5', year: '2025', status: 'confirmed' };
            db.query.mockResolvedValueOnce([[{ id: 1 }]]);

            await salaryController.getAll(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('sr.month = ?'),
                expect.arrayContaining(['5'])
            );
        });
    });

    // =====================================================
    // getById
    // =====================================================
    describe('getById()', () => {
        test('HR lấy chi tiết bảng lương theo ID thành công', async () => {
            req.params.id = '1';
            req.user = { role: 'hr', id: 1 };
            const mockSalary = { id: 1, employee_id: 5, net_salary: 10000000 };
            db.query.mockResolvedValueOnce([[mockSalary]]);

            await salaryController.getById(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockSalary);
        });

        test('trả về 404 nếu không tìm thấy bảng lương', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await salaryController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy bảng lương' });
        });

        test('Employee bị từ chối nếu xem bảng lương của người khác (403)', async () => {
            req.params.id = '1';
            req.user = { role: 'employee', id: 2 };

            const mockSalary = { id: 1, employee_id: 99 }; // Của nhân viên khác
            const mockEmp = [{ id: 5 }]; // Employee của user này

            db.query
                .mockResolvedValueOnce([[mockSalary]]) // SELECT salary
                .mockResolvedValueOnce([mockEmp]);     // SELECT employee của user

            await salaryController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('không có quyền') })
            );
        });
    });

    // =====================================================
    // create
    // =====================================================
    describe('create()', () => {
        test('tạo bảng lương tháng mới thành công', async () => {
            req.body = {
                employeeId: 5, month: 5, year: 2025,
                baseSalary: 10000000, allowance: 500000,
                deduction: 1000000, netSalary: 9500000,
            };

            const mockNewSalary = { id: 1, employee_id: 5, month: 5, year: 2025, net_salary: 9500000 };

            db.query
                .mockResolvedValueOnce([[{ id: 5 }]])        // SELECT employee exists
                .mockResolvedValueOnce([[]])                  // SELECT existing salary (chưa có)
                .mockResolvedValueOnce([{ insertId: 1 }])    // INSERT salary_records
                .mockResolvedValueOnce([[mockNewSalary]]);   // SELECT mới

            await salaryController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockNewSalary);
            expect(req._auditAction).toBe('CREATE_SALARY');
        });

        test('trả về 400 nếu thiếu các trường bắt buộc', async () => {
            req.body = { month: 5, year: 2025 }; // Thiếu employeeId, baseSalary

            await salaryController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('Thiếu thông tin bắt buộc') })
            );
            expect(db.query).not.toHaveBeenCalled();
        });

        test('trả về 404 nếu nhân viên không tồn tại', async () => {
            req.body = { employeeId: 999, month: 5, year: 2025, baseSalary: 10000000 };
            db.query.mockResolvedValueOnce([[]]); // employee không tồn tại

            await salaryController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy nhân viên' });
        });

        test('trả về 400 nếu đã tồn tại bảng lương cho nhân viên trong tháng này', async () => {
            req.body = { employeeId: 5, month: 5, year: 2025, baseSalary: 10000000 };

            db.query
                .mockResolvedValueOnce([[{ id: 5 }]])    // Employee exists
                .mockResolvedValueOnce([[{ id: 1 }]]);   // Salary đã tồn tại

            await salaryController.create(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ message: expect.stringContaining('Đã tồn tại bảng lương') })
            );
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.body = { employeeId: 5, month: 5, year: 2025, baseSalary: 10000000 };
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await salaryController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // update
    // =====================================================
    describe('update()', () => {
        test('cập nhật bảng lương thành công', async () => {
            req.params.id = '1';
            req.body = { netSalary: 11000000, status: 'confirmed' };

            const mockUpdated = { id: 1, employee_id: 5, net_salary: 11000000, status: 'confirmed', month: 5, year: 2025 };

            db.query
                .mockResolvedValueOnce([{}])              // UPDATE salary_records
                .mockResolvedValueOnce([[mockUpdated]])   // SELECT sau UPDATE
                .mockResolvedValueOnce([[{ personal_email: 'emp@test.com', full_name: 'EmpA' }]]); // email data

            await salaryController.update(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockUpdated);
            expect(req._auditAction).toBe('UPDATE_SALARY');
        });

        test('trả về 400 nếu không có trường hợp lệ nào để cập nhật', async () => {
            req.params.id = '1';
            req.body = { unknownField: 'value' };

            await salaryController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không có trường nào để cập nhật' });
        });

        test('trả về 404 nếu bảng lương không tồn tại sau update', async () => {
            req.params.id = '999';
            req.body = { status: 'paid' };

            db.query
                .mockResolvedValueOnce([{}])   // UPDATE
                .mockResolvedValueOnce([[]]); // SELECT sau UPDATE - không tìm thấy

            await salaryController.update(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });

    // =====================================================
    // delete
    // =====================================================
    describe('delete()', () => {
        test('xóa bảng lương thành công', async () => {
            req.params.id = '1';
            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await salaryController.delete(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ message: 'Xóa bảng lương thành công' });
            expect(req._auditAction).toBe('DELETE_SALARY');
        });

        test('trả về 404 nếu không tìm thấy bảng lương', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([{ affectedRows: 0 }]);

            await salaryController.delete(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy bảng lương' });
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.params.id = '1';
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await salaryController.delete(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });
});
