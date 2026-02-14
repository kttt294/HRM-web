import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../features/auth/models/user.model';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null; // Access Token (15 phút)
    refreshToken: string | null; // Refresh Token (7 ngày)

    // Actions
    login: (user: User, accessToken: string, refreshToken: string) => void;
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
            refreshToken: null,

            login: (user, accessToken, refreshToken) =>
                set({
                    user,
                    token: accessToken,
                    refreshToken,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                }),

            updateUser: (userData) =>
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null,
                })),

            updateAccessToken: (accessToken) =>
                set({
                    token: accessToken,
                }),
        }),
        {
            name: 'auth-storage',
        }
    )
);

// Helper function để kiểm tra role
export function hasRole(user: User | null, role: string | string[]): boolean {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
}
