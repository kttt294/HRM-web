import { useNavigate } from "react-router-dom";
import { Table } from "../../../components/ui/Table";
import { Employee } from "../models/employee.model";
import { ROUTES } from "../../../shared/constants/routes";
import { Button } from "../../../components/ui/Button";
import {
  EMPLOYEE_TYPE_LABELS,
  EmployeeType,
} from "../constants/employeeStatus";
import { Role } from "../../../shared/constants/rbac";
import { ShowForRoles } from "../../../components/guards/PermissionGuard";
import { getAvatarUrl } from "../../../shared/utils/avatar.util";
import { formatEmployeeId } from "../../../shared/utils/format.util";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading: boolean;
}

// Status badge component với màu sắc
function StatusBadge({ status }: { status: string }) {
  const statusMap: Record<string, { label: string; className: string }> = {
    active: { label: "Đang làm việc", className: "status-active" },
    probation: { label: "Thử việc", className: "status-working" },
    resigned: { label: "Đã nghỉ việc", className: "status-resigned" },
    terminated: { label: "Đã sa thải", className: "status-inactive" },
    on_leave: { label: "Đang nghỉ phép", className: "status-onleave" },
  };

  const statusInfo = statusMap[status] || {
    label: status || "N/A",
    className: "status-inactive",
  };

  return (
    <span className={`status-badge ${statusInfo.className}`}>
      {statusInfo.label}
    </span>
  );
}

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="loading">Đang tải dữ liệu...</div>;
  }

  const columns = [
    {
      key: "id",
      header: "Mã NV",
      render: (employee: Employee) => (
        <span className="font-medium text-primary">{formatEmployeeId(employee.id)}</span>
      ),
    },
    {
      key: "fullName",
      header: "Họ tên",
      render: (employee: Employee) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={getAvatarUrl(employee.avatarUrl, employee.fullName, 64)}
            alt={employee.fullName}
            style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }}
          />
          <span className="font-medium">{employee.fullName}</span>
        </div>
      ),
    },
    {
      key: "departmentName",
      header: "Phòng ban",
      render: (employee: Employee) => (
        <span>{employee.departmentName || "—"}</span>
      ),
    },
    {
      key: "jobTitle",
      header: "Chức danh",
      render: (employee: Employee) => <span>{employee.jobTitle || "—"}</span>,
    },
    {
      key: "employeeType",
      header: "Loại hình",
      render: (employee: Employee) => (
        <span>
          {EMPLOYEE_TYPE_LABELS[employee.employeeType as EmployeeType] ||
            employee.employeeType}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (employee: Employee) => <StatusBadge status={employee.status} />,
    },
    {
      key: "profileStatus",
      header: "Hồ sơ",
      render: (employee: Employee) => (
        employee.profileStatus === 'pending' ? (
          <span className="status-badge status-pending" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
            Chờ duyệt hồ sơ
          </span>
        ) : (
          <span className="status-badge status-completed no-dot" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
            Đã xác thực
          </span>
        )
      ),
    },
    {
      key: "actions",
      header: "",
      render: (employee: Employee) => (
        <div className="action-buttons" style={{ justifyContent: "flex-end" }}>
          <ShowForRoles roles={[Role.HR, Role.ADMIN]}>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(ROUTES.EMPLOYEE_EDIT.replace(":id", employee.id));
              }}
            >
              Sửa
            </Button>
          </ShowForRoles>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={employees}
      onRowClick={(employee) =>
        navigate(ROUTES.EMPLOYEE_DETAIL.replace(":id", employee.id))
      }
      emptyMessage="Không tìm thấy nhân viên nào"
    />
  );
}
