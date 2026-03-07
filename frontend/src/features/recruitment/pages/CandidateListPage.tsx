import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { CandidateTable } from '../components/CandidateTable';
import { useCandidates } from '../hooks/useCandidates';
import { ROUTES } from '../../../shared/constants/routes';

export function CandidateListPage() {
    const navigate = useNavigate();
    const { candidates, isLoading, fetchCandidates } = useCandidates();

    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <nav className="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="breadcrumb-separator">/</span>
                        <a href="/recruitment">Tuyển dụng</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Ứng viên</span>
                    </nav>
                    <h1>Danh sách ứng viên</h1>
                    <p className="page-subtitle">
                        Quản lý và theo dõi ứng viên trong quy trình tuyển dụng
                    </p>
                </div>
                <div className="page-actions">
                    <Button onClick={() => navigate(ROUTES.CANDIDATE_NEW)}>
                        Thêm ứng viên
                    </Button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Ứng viên ({candidates.length})</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <CandidateTable
                        candidates={candidates}
                        isLoading={isLoading}
                        onViewDetail={(id) => navigate(ROUTES.CANDIDATE_DETAIL.replace(':id', id))}
                        onStatusUpdated={fetchCandidates}
                    />
                </div>
            </div>
        </>
    );
}
