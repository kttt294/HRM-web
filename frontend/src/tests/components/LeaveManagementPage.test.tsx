/**
 * Unit Tests: LeaveManagementPage
 *
 * Kiểm thử tính năng quản lý nghỉ phép dành cho HR:
 * - Hiển thị danh sách đơn nghỉ phép (kèm filter trạng thái, loại nghỉ)
 * - Hiển thị thống kê (số đơn chờ duyệt, đã duyệt, từ chối)
 * - Approve / Reject đơn nghỉ phép
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LeaveManagementPage } from '../../features/hr/pages/LeaveManagementPage';
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

describe('LeaveManagementPage', () => {
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
                approvedByName: 'HR Admin',
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

    it('hiển thị danh sách đơn nghỉ phép và thống kê', async () => {
        vi.mocked(leaveApi.getAll).mockResolvedValueOnce(mockRequests as any);

        render(<LeaveManagementPage />);

        // Kiểm tra loading state ban đầu
        expect(screen.getByText('Đang tải...')).toBeInTheDocument();

        // Chờ render xong danh sách
        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows.length).toBeGreaterThan(1); // 1 header + rows
        });
    });

    it('gọi API với filter khi thay đổi bộ lọc', async () => {
        vi.mocked(leaveApi.getAll)
            .mockResolvedValueOnce(mockRequests as any) // lần render đầu
            .mockResolvedValueOnce(mockRequests as any); // lần render sau filter

        render(<LeaveManagementPage />);

        await waitFor(() => {
            expect(screen.getAllByText('Nguyen Van A')[0]).toBeInTheDocument();
        });

        // Chọn filter trạng thái
        const statusSelect = screen.getAllByRole('combobox')[0];
        fireEvent.change(statusSelect, { target: { value: 'pending' } });

        await waitFor(() => {
            expect(leaveApi.getAll).toHaveBeenCalledWith({ status: 'pending' });
        });
    });

    it('mở modal duyệt đơn và gọi API duyệt thành công', async () => {
        vi.mocked(leaveApi.getAll).mockResolvedValue(mockRequests as any);
        vi.mocked(leaveApi.approve).mockResolvedValueOnce({} as any);

        render(<LeaveManagementPage />);

        await waitFor(() => {
            expect(screen.getAllByText('Nguyen Van A')[0]).toBeInTheDocument();
        });

        // Bấm nút Duyệt của Nguyen Van A
        const approveBtn = screen.getByText('Duyệt', { selector: 'button' });
        fireEvent.click(approveBtn);

        // Chờ modal mở
        await waitFor(() => {
            expect(screen.getByText('Duyệt đơn nghỉ phép')).toBeInTheDocument();
        });

        // Bấm xác nhận Duyệt trong Modal
        const modalButtons = screen.getAllByRole('button', { name: 'Duyệt' });
        fireEvent.click(modalButtons[modalButtons.length - 1]);

        await waitFor(() => {
            expect(leaveApi.approve).toHaveBeenCalledWith(1);
            expect(mockShowSnackbar).toHaveBeenCalledWith('Duyệt đơn thành công', 'success');
            expect(leaveApi.getAll).toHaveBeenCalledTimes(2); // refetch
        });
    });

    it('mở modal từ chối và gọi API từ chối thành công', async () => {
        vi.mocked(leaveApi.getAll).mockResolvedValue(mockRequests as any);
        vi.mocked(leaveApi.reject).mockResolvedValueOnce({} as any);

        render(<LeaveManagementPage />);

        await waitFor(() => {
            expect(screen.getAllByText('Nguyen Van A')[0]).toBeInTheDocument();
        });

        // Bấm nút Từ chối của Nguyen Van A
        const rejectBtn = screen.getByText('Từ chối', { selector: 'button' });
        fireEvent.click(rejectBtn);

        // Chờ modal mở
        await waitFor(() => {
            expect(screen.getByText('Từ chối đơn nghỉ phép')).toBeInTheDocument();
        });

        // Bấm xác nhận Từ chối trong Modal
        const modalButtons = screen.getAllByRole('button', { name: 'Từ chối' });
        fireEvent.click(modalButtons[modalButtons.length - 1]);

        await waitFor(() => {
            expect(leaveApi.reject).toHaveBeenCalledWith(1);
            expect(mockShowSnackbar).toHaveBeenCalledWith('Từ chối đơn thành công', 'success');
            expect(leaveApi.getAll).toHaveBeenCalledTimes(2); // refetch
        });
    });

    it('hiển thị fallback khi không có dữ liệu', async () => {
        vi.mocked(leaveApi.getAll).mockResolvedValueOnce({ requests: [], pagination: {} } as any);

        render(<LeaveManagementPage />);

        await waitFor(() => {
            expect(screen.getByText('Không có đơn nghỉ phép nào')).toBeInTheDocument();
        });
    });
});
