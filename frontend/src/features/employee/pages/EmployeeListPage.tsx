import { useNavigate } from "react-router-dom";
import { EmployeeSearchForm } from "../components/EmployeeSearchForm";
import { EmployeeTable } from "../components/EmployeeTable";
import { useEmployees } from "../hooks/useEmployees";
import { Button } from "../../../components/ui/Button";
import { ROUTES } from "../../../shared/constants/routes";

export function EmployeeListPage() {
  const navigate = useNavigate();
  const { employees, isLoading, searchEmployees } = useEmployees();

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-section">
          <nav className="breadcrumb">
            <a href="/">Trang chủ</a>
            <span className="breadcrumb-separator">/</span>
            <span>Quản lý nhân sự</span>
          </nav>
          <h1>Danh sách nhân viên</h1>
          <p className="page-subtitle">
            Quản lý hồ sơ, hợp đồng và lịch sử làm việc của nhân viên
          </p>
        </div>
        <div className="page-actions">
          <Button onClick={() => navigate(ROUTES.EMPLOYEE_NEW)}>
            <span style={{ marginRight: "8px" }}>+</span> Thêm nhân viên
          </Button>
        </div>
      </div>

      {/* Search Panel */}
      <div className="search-panel">
        <div className="card-header">
          <h2>Bộ lọc tìm kiếm</h2>
        </div>
        <EmployeeSearchForm onSearch={searchEmployees} />
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-header">
          <h3>
            Danh sách nhân viên{" "}
            <span
              style={{
                color: "var(--gray-500)",
                fontWeight: "normal",
                fontSize: "14px",
                marginLeft: "8px",
              }}
            >
              ({employees.length})
            </span>
          </h3>
        </div>
        {/* Remove padding to let table stretch full width */}
        <div className="card-body" style={{ padding: 0 }}>
          <EmployeeTable employees={employees} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}
