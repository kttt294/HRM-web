/**
 * Unit Tests: dataScope.js middleware
 *
 * Kiểm tra cơ chế phân vùng dữ liệu dựa trên role:
 * - Admin/HR: không bị giới hạn (queryScope rỗng)
 * - Manager với resource 'employee': filterByDept = true
 * - Employee với resource 'employee': chỉ thấy chính mình (id = employeeId)
 * - Manager với resource 'leave_request': filterByDept = true
 * - Employee với resource 'leave_request': chỉ thấy đơn của mình
 * - Manager với resource 'vacancy': chỉ thấy tin của mình (recruiter_id)
 * - Không có user (khách): queryScope rỗng
 */
const { dataScope } = require('../../middleware/dataScope');

describe('dataScope Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { user: null };
        res = {};
        next = jest.fn();
    });

    // =====================================================
    // Trường hợp không có user (public)
    // =====================================================
    test('không có user (khách): đặt queryScope rỗng và gọi next()', () => {
        req.user = null;
        const middleware = dataScope('employee');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({});
        expect(next).toHaveBeenCalled();
    });

    // =====================================================
    // Admin và HR - không bị giới hạn
    // =====================================================
    test('Admin: không bị giới hạn - queryScope rỗng', () => {
        req.user = { role: 'admin', employeeId: 1 };
        const middleware = dataScope('employee');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({});
        expect(next).toHaveBeenCalled();
    });

    test('HR: không bị giới hạn - queryScope rỗng', () => {
        req.user = { role: 'hr', employeeId: 10 };
        const middleware = dataScope('employee');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({});
        expect(next).toHaveBeenCalled();
    });

    // =====================================================
    // Resource: employee
    // =====================================================
    test('Manager xem employee: được lọc theo phòng ban (filterByDept=true)', () => {
        req.user = { role: 'manager', employeeId: 20 };
        const middleware = dataScope('employee');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({ filterByDept: true });
        expect(next).toHaveBeenCalled();
    });

    test('Employee xem employee: chỉ thấy chính mình (id = employeeId)', () => {
        req.user = { role: 'employee', employeeId: 5 };
        const middleware = dataScope('employee');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({ id: 5 });
        expect(next).toHaveBeenCalled();
    });

    // =====================================================
    // Resource: leave_request
    // =====================================================
    test('Manager xem leave_request: được lọc theo phòng ban (filterByDept=true)', () => {
        req.user = { role: 'manager', employeeId: 20 };
        const middleware = dataScope('leave_request');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({ filterByDept: true });
        expect(next).toHaveBeenCalled();
    });

    test('Employee xem leave_request: chỉ thấy đơn của mình (employee_id = employeeId)', () => {
        req.user = { role: 'employee', employeeId: 5 };
        const middleware = dataScope('leave_request');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({ employee_id: 5 });
        expect(next).toHaveBeenCalled();
    });

    // =====================================================
    // Resource: vacancy
    // =====================================================
    test('Manager xem vacancy: chỉ thấy tin của mình (recruiter_id = employeeId)', () => {
        req.user = { role: 'manager', employeeId: 20 };
        const middleware = dataScope('vacancy');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({ recruiter_id: 20 });
        expect(next).toHaveBeenCalled();
    });

    test('Employee xem vacancy: chỉ thấy tin của mình (recruiter_id = employeeId)', () => {
        req.user = { role: 'employee', employeeId: 5 };
        const middleware = dataScope('vacancy');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({ recruiter_id: 5 });
        expect(next).toHaveBeenCalled();
    });

    // =====================================================
    // Resource không xác định (default case)
    // =====================================================
    test('resource không xác định: queryScope rỗng', () => {
        req.user = { role: 'employee', employeeId: 5 };
        const middleware = dataScope('unknown_resource');

        middleware(req, res, next);

        expect(req.queryScope).toEqual({});
        expect(next).toHaveBeenCalled();
    });

    // =====================================================
    // dataScope trả về middleware function (factory pattern)
    // =====================================================
    test('dataScope() trả về một function middleware', () => {
        const middleware = dataScope('employee');
        expect(typeof middleware).toBe('function');
        expect(middleware.length).toBe(3); // (req, res, next)
    });
});
