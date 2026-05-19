/**
 * Unit Tests: CandidateListPage
 *
 * Kiểm thử trang danh sách ứng viên:
 * - Hiển thị bảng CandidateTable
 * - Truyền dữ liệu từ useCandidates vào CandidateTable
 * - Điều hướng (Thêm ứng viên, Xem chi tiết)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CandidateListPage } from '../../features/recruitment/pages/CandidateListPage';
import { useCandidates } from '../../features/recruitment/hooks/useCandidates';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';

// Mock hook
vi.mock('../../features/recruitment/hooks/useCandidates', () => ({
    useCandidates: vi.fn(),
}));

// Mock router
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('CandidateListPage', () => {
    const mockNavigate = vi.fn();
    const mockFetch = vi.fn();

    const mockCandidates = [
        {
            id: 'can1',
            fullName: 'Nguyen Van A',
            email: 'a@example.com',
            phone: '0123456789',
            status: 'applied',
            appliedRole: 'Backend Developer',
            appliedDate: '2025-06-01',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
        vi.mocked(useCandidates).mockReturnValue({
            candidates: mockCandidates,
            isLoading: false,
            fetchCandidates: mockFetch,
        } as any);
    });

    it('hiển thị tiêu đề và nút Thêm ứng viên', () => {
        render(<CandidateListPage />);

        expect(screen.getByText('Danh sách ứng viên')).toBeInTheDocument();
        expect(screen.getByText('Thêm ứng viên')).toBeInTheDocument();
        expect(screen.getByText('Ứng viên (1)')).toBeInTheDocument();
    });

    it('hiển thị dữ liệu ứng viên trong bảng', () => {
        render(<CandidateListPage />);

        expect(screen.getByText('Nguyen Van A')).toBeInTheDocument();
        expect(screen.getByText('Mới ứng tuyển')).toBeInTheDocument(); // applied -> Mới ứng tuyển
    });

    it('điều hướng khi bấm Thêm ứng viên', () => {
        render(<CandidateListPage />);

        fireEvent.click(screen.getByText('Thêm ứng viên'));
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.CANDIDATE_NEW);
    });
});
