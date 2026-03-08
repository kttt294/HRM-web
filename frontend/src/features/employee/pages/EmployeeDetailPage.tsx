import { useNavigate, useParams } from "react-router-dom";
import { useEmployeeDetail } from "../hooks/useEmployeeDetail";
import { formatDate } from "../../../shared/utils/date.util";
import { formatCurrency } from "../../../shared/utils/format.util";
import { Button } from "../../../components/ui/Button";
import { ROUTES } from "../../../shared/constants/routes";
import { useMemo } from "react";

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employee, isLoading } = useEmployeeDetail(id!);

  const personalFields = useMemo(() => {
    if (!employee) return [];
    return [
      { label: "Mã nhân viên", value: employee.id || "—" },
      { label: "Họ và tên", value: employee.fullName || "—" },
      { label: "Ngày sinh", value: formatDate(employee.dateOfBirth) },
      { label: "Giới tính", value: employee.gender || "—" },
      { label: "Số CCCD", value: employee.nationalId || "—" },
      { label: "Số điện thoại", value: employee.phone || "—" },
      { label: "Địa chỉ", value: employee.address || "—" },
    ];
  }, [employee]);

  const jobFields = useMemo(() => {
    if (!employee) return [];
    return [
      { label: "Phòng ban", value: employee.departmentName || employee.departmentId || "—" },
      { label: "Chức danh", value: employee.jobTitle || "—" },
      { label: "Người quản lý", value: employee.supervisorId || "—" },
      { label: "Ngày vào làm", value: formatDate(employee.hireDate) },
      { label: "Loại hình nhân viên", value: employee.employeeType || "—" },
      { label: "Trạng thái", value: employee.status || "—" },
    ];
  }, [employee]);

  const salaryFields = useMemo(() => {
    if (!employee) return [];
    return [
      { label: "Lương cơ bản", value: formatCurrency(employee.baseSalary) },
      { label: "Phụ cấp", value: formatCurrency(employee.allowance) },
    ];
  }, [employee]);

  if (isLoading) {
    return <div className="loading">Đang tải chi tiết nhân viên...</div>;
  }

  if (!employee) {
    return (
      <div className="card">
        <div className="card-body">
          <p>Không tìm thấy nhân viên</p>
          <Button onClick={() => navigate(ROUTES.EMPLOYEES)}>
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
          <h1>Hồ sơ nhân viên</h1>
          <p className="page-subtitle">{employee.fullName} - {employee.jobTitle}</p>
        </div>
        <div className="page-actions">
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.EMPLOYEES)}
          >
            Quay lại danh sách
          </Button>
          <Button onClick={() => navigate(ROUTES.EMPLOYEE_EDIT.replace(":id", employee.id))}>
            Chỉnh sửa
          </Button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Thông tin cá nhân</h2>
        </div>
        <div className="card-body">
          <table className="data-table">
            <tbody>
              {personalFields.map((field) => (
                <tr key={field.label}>
                  <td style={{ width: "260px", fontWeight: 600 }}>{field.label}</td>
                  <td>{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Thông tin công việc</h2>
        </div>
        <div className="card-body">
          <table className="data-table">
            <tbody>
              {jobFields.map((field) => (
                <tr key={field.label}>
                  <td style={{ width: "260px", fontWeight: 600 }}>{field.label}</td>
                  <td>{field.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="card-header">
          <h2>Thông tin lương</h2>
        </div>
        <div className="card-body">
          <table className="data-table">
            <tbody>
              {salaryFields.map((field) => (
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
