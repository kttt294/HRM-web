import { useNavigate } from "react-router-dom";
import { Table } from "../../../components/ui/Table";
import { Button } from "../../../components/ui/Button";
import { useVacancies } from "../hooks/useVacancies";
import { Vacancy } from "../models/vacancy.model";
import { ROUTES } from "../../../shared/constants/routes";

// Status badge for vacancies
function VacancyStatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    open: { label: "Đang tuyển", className: "status-active" },
    closed: { label: "Đã đóng", className: "status-inactive" },
    draft: { label: "Nháp", className: "status-pending" },
  };

  const statusInfo = statusMap[status?.toLowerCase()] || {
    label: status || "N/A",
    className: "status-inactive",
  };

  return (
    <span className={`status-badge no-dot ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}

export function VacancyListPage() {
  const navigate = useNavigate();
  const { vacancies, isLoading } = useVacancies();

  const columns = [
    {
      key: "title",
      header: "Vị trí",
      width: "30%",
      render: (vacancy: Vacancy) => (
        <span className="font-medium">{vacancy.title}</span>
      ),
    },
    {
      key: "jobTitle",
      header: "Chức danh",
      width: "30%",
      render: (vacancy: Vacancy) => <span>{vacancy.jobTitle || "—"}</span>,
    },
    { key: "department", header: "Phòng ban", width: "20%" },
    {
      key: "status",
      header: "Trạng thái",
      width: "20%",
      align: "center" as const,
      render: (vacancy: Vacancy) => (
        <VacancyStatusBadge status={vacancy.status} />
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (vacancy: Vacancy) => (
        <div className="action-buttons" style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(
                ROUTES.VACANCY_DETAIL.replace(":id", String(vacancy.id)),
              );
            }}
          >
            Xem
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.VACANCY_EDIT.replace(":id", String(vacancy.id)));
            }}
          >
            Sửa
          </Button>
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
              onRowClick={(vacancy) =>
                navigate(ROUTES.VACANCY_DETAIL.replace(":id", String(vacancy.id)))
              }
              emptyMessage="Không có vị trí tuyển dụng nào"
            />
          )}
        </div>
      </div>
    </>
  );
}
