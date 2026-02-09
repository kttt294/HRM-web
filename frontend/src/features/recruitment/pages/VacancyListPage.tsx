import { useNavigate } from 'react-router-dom';
import { Table } from '../../../components/ui/Table';
import { Button } from '../../../components/ui/Button';
import { useVacancies } from '../hooks/useVacancies';
import { Vacancy } from '../models/vacancy.model';
import { ROUTES } from '../../../shared/constants/routes';

// Status badge for vacancies
function VacancyStatusBadge({ status }: { status: string }) {
    const statusMap: Record<string, { label: string; className: string }> = {
        open: { label: 'Đang tuyển', className: 'status-active' },
        closed: { label: 'Đã đóng', className: 'status-inactive' },
        draft: { label: 'Nháp', className: 'status-pending' },
    };

    const statusInfo = statusMap[status?.toLowerCase()] || { 
        label: status || 'N/A', 
        className: 'status-inactive' 
    };

    return (
        <span className={`status-badge ${statusInfo.className}`}>
            {statusInfo.label}
        </span>
    );
}

export function VacancyListPage() {
    const navigate = useNavigate();
    const { vacancies, isLoading } = useVacancies();

    const columns = [
        { 
            key: 'title', 
            header: 'Vị trí',
            render: (vacancy: Vacancy) => (
                <span className="font-medium">{vacancy.title}</span>
            )
        },
        { key: 'department', header: 'Phòng ban' },
        { 
            key: 'status', 
            header: 'Trạng thái',
            render: (vacancy: Vacancy) => (
                <VacancyStatusBadge status={vacancy.status} />
            )
        },
        {
            key: 'actions',
            header: 'Thao tác',
            render: (vacancy: Vacancy) => (
                <div className="action-buttons">
                    <Button size="sm">Xem</Button>
                    <Button size="sm" variant="secondary">✏️ Sửa</Button>
                </div>
            ),
        },
    ];

    return (
        <>
            <div className="page-header">
                <div className="page-title-section">
                    <nav className="breadcrumb">
                        <a href="/">Trang chủ</a>
                        <span className="breadcrumb-separator">/</span>
                        <a href="/recruitment">Tuyển dụng</a>
                        <span className="breadcrumb-separator">/</span>
                        <span>Vị trí tuyển dụng</span>
                    </nav>
                    <h1>Vị trí tuyển dụng</h1>
                    <p className="page-subtitle">
                        Quản lý các vị trí đang cần tuyển dụng
                    </p>
                </div>
                <div className="page-actions">
                    <Button onClick={() => navigate(ROUTES.VACANCY_NEW)}>
                        Thêm vị trí
                    </Button>
                </div>
            </div>
            <div className="card">
                <div className="card-header">
                    <h3>Vị trí ({vacancies.length})</h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    {isLoading ? (
                        <div className="loading">Đang tải...</div>
                    ) : (
                        <Table
                            columns={columns}
                            data={vacancies}
                            emptyMessage="Không có vị trí tuyển dụng nào"
                        />
                    )}
                </div>
            </div>
        </>
    );
}
