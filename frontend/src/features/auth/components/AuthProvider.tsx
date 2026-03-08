import { ReactNode, useEffect, useState } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import { authApi } from '../services/auth.api';

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const { token, isAuthenticated, login, logout, user } = useAuthStore();
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            // Nếu có token nhưng chưa có user (do vừa F5 trang và partialize đã lọc user ra)
            if (token && isAuthenticated && !user) {
                try {
                    const userData = await authApi.me();
                    // Nạp lại user vào store. Lưu ý: login action của store đã lo việc decode permissions
                    login(userData, token);
                } catch (error) {
                    console.error('Failed to fetch user profile:', error);
                    logout(); // Token lỗi hoặc hết hạn thật sự
                }
            }
            setIsInitializing(false);
        };

        initAuth();
    }, [token, isAuthenticated, user, login, logout]);

    if (isInitializing && token && isAuthenticated && !user) {
        return (
            <div style={{ 
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '16px',
                color: '#666'
            }}>
                <div className="spinner"></div> {}
                <p>Đang xác thực phiên đăng nhập...</p>
            </div>
        );
    }

    return <>{children}</>;
}
