/**
 * Unit Tests: MyProfilePage
 *
 * Kiểm thử trang Hồ sơ cá nhân:
 * - Xem thông tin hồ sơ
 * - Cập nhật hồ sơ (đổi tab, nhập liệu, gửi API)
 * - Đổi mật khẩu
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyProfilePage } from '../../features/employee/pages/MyProfilePage';
import { employeeApi } from '../../features/employee/services/employee.api';
import { authApi } from '../../features/auth/services/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { useSnackbarStore } from '../../store/snackbar.store';
import * as authFetchModule from '../../utils/auth-fetch';

// Mock APIs
vi.mock('../../features/employee/services/employee.api', () => ({
    employeeApi: {
        getMe: vi.fn(),
        updateMe: vi.fn(),
    },
}));

vi.mock('../../features/auth/services/auth.api', () => ({
    authApi: {
        changePassword: vi.fn(),
    },
}));

// Mock auth fetch for enums
vi.mock('../../utils/auth-fetch', () => ({
    authFetch: vi.fn(),
}));

// Mock AuthStore
vi.mock('../../store/auth.store', () => ({
    useAuthStore: vi.fn(),
}));

// Mock SnackbarStore
vi.mock('../../store/snackbar.store', () => ({
    useSnackbarStore: vi.fn(),
}));

// Mock animejs
vi.mock('animejs', () => {
    const mockAnime = vi.fn(() => ({ play: vi.fn() }));
    (mockAnime as any).stagger = vi.fn();
    return { default: mockAnime };
});

describe('MyProfilePage', () => {
    const mockShowSnackbar = vi.fn();

    const mockProfile = {
        id: 'user1',
        fullName: 'Le Van A',
        gender: 'male',
        dateOfBirth: '1995-01-01',
        personalEmail: 'levana@example.com',
        phone: '0123456789',
        status: 'active',
        jobTitle: 'Developer',
        departmentName: 'IT',
        profileStatus: 'verified',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuthStore).mockReturnValue({
            user: { id: 'user1', name: 'Le Van A' },
        } as any);
        vi.mocked(useSnackbarStore).mockReturnValue({
            showSnackbar: mockShowSnackbar,
        } as any);

        vi.mocked(authFetchModule.authFetch).mockResolvedValue({
            ok: true,
            json: async () => ({ values: ['ielts', 'toeic'] }),
        } as any);
    });

    it('hiển thị loading và sau đó hiển thị thông tin hồ sơ', async () => {
        vi.mocked(employeeApi.getMe).mockResolvedValueOnce(mockProfile as any);

        render(<MyProfilePage />);

        expect(screen.getByText('Đang tải thông tin...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('levana@example.com')).toBeInTheDocument();
            expect(screen.getByText('0123456789')).toBeInTheDocument();
        });
    });

    it('cho phép chuyển tab thông tin', async () => {
        vi.mocked(employeeApi.getMe).mockResolvedValueOnce({
            ...mockProfile,
            nationalId: '012345678910'
        } as any);

        render(<MyProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('levana@example.com')).toBeInTheDocument();
        });

        // Click tab Pháp lý & Liên hệ
        fireEvent.click(screen.getByText('Pháp lý & Liên hệ'));

        await waitFor(() => {
            expect(screen.getByText('012345678910')).toBeInTheDocument();
        });
    });

    it('cho phép gửi yêu cầu cập nhật hồ sơ', async () => {
        vi.mocked(employeeApi.getMe).mockResolvedValue(mockProfile as any);
        vi.mocked(employeeApi.updateMe).mockResolvedValue({} as any);

        render(<MyProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Cập nhật hồ sơ')).toBeInTheDocument();
        });

        // Click cập nhật
        fireEvent.click(screen.getByText('Cập nhật hồ sơ'));

        await waitFor(() => {
            expect(screen.getByDisplayValue('Le Van A')).toBeInTheDocument();
        });

        // Đổi thông tin
        const nameInput = screen.getByDisplayValue('Le Van A');
        fireEvent.change(nameInput, { target: { value: 'Le Van B' } });

        // Submit
        fireEvent.click(screen.getByText('Gửi yêu cầu xác nhận'));

        await waitFor(() => {
            expect(employeeApi.updateMe).toHaveBeenCalledWith(expect.objectContaining({
                fullName: 'Le Van B'
            }));
            expect(mockShowSnackbar).toHaveBeenCalledWith('Thông tin đã được gửi. Vui lòng chờ được xác thực!', 'success');
        });
    });

    it('cho phép đổi mật khẩu', async () => {
        vi.mocked(employeeApi.getMe).mockResolvedValueOnce(mockProfile as any);
        vi.mocked(authApi.changePassword).mockResolvedValueOnce({} as any);

        const { container } = render(<MyProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Đổi mật khẩu')).toBeInTheDocument();
        });

        // Click đổi mật khẩu
        fireEvent.click(screen.getByText('Đổi mật khẩu'));

        await waitFor(() => {
            // Because there are two "Đổi mật khẩu" buttons (one is the trigger, one is the submit inside modal)
            expect(screen.getAllByText('Đổi mật khẩu').length).toBeGreaterThan(1);
        });

        // Lấy các ô nhập mật khẩu bằng container.querySelectorAll
        const passInputs = container.querySelectorAll('input[type="password"]');
        expect(passInputs.length).toBe(3);

        fireEvent.change(passInputs[0], { target: { value: 'oldpass' } });
        fireEvent.change(passInputs[1], { target: { value: 'newpass' } });
        fireEvent.change(passInputs[2], { target: { value: 'newpass' } });

        // Submit (nút trong modal)
        const submitBtns = screen.getAllByRole('button', { name: 'Đổi mật khẩu' });
        fireEvent.click(submitBtns[1]);

        await waitFor(() => {
            expect(authApi.changePassword).toHaveBeenCalledWith('oldpass', 'newpass');
            expect(mockShowSnackbar).toHaveBeenCalledWith('Đổi mật khẩu thành công!', 'success');
        });
    });

    it('hiển thị thông báo nếu hồ sơ đang pending', async () => {
        vi.mocked(employeeApi.getMe).mockResolvedValueOnce({
            ...mockProfile,
            profileStatus: 'pending'
        } as any);

        render(<MyProfilePage />);

        await waitFor(() => {
            expect(screen.getByText('Hồ sơ đang chờ xác thực bởi HR/Manager')).toBeInTheDocument();
        });
    });
});
