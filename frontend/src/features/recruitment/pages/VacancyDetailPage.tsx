import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../../../components/ui/Button";
import { ROUTES } from "../../../shared/constants/routes";
import { formatCurrency, formatNumber } from "../../../shared/utils/format.util";
import { formatDate } from "../../../shared/utils/date.util";
import { Vacancy } from "../models/vacancy.model";
import { recruitmentApi } from "../services/recruitment.api";

type VacancyDetail = Vacancy & {
  requirements?: string[] | string | null;
  deadline?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

function VacancyStatusLabel({ status }: { status?: string }) {
  const statusMap: Record<string, string> = {
    open: "Đang tuyển",
    closed: "Đã đóng",
    draft: "Nháp",
  };

  return <>{statusMap[status?.toLowerCase() || ""] || status || "—"}</>;
}

function formatRequirements(value: string[] | string | null | undefined): string {
  if (Array.isArray(value)) return value.length > 0 ? value.join(", ") : "—";
  if (typeof value === "string") return value.trim() ? value : "—";
  return "—";
}

function formatOptionalDate(value?: string | null): string {
  if (!value) return "—";
  return formatDate(value);
}

export function VacancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vacancy, setVacancy] = useState<VacancyDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVacancyDetail() {
      if (!id) {
        setError("Thiếu mã vị trí tuyển dụng");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const data = await recruitmentApi.getVacancyById(id);
        setVacancy(data as VacancyDetail);
      } catch (err) {
        setError("Không thể tải chi tiết vị trí tuyển dụng");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVacancyDetail();
  }, [id]);

  const fields = useMemo(() => {
    if (!vacancy) return [];

    return [
      { label: "Mã vị trí", value: vacancy.id || "—" },
      { label: "Tên vị trí", value: vacancy.title || "—" },
      { label: "Chức danh", value: vacancy.jobTitle || "—" },
      { label: "Phòng ban", value: vacancy.department || "—" },
      {
        label: "Số lượng cần tuyển",
        value:
          vacancy.numberOfPositions !== undefined
            ? formatNumber(vacancy.numberOfPositions)
            : "—",
      },
      { label: "Lương tối thiểu", value: formatCurrency(vacancy.minSalary) },
      { label: "Lương tối đa", value: formatCurrency(vacancy.maxSalary) },
      { label: "Hạn nộp hồ sơ", value: formatOptionalDate(vacancy.deadline) },
      {
        label: "Trạng thái",
        value: <VacancyStatusLabel status={vacancy.status} />,
      },
      { label: "Mô tả công việc", value: vacancy.description || "—" },
      {
        label: "Yêu cầu",
        value: formatRequirements(vacancy.requirements),
      },
      {
        label: "Ngày tạo",
        value: formatOptionalDate(vacancy.createdAt),
      },
      {
        label: "Cập nhật lần cuối",
        value: formatOptionalDate(vacancy.updatedAt),
      },
    ];
  }, [vacancy]);

  if (isLoading) {
    return <div className="loading">Đang tải chi tiết vị trí...</div>;
  }

  if (error || !vacancy) {
    return (
      <div className="card">
        <div className="card-body">
          <p>{error || "Không tìm thấy vị trí tuyển dụng"}</p>
          <Button onClick={() => navigate(ROUTES.VACANCIES)}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <nav className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span className="breadcrumb-separator">/</span>
            <a href="/recruitment">Tuyển dụng</a>
            <span className="breadcrumb-separator">/</span>
            <a href="/recruitment/vacancies">Vị trí tuyển dụng</a>
            <span className="breadcrumb-separator">/</span>
            <span>Chi tiết</span>
          </nav>
          <h1>Chi tiết vị trí tuyển dụng</h1>
          <p className="page-subtitle">{vacancy.title}</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.VACANCY_EDIT.replace(":id", String(vacancy.id)))}
          >
            Chỉnh sửa
          </Button>
          <Button onClick={() => navigate(ROUTES.VACANCIES)}>
            Quay lại danh sách
          </Button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <table className="data-table">
            <tbody>
              {fields.map((field) => (
                <tr key={field.label}>
                  <td style={{ width: "260px", fontWeight: 600 }}>{field.label}</td>
                  <td>{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
