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

    return fetch(url, {
        ...options,
        headers,
    });
}
