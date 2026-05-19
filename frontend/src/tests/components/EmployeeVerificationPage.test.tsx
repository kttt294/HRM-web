/**
 * Unit Tests: EmployeeVerificationPage
 * 
 * Kiểm thử tính năng phê duyệt cập nhật hồ sơ nhân viên của HR:
 * - Hiển thị danh sách yêu cầu chờ duyệt
 * - Hiển thị thông báo khi không có yêu cầu nào
 * - Mở modal so sánh khi bấm "So sánh & Duyệt"
 * - Duyệt hồ sơ (Approve) và từ chối hồ sơ (Reject)
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmployeeVerificationPage } from '../../features/hr/pages/EmployeeVerificationPage';
import { employeeApi } from '../../features/employee/services/employee.api';
import { useSnackbarStore } from '../../store/snackbar.store';

// Mock API
vi.mock('../../features/employee/services/employee.api', () => ({
    employeeApi: {
        getPendingUpdates: vi.fn(),
        getById: vi.fn(),
        approveUpdate: vi.fn(),
        rejectUpdate: vi.fn(),
    },
}));

// Mock Zustand store
vi.mock('../../store/snackbar.store', () => ({
    useSnackbarStore: vi.fn(),
}));

describe('EmployeeVerificationPage', () => {
    const mockShowSnackbar = vi.fn();

    const mockUpdates = [
        {
            id: 1,
            employeeId: '5',
            employeeName: 'Nguyen Van A',
            data: JSON.stringify({ fullName: 'Nguyen Van A (Updated)', phone: '0987654321' }),
            requestedAt: '2025-05-20T10:00:00Z',
        },
    ];

    const mockOriginalEmployee = {
        id: 5,
        fullName: 'Nguyen Van A',
        phone: '0123456789',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSnackbarStore).mockReturnValue({
            showSnackbar: mockShowSnackbar,
        } as any);

        // Mặc định window.confirm trả về true
        window.confirm = vi.fn().mockReturnValue(true);
    });

    it('hiển thị loader khi đang tải dữ liệu', () => {
        vi.mocked(employeeApi.getPendingUpdates).mockReturnValue(new Promise(() => {})); // Never resolves to keep loading state

        render(<EmployeeVerificationPage />);

        expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    });

    it('hiển thị thông báo khi không có yêu cầu nào', async () => {
        vi.mocked(employeeApi.getPendingUpdates).mockResolvedValueOnce([]);

        render(<EmployeeVerificationPage />);

        await waitFor(() => {
            expect(screen.getByText('Không có yêu cầu cập nhật hồ sơ nào đang chờ duyệt')).toBeInTheDocument();
        });
    });

    it('hiển thị danh sách các yêu cầu chờ duyệt', async () => {
        vi.mocked(employeeApi.getPendingUpdates).mockResolvedValueOnce(mockUpdates);

        render(<EmployeeVerificationPage />);

        await waitFor(() => {
            expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
            expect(screen.getByText('00005')).toBeInTheDocument(); // formatted employee ID
        });
    });

    it('mở modal so sánh khi bấm nút "So sánh & Duyệt"', async () => {
        vi.mocked(employeeApi.getPendingUpdates).mockResolvedValueOnce(mockUpdates);
        vi.mocked(employeeApi.getById).mockResolvedValueOnce(mockOriginalEmployee as any);

        render(<EmployeeVerificationPage />);

        // Chờ render xong bảng
        const compareBtn = await screen.findByText('So sánh & Duyệt');
        fireEvent.click(compareBtn);

        // Chờ modal mở và fetch original data
        await waitFor(() => {
            expect(employeeApi.getById).toHaveBeenCalledWith('5');
            // Check tiêu đề modal
            expect(screen.getByText('So sánh thay đổi hồ sơ: Nguyen Van A')).toBeInTheDocument();
            // Check diff render
            expect(screen.getByText('0123456789')).toBeInTheDocument(); // Giá trị cũ
            expect(screen.getByText('0987654321')).toBeInTheDocument(); // Giá trị mới
        });
    });

    it('xử lý duyệt hồ sơ thành công', async () => {
        vi.mocked(employeeApi.getPendingUpdates).mockResolvedValueOnce(mockUpdates);
        vi.mocked(employeeApi.getById).mockResolvedValueOnce(mockOriginalEmployee as any);
        vi.mocked(employeeApi.approveUpdate).mockResolvedValueOnce({} as any);

        render(<EmployeeVerificationPage />);

        // Mở modal
        fireEvent.click(await screen.findByText('So sánh & Duyệt'));

        // Bấm duyệt
        const approveBtn = await screen.findByText('Chấp nhận & Cập nhật');
        fireEvent.click(approveBtn);

        await waitFor(() => {
            expect(employeeApi.approveUpdate).toHaveBeenCalledWith(1);
            expect(mockShowSnackbar).toHaveBeenCalledWith('Đã duyệt và cập nhật hồ sơ thành công', 'success');
            expect(employeeApi.getPendingUpdates).toHaveBeenCalledTimes(2); // Fetch lại danh sách
        });
    });

    it('xử lý từ chối hồ sơ thành công', async () => {
        vi.mocked(employeeApi.getPendingUpdates).mockResolvedValueOnce(mockUpdates);
        vi.mocked(employeeApi.getById).mockResolvedValueOnce(mockOriginalEmployee as any);
        vi.mocked(employeeApi.rejectUpdate).mockResolvedValueOnce({} as any);

        render(<EmployeeVerificationPage />);

        // Mở modal
        fireEvent.click(await screen.findByText('So sánh & Duyệt'));

        // Bấm từ chối
        const rejectBtn = await screen.findByText('Từ chối');
        fireEvent.click(rejectBtn);

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled();
            expect(employeeApi.rejectUpdate).toHaveBeenCalledWith(1);
            expect(mockShowSnackbar).toHaveBeenCalledWith('Đã từ chối yêu cầu cập nhật', 'info');
            expect(employeeApi.getPendingUpdates).toHaveBeenCalledTimes(2); // Fetch lại danh sách
        });
    });

    it('xử lý lỗi khi fetch pending updates thất bại', async () => {
        vi.mocked(employeeApi.getPendingUpdates).mockRejectedValueOnce(new Error('Network error'));

        render(<EmployeeVerificationPage />);

        await waitFor(() => {
            expect(mockShowSnackbar).toHaveBeenCalledWith('Không thể tải danh sách chờ duyệt', 'error');
            expect(screen.getByText('Không có yêu cầu cập nhật hồ sơ nào đang chờ duyệt')).toBeInTheDocument(); // Fallback empty state
        });
    });
});
