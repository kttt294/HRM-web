/**
 * Unit Tests: store/auth.store.ts
 *
 * Kiểm tra Zustand auth store:
 * - Trạng thái khởi tạo
 * - Action login (decode permissions từ JWT)
 * - Action logout
 * - Action updateUser
 * - Action updateAccessToken
 * - Helper function hasRole
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore, hasRole } from '../../store/auth.store';
import { User } from '../../features/auth/models/user.model';

// ============================================================
// Helpers
// ============================================================

/** Tạo JWT giả với payload chỉ định */
function makeFakeJWT(payload: object): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return `${header}.${body}.fakesig`;
}

const mockUser: User = {
  id: 'user-1',
  username: 'john.doe',
  name: 'John Doe',
  role: 'admin',
  permissions: ['manage_users', 'manage_roles'],
  createdAt: '2024-01-01T00:00:00.000Z',
};

// ============================================================
// Reset store trước mỗi test
// ============================================================
beforeEach(() => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    token: null,
  });
  localStorage.clear();
});

// ============================================================
// Initial State
// ============================================================
describe('Auth Store - Trạng thái khởi tạo', () => {
  it('nên bắt đầu với trạng thái chưa đăng nhập', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.token).toBeNull();
  });
});

// ============================================================
// login action
// ============================================================
describe('Auth Store - login()', () => {
  it('nên cập nhật state đúng khi login thành công', () => {
    const token = makeFakeJWT({ sub: 'user-1', permissions: ['manage_users'] });

    useAuthStore.getState().login(mockUser, token);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe(token);
    expect(state.user?.username).toBe('john.doe');
  });

  it('nên dùng permissions từ user object nếu có', () => {
    const token = makeFakeJWT({ sub: 'user-1', permissions: ['manage_roles'] });
    const userWithPerms = { ...mockUser, permissions: ['manage_users', 'manage_roles'] };

    useAuthStore.getState().login(userWithPerms, token);

    // permissions từ user object được ưu tiên (đã có)
    const state = useAuthStore.getState();
    expect(state.user?.permissions).toEqual(['manage_users', 'manage_roles']);
  });

  it('nên giữ permissions rỗng [] khi user.permissions là [] (không fallback JWT)', () => {
    // Lý do: Trong JS, [] là truthy nên `[] || decoded.permissions` giữ []
    // Đây là hành vi đúng của auth store.
    const tokenPayloadPerms = ['view_self', 'update_self'];
    const token = makeFakeJWT({ sub: 'emp-1', permissions: tokenPayloadPerms });
    const userNoPerms = { ...mockUser, role: 'employee' as const, permissions: [] };

    useAuthStore.getState().login(userNoPerms, token);

    // [] là truthy → giữ nguyên [], KHÔNG fallback sang JWT permissions
    const state = useAuthStore.getState();
    expect(state.user?.permissions).toEqual([]);
  });
});

// ============================================================
// logout action
// ============================================================
describe('Auth Store - logout()', () => {
  it('nên xóa toàn bộ thông tin xác thực sau khi logout', () => {
    const token = makeFakeJWT({ sub: 'user-1' });
    useAuthStore.getState().login(mockUser, token);

    // Đảm bảo đã login
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

// ============================================================
// updateUser action
// ============================================================
describe('Auth Store - updateUser()', () => {
  it('nên cập nhật một phần thông tin user', () => {
    const token = makeFakeJWT({ sub: 'user-1' });
    useAuthStore.getState().login(mockUser, token);

    useAuthStore.getState().updateUser({ name: 'John Updated', avatar: '/avatar.png' });

    const state = useAuthStore.getState();
    expect(state.user?.name).toBe('John Updated');
    expect(state.user?.avatar).toBe('/avatar.png');
    // Các field khác không bị thay đổi
    expect(state.user?.username).toBe('john.doe');
    expect(state.user?.role).toBe('admin');
  });

  it('nên không làm gì khi user chưa login', () => {
    useAuthStore.getState().updateUser({ name: 'Ghost' });

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
  });
});

// ============================================================
// updateAccessToken action
// ============================================================
describe('Auth Store - updateAccessToken()', () => {
  it('nên cập nhật token mới và permissions từ token mới', () => {
    const oldToken = makeFakeJWT({ sub: 'user-1', permissions: ['view_self'] });
    useAuthStore.getState().login({ ...mockUser, role: 'employee' }, oldToken);

    const newPermissions = ['view_self', 'update_self', 'request_leave'];
    const newToken = makeFakeJWT({ sub: 'user-1', permissions: newPermissions });

    useAuthStore.getState().updateAccessToken(newToken);

    const state = useAuthStore.getState();
    expect(state.token).toBe(newToken);
    expect(state.user?.permissions).toEqual(newPermissions);
  });

  it('nên giữ nguyên user nếu token mới không có permissions', () => {
    const oldToken = makeFakeJWT({ sub: 'user-1', permissions: ['view_self'] });
    useAuthStore.getState().login(mockUser, oldToken);

    const newToken = makeFakeJWT({ sub: 'user-1' }); // không có permissions

    useAuthStore.getState().updateAccessToken(newToken);

    const state = useAuthStore.getState();
    expect(state.token).toBe(newToken);
    // user không thay đổi vì decoded?.permissions là undefined
    expect(state.user?.username).toBe('john.doe');
  });
});

// ============================================================
// hasRole helper
// ============================================================
describe('hasRole() helper', () => {
  it('trả về true khi user có đúng role (string)', () => {
    expect(hasRole(mockUser, 'admin')).toBe(true);
  });

  it('trả về true khi user có role nằm trong mảng', () => {
    expect(hasRole(mockUser, ['hr', 'admin'])).toBe(true);
  });

  it('trả về false khi user không có role đó', () => {
    expect(hasRole(mockUser, 'employee')).toBe(false);
  });

  it('trả về false khi user là null', () => {
    expect(hasRole(null, 'admin')).toBe(false);
  });
});
