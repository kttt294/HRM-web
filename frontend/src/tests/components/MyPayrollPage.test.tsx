/**
 * Unit Tests: MyPayrollPage
 *
 * Kiểm thử tính năng xem bảng lương cá nhân:
 * - Hiển thị thẻ tóm tắt tháng gần nhất
 * - Hiển thị danh sách lịch sử lương
 * - Mở modal xem chi tiết
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MyPayrollPage } from '../../features/employee/pages/MyPayrollPage';
import { payrollApi } from '../../features/hr/services/payroll.api';

// Mock API
vi.mock('../../features/hr/services/payroll.api', () => ({
    payrollApi: {
        getMyPayroll: vi.fn(),
    },
}));

// Mock animejs
vi.mock('animejs', () => {
    const mockAnime = vi.fn(() => ({ play: vi.fn() }));
    (mockAnime as any).stagger = vi.fn();
    return { default: mockAnime };
});

describe('MyPayrollPage', () => {
    const mockPayrolls = [
        {
            id: 1,
            employeeId: '10',
            employeeName: 'Nguyen Van A',
            department: 'IT',
            month: 5,
            year: 2026,
            baseSalary: 15000000,
            allowance: 2000000,
            deduction: 500000,
            netSalary: 16500000,
            status: 'paid',
        },
        {
            id: 2,
            employeeId: '10',
            employeeName: 'Nguyen Van A',
            department: 'IT',
            month: 4,
            year: 2026,
            baseSalary: 15000000,
            allowance: 1000000,
            deduction: 200000,
            netSalary: 15800000,
            status: 'paid',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('hiển thị loading ban đầu và danh sách lương sau khi fetch', async () => {
        vi.mocked(payrollApi.getMyPayroll).mockResolvedValueOnce(mockPayrolls as any);

        render(<MyPayrollPage />);

        expect(screen.getByText('Đang tải...')).toBeInTheDocument();

        await waitFor(() => {
            // Kiểm tra thẻ tóm tắt (Latest Payroll)
            expect(screen.getByText('Lương Tháng 5 2026')).toBeInTheDocument();
            // formatCurrency for 16,500,000 (Month 5 netSalary)
            expect(screen.getAllByText(/16.500.000/).length).toBeGreaterThan(0); 

            // Kiểm tra list
            expect(screen.getByText('Lịch sử lương')).toBeInTheDocument();
            expect(screen.getByText('Tháng 5 2026')).toBeInTheDocument();
            expect(screen.getByText('Tháng 4 2026')).toBeInTheDocument();
        });
    });

    it('hiển thị thông báo khi không có dữ liệu', async () => {
        vi.mocked(payrollApi.getMyPayroll).mockResolvedValueOnce([]);

        render(<MyPayrollPage />);

        await waitFor(() => {
            expect(screen.getByText('Chưa có dữ liệu bảng lương')).toBeInTheDocument();
        });
    });

    it('mở modal chi tiết khi click vào thẻ tóm tắt tháng gần nhất', async () => {
        vi.mocked(payrollApi.getMyPayroll).mockResolvedValueOnce(mockPayrolls as any);

        render(<MyPayrollPage />);

        await waitFor(() => {
            expect(screen.getByText('Lương Tháng 5 2026')).toBeInTheDocument();
        });

        // Click vào thẻ tóm tắt
        fireEvent.click(screen.getByText('Lương Tháng 5 2026'));

        await waitFor(() => {
            expect(screen.getByText('Phiếu lương Tháng 5/2026')).toBeInTheDocument();
        });
    });

    it('mở modal chi tiết khi click vào một item trong lịch sử', async () => {
        vi.mocked(payrollApi.getMyPayroll).mockResolvedValueOnce(mockPayrolls as any);

        render(<MyPayrollPage />);

        await waitFor(() => {
            expect(screen.getByText('Tháng 4 2026')).toBeInTheDocument();
        });

        // Click vào item của tháng 4
        fireEvent.click(screen.getByText('Tháng 4 2026'));

        await waitFor(() => {
            expect(screen.getByText('Phiếu lương Tháng 4/2026')).toBeInTheDocument();
        });

        // Check values in modal
        expect(screen.getByText('+1.000.000 ₫')).toBeInTheDocument(); // Allowance of month 4
    });
});
