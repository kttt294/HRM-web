import { Employee } from "../models/employee.model";
import { formatDate } from "../../../shared/utils/date.util";

interface JobInfoSectionProps {
  employee: Employee;
}

export function JobInfoSection({ employee }: JobInfoSectionProps) {
  return (
    <section data-section="job">
      <h2>Thông tin công việc</h2>
      <ul id="job-info">
        <li>
          <strong>Mã nhân viên:</strong> {employee.id}
        </li>
        <li>
          <strong>Phòng ban:</strong> {employee.departmentId}
        </li>
        <li>
          <strong>Chức danh:</strong> {employee.jobTitle || "—"}
        </li>
        <li>
          <strong>Quản lý:</strong> {employee.supervisorId}
        </li>
        <li>
          <strong>Ngày vào làm:</strong> {formatDate(employee.hireDate)}
        </li>
        <li>
          <strong>Trạng thái:</strong> {employee.status}
        </li>
        <li>
          <strong>Loại hình:</strong> {employee.employeeType}
        </li>
      </ul>
    </section>
  );
}
