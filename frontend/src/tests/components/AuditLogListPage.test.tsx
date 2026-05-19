/**
 * Unit Tests: AuditLogListPage
 *
 * Kiểm thử trang xem nhật ký hệ thống:
 * - Hiển thị danh sách audit logs
 * - Thay đổi bộ lọc (tìm kiếm, method, status)
 * - Điều hướng xem chi tiết
 * - Phân trang
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuditLogListPage } from '../../features/admin/pages/AuditLogListPage';
import { auditLogApi } from '../../features/admin/services/audit-log.api';
import { useNavigate } from 'react-router-dom';
import { useSnackbarStore } from '../../store/snackbar.store';

// Mock API
vi.mock('../../features/admin/services/audit-log.api', () => ({
    auditLogApi: {
        getAuditLogs: vi.fn(),
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

describe('AuditLogListPage', () => {
    const mockNavigate = vi.fn();
    const mockShowSnackbar = vi.fn();

    const mockLogs = [
        {
            id: 'log1',
            action: 'LOGIN',
            resource: 'Auth',
            method: 'POST',
            status_code: 200,
            response_time: 120,
            username: 'admin',
            full_name: 'System Admin',
            created_at: '2026-05-20T10:00:00Z',
        },
        {
            id: 'log2',
            action: 'UPDATE_PROFILE',
            resource: 'Employee',
            method: 'PUT',
            status_code: 403,
            response_time: 50,
            username: 'user1',
            full_name: 'User 1',
            created_at: '2026-05-19T08:00:00Z',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useSnackbarStore).mockReturnValue({
            showSnackbar: mockShowSnackbar,
        } as any);
        vi.mocked(auditLogApi.getAuditLogs).mockResolvedValue({
            data: mockLogs,
            pagination: { totalPages: 2, total: 2 },
        } as any);
    });

    it('hiển thị danh sách audit logs', async () => {
        render(<AuditLogListPage />);

        expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('LOGIN')).toBeInTheDocument();
            expect(screen.getByText('UPDATE_PROFILE')).toBeInTheDocument();
            expect(screen.getByText('System Admin')).toBeInTheDocument();
            // Status code
            expect(screen.getByText('200')).toBeInTheDocument();
            expect(screen.getByText('403')).toBeInTheDocument();
        });
    });

    it('gọi API với bộ lọc thay đổi', async () => {
        render(<AuditLogListPage />);

        await waitFor(() => {
            expect(screen.getByText('LOGIN')).toBeInTheDocument();
        });

        const searchInput = screen.getByPlaceholderText('Username, họ tên...');
        fireEvent.change(searchInput, { target: { value: 'admin' } });

        await waitFor(() => {
            expect(auditLogApi.getAuditLogs).toHaveBeenCalledWith(expect.objectContaining({
                search: 'admin',
                page: 1,
            }));
        });
    });

    it('chuyển trang thành công', async () => {
        render(<AuditLogListPage />);

        await waitFor(() => {
            expect(screen.getByText('Trang 1 / 2')).toBeInTheDocument();
        });

        const nextBtn = screen.getByText('Sau');
        fireEvent.click(nextBtn);

        await waitFor(() => {
            expect(auditLogApi.getAuditLogs).toHaveBeenCalledWith(expect.objectContaining({
                page: 2,
            }));
        });
    });

    it('điều hướng đến trang chi tiết khi bấm vào dòng log', async () => {
        const { container } = render(<AuditLogListPage />);

        await waitFor(() => {
            expect(screen.getByText('LOGIN')).toBeInTheDocument();
        });

        // Lấy hàng đầu tiên
        const rows = container.querySelectorAll('tbody tr.log-row');
        expect(rows.length).toBeGreaterThan(0);

        fireEvent.click(rows[0]);

        expect(mockNavigate).toHaveBeenCalledWith('/admin/audit-logs/log1');
    });

    it('hiển thị thông báo khi không có dữ liệu', async () => {
        vi.mocked(auditLogApi.getAuditLogs).mockResolvedValue({
            data: [],
            pagination: { totalPages: 1, total: 0 },
        } as any);

        render(<AuditLogListPage />);

        await waitFor(() => {
            expect(screen.getByText('Không tìm thấy bản ghi nào phù hợp.')).toBeInTheDocument();
        });
    });
});
