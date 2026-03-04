import { useState, useCallback } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { authApi } from '../services/auth.api';

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { login: storeLogin, logout: storeLogout, user, isAuthenticated } = useAuthStore();

    const login = useCallback(async (username: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        setError(null);

        try {
            const { user, accessToken } = await authApi.login(username, password);
            storeLogin(user, accessToken);
            return true;
        } catch (err) {
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [storeLogin]);

    const logout = useCallback(async () => {
        try {
            await authApi.logout();
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            storeLogout();
        }
    }, [storeLogout]);

    return {
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        logout,
    };
}
