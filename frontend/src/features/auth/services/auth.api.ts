import { User } from '../models/user.model';
import { authFetch } from '../../../utils/auth-fetch';

const API_BASE = '/api/auth';

export const authApi = {
    async login(username: string, password: string): Promise<{ user: User; accessToken: string }> {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Đăng nhập thất bại');
        }
        
        return response.json();
    },

    async logout(): Promise<void> {
        const response = await authFetch(`${API_BASE}/logout`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Đăng xuất thất bại');
    },

    async me(): Promise<User> {
        const response = await authFetch(`${API_BASE}/me`);
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    /**
     * Làm mới access token bằng refresh token
     * Gọi khi access token hết hạn (401)
     */
    async refreshAccessToken(): Promise<{ accessToken: string }> {
        const response = await fetch(`${API_BASE}/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Không gửi body vì refresh token nằm trong cookie
        });
        if (!response.ok) throw new Error('Failed to refresh token');
        return response.json();
    },

    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        const response = await authFetch(`${API_BASE}/change-password`, {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Đổi mật khẩu thất bại');
        }
    },
};
