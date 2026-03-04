import { useAuthStore } from '../store/auth.store';

/**
 * Helper function để tạo headers với JWT token
 */
export function getAuthHeaders(): HeadersInit {
    const token = useAuthStore.getState().token;
    
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

/**
 * Wrapper cho fetch API với authentication tự động
 * Tự động refresh access token khi hết hạn (401)
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = useAuthStore.getState().token;
    
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    // Nếu nhận 401 Unauthorized -> Access token hết hạn
    if (response.status === 401) {
        try {
            const { authApi } = await import('../features/auth/services/auth.api');
            const { accessToken: newAccessToken } = await authApi.refreshAccessToken();
            
            // Cập nhật access token mới vào store
            useAuthStore.getState().updateAccessToken(newAccessToken);
            
            // Thử lại request với access token mới
            headers['Authorization'] = `Bearer ${newAccessToken}`;
            return fetch(url, {
                ...options,
                headers,
            });
        } catch (error) {
            // Refresh token cũng hết hạn hoặc không hợp lệ -> Đăng xuất
            console.error('Token refresh failed:', error);
            useAuthStore.getState().logout();
            return response; // Trả về response 401 gốc
        }
    }

    return response;
}
