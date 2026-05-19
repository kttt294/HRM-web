/**
 * Unit Tests: DeptLeaveManagementPage
 *
 * Kiểm thử tính năng duyệt nghỉ phép phòng ban của Manager:
 * - Hiển thị danh sách đơn nghỉ phép của nhân viên trong phòng
 * - Lọc theo trạng thái
 * - Duyệt / Từ chối đơn
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DeptLeaveManagementPage } from '../../features/employee/pages/DeptLeaveManagementPage';
import { leaveApi } from '../../features/employee/services/leave.api';
import { useSnackbarStore } from '../../store/snackbar.store';

// Mock API
vi.mock('../../features/employee/services/leave.api', () => ({
    leaveApi: {
        getAll: vi.fn(),
        approve: vi.fn(),
        reject: vi.fn(),
    },
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

describe('DeptLeaveManagementPage', () => {
    const mockShowSnackbar = vi.fn();

    const mockRequests = {
        requests: [
            {
                id: 1,
                employeeId: '5',
                employeeName: 'Nguyen Van A',
                leaveType: 'annual',
                startDate: '2025-06-01',
                endDate: '2025-06-03',
                reason: 'Du lịch',
                status: 'pending',
                createdAt: '2025-05-20T10:00:00Z',
            },
            {
                id: 2,
                employeeId: '6',
                employeeName: 'Tran Thi B',
                leaveType: 'sick',
                startDate: '2025-06-05',
                endDate: '2025-06-06',
                reason: 'Ốm',
                status: 'approved',
                createdAt: '2025-05-20T10:00:00Z',
                approvedByName: 'Manager X',
            },
        ],
        pagination: { total: 2 }
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSnackbarStore).mockReturnValue({
            showSnackbar: mockShowSnackbar,
        } as any);
    });

    it('hiển thị danh sách đơn nghỉ phép', async () => {
        vi.mocked(leaveApi.getAll).mockResolvedValueOnce(mockRequests as any);

        render(<DeptLeaveManagementPage />);

        expect(screen.getByText('Đang tải...')).toBeInTheDocument();

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows.length).toBeGreaterThan(1); // 1 header + 2 data rows
        });
    });

    it('gọi API với filter trạng thái pending mặc định và khi thay đổi', async () => {
        vi.mocked(leaveApi.getAll)
            .mockResolvedValueOnce(mockRequests as any) // lần render đầu (pending mặc định)
            .mockResolvedValueOnce(mockRequests as any); // lần thay đổi filter

        render(<DeptLeaveManagementPage />);

        await waitFor(() => {
            expect(leaveApi.getAll).toHaveBeenCalledWith({ status: 'pending' });
        });

        const statusSelect = screen.getAllByRole('combobox')[0];
        fireEvent.change(statusSelect, { target: { value: 'approved' } });

        await waitFor(() => {
            expect(leaveApi.getAll).toHaveBeenCalledWith({ status: 'approved' });
        });
    });

    it('mở modal duyệt đơn và gọi API duyệt thành công', async () => {
        vi.mocked(leaveApi.getAll).mockResolvedValue(mockRequests as any);
        vi.mocked(leaveApi.approve).mockResolvedValueOnce({} as any);

        render(<DeptLeaveManagementPage />);

        await waitFor(() => {
            expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
        });

        // Tìm nút Duyệt cho đơn pending
        const approveBtn = screen.getByText('Duyệt', { selector: 'button' });
        fireEvent.click(approveBtn);

        // Chờ modal
        await waitFor(() => {
            expect(screen.getByText('Duyệt đơn nghỉ phép')).toBeInTheDocument();
        });

        // Bấm duyệt trong modal
        const modalButtons = screen.getAllByRole('button', { name: 'Duyệt' });
        fireEvent.click(modalButtons[modalButtons.length - 1]);

        await waitFor(() => {
            expect(leaveApi.approve).toHaveBeenCalledWith(1);
            expect(mockShowSnackbar).toHaveBeenCalledWith('Duyệt đơn thành công', 'success');
            expect(leaveApi.getAll).toHaveBeenCalledTimes(2);
        });
    });

    it('mở modal từ chối và gọi API từ chối thành công', async () => {
        vi.mocked(leaveApi.getAll).mockResolvedValue(mockRequests as any);
        vi.mocked(leaveApi.reject).mockResolvedValueOnce({} as any);

        render(<DeptLeaveManagementPage />);

        await waitFor(() => {
            expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
        });

        // Tìm nút Từ chối
        const rejectBtn = screen.getByText('Từ chối', { selector: 'button' });
        fireEvent.click(rejectBtn);

        await waitFor(() => {
            expect(screen.getByText('Từ chối đơn nghỉ phép')).toBeInTheDocument();
        });

        // Bấm từ chối trong modal
        const modalButtons = screen.getAllByRole('button', { name: 'Từ chối' });
        fireEvent.click(modalButtons[modalButtons.length - 1]);

        await waitFor(() => {
            expect(leaveApi.reject).toHaveBeenCalledWith(1);
            expect(mockShowSnackbar).toHaveBeenCalledWith('Từ chối đơn thành công', 'success');
        });
    });

    it('hiển thị thông báo lỗi nếu API lỗi', async () => {
        vi.mocked(leaveApi.getAll).mockRejectedValueOnce(new Error('Lỗi fetch data'));

        render(<DeptLeaveManagementPage />);

        await waitFor(() => {
            expect(screen.getByText('Lỗi: Lỗi fetch data')).toBeInTheDocument();
        });
    });
});
