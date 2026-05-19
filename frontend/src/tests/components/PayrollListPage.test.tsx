/**
 * Unit Tests: PayrollListPage
 *
 * Kiểm thử tính năng xem bảng lương của HR:
 * - Hiển thị danh sách bảng lương
 * - Lọc theo tháng/năm
 * - Hiển thị modal chi tiết bảng lương khi click vào dòng
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PayrollListPage } from '../../features/hr/pages/PayrollListPage';
import { payrollApi } from '../../features/hr/services/payroll.api';

// Mock API
vi.mock('../../features/hr/services/payroll.api', () => ({
    payrollApi: {
        getAll: vi.fn(),
    },
}));

// Mock animejs
vi.mock('animejs', () => {
    const mockAnime = vi.fn(() => ({ play: vi.fn() }));
    (mockAnime as any).stagger = vi.fn();
    return { default: mockAnime };
});

describe('PayrollListPage', () => {
    const mockPayrolls = {
        payrolls: [
            {
                id: 1,
                employeeId: '10',
                employeeName: 'Le Van C',
                department: 'IT',
                month: 4,
                year: 2026,
                baseSalary: 15000000,
                allowance: 2000000,
                deduction: 500000,
                netSalary: 16500000,
                status: 'paid',
                createdAt: '2026-05-20T00:00:00Z',
            },
            {
                id: 2,
                employeeId: '11',
                employeeName: 'Pham Thi D',
                department: 'HR',
                month: 4,
                year: 2026,
                baseSalary: 10000000,
                allowance: 1000000,
                deduction: 300000,
                netSalary: 10700000,
                status: 'confirmed',
                createdAt: '2026-05-20T00:00:00Z',
            },
        ],
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('hiển thị danh sách bảng lương và thống kê', async () => {
        vi.mocked(payrollApi.getAll).mockResolvedValueOnce(mockPayrolls as any);

        render(<PayrollListPage />);

        expect(screen.getByText('Đang tải...')).toBeInTheDocument();

        await waitFor(() => {
            const tableRows = screen.getAllByRole('row');
            expect(tableRows.length).toBeGreaterThan(1); // 1 header + 2 rows
            
            expect(screen.getByText('Le Van C')).toBeInTheDocument();
            expect(screen.getByText('Pham Thi D')).toBeInTheDocument();
        });

        // Kiểm tra thống kê
        // formatCurrency for 16,500,000 + 10,700,000 = 27,200,000
        expect(screen.getByText(/27.200.000/)).toBeInTheDocument(); 
        expect(screen.getByText('1')).toBeInTheDocument(); // 1 paid
        expect(screen.getByText('2')).toBeInTheDocument(); // 2 total employees
    });

    it('gọi API với filter tháng/năm khi thay đổi bộ lọc', async () => {
        vi.mocked(payrollApi.getAll)
            .mockResolvedValueOnce(mockPayrolls as any)
            .mockResolvedValueOnce(mockPayrolls as any);

        render(<PayrollListPage />);

        await waitFor(() => {
            expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
        });

        const monthSelect = screen.getAllByRole('combobox')[0];
        fireEvent.change(monthSelect, { target: { value: '5' } });

        await waitFor(() => {
            expect(payrollApi.getAll).toHaveBeenLastCalledWith(expect.objectContaining({ month: 5 }));
        });
    });

    it('mở modal chi tiết bảng lương khi click vào một dòng', async () => {
        vi.mocked(payrollApi.getAll).mockResolvedValueOnce(mockPayrolls as any);

        render(<PayrollListPage />);

        await waitFor(() => {
            expect(screen.getByText('Le Van C')).toBeInTheDocument();
        });

        // Click row
        const row = screen.getByText('Le Van C').closest('tr');
        if (row) fireEvent.click(row);

        // Chờ modal
        await waitFor(() => {
            expect(screen.getByText('Chi tiết phiếu lương')).toBeInTheDocument();
        });
        
        // Kiểm tra chi tiết trong modal
        expect(screen.getAllByText('Le Van C').length).toBeGreaterThan(1); // Có trong bảng và modal
        expect(screen.getAllByText(/16.500.000/).length).toBeGreaterThan(1);
    });

    it('hiển thị lỗi khi gọi API thất bại', async () => {
        vi.mocked(payrollApi.getAll).mockRejectedValueOnce(new Error('Network error'));

        render(<PayrollListPage />);

        await waitFor(() => {
            expect(screen.getByText('⚠️ Lỗi hệ thống')).toBeInTheDocument();
        });
    });

    it('hiển thị thông báo khi không có dữ liệu', async () => {
        vi.mocked(payrollApi.getAll).mockResolvedValueOnce({ payrolls: [] } as any);

        render(<PayrollListPage />);

        await waitFor(() => {
            expect(screen.getByText('Không có dữ liệu bảng lương')).toBeInTheDocument();
        });
    });
});
