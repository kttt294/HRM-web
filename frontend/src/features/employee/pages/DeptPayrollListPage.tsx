import { useState, useEffect } from "react";
import { authFetch } from "../../../utils/auth-fetch";
import { formatEmployeeId } from "../../../shared/utils/format.util";

export function DeptPayrollListPage() {
  const [salaries, setSalaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSalaries = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await authFetch("/api/salary");
        if (!response.ok) throw new Error("Không thể tải dữ liệu bảng lương");
        const data = await response.json();
        setSalaries(data);
      } catch (err) {
        console.error("Failed to fetch department salaries:", err);
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra");
      } finally {
        setLoading(false);
      }
    };
    fetchSalaries();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (error) {
     return <div className="p-4 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="dept-payroll-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1>Bảng lương phòng ban</h1>
          <p className="page-subtitle">Xem thông tin thu nhập của nhân viên trong phòng</p>
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center" }}>Đang tải...</div>
          ) : salaries.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#757575" }}>
              Không có dữ liệu bảng lương
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={{ padding: "14px 16px", textAlign: "left" }}>Nhân viên</th>
                  <th style={{ padding: "14px 16px", textAlign: "left" }}>Mã NV</th>
                  <th style={{ padding: "14px 16px", textAlign: "left" }}>Tháng/Năm</th>
                  <th style={{ padding: "14px 16px", textAlign: "right" }}>Lương thực nhận</th>
                  <th style={{ padding: "14px 16px", textAlign: "center" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {salaries.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "14px 16px", fontWeight: 500 }}>{s.employeeName}</td>
                    <td style={{ padding: "14px 16px" }}>{formatEmployeeId(s.employeeId)}</td>
                    <td style={{ padding: "14px 16px" }}>{s.month}/{s.year}</td>
                    <td style={{ padding: "14px 16px", textAlign: "right", color: "#2e7d32", fontWeight: 600 }}>
                      {formatCurrency(s.netSalary)}
                    </td>
                    <td style={{ padding: "14px 16px", textAlign: "center" }}>
                      <span className={`status-badge status-${s.status}`}>
                        {s.status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
