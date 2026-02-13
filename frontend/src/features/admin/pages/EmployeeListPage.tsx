import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { adminEmployeeApi, Employee } from "../services/employee.api";
import { useSnackbarStore } from "../../../store/snackbar.store";

export function EmployeeListPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingEmployeeId, setProcessingEmployeeId] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "create" | "delete" | null;
    employee: Employee | null;
  }>({
    isOpen: false,
    type: null,
    employee: null,
  });



  const [selectedRole, setSelectedRole] = useState<number>(3);
  const { showSnackbar } = useSnackbarStore();

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

  const handleCreateAccount = (employee: Employee) => {
    setSelectedRole(3);
    setConfirmModal({
      isOpen: true,
      type: "create",
      employee: employee,
    });
  };

  const handleDeleteAccount = (employee: Employee) => {
    if (!employee.userId) return;
    setConfirmModal({
      isOpen: true,
      type: "delete",
      employee: employee,
    });
  };

  const handleConfirmAction = async () => {
    const { type, employee } = confirmModal;
    if (!employee || !type) return;

    try {
      setProcessingEmployeeId(employee.id);
      setConfirmModal({ ...confirmModal, isOpen: false });

      if (type === "create") {
        await adminEmployeeApi.createUserAccount(
          employee.id,
          employee.fullName,
          selectedRole
        );

      } else {
        if (!employee.userId) return;
        await adminEmployeeApi.deleteUserAccount(
          employee.id,
          employee.userId
        );

      }
      
      await loadEmployees();
      showSnackbar(`${type === 'create' ? 'Tạo' : 'Xóa'} tài khoản thành công`, 'success');
    } catch (err: any) {
      console.error(`Failed to ${type} account:`, err);
      showSnackbar(`Lỗi: ${err.message}`, 'error');
    } finally {
      setProcessingEmployeeId(null);
      setConfirmModal({ isOpen: false, type: null, employee: null });
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

                      <td>{employee.jobTitle || "—"}</td>
                      <td>{employee.departmentName || "—"}</td>
                      <td>
                        {employee.userId ? (
                          <span style={{ color: "green", fontWeight: 500 }}>
                            Đã có tài khoản
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
            </ul>
          </div>
        </div>
      </div>
      <Modal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        title={
          confirmModal.type === "create" 
            ? `Tạo tài khoản cho ${confirmModal.employee?.fullName}` 
            : `Xóa tài khoản của ${confirmModal.employee?.fullName}`
        }
      >
        <div style={{ padding: "8px 0", minWidth: "450px" }}>
          <div style={{ marginBottom: "16px", fontSize: "15px", lineHeight: "1.5" }}>
            {confirmModal.type === "create" ? (
              <>
                <div style={{ marginBottom: "16px" }}>
                  <label style={{ display: "block", marginBottom: "6px", fontWeight: "500", fontSize: "14px" }}>
                    Chọn vai trò:
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      outline: "none"
                    }}
                  >
                    <option value={3}>Nhân viên (Employee)</option>
                    <option value={2}>Quản lý nhân sự (HR)</option>
                    <option value={1}>Quản trị viên (Admin)</option>
                  </select>
                </div>

                <div style={{ background: "#e3f2fd", padding: "12px", borderRadius: "8px", fontSize: "13px", color: "#0d47a1" }}>
                  Tên đăng nhập: <strong>{confirmModal.employee ? confirmModal.employee.id.toLowerCase().replace(/[^a-z0-9]/g, "") : ""}</strong>
                  <br/>
                  Mật khẩu mặc định: <strong>123456</strong>
                </div>
              </>
            ) : (
              <div style={{ padding: "18px", background: "#fff5f5", borderRadius: "8px", color: "#c53030", fontSize: "15px", border: "1px solid #fed7d7" }}>
                 ⚠️ Tài khoản sẽ bị xóa vĩnh viễn và không thể hoàn tác.
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "24px" }}>
            <Button
              variant="secondary"
              onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
            >
              Hủy
            </Button>
            <Button
              variant={confirmModal.type === "create" ? "primary" : "danger"}
              onClick={handleConfirmAction}
              style={confirmModal.type === "delete" ? { backgroundColor: "#dc3545", color: "white" } : {}}
            >
              {confirmModal.type === "create" ? "Tạo tài khoản" : "Xóa tài khoản"}
            </Button>
          </div>
        </div>
      </Modal>


    </>
  );
}
