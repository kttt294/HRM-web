import { useNavigate } from 'react-router-dom';
import { Table } from '../../../components/ui/Table';
import { Employee } from '../models/employee.model';
import { ROUTES } from '../../../shared/constants/routes';
import { Button } from '../../../components/ui/Button';

interface EmployeeTableProps {
    employees: Employee[];
    isLoading: boolean;
}

// Status badge component với màu sắc
function StatusBadge({ status }: { status: string }) {
    const statusMap: Record<string, { label: string; className: string }> = {
        active: { label: 'Đang làm', className: 'status-active' },
        working: { label: 'Đang làm', className: 'status-working' },
        onleave: { label: 'Nghỉ phép', className: 'status-onleave' },
        resigned: { label: 'Đã nghỉ', className: 'status-resigned' },
        inactive: { label: 'Không hoạt động', className: 'status-inactive' },
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

export function EmployeeTable({ employees, isLoading }: EmployeeTableProps) {
    const navigate = useNavigate();

    if (isLoading) {
        return (
            <div className="loading">
                Đang tải dữ liệu...
            </div>
        );
    }

    const columns = [
        { 
            key: 'id', 
            header: 'Mã NV',
            render: (employee: Employee) => (
                <span className="font-medium text-primary">{employee.id}</span>
            )
        },
        { 
            key: 'fullName', 
            header: 'Họ tên',
            render: (employee: Employee) => (
                <span className="font-medium">{employee.fullName}</span>
            )
        },
        { key: 'departmentId', header: 'Phòng ban' },
        { 
            key: 'jobTitle', 
            header: 'Chức danh',
            render: (employee: Employee) => (
                <span>{employee.jobTitle || '—'}</span>
            )
        },
        { key: 'employeeType', header: 'Loại hình' },
        { 
            key: 'status', 
            header: 'Trạng thái',
            render: (employee: Employee) => (
                <StatusBadge status={employee.status} />
            )
        },
        {
            key: 'actions',
            header: '',
            render: (employee: Employee) => (
                <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                    <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(ROUTES.EMPLOYEE_EDIT.replace(':id', employee.id));
                        }}
                    >
                        Sửa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <Table
            columns={columns}
            data={employees}
            onRowClick={(employee) =>
                navigate(ROUTES.EMPLOYEE_DETAIL.replace(':id', employee.id))
            }
            emptyMessage="Không tìm thấy nhân viên nào"
        />
    );
}
