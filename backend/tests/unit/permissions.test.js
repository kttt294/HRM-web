const db = require('../../config/database');
const { getUserPermissions, getRolePermissions, hasPermission } = require('../../utils/permissions');

// Mock database
jest.mock('../../config/database', () => ({
    query: jest.fn()
}));

describe('Permissions Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =====================================================
    // getUserPermissions
    // =====================================================
    describe('getUserPermissions(userId)', () => {
        test('trả về danh sách permission của user dựa trên role', async () => {
            const mockPermissions = [
                { name: 'view_self' },
                { name: 'update_self' },
                { name: 'request_leave' }
            ];
            db.query.mockResolvedValueOnce([mockPermissions]);

            const result = await getUserPermissions(4); // userId = 4 (employee)

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE u.id = ?'), [4]);
            expect(result).toEqual(['view_self', 'update_self', 'request_leave']);
        });

        test('trả về mảng rỗng nếu user không có permission nào', async () => {
            db.query.mockResolvedValueOnce([[]]); // Không có permissions

            const result = await getUserPermissions(99);

            expect(result).toEqual([]);
        });

        test('admin có tất cả permissions', async () => {
            const allPermissions = [
                { name: 'manage_users' },
                { name: 'manage_roles' },
                { name: 'manage_employees' },
                { name: 'manage_payroll_all' },
            ];
            db.query.mockResolvedValueOnce([allPermissions]);

            const result = await getUserPermissions(1); // userId = 1 (admin)

            expect(result).toContain('manage_users');
            expect(result).toContain('manage_employees');
            expect(result.length).toBe(4);
        });
    });

    // =====================================================
    // getRolePermissions
    // =====================================================
    describe('getRolePermissions(roleId)', () => {
        test('trả về permissions của role employee (roleId=4)', async () => {
            const mockPermissions = [
                { name: 'view_self' },
                { name: 'update_self' },
                { name: 'view_my_leave' },
                { name: 'request_leave' },
            ];
            db.query.mockResolvedValueOnce([mockPermissions]);

            const result = await getRolePermissions(4);

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE rp.role_id = ?'), [4]);
            expect(result).toContain('view_self');
            expect(result).toContain('request_leave');
        });

        test('trả về mảng rỗng nếu role không tồn tại', async () => {
            db.query.mockResolvedValueOnce([[]]); // Không có permissions

            const result = await getRolePermissions(999);

            expect(result).toEqual([]);
        });
    });

    // =====================================================
    // hasPermission
    // =====================================================
    describe('hasPermission(userId, permissionName)', () => {
        test('trả về true nếu user có permission được chỉ định', async () => {
            db.query.mockResolvedValueOnce([[{ count: 1 }]]);

            const result = await hasPermission(1, 'manage_users');

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('WHERE u.id = ? AND p.name = ?'),
                [1, 'manage_users']
            );
            expect(result).toBe(true);
        });

        test('trả về false nếu user không có permission được chỉ định', async () => {
            db.query.mockResolvedValueOnce([[{ count: 0 }]]);

            const result = await hasPermission(5, 'manage_users'); // Employee không có quyền này

            expect(result).toBe(false);
        });
    });
});
