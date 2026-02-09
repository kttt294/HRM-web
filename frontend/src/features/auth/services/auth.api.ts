import { User } from '../models/user.model';

// ============================================
// MOCK TEST ACCOUNTS
// Sử dụng cho môi trường development
// ============================================
export const TEST_ACCOUNTS = {
    admin: {
        username: 'admin',
        password: 'admin123',
        user: {
            id: '1',
            username: 'admin',
            email: 'admin@hrm.vn',
            name: 'System Admin',
            role: 'admin',
            permissions: ['manage_users', 'manage_roles', 'view_audit_log', 'lock_accounts'],
            createdAt: new Date().toISOString(),
        } as User,
    },
    hr: {
        username: 'hr',
        password: 'hr123',
        user: {
            id: '4',
            username: 'hr',
            email: 'hr@hrm.vn',
            name: 'HR Manager',
            role: 'hr',
            permissions: ['manage_employees', 'manage_recruitment', 'view_all_reports', 'create_accounts'],
            createdAt: new Date().toISOString(),
        } as User,
    },
    employee: {
        username: 'nhanvien',
        password: 'nhanvien123',
        user: {
            id: '2',
            username: 'nhanvien',
            email: 'nhanvien@hrm.vn',
            name: 'Nguyễn Văn A',
            role: 'employee',
            permissions: ['view_self', 'update_self', 'request_leave'],
            createdAt: new Date().toISOString(),
        } as User,
    },
};

const API_BASE = '/api/auth';

export const authApi = {
    /**
     * Mock login - kiểm tra với TEST_ACCOUNTS
     * Trong production, thay bằng API thật
     */
    async login(username: string, password: string): Promise<{ user: User; token: string }> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Check against test accounts
        const account = Object.values(TEST_ACCOUNTS).find(
            acc => acc.username === username && acc.password === password
        );

        if (account) {
            return {
                user: account.user,
                token: `mock-token-${account.user.role}-${Date.now()}`,
            };
        }

        throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    },

    async logout(): Promise<void> {
        // Mock logout - just return success
        await new Promise(resolve => setTimeout(resolve, 200));
    },

    async me(): Promise<User> {
        const response = await fetch(`${API_BASE}/me`);
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    async refreshToken(): Promise<{ token: string }> {
        const response = await fetch(`${API_BASE}/refresh`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to refresh token');
        return response.json();
    },

    async changePassword(oldPassword: string, newPassword: string): Promise<void> {
        const response = await fetch(`${API_BASE}/change-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldPassword, newPassword }),
        });
        if (!response.ok) throw new Error('Failed to change password');
    },
};
