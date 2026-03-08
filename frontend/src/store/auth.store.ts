import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../features/auth/models/user.model';
import { decodeJWT } from '../utils/jwt.utils';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null; // Access Token (15 phút)
    // Refresh Token đã được chuyển sang HttpOnly Cookie để bảo mật (XSS)

    // Actions
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
    updateAccessToken: (accessToken: string) => void; // Cập nhật access token sau khi refresh
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Mặc định chưa đăng nhập
            user: null,
            isAuthenticated: false,
            token: null,

            login: (user, accessToken) => {
                // Extract permissions từ token nếu user object ko có (body private)
                const decoded = decodeJWT(accessToken);
                const permissions = user.permissions || decoded?.permissions || [];
                
                set({
                    user: { ...user, permissions },
                    token: accessToken,
                    isAuthenticated: true,
                });
            },

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),

            updateAccessToken: (accessToken) => {
                const decoded = decodeJWT(accessToken);
                set((state) => ({
                    token: accessToken,
                    user: state.user && decoded?.permissions 
                        ? { ...state.user, permissions: decoded.permissions } 
                        : state.user
                }));
            },
        }),
        {
            name: 'auth-storage',
            // Only persist token and auth status, fetch user data on app load
            partialize: (state) => ({
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);

// Helper function để kiểm tra role
export function hasRole(user: User | null, role: string | string[]): boolean {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
}
