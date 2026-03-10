import { useState, useEffect, useRef } from "react";
import { employeeApi } from "../../employee/services/employee.api";
import { Employee } from "../../employee/models/employee.model";
import { Button } from "../../../components/ui/Button";
import { Table } from "../../../components/ui/Table";
import { useSnackbarStore } from "../../../store/snackbar.store";
import { formatEmployeeId } from "../../../shared/utils/format.util";
import { getAvatarUrl } from "../../../shared/utils/avatar.util";
import anime from "animejs";

export function EmployeeVerificationPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSnackbar } = useSnackbarStore();

  const fetchPendingEmployees = async () => {
    setLoading(true);
    try {
      const result = await employeeApi.getAll({ profileStatus: 'pending' });
      setEmployees(result);
    } catch (error) {
      console.error("Failed to fetch pending employees:", error);
      showSnackbar("Không thể tải danh sách chờ duyệt", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingEmployees();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      anime({
        targets: containerRef.current.querySelectorAll("tr"),
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 400,
        delay: anime.stagger(30),
        easing: "easeOutQuart",
      });
    }
  }, [loading, employees]);

  const handleVerify = async (id: string, name: string) => {
    try {
      await employeeApi.verifyProfile(id);
      showSnackbar(`Đã duyệt hồ sơ của ${name}`, "success");
      fetchPendingEmployees();
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Duyệt hồ sơ thất bại", "error");
    }
  };

  const columns = [
    {
      key: "id",
      header: "Mã NV",
      render: (emp: Employee) => (
        <span style={{ fontWeight: 600, color: '#1976d2' }}>{formatEmployeeId(emp.id)}</span>
      ),
    },
    {
      key: "fullName",
      header: "Họ tên",
      render: (emp: Employee) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={getAvatarUrl(emp.avatarUrl, emp.fullName)} 
            alt={emp.fullName}
            style={{ width: '32px', height: '32px', borderRadius: '50%' }}
          />
          <span style={{ fontWeight: 500 }}>{emp.fullName}</span>
        </div>
      ),
    },
    {
      key: "department",
      header: "Phòng ban",
      render: (emp: Employee) => <span>{emp.departmentName || "—"}</span>,
    },
    {
        key: "jobTitle",
        header: "Chức danh",
        render: (emp: Employee) => <span>{emp.jobTitle || "—"}</span>,
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (emp: Employee) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" onClick={() => handleVerify(emp.id, emp.fullName)}>
            Duyệt hồ sơ
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => window.open(`/hr/employees/${emp.id}`, '_blank')}
          >
            Xem chi tiết
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div ref={containerRef}>
      <div className="page-header">
        <div className="page-title-section">
          <h1>Duyệt hồ sơ nhân viên</h1>
          <p className="page-subtitle">
            Danh sách nhân viên vừa cập nhật thông tin và đang chờ xác thực
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center' }}>Đang tải...</div>
          ) : employees.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
              Không có hồ sơ nào đang chờ duyệt
            </div>
          ) : (
            <Table columns={columns} data={employees} />
          )}
        </div>
      </div>
    </div>
  );
}
