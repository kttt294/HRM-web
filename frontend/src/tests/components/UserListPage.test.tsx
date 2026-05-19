/**
 * Unit Tests: UserListPage
 *
 * Kiểm thử trang quản lý tài khoản:
 * - Hiển thị danh sách, thống kê
 * - Lọc danh sách (role, status)
 * - Đổi mật khẩu, khóa, sửa, xóa
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserListPage } from '../../features/admin/pages/UserListPage';
import { userApi } from '../../features/admin/services/user.api';
import { Role } from '../../shared/constants/rbac';
import { useSnackbarStore } from '../../store/snackbar.store';

// Mock API
vi.mock('../../features/admin/services/user.api', () => ({
    userApi: {
        getUsers: vi.fn(),
        deleteUser: vi.fn(),
        toggleLock: vi.fn(),
        updateUser: vi.fn(),
        resetPassword: vi.fn(),
    },
}));

// Mock Router
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

// Mock Snackbar
vi.mock('../../store/snackbar.store', () => ({
    useSnackbarStore: vi.fn(),
}));

// Mock animejs
vi.mock('animejs', () => {
    const mockAnime = vi.fn(() => ({ play: vi.fn() }));
    (mockAnime as any).stagger = vi.fn();
    return { default: mockAnime };
});

describe('UserListPage', () => {
    const mockShowSnackbar = vi.fn();

    const mockUsers = [
        {
            id: 'admin',
            name: 'System Admin',
            username: 'admin',
            role: Role.ADMIN,
            status: 'active',
            lastLoginAt: '2026-05-20T10:00:00Z',
        },
        {
            id: 'emp1',
            name: 'Nguyen Van A',
            username: 'nva',
            role: Role.EMPLOYEE,
            status: 'locked',
            lastLoginAt: '2026-05-19T08:00:00Z',
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSnackbarStore).mockReturnValue({
            showSnackbar: mockShowSnackbar,
        } as any);
        vi.mocked(userApi.getUsers).mockResolvedValue({ users: mockUsers } as any);
    });

    it('hiển thị danh sách tài khoản', async () => {
        render(<UserListPage />);

        expect(screen.getByText('Đang tải...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getAllByText(/System Admin/).length).toBeGreaterThan(0);
            expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
            // Role
            expect(screen.getAllByText('Nhân viên').length).toBeGreaterThan(0);
            // Status
            expect(screen.getAllByText('Đã khóa').length).toBeGreaterThan(0);
        });
    });

    it('khóa/mở khóa tài khoản thành công', async () => {
        vi.mocked(userApi.toggleLock).mockResolvedValue({} as any);
        
        render(<UserListPage />);

        await waitFor(() => {
            expect(screen.getByText('Mở khóa')).toBeInTheDocument(); // Vì user emp1 bị khóa
        });

        fireEvent.click(screen.getByText('Mở khóa'));

        await waitFor(() => {
            expect(userApi.toggleLock).toHaveBeenCalledWith('emp1');
            expect(mockShowSnackbar).toHaveBeenCalledWith('Cập nhật trạng thái tài khoản thành công', 'success');
        });
    });

    it('đổi mật khẩu thành công', async () => {
        vi.mocked(userApi.resetPassword).mockResolvedValue({ tempPassword: 'newpassword123' } as any);
        
        render(<UserListPage />);

        await waitFor(() => {
            expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
        });

        fireEvent.click(screen.getAllByText('Đổi mật khẩu')[0]);

        await waitFor(() => {
            expect(userApi.resetPassword).toHaveBeenCalledWith('emp1');
            expect(mockShowSnackbar).toHaveBeenCalledWith('Mật khẩu mới của Nguyen Van A: newpassword123', 'success', 15000);
        });
    });

    it('xóa tài khoản thành công', async () => {
        vi.mocked(userApi.deleteUser).mockResolvedValue({} as any);
        
        render(<UserListPage />);

        await waitFor(() => {
            expect(screen.getByText('Xóa')).toBeInTheDocument();
        });

        // Click Xóa (mở modal)
        fireEvent.click(screen.getByText('Xóa'));

        await waitFor(() => {
            expect(screen.getByText(/Bạn có chắc muốn xóa tài khoản/)).toBeInTheDocument();
        });

        // Click Xóa trong modal (chọn theo style danger)
        const buttons = screen.getAllByRole('button', { name: 'Xóa' });
        fireEvent.click(buttons[1]); // Buttons[0] là table, buttons[1] là trong modal

        await waitFor(() => {
            expect(userApi.deleteUser).toHaveBeenCalledWith('emp1');
            expect(mockShowSnackbar).toHaveBeenCalledWith('Xóa tài khoản thành công', 'success');
        });
    });
});
