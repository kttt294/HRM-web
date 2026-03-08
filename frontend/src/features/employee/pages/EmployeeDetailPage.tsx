import { useParams } from "react-router-dom";
import { useEmployeeDetail } from "../hooks/useEmployeeDetail";
import { JobInfoSection } from "../components/JobInfoSection";
import { SalarySection } from "../components/SalarySection";
import { formatDate } from "../../../shared/utils/date.util";

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { employee, isLoading } = useEmployeeDetail(id!);

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (!employee) {
    return <div>Không tìm thấy nhân viên</div>;
  }

  return (
    <>
      <div className="page-header">
        <div className="page-title-section">
          <h1>HỒ SƠ NHÂN VIÊN</h1>
          <p className="page-subtitle">Xem chi tiết hồ sơ, hợp đồng và thông tin công việc</p>
        </div>
      </div>

      <main id="employee-profile">
        <section data-section="personal">
          <h2>Thông tin cá nhân</h2>
          <ul id="personal-info">
            <li>
              <strong>Họ và tên:</strong> {employee.fullName}
            </li>
            <li>
              <strong>Ngày sinh:</strong> {formatDate(employee.dateOfBirth)}
            </li>
            <li>
              <strong>Giới tính:</strong> {employee.gender}
            </li>
            <li>
              <strong>Số CCCD:</strong> {employee.nationalId}
            </li>
          </ul>
        </section>

        <JobInfoSection employee={employee} />
        <SalarySection employee={employee} />
      </main>
    </>
  );
}
