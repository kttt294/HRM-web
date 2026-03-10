import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Table } from "../../../components/ui/Table";
import { Button } from "../../../components/ui/Button";
import { recruitmentApi } from "../services/recruitment.api";
import { Vacancy } from "../models/vacancy.model";
import { ROUTES } from "../../../shared/constants/routes";
import { useSnackbarStore } from "../../../store/snackbar.store";

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

export function MyVacanciesPage() {
  const navigate = useNavigate();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  useEffect(() => {
    const fetchMyVacancies = async () => {
      try {
        setIsLoading(true);
        const data = await recruitmentApi.getMyVacancies();
        setVacancies(data);
      } catch (error) {
        console.error("Failed to load my vacancies:", error);
        showSnackbar("Không thể tải danh sách tin tuyển dụng", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchMyVacancies();
  }, [showSnackbar]);

  const columns = [
    {
      key: "title",
      header: "Vị trí",
      render: (vacancy: Vacancy) => (
        <span className="font-medium">{vacancy.title}</span>
      ),
    },
    {
      key: "jobTitle",
      header: "Chức danh",
      render: (vacancy: Vacancy) => <span>{vacancy.jobTitle || "—"}</span>,
    },
    { key: "department", header: "Phòng ban" },
    {
      key: "status",
      header: "Trạng thái",
      align: "center" as const,
      render: (vacancy: Vacancy) => (
        <VacancyStatusBadge status={vacancy.status} />
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (vacancy: Vacancy) => (
        <div className="action-buttons">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(ROUTES.VACANCY_DETAIL.replace(":id", String(vacancy.id)));
            }}
          >
            Quản lý
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Tuyển dụng tôi phụ trách</h1>
          <p className="page-subtitle">
            Danh sách các vị trí tuyển dụng bạn đang chịu trách nhiệm sàng lọc và phỏng vấn
          </p>
        </div>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Số lượng: {vacancies.length}</h3>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {isLoading ? (
            <div className="loading" style={{ padding: '24px' }}>Đang tải dữ liệu...</div>
          ) : (
            <Table
              columns={columns}
              data={vacancies}
              onRowClick={(vacancy) =>
                navigate(ROUTES.VACANCY_DETAIL.replace(":id", String(vacancy.id)))
              }
              emptyMessage="Bạn hiện không phụ trách vị trí tuyển dụng nào"
            />
          )}
        </div>
      </div>
    </>
  );
}
