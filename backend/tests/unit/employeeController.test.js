/**
 * Unit Tests: employeeController.js
 *
 * Kiểm tra các chức năng:
 * - updateMe: Nhân viên tự gửi yêu cầu cập nhật hồ sơ
 * - getPendingUpdates: HR/Manager xem danh sách yêu cầu chờ duyệt
 * - approveUpdate: HR/Manager duyệt yêu cầu thay đổi hồ sơ
 * - rejectUpdate: HR/Manager từ chối yêu cầu thay đổi hồ sơ
 * - verifyProfile: HR xác thực hồ sơ nhân viên
 * - getMe: Lấy thông tin nhân viên hiện tại
 * - getById: Lấy thông tin nhân viên theo ID
 * - updateRole: Thay đổi vai trò hệ thống
 */
const employeeController = require('../../controllers/employeeController');
const db = require('../../config/database');

// Mock database
jest.mock('../../config/database', () => ({
    query: jest.fn(),
    getConnection: jest.fn(),
}));

// Mock formatters
jest.mock('../../utils/formatters', () => ({
    toCamelCase: jest.fn((data) => data),
}));

describe('Employee Controller', () => {
    let req, res, next;

    beforeEach(() => {
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
        jest.clearAllMocks();
    });

    // =====================================================
    // getMe
    // =====================================================
    describe('getMe()', () => {
        test('trả về thông tin nhân viên của user đang đăng nhập', async () => {
            const mockEmp = { id: 5, full_name: 'Nguyen Van A', user_id: 1 };
            db.query.mockResolvedValueOnce([[mockEmp]]);

            await employeeController.getMe(req, res, next);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE e.user_id = ?'), [1]);
            expect(res.json).toHaveBeenCalledWith(mockEmp);
        });

        test('trả về 404 nếu không tìm thấy nhân viên', async () => {
            db.query.mockResolvedValueOnce([[]]);

            await employeeController.getMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy thông tin nhân viên' });
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await employeeController.getMe(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getById
    // =====================================================
    describe('getById()', () => {
        test('HR có thể lấy thông tin nhân viên theo ID', async () => {
            req.params.id = '5';
            const mockEmp = { id: 5, full_name: 'Nguyen Van A', department_id: 2 };
            db.query.mockResolvedValueOnce([[mockEmp]]);

            await employeeController.getById(req, res, next);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE e.id = ?'), ['5']);
            expect(res.json).toHaveBeenCalledWith(mockEmp);
        });

        test('trả về 404 nếu không tìm thấy nhân viên', async () => {
            req.params.id = '999';
            db.query.mockResolvedValueOnce([[]]);

            await employeeController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không tìm thấy nhân viên' });
        });

        test('Manager bị từ chối khi xem nhân viên ngoài phòng ban', async () => {
            req.user.role = 'manager';
            req.user.employeeId = 10;
            req.params.id = '5';

            const mockEmp = { id: 5, full_name: 'Nguyen Van A', department_id: 2 };
            db.query
                .mockResolvedValueOnce([[mockEmp]])                   // getById query
                .mockResolvedValueOnce([[{ department_id: 99 }]]);    // manager's dept

            await employeeController.getById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    // =====================================================
    // updateMe
    // =====================================================
    describe('updateMe()', () => {
        test('lưu yêu cầu cập nhật thành công khi dữ liệu hợp lệ', async () => {
            req.user.employeeId = 5;
            req.body = { fullName: 'Nguyen Van B', phone: '0987654321' };

            const updatedEmp = { id: 5, full_name: 'Nguyen Van B', profile_status: 'pending' };
            db.query
                .mockResolvedValueOnce([{ insertId: 1 }])  // INSERT profile_updates
                .mockResolvedValueOnce([{}])                // UPDATE employees profile_status
                .mockResolvedValueOnce([[updatedEmp]]);     // SELECT employee sau khi update

            await employeeController.updateMe(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("INSERT INTO profile_updates"),
                expect.arrayContaining([5])
            );
            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("profile_status = 'pending'"),
                [5]
            );
            expect(res.json).toHaveBeenCalledWith(updatedEmp);
        });

        test('trả về 400 nếu body rỗng hoặc không có trường hợp lệ', async () => {
            req.body = { unknownField: 'value', anotherUnknown: 123 };

            await employeeController.updateMe(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Không có thông tin thay đổi' });
            expect(db.query).not.toHaveBeenCalled();
        });

        test('ghi audit log sau khi cập nhật thành công', async () => {
            req.user.employeeId = 5;
            req.body = { phone: '0987654321' };

            const updatedEmp = { id: 5, profile_status: 'pending' };
            db.query
                .mockResolvedValueOnce([{ insertId: 1 }])
                .mockResolvedValueOnce([{}])
                .mockResolvedValueOnce([[updatedEmp]]);

            await employeeController.updateMe(req, res, next);

            expect(req._auditAction).toBe('REQUEST_PROFILE_UPDATE');
            expect(req._auditResource).toBe('profile_updates');
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.body = { phone: '0123456789' };
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await employeeController.updateMe(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // getPendingUpdates
    // =====================================================
    describe('getPendingUpdates()', () => {
        test('HR lấy được toàn bộ danh sách yêu cầu chờ duyệt', async () => {
            req.user.role = 'hr';
            const mockUpdates = [
                { id: 1, employee_id: 5, status: 'pending', employee_name: 'Nguyen Van A' },
                { id: 2, employee_id: 6, status: 'pending', employee_name: 'Tran Thi B' },
            ];
            db.query.mockResolvedValueOnce([mockUpdates]);

            await employeeController.getPendingUpdates(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockUpdates);
        });

        test('Manager chỉ lấy yêu cầu của nhân viên trong phòng ban mình', async () => {
            req.user.role = 'manager';
            req.user.employeeId = 10;

            const mockDepts = [{ id: 3 }, { id: 4 }];
            const mockUpdates = [
                { id: 1, employee_id: 5, status: 'pending', department_id: 3 },
            ];
            db.query
                .mockResolvedValueOnce([mockDepts])    // SELECT departments WHERE manager_id
                .mockResolvedValueOnce([mockUpdates]); // SELECT pending updates

            await employeeController.getPendingUpdates(req, res, next);

            expect(res.json).toHaveBeenCalledWith(mockUpdates);
        });

        test('Manager không quản lý phòng ban nào thì trả về mảng rỗng', async () => {
            req.user.role = 'manager';
            req.user.employeeId = 99;

            db.query.mockResolvedValueOnce([[]]); // Không có phòng ban nào

            await employeeController.getPendingUpdates(req, res, next);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await employeeController.getPendingUpdates(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // approveUpdate
    // =====================================================
    describe('approveUpdate()', () => {
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

        test('HR duyệt thành công - cập nhật thông tin nhân viên và đánh dấu approved', async () => {
            req.user.role = 'hr';
            req.user.employeeId = 10;
            req.params.updateId = '1';

            const mockUpdate = {
                id: 1,
                employee_id: 5,
                department_id: 2,
                data: JSON.stringify({ fullName: 'Nguyen Van B', phone: '0987654321' }),
            };

            mockConn.query
                .mockResolvedValueOnce([[mockUpdate]])   // SELECT profile_updates
                .mockResolvedValueOnce([{}])             // UPDATE employees SET ...
                .mockResolvedValueOnce([{}]);            // UPDATE profile_updates SET status='approved'

            await employeeController.approveUpdate(req, res, next);

            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE profile_updates SET status = 'approved'"),
                expect.arrayContaining([10, '1'])
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Đã duyệt và cập nhật hồ sơ thành công' });
            expect(mockConn.commit).toHaveBeenCalled();
        });

        test('Manager không được duyệt yêu cầu của nhân viên ngoài phòng ban (403)', async () => {
            req.user.role = 'manager';
            req.user.employeeId = 10;
            req.params.updateId = '1';

            const mockUpdate = { id: 1, employee_id: 5, department_id: 99, data: '{}' };

            mockConn.query
                .mockResolvedValueOnce([[mockUpdate]])           // SELECT profile_updates
                .mockResolvedValueOnce([[{ id: 3 }, { id: 4 }]]); // SELECT departments (không chứa 99)

            await employeeController.approveUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(mockConn.commit).not.toHaveBeenCalled();
        });

        test('trả về lỗi nếu không tìm thấy yêu cầu cập nhật', async () => {
            req.params.updateId = '999';
            mockConn.query.mockResolvedValueOnce([[]]); // Không tìm thấy

            await employeeController.approveUpdate(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(mockConn.rollback).toHaveBeenCalled();
        });

        test('đồng bộ bằng cấp khi dữ liệu có chứa degrees', async () => {
            req.user.role = 'hr';
            req.user.employeeId = 10;
            req.params.updateId = '1';

            const mockUpdate = {
                id: 1,
                employee_id: 5,
                department_id: 2,
                data: JSON.stringify({
                    degrees: [{ educationLevel: 'university', major: 'IT', schoolName: 'HUST', degreeClassification: 'good' }],
                }),
            };

            mockConn.query
                .mockResolvedValueOnce([[mockUpdate]])  // SELECT profile_updates
                .mockResolvedValueOnce([{}])            // UPDATE employees
                .mockResolvedValueOnce([{}])            // DELETE employee_degrees
                .mockResolvedValueOnce([{}])            // INSERT employee_degrees
                .mockResolvedValueOnce([{}]);           // UPDATE profile_updates status

            await employeeController.approveUpdate(req, res, next);

            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM employee_degrees'),
                [5]
            );
            expect(mockConn.commit).toHaveBeenCalled();
        });
    });

    // =====================================================
    // rejectUpdate
    // =====================================================
    describe('rejectUpdate()', () => {
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

        test('HR từ chối thành công - cập nhật trạng thái rejected và reset hồ sơ nhân viên', async () => {
            req.user.role = 'hr';
            req.user.employeeId = 10;
            req.params.updateId = '1';

            const mockUpdate = { id: 1, employee_id: 5, department_id: 2 };

            db.query
                .mockResolvedValueOnce([[mockUpdate]]);  // SELECT profile_updates (outer db.query)

            mockConn.query
                .mockResolvedValueOnce([{}])             // UPDATE profile_updates status='rejected'
                .mockResolvedValueOnce([{}]);            // UPDATE employees profile_status='verified'

            await employeeController.rejectUpdate(req, res, next);

            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE profile_updates SET status = 'rejected'"),
                expect.arrayContaining([10, '1'])
            );
            expect(mockConn.query).toHaveBeenCalledWith(
                expect.stringContaining("UPDATE employees SET profile_status = 'verified'"),
                [5]
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Đã từ chối yêu cầu cập nhật hồ sơ' });
        });

        test('Manager không được từ chối yêu cầu của nhân viên ngoài phòng ban (403)', async () => {
            req.user.role = 'manager';
            req.user.employeeId = 10;
            req.params.updateId = '1';

            const mockUpdate = { id: 1, employee_id: 5, department_id: 99 };

            db.query
                .mockResolvedValueOnce([[mockUpdate]])           // SELECT profile_updates
                .mockResolvedValueOnce([[{ id: 3 }]]);           // SELECT departments of manager

            await employeeController.rejectUpdate(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
        });
    });

    // =====================================================
    // verifyProfile
    // =====================================================
    describe('verifyProfile()', () => {
        test('HR xác thực hồ sơ nhân viên thành công', async () => {
            req.params.id = '5';
            req.user.employeeId = 10;

            db.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            await employeeController.verifyProfile(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining("profile_status = 'verified'"),
                expect.arrayContaining([10, '5'])
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Đã xác thực hồ sơ nhân viên' });
            expect(req._auditAction).toBe('VERIFY_PROFILE');
        });

        test('gọi next(error) nếu DB lỗi', async () => {
            req.params.id = '5';
            const err = new Error('DB error');
            db.query.mockRejectedValueOnce(err);

            await employeeController.verifyProfile(req, res, next);

            expect(next).toHaveBeenCalledWith(err);
        });
    });

    // =====================================================
    // updateRole
    // =====================================================
    describe('updateRole()', () => {
        test('cập nhật vai trò hệ thống thành công', async () => {
            req.params.id = '5';
            req.body = { roleId: 3 }; // Manager

            db.query
                .mockResolvedValueOnce([[{ user_id: 20 }]])  // SELECT user_id from employees
                .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE users SET role_id

            await employeeController.updateRole(req, res, next);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE users SET role_id = ?'),
                [3, 20]
            );
            expect(res.json).toHaveBeenCalledWith({ message: 'Cập nhật vai trò hệ thống thành công' });
        });

        test('trả về 400 nếu roleId không hợp lệ (ví dụ: Admin = 1)', async () => {
            req.params.id = '5';
            req.body = { roleId: 1 }; // Admin - không được phép

            await employeeController.updateRole(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(db.query).not.toHaveBeenCalled();
        });

        test('trả về 404 nếu nhân viên không có tài khoản người dùng liên kết', async () => {
            req.params.id = '5';
            req.body = { roleId: 4 };

            db.query.mockResolvedValueOnce([[]]); // Không tìm thấy employee

            await employeeController.updateRole(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
