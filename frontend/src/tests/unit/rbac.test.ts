/**
 * Unit Tests: shared/constants/rbac.ts
 *
 * Kiểm tra các helper functions RBAC:
 * - hasPermission
 * - hasAnyPermission
 * - hasAllPermissions
 * - hasRole
 * - canAccessRoute
 * - getDefaultRoute
 */
import { describe, it, expect } from 'vitest';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  hasRole,
  canAccessRoute,
  getDefaultRoute,
  Permission,
  Role,
} from '../../shared/constants/rbac';

// ============================================================
// hasPermission
// ============================================================
describe('hasPermission', () => {
  it('trả về true khi user có permission cần thiết', () => {
    const perms = ['manage_users', 'view_employees'];
    expect(hasPermission(perms, Permission.MANAGE_USERS)).toBe(true);
  });

  it('trả về false khi user không có permission đó', () => {
    const perms = ['view_employees'];
    expect(hasPermission(perms, Permission.MANAGE_USERS)).toBe(false);
  });

  it('trả về false khi userPermissions là undefined', () => {
    expect(hasPermission(undefined, Permission.MANAGE_USERS)).toBe(false);
  });

  it('trả về false khi mảng permissions rỗng', () => {
    expect(hasPermission([], Permission.VIEW_SELF)).toBe(false);
  });

  it('chấp nhận permission dạng string thô (không phải enum)', () => {
    expect(hasPermission(['request_leave'], 'request_leave')).toBe(true);
  });
});

// ============================================================
// hasAnyPermission
// ============================================================
describe('hasAnyPermission', () => {
  it('trả về true khi có ít nhất 1 permission trong danh sách', () => {
    const perms = ['view_self', 'update_self'];
    expect(hasAnyPermission(perms, [Permission.VIEW_SELF, Permission.MANAGE_USERS])).toBe(true);
  });

  it('trả về false khi không có permission nào trong danh sách', () => {
    const perms = ['view_self'];
    expect(hasAnyPermission(perms, [Permission.MANAGE_USERS, Permission.MANAGE_ROLES])).toBe(false);
  });

  it('trả về false khi userPermissions là undefined', () => {
    expect(hasAnyPermission(undefined, [Permission.VIEW_SELF])).toBe(false);
  });
});

// ============================================================
// hasAllPermissions
// ============================================================
describe('hasAllPermissions', () => {
  it('trả về true khi user có TẤT CẢ permissions cần thiết', () => {
    const perms = ['manage_users', 'manage_roles', 'view_audit_log'];
    expect(
      hasAllPermissions(perms, [Permission.MANAGE_USERS, Permission.MANAGE_ROLES])
    ).toBe(true);
  });

  it('trả về false khi user thiếu ít nhất 1 permission', () => {
    const perms = ['manage_users'];
    expect(
      hasAllPermissions(perms, [Permission.MANAGE_USERS, Permission.MANAGE_ROLES])
    ).toBe(false);
  });

  it('trả về false khi userPermissions là undefined', () => {
    expect(hasAllPermissions(undefined, [Permission.MANAGE_USERS])).toBe(false);
  });
});

// ============================================================
// hasRole
// ============================================================
describe('hasRole', () => {
  it('trả về true khi role khớp (truyền Role đơn)', () => {
    expect(hasRole('admin', Role.ADMIN)).toBe(true);
  });

  it('trả về true khi role nằm trong mảng cho phép', () => {
    expect(hasRole('hr', [Role.ADMIN, Role.HR])).toBe(true);
  });

  it('trả về false khi role không khớp', () => {
    expect(hasRole('employee', [Role.ADMIN, Role.HR])).toBe(false);
  });

  it('trả về false khi userRole là undefined', () => {
    expect(hasRole(undefined, Role.ADMIN)).toBe(false);
  });

  it('trả về false khi userRole là chuỗi rỗng', () => {
    expect(hasRole('', [Role.ADMIN])).toBe(false);
  });
});

// ============================================================
// canAccessRoute
// ============================================================
describe('canAccessRoute', () => {
  describe('Routes được định nghĩa trong ROUTE_ACCESS', () => {
    it('Admin được phép vào /admin/users', () => {
      expect(canAccessRoute('admin', '/admin/users')).toBe(true);
    });

    it('Employee bị từ chối vào /admin/users', () => {
      expect(canAccessRoute('employee', '/admin/users')).toBe(false);
    });

    it('HR được phép vào /hr/employees', () => {
      expect(canAccessRoute('hr', '/hr/employees')).toBe(true);
    });

    it('Employee bị từ chối vào /hr/employees', () => {
      expect(canAccessRoute('employee', '/hr/employees')).toBe(false);
    });

    it('Employee được phép vào /my-profile', () => {
      expect(canAccessRoute('employee', '/my-profile')).toBe(true);
    });

    it('Admin được phép vào /my-profile', () => {
      expect(canAccessRoute('admin', '/my-profile')).toBe(true);
    });
  });

  describe('Dynamic routes (có :id)', () => {
    it('HR được phép vào /hr/employees/123', () => {
      expect(canAccessRoute('hr', '/hr/employees/123')).toBe(true);
    });

    it('Employee bị từ chối vào /hr/employees/123', () => {
      expect(canAccessRoute('employee', '/hr/employees/123')).toBe(false);
    });

    it('Admin được phép vào /admin/users/abc-def', () => {
      expect(canAccessRoute('admin', '/admin/users/abc-def')).toBe(true);
    });
  });

  describe('Routes không được định nghĩa → cho phép tất cả', () => {
    it('Mọi role đều được phép vào route không định nghĩa', () => {
      expect(canAccessRoute('employee', '/some-undefined-route')).toBe(true);
      expect(canAccessRoute('admin', '/some-undefined-route')).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('trả về false khi userRole là undefined', () => {
      expect(canAccessRoute(undefined, '/admin/users')).toBe(false);
    });

    it('trả về false khi userRole là chuỗi rỗng', () => {
      expect(canAccessRoute('', '/admin/users')).toBe(false);
    });
  });
});

// ============================================================
// getDefaultRoute
// ============================================================
describe('getDefaultRoute', () => {
  it('Admin → /admin/users', () => {
    expect(getDefaultRoute('admin')).toBe('/admin/users');
  });

  it('HR → /hr/employees', () => {
    expect(getDefaultRoute('hr')).toBe('/hr/employees');
  });

  it('Manager → /dept/employees', () => {
    expect(getDefaultRoute('manager')).toBe('/dept/employees');
  });

  it('Employee → /my-profile', () => {
    expect(getDefaultRoute('employee')).toBe('/my-profile');
  });

  it('Role không xác định → /', () => {
    expect(getDefaultRoute('unknown_role')).toBe('/');
  });

  it('undefined → /login', () => {
    expect(getDefaultRoute(undefined)).toBe('/login');
  });
});
