/**
 * Component Tests: RoleGuard.tsx
 *
 * Kiểm tra điều hướng dựa trên xác thực và vai trò:
 * - RoleGuard: redirect khi chưa login, redirect khi sai role, render khi đúng role
 * - ProtectedRoute: redirect khi chưa login, render khi đã login
 * - AdminRoute, HRRoute, EmployeeRoute: wrapper components
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import {
  RoleGuard,
  ProtectedRoute,
  AdminRoute,
  HRRoute,
  EmployeeRoute,
} from '../../components/guards/RoleGuard';
import { Role } from '../../shared/constants/rbac';
import { User } from '../../features/auth/models/user.model';

// ============================================================
// Helpers
// ============================================================
function setUser(role: User['role'], permissions: string[] = []) {
  useAuthStore.setState({
    user: { id: 'u1', username: 'test', name: 'Test', role, permissions, createdAt: '2024-01-01' },
    isAuthenticated: true,
    token: 'fake-token',
  });
}

/** Render component trong MemoryRouter với initial route */
function renderWithRouter(
  ui: React.ReactNode,
  { initialEntries = ['/'] }: { initialEntries?: string[] } = {}
) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/admin/users" element={<div>Admin Users Page</div>} />
        <Route path="/hr/employees" element={<div>HR Employees Page</div>} />
        <Route path="/my-profile" element={<div>My Profile Page</div>} />
        <Route path="/dept/employees" element={<div>Dept Employees Page</div>} />
        <Route path="/protected" element={ui} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => {
  useAuthStore.setState({ user: null, isAuthenticated: false, token: null });
  localStorage.clear();
});

// ============================================================
// ProtectedRoute
// ============================================================
describe('ProtectedRoute', () => {
  it('nên redirect về / khi chưa đăng nhập', () => {
    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { initialEntries: ['/protected'] }
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });

  it('nên render children khi đã đăng nhập', () => {
    setUser('employee');

    renderWithRouter(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>,
      { initialEntries: ['/protected'] }
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});

// ============================================================
// RoleGuard - không truyền allowedRoles
// ============================================================
describe('RoleGuard - Chỉ check authentication', () => {
  it('nên redirect về / khi chưa đăng nhập', () => {
    renderWithRouter(
      <RoleGuard>
        <div>Guarded Content</div>
      </RoleGuard>,
      { initialEntries: ['/protected'] }
    );

    expect(screen.queryByText('Guarded Content')).not.toBeInTheDocument();
    expect(screen.getByText('Home Page')).toBeInTheDocument();
  });
});

// ============================================================
// RoleGuard - có allowedRoles
// ============================================================
describe('RoleGuard - Check theo role', () => {
  it('nên render children khi user có role phù hợp', () => {
    setUser('admin');

    renderWithRouter(
      <RoleGuard allowedRoles={[Role.ADMIN]}>
        <div>Admin Only</div>
      </RoleGuard>,
      { initialEntries: ['/protected'] }
    );

    expect(screen.getByText('Admin Only')).toBeInTheDocument();
  });

  it('nên redirect khi user không có role phù hợp', () => {
    setUser('employee');

    renderWithRouter(
      <RoleGuard allowedRoles={[Role.ADMIN]}>
        <div>Admin Only</div>
      </RoleGuard>,
      { initialEntries: ['/protected'] }
    );

    expect(screen.queryByText('Admin Only')).not.toBeInTheDocument();
    // Employee sẽ bị redirect đến /my-profile (default route)
    expect(screen.getByText('My Profile Page')).toBeInTheDocument();
  });

  it('nên redirect đến redirectTo nếu được truyền', () => {
    setUser('employee');

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/custom-redirect" element={<div>Custom Redirect Page</div>} />
          <Route
            path="/protected"
            element={
              <RoleGuard allowedRoles={[Role.ADMIN]} redirectTo="/custom-redirect">
                <div>Admin Only</div>
              </RoleGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Custom Redirect Page')).toBeInTheDocument();
  });

  it('nên cho phép nhiều roles', () => {
    setUser('hr');

    renderWithRouter(
      <RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}>
        <div>Admin or HR</div>
      </RoleGuard>,
      { initialEntries: ['/protected'] }
    );

    expect(screen.getByText('Admin or HR')).toBeInTheDocument();
  });
});

// ============================================================
// AdminRoute (alias cho ADMIN + HR)
// ============================================================
describe('AdminRoute', () => {
  it('nên render cho Admin', () => {
    setUser('admin');
    renderWithRouter(
      <AdminRoute><div>Admin Area</div></AdminRoute>,
      { initialEntries: ['/protected'] }
    );
    expect(screen.getByText('Admin Area')).toBeInTheDocument();
  });

  it('nên render cho HR', () => {
    setUser('hr');
    renderWithRouter(
      <AdminRoute><div>Admin Area</div></AdminRoute>,
      { initialEntries: ['/protected'] }
    );
    expect(screen.getByText('Admin Area')).toBeInTheDocument();
  });

  it('nên redirect cho Employee', () => {
    setUser('employee');
    renderWithRouter(
      <AdminRoute><div>Admin Area</div></AdminRoute>,
      { initialEntries: ['/protected'] }
    );
    expect(screen.queryByText('Admin Area')).not.toBeInTheDocument();
  });
});

// ============================================================
// HRRoute
// ============================================================
describe('HRRoute', () => {
  it('nên render cho HR', () => {
    setUser('hr');
    renderWithRouter(
      <HRRoute><div>HR Area</div></HRRoute>,
      { initialEntries: ['/protected'] }
    );
    expect(screen.getByText('HR Area')).toBeInTheDocument();
  });
});

// ============================================================
// EmployeeRoute (ADMIN + HR + EMPLOYEE)
// ============================================================
describe('EmployeeRoute', () => {
  it('nên render cho Employee', () => {
    setUser('employee');
    renderWithRouter(
      <EmployeeRoute><div>Employee Area</div></EmployeeRoute>,
      { initialEntries: ['/protected'] }
    );
    expect(screen.getByText('Employee Area')).toBeInTheDocument();
  });

  it('nên render cho Admin', () => {
    setUser('admin');
    renderWithRouter(
      <EmployeeRoute><div>Employee Area</div></EmployeeRoute>,
      { initialEntries: ['/protected'] }
    );
    expect(screen.getByText('Employee Area')).toBeInTheDocument();
  });

  it('nên redirect cho Manager (không trong allowedRoles)', () => {
    setUser('manager');
    renderWithRouter(
      <EmployeeRoute><div>Employee Area</div></EmployeeRoute>,
      { initialEntries: ['/protected'] }
    );
    // Manager bị redirect về /dept/employees (default)
    expect(screen.queryByText('Employee Area')).not.toBeInTheDocument();
    expect(screen.getByText('Dept Employees Page')).toBeInTheDocument();
  });
});
