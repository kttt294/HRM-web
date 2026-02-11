import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { adminEmployeeApi, Employee } from "../services/employee.api";

export function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingEmployeeId, setProcessingEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await adminEmployeeApi.getAll();
      setEmployees(data);
    } catch (err: any) {
      console.error("Failed to load employees:", err);
      setError(err.message || "Không thể tải danh sách nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = async (employee: Employee) => {
    if (!confirm(`Tạo tài khoản cho nhân viên ${employee.fullName}?\n\nTên đăng nhập và mật khẩu sẽ được tạo tự động.`)) {
      return;
    }

    try {
      setProcessingEmployeeId(employee.id);
      await adminEmployeeApi.createUserAccount(
        employee.id,
        employee.fullName,
        employee.email
      );
      alert(`Tạo tài khoản thành công!\n\nTên đăng nhập: ${employee.id.toLowerCase().replace(/[^a-z0-9]/g, '')}\nMật khẩu: 123456`);
      await loadEmployees(); // Reload để cập nhật trạng thái
    } catch (err: any) {
      console.error("Failed to create account:", err);
      alert(`Không thể tạo tài khoản: ${err.message}`);
    } finally {
      setProcessingEmployeeId(null);
    }
  };

  const handleDeleteAccount = async (employee: Employee) => {
    if (!employee.userId) {
      return;
    }

    if (!confirm(`Xóa tài khoản của nhân viên ${employee.fullName}?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      setProcessingEmployeeId(employee.id);
      await adminEmployeeApi.deleteUserAccount(employee.id, employee.userId);
      alert("Xóa tài khoản thành công!");
      await loadEmployees(); // Reload để cập nhật trạng thái
    } catch (err: any) {
      console.error("Failed to delete account:", err);
      alert(`Không thể xóa tài khoản: ${err.message}`);
    } finally {
      setProcessingEmployeeId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="loading" style={{ padding: "40px", textAlign: "center" }}>
        Đang tải danh sách nhân viên...
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="card-body">
          <p style={{ color: "red" }}>{error}</p>
          <Button onClick={loadEmployees}>Thử lại</Button>
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
            <a href="/admin">Quản lý hệ thống</a>
            <span className="breadcrumb-separator">/</span>
            <span>Danh sách nhân viên</span>
          </nav>
          <h1>Quản lý nhân viên</h1>
          <p className="page-subtitle">
            Danh sách nhân viên và quản lý tài khoản
          </p>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          {employees.length === 0 ? (
            <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>
              Chưa có nhân viên nào trong hệ thống
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên nhân viên</th>
                    <th>Email</th>
                    <th>Chức vụ</th>
                    <th>Phòng ban</th>
                    <th>Trạng thái tài khoản</th>
                    <th style={{ width: "220px" }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id}>
                      <td>{employee.id}</td>
                      <td style={{ fontWeight: 600 }}>{employee.fullName}</td>
                      <td>{employee.email || "—"}</td>
                      <td>{employee.jobTitle || "—"}</td>
                      <td>{employee.departmentName || "—"}</td>
                      <td>
                        {employee.userId ? (
                          <span style={{ color: "green", fontWeight: 500 }}>
                            ✓ Đã có tài khoản
                          </span>
                        ) : (
                          <span style={{ color: "#999" }}>
                            Chưa có tài khoản
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          {!employee.userId ? (
                            <Button
                              variant="primary"
                              onClick={() => handleCreateAccount(employee)}
                              disabled={processingEmployeeId === employee.id}
                              style={{ fontSize: "13px", padding: "6px 12px" }}
                            >
                              {processingEmployeeId === employee.id
                                ? "Đang xử lý..."
                                : "Tạo tài khoản"}
                            </Button>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => handleDeleteAccount(employee)}
                              disabled={processingEmployeeId === employee.id}
                              style={{ 
                                fontSize: "13px", 
                                padding: "6px 12px",
                                backgroundColor: "#dc3545",
                                color: "white"
                              }}
                            >
                              {processingEmployeeId === employee.id
                                ? "Đang xử lý..."
                                : "Xóa tài khoản"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ marginTop: "20px", color: "#666", fontSize: "14px" }}>
            <p>
              <strong>Lưu ý:</strong>
            </p>
            <ul style={{ marginLeft: "20px", marginTop: "8px" }}>
              <li>Tài khoản được tạo tự động với tên đăng nhập là mã nhân viên</li>
              <li>Mật khẩu mặc định: <strong>123456</strong></li>
              <li>Nhân viên nên đổi mật khẩu sau khi đăng nhập lần đầu</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
