import { Button } from '../../../components/ui/Button';
import { ROUTES } from '../../../shared/constants/routes';
import { useNavigate } from 'react-router-dom';
import { useVacancies } from '../hooks/useVacancies';
import { useCandidates } from '../hooks/useCandidates';

export function RecruitmentDashboardPage() {
    const navigate = useNavigate();
    const { vacancies } = useVacancies();
    const { candidates } = useCandidates();

    const openVacancies = vacancies.filter(v => v.status === 'open').length;
    // Đếm số ứng viên chưa có kết quả cuối cùng (không phải hired hoặc rejected)
    const pendingCandidates = candidates.filter(c => c.status !== 'hired' && c.status !== 'rejected').length;
    const hiredCandidates = candidates.filter(c => c.status === 'hired').length;

    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <nav className="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Tuyển dụng</span>
                    </nav>
                    <h1>Tổng quan Tuyển dụng</h1>
                    <p className="page-subtitle">
                        Theo dõi hoạt động tuyển dụng trong tổ chức
                    </p>
                </div>
            </div>

            <div className="summary-cards">
                <div className="summary-card">
                    <div className="card-label">Vị trí đang tuyển</div>
                    <div className="card-value">{openVacancies}</div>
                </div>

                <div className="summary-card">
                    <div className="card-label">Ứng viên chờ xử lý</div>
                    <div className="card-value">{pendingCandidates}</div>
                </div>

                <div className="summary-card">
                    <div className="card-label">Đã tuyển dụng</div>
                    <div className="card-value">{hiredCandidates}</div>
                </div>

                <div className="summary-card">
                    <div className="card-label">Tổng số ứng viên</div>
                    <div className="card-value">{candidates.length}</div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Thao tác nhanh</h3>
                </div>
                <div className="card-body">
                    <div className="flex gap-4">
                        <Button onClick={() => navigate(ROUTES.VACANCY_NEW)}>
                            Thêm vị trí mới
                        </Button>
                        <Button onClick={() => navigate(ROUTES.CANDIDATE_NEW)}>
                            Thêm ứng viên
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(ROUTES.VACANCIES)}>
                            Quản lý vị trí
                        </Button>
                        <Button variant="secondary" onClick={() => navigate(ROUTES.CANDIDATES)}>
                            Quản lý ứng viên
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
