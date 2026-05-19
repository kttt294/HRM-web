/**
 * Unit Tests: VacancyListPage
 *
 * Kiểm thử trang danh sách tin tuyển dụng:
 * - Hiển thị danh sách từ hook useVacancies
 * - Điều hướng khi bấm nút (Thêm mới, Xem, Sửa)
 * - Hiển thị trạng thái (badge)
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { VacancyListPage } from '../../features/recruitment/pages/VacancyListPage';
import { useVacancies } from '../../features/recruitment/hooks/useVacancies';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../shared/constants/routes';

// Mock hook
vi.mock('../../features/recruitment/hooks/useVacancies', () => ({
    useVacancies: vi.fn(),
}));

// Mock router
vi.mock('react-router-dom', () => ({
    useNavigate: vi.fn(),
}));

describe('VacancyListPage', () => {
    const mockNavigate = vi.fn();

    const mockVacancies = [
        {
            id: 'vac1',
            title: 'Tuyển dụng Backend Developer',
            jobTitle: 'Backend Developer',
            department: 'IT',
            status: 'open',
        },
        {
            id: 'vac2',
            title: 'Tuyển dụng HR Manager',
            jobTitle: 'HR Manager',
            department: 'HR',
            status: 'closed',
        },
        {
            id: 'vac3',
            title: 'Tuyển dụng Tester',
            jobTitle: 'Tester',
            department: 'QA',
            status: 'draft',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useNavigate).mockReturnValue(mockNavigate);
    });

    it('hiển thị loading khi đang tải dữ liệu', () => {
        vi.mocked(useVacancies).mockReturnValue({ vacancies: [], isLoading: true } as any);
        render(<VacancyListPage />);

        expect(screen.getByText('Đang tải...')).toBeInTheDocument();
    });

    it('hiển thị danh sách tin tuyển dụng và trạng thái', () => {
        vi.mocked(useVacancies).mockReturnValue({ vacancies: mockVacancies, isLoading: false } as any);
        render(<VacancyListPage />);

        expect(screen.getByText('Tuyển dụng Backend Developer')).toBeInTheDocument();
        expect(screen.getByText('Backend Developer')).toBeInTheDocument();
        
        // Status badges
        expect(screen.getByText('Đang tuyển')).toBeInTheDocument();
        expect(screen.getByText('Đã đóng')).toBeInTheDocument();
        expect(screen.getByText('Nháp')).toBeInTheDocument();
    });

    it('hiển thị thông báo khi không có dữ liệu', () => {
        vi.mocked(useVacancies).mockReturnValue({ vacancies: [], isLoading: false } as any);
        render(<VacancyListPage />);

        expect(screen.getByText('Không có vị trí tuyển dụng nào')).toBeInTheDocument();
    });

    it('điều hướng khi bấm Thêm vị trí', () => {
        vi.mocked(useVacancies).mockReturnValue({ vacancies: [], isLoading: false } as any);
        render(<VacancyListPage />);

        fireEvent.click(screen.getByText('Thêm vị trí'));
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.VACANCY_NEW);
    });

    it('điều hướng khi bấm Xem và Sửa trên mỗi dòng', () => {
        vi.mocked(useVacancies).mockReturnValue({ vacancies: [mockVacancies[0]], isLoading: false } as any);
        render(<VacancyListPage />);

        const viewBtn = screen.getByText('Xem');
        const editBtn = screen.getByText('Sửa');

        fireEvent.click(viewBtn);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.VACANCY_DETAIL.replace(':id', 'vac1'));

        fireEvent.click(editBtn);
        expect(mockNavigate).toHaveBeenCalledWith(ROUTES.VACANCY_EDIT.replace(':id', 'vac1'));
    });
});
