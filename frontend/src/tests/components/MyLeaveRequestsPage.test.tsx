/**
 * Unit Tests: MyLeaveRequestsPage
 *
 * Kiểm thử trang quản lý đơn nghỉ phép cá nhân (Employee Self-Service):
 * - Xem danh sách đơn và số dư phép
 * - Tạo đơn mới (thành công, lỗi validate, gọi API)
 * - Hủy đơn (chỉ với đơn pending)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyLeaveRequestsPage } from '../../features/employee/pages/MyLeaveRequestsPage';
import { leaveApi } from '../../features/employee/services/leave.api';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useSnackbarStore } from '../../store/snackbar.store';

// Mock API
vi.mock('../../features/employee/services/leave.api', () => ({
    leaveApi: {
        getMyRequests: vi.fn(),
        getMyBalance: vi.fn(),
        create: vi.fn(),
        cancel: vi.fn(),
    },
}));

// Mock Auth
vi.mock('../../features/auth/hooks/useAuth', () => ({
    useAuth: vi.fn(),
}));

// Mock Zustand store
vi.mock('../../store/snackbar.store', () => ({
    useSnackbarStore: vi.fn(),
}));

// Mock animejs
vi.mock('animejs', () => {
    const mockAnime = vi.fn(() => ({ play: vi.fn() }));
    (mockAnime as any).stagger = vi.fn();
    return { default: mockAnime };
});

describe('MyLeaveRequestsPage', () => {
    const mockShowSnackbar = vi.fn();

    const mockUser = {
        id: 'user1',
        employeeId: 'EMP001',
        name: 'Nguyen Van A',
        role: 'employee',
    };

    const mockRequests = [
        {
            id: 'req1',
            employeeId: 'EMP001',
            leaveType: 'annual',
            startDate: '2025-06-01',
            endDate: '2025-06-03',
            reason: 'Đi du lịch',
            status: 'pending',
            createdAt: '2025-05-20T00:00:00Z',
        },
        {
            id: 'req2',
            employeeId: 'EMP001',
            leaveType: 'sick',
            startDate: '2025-04-10',
            endDate: '2025-04-11',
            reason: 'Bị ốm',
            status: 'approved',
            createdAt: '2025-04-09T00:00:00Z',
            approvedAt: '2025-04-09T10:00:00Z',
        },
    ];

    const mockBalance = {
        annualLeave: 12,
        usedAnnualLeave: 2,
        sickLeave: 5,
        usedSickLeave: 1,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAuth).mockReturnValue({ user: mockUser } as any);
        vi.mocked(useSnackbarStore).mockReturnValue({
            showSnackbar: mockShowSnackbar,
        } as any);

        // Mặc định window.confirm trả về true
        window.confirm = vi.fn(() => true);
    });

    it('hiển thị danh sách đơn và số dư phép', async () => {
        vi.mocked(leaveApi.getMyRequests).mockResolvedValue(mockRequests as any);
        vi.mocked(leaveApi.getMyBalance).mockResolvedValue(mockBalance as any);

        render(<MyLeaveRequestsPage />);

        // Số dư phép
        await waitFor(() => {
            // annualLeave - usedAnnualLeave = 10
            expect(screen.getByText('10')).toBeInTheDocument();
            // sickLeave - usedSickLeave = 4
            expect(screen.getByText('4')).toBeInTheDocument();
            
            // Danh sách
            expect(screen.getByText('Đi du lịch')).toBeInTheDocument();
            expect(screen.getByText('Bị ốm')).toBeInTheDocument();
        });
    });

    it('hiển thị lỗi validate khi tạo đơn thiếu thông tin', async () => {
        vi.mocked(leaveApi.getMyRequests).mockResolvedValue([] as any);
        vi.mocked(leaveApi.getMyBalance).mockResolvedValue(mockBalance as any);

        render(<MyLeaveRequestsPage />);

        await waitFor(() => {
            expect(screen.getByText('+ Tạo đơn mới')).toBeInTheDocument();
        });

        // Click mở modal tạo đơn
        fireEvent.click(screen.getByText('+ Tạo đơn mới'));

        await waitFor(() => {
            expect(screen.getByText('Tạo đơn nghỉ phép')).toBeInTheDocument();
        });

        // Bấm gửi khi form trống
        const submitBtn = screen.getByText('Gửi đơn');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Vui lòng chọn ngày bắt đầu và kết thúc')).toBeInTheDocument();
        });
    });

    it('tạo đơn thành công và refetch', async () => {
        vi.mocked(leaveApi.getMyRequests).mockResolvedValue([] as any);
        vi.mocked(leaveApi.getMyBalance).mockResolvedValue(mockBalance as any);
        vi.mocked(leaveApi.create).mockResolvedValue({} as any);

        const { container } = render(<MyLeaveRequestsPage />);

        await waitFor(() => {
            expect(screen.getByText('+ Tạo đơn mới')).toBeInTheDocument();
        });

        // Mở modal
        fireEvent.click(screen.getByText('+ Tạo đơn mới'));

        // Nhập liệu
        await waitFor(() => {
            expect(screen.getByText('Tạo đơn nghỉ phép')).toBeInTheDocument();
        });

        const dateInputs = document.querySelectorAll('input[type="date"]');
        fireEvent.change(dateInputs[0], { target: { value: '2025-07-01' } });
        fireEvent.change(dateInputs[1], { target: { value: '2025-07-02' } });
        fireEvent.change(screen.getByPlaceholderText('Mô tả lý do xin nghỉ...'), { target: { value: 'Lý do hợp lệ' } });

        // Gửi đơn
        fireEvent.click(screen.getByText('Gửi đơn'));

        await waitFor(() => {
            expect(leaveApi.create).toHaveBeenCalledWith(expect.objectContaining({
                leaveType: 'annual',
                startDate: '2025-07-01',
                endDate: '2025-07-02',
                reason: 'Lý do hợp lệ',
            }));
            expect(mockShowSnackbar).toHaveBeenCalledWith('Tạo đơn nghỉ phép thành công', 'success');
            // Refetch
            expect(leaveApi.getMyRequests).toHaveBeenCalledTimes(2);
        });
    });

    it('hủy đơn pending thành công', async () => {
        vi.mocked(leaveApi.getMyRequests).mockResolvedValue(mockRequests as any);
        vi.mocked(leaveApi.getMyBalance).mockResolvedValue(mockBalance as any);
        vi.mocked(leaveApi.cancel).mockResolvedValue({} as any);

        render(<MyLeaveRequestsPage />);

        await waitFor(() => {
            expect(screen.getByText('Đi du lịch')).toBeInTheDocument();
        });

        // Bấm nút Hủy đơn cho đơn đầu tiên (pending)
        const cancelBtn = screen.getByText('Hủy đơn');
        fireEvent.click(cancelBtn);

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled();
            expect(leaveApi.cancel).toHaveBeenCalledWith('req1');
            expect(mockShowSnackbar).toHaveBeenCalledWith('Hủy đơn thành công', 'success');
            expect(leaveApi.getMyRequests).toHaveBeenCalledTimes(2);
        });
    });
});
