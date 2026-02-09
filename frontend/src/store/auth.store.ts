import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../features/auth/models/user.model';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    token: string | null;

    // Actions
    login: (user: User, token: string) => void;
    logout: () => void;
    updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Mặc định chưa đăng nhập
            user: null,
            isAuthenticated: false,
            token: null,

            login: (user, token) =>
                set({
                    user,
                    token,
                    isAuthenticated: true,
                }),

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
        }),
        {
            name: 'auth-storage',
        }
    )
);

// Helper function để kiểm tra quyền
export function hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
}

// Helper function để kiểm tra role
export function hasRole(user: User | null, role: string | string[]): boolean {
    if (!user) return false;
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(user.role);
}
