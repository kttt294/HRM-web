/**
 * Component Tests: PermissionGuard.tsx
 *
 * Kiểm tra render có điều kiện dựa trên role và permission:
 * - ShowForRoles: hiển thị/ẩn theo role
 * - ShowForPermission: hiển thị/ẩn theo permission
 * - ShowForAnyPermission: hiển thị khi có ít nhất 1 permission
 * - HideForRoles: ẩn khi user có role chỉ định
 * - AdminOnly, HROnly, HRAndEmployee, InternalUsers
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAuthStore } from '../../store/auth.store';
import {
  ShowForRoles,
  ShowForPermission,
  ShowForAnyPermission,
  HideForRoles,
  AdminOnly,
  HROnly,
  HRAndEmployee,
  InternalUsers,
} from '../../components/guards/PermissionGuard';
import { Role, Permission } from '../../shared/constants/rbac';
import { User } from '../../features/auth/models/user.model';

// ============================================================
// Helpers
// ============================================================
function setUser(role: User['role'], permissions: string[] = []) {
  useAuthStore.setState({
    user: {
      id: 'u1',
      username: 'test',
      name: 'Test User',
      role,
      permissions,
      createdAt: '2024-01-01',
    },
    isAuthenticated: true,
    token: 'fake-token',
  });
}

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false, token: null });
  localStorage.clear();
});

// ============================================================
// ShowForRoles
// ============================================================
describe('ShowForRoles', () => {
  it('nên hiển thị children khi user có role phù hợp', () => {
    setUser('admin');

    render(
      <ShowForRoles roles={[Role.ADMIN]}>
        <span>Admin Content</span>
      </ShowForRoles>
    );

    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('nên ẩn children khi user không có role phù hợp', () => {
    setUser('employee');

    render(
      <ShowForRoles roles={[Role.ADMIN]}>
        <span>Admin Content</span>
      </ShowForRoles>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('nên hiển thị fallback khi không có quyền', () => {
    setUser('employee');

    render(
      <ShowForRoles roles={[Role.ADMIN]} fallback={<span>No Access</span>}>
        <span>Admin Content</span>
      </ShowForRoles>
    );

    expect(screen.getByText('No Access')).toBeInTheDocument();
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('nên ẩn content khi chưa đăng nhập (user = null)', () => {
    render(
      <ShowForRoles roles={[Role.ADMIN]}>
        <span>Admin Content</span>
      </ShowForRoles>
    );

    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
  });

  it('nên hiển thị khi user có 1 trong nhiều roles được cho phép', () => {
    setUser('hr');

    render(
      <ShowForRoles roles={[Role.ADMIN, Role.HR]}>
        <span>HR or Admin Content</span>
      </ShowForRoles>
    );

    expect(screen.getByText('HR or Admin Content')).toBeInTheDocument();
  });
});

// ============================================================
// ShowForPermission
// ============================================================
describe('ShowForPermission', () => {
  it('nên hiển thị khi user có permission cần thiết', () => {
    setUser('hr', ['manage_employees', 'view_employees']);

    render(
      <ShowForPermission permission={Permission.MANAGE_EMPLOYEES}>
        <span>Manage Employees</span>
      </ShowForPermission>
    );

    expect(screen.getByText('Manage Employees')).toBeInTheDocument();
  });

  it('nên ẩn khi user không có permission', () => {
    setUser('employee', ['view_self']);

    render(
      <ShowForPermission permission={Permission.MANAGE_EMPLOYEES}>
        <span>Manage Employees</span>
      </ShowForPermission>
    );

    expect(screen.queryByText('Manage Employees')).not.toBeInTheDocument();
  });

  it('nên hiển thị fallback khi không có permission', () => {
    setUser('employee', ['view_self']);

    render(
      <ShowForPermission
        permission={Permission.MANAGE_EMPLOYEES}
        fallback={<span>Access Denied</span>}
      >
        <span>Manage Employees</span>
      </ShowForPermission>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });
});

// ============================================================
// ShowForAnyPermission
// ============================================================
describe('ShowForAnyPermission', () => {
  it('nên hiển thị khi user có ít nhất 1 trong các permissions', () => {
    setUser('manager', ['approve_dept_leave']);

    render(
      <ShowForAnyPermission
        permissions={[Permission.APPROVE_DEPT_LEAVE, Permission.MANAGE_EMPLOYEES]}
      >
        <span>Leave Actions</span>
      </ShowForAnyPermission>
    );

    expect(screen.getByText('Leave Actions')).toBeInTheDocument();
  });

  it('nên ẩn khi user không có bất kỳ permission nào', () => {
    setUser('employee', ['view_self']);

    render(
      <ShowForAnyPermission
        permissions={[Permission.APPROVE_DEPT_LEAVE, Permission.MANAGE_EMPLOYEES]}
      >
        <span>Leave Actions</span>
      </ShowForAnyPermission>
    );

    expect(screen.queryByText('Leave Actions')).not.toBeInTheDocument();
  });
});

// ============================================================
// HideForRoles
// ============================================================
describe('HideForRoles', () => {
  it('nên ẩn children khi user có role bị ẩn', () => {
    setUser('admin');

    render(
      <HideForRoles roles={[Role.ADMIN]}>
        <span>Not For Admin</span>
      </HideForRoles>
    );

    expect(screen.queryByText('Not For Admin')).not.toBeInTheDocument();
  });

  it('nên hiển thị children khi user không có role bị ẩn', () => {
    setUser('employee');

    render(
      <HideForRoles roles={[Role.ADMIN]}>
        <span>Not For Admin</span>
      </HideForRoles>
    );

    expect(screen.getByText('Not For Admin')).toBeInTheDocument();
  });

  it('nên hiển thị children khi chưa đăng nhập', () => {
    render(
      <HideForRoles roles={[Role.ADMIN]}>
        <span>Public Content</span>
      </HideForRoles>
    );

    expect(screen.getByText('Public Content')).toBeInTheDocument();
  });
});

// ============================================================
// Convenience Components
// ============================================================
describe('AdminOnly', () => {
  it('nên hiển thị khi user là admin', () => {
    setUser('admin');
    render(<AdminOnly><span>Admin</span></AdminOnly>);
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('nên ẩn khi user là HR', () => {
    setUser('hr');
    render(<AdminOnly><span>Admin</span></AdminOnly>);
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });
});

describe('HROnly', () => {
  it('nên hiển thị khi user là HR', () => {
    setUser('hr');
    render(<HROnly><span>HR Content</span></HROnly>);
    expect(screen.getByText('HR Content')).toBeInTheDocument();
  });

  it('nên ẩn khi user là Employee', () => {
    setUser('employee');
    render(<HROnly><span>HR Content</span></HROnly>);
    expect(screen.queryByText('HR Content')).not.toBeInTheDocument();
  });
});

describe('HRAndEmployee', () => {
  it('nên hiển thị cho HR', () => {
    setUser('hr');
    render(<HRAndEmployee><span>Shared</span></HRAndEmployee>);
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it('nên hiển thị cho Employee', () => {
    setUser('employee');
    render(<HRAndEmployee><span>Shared</span></HRAndEmployee>);
    expect(screen.getByText('Shared')).toBeInTheDocument();
  });

  it('nên ẩn cho Admin', () => {
    setUser('admin');
    render(<HRAndEmployee><span>Shared</span></HRAndEmployee>);
    expect(screen.queryByText('Shared')).not.toBeInTheDocument();
  });
});

describe('InternalUsers', () => {
  it('nên hiển thị cho Admin', () => {
    setUser('admin');
    render(<InternalUsers><span>Internal</span></InternalUsers>);
    expect(screen.getByText('Internal')).toBeInTheDocument();
  });

  it('nên hiển thị cho HR', () => {
    setUser('hr');
    render(<InternalUsers><span>Internal</span></InternalUsers>);
    expect(screen.getByText('Internal')).toBeInTheDocument();
  });

  it('nên hiển thị cho Employee', () => {
    setUser('employee');
    render(<InternalUsers><span>Internal</span></InternalUsers>);
    expect(screen.getByText('Internal')).toBeInTheDocument();
  });
});
