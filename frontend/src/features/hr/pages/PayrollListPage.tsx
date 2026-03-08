import { useState, useEffect, useRef } from "react";
import { payrollApi } from "../services/payroll.api";
import { Payroll } from "../models/payroll.model";
import anime from "animejs";

/**
 * ============================================
 * PAYROLL LIST PAGE - HR
 * ============================================
 * Xem bảng lương tất cả nhân viên
 */

export function PayrollListPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [loading, setLoading] = useState(true);
  const getDefaultDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    };
  };

  const defaultDate = getDefaultDate();

  const [monthFilter, setMonthFilter] = useState<number>(defaultDate.month);
  const [yearFilter, setYearFilter] = useState<number>(defaultDate.year);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);

  const fetchPayrolls = async () => {
    setLoading(true);
    try {
      const result = await payrollApi.getAll({
        month: monthFilter,
        year: yearFilter,
      });
      setPayrolls(result.payrolls);
    } catch (error) {
      console.error("Failed to fetch payrolls:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrolls();
  }, [monthFilter, yearFilter]);

  useEffect(() => {
    if (containerRef.current && !loading) {
      anime({
        targets: containerRef.current.querySelectorAll(".payroll-row"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: anime.stagger(50),
        easing: "easeOutQuart",
      });
    }
  }, [loading, payrolls]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      draft: "Nháp",
      confirmed: "Đã xác nhận",
      paid: "Đã thanh toán",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#ff9800",
      confirmed: "#1976d2",
      paid: "#4caf50",
    };
    return colors[status] || "#757575";
  };

  // Stats
  const totalNetSalary = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const paidCount = payrolls.filter((p) => p.status === "paid").length;

  // Generate month options
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from(
    { length: 3 },
    (_, i) => new Date().getFullYear() - i,
  );

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="page-header">
        <h1>Bảng lương</h1>
        <p className="page-subtitle">
          Quản lý và xem bảng lương của tất cả nhân viên
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            padding: "20px 28px",
            background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
            borderRadius: "16px",
            color: "white",
            minWidth: "200px",
          }}
        >
          <div style={{ fontSize: "14px", opacity: 0.9, marginBottom: "4px" }}>
            Tổng lương tháng {monthFilter}
          </div>
          <div style={{ fontSize: "28px", fontWeight: "700" }}>
            {formatCurrency(totalNetSalary)}
          </div>
        </div>
        <div
          style={{
            padding: "16px 24px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            minWidth: "120px",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: "#4caf50" }}
          >
            {paidCount}
          </div>
          <div style={{ fontSize: "13px", color: "#757575" }}>
            Đã thanh toán
          </div>
        </div>
        <div
          style={{
            padding: "16px 24px",
            background: "white",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            minWidth: "120px",
          }}
        >
          <div
            style={{ fontSize: "24px", fontWeight: "700", color: "#1976d2" }}
          >
            {payrolls.length}
          </div>
          <div style={{ fontSize: "13px", color: "#757575" }}>
            Tổng nhân viên
          </div>
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "13px",
              color: "#757575",
            }}
          >
            Tháng
          </label>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(Number(e.target.value))}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              fontSize: "14px",
              minWidth: "120px",
            }}
          >
            {months.map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "4px",
              fontSize: "13px",
              color: "#757575",
            }}
          >
            Năm
          </label>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(Number(e.target.value))}
            style={{
              padding: "10px 16px",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
              fontSize: "14px",
              minWidth: "120px",
            }}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Payroll Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#757575" }}
          >
            Đang tải...
          </div>
        ) : payrolls.length === 0 ? (
          <div
            style={{ padding: "40px", textAlign: "center", color: "#757575" }}
          >
            Không có dữ liệu bảng lương
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Nhân viên
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Mã NV
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Phòng ban
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "right",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Lương cơ bản
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "right",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Phụ cấp
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "right",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Khấu trừ
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "right",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Thực nhận
                </th>
                <th
                  style={{
                    padding: "14px 16px",
                    textAlign: "center",
                    fontWeight: "600",
                    fontSize: "13px",
                  }}
                >
                  Trạng thái
                </th>
              </tr>
            </thead>
              <tbody>
                {payrolls.map((payroll) => {
                  return (
                    <tr
                      key={payroll.id}
                      className="payroll-row"
                      onClick={() => setSelectedPayroll(payroll)}
                      style={{
                        borderBottom: "1px solid #f0f0f0",
                        opacity: 0,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#fafafa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ fontWeight: "500" }}>
                          {payroll.employeeName}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          color: "#616161",
                          fontFamily: "monospace",
                        }}
                      >
                        {payroll.employeeId}
                      </td>
                      <td style={{ padding: "14px 16px", color: "#616161" }}>
                        {payroll.department}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "right",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatCurrency(payroll.baseSalary)}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "right",
                          color: "#4caf50",
                          fontFamily: "monospace",
                        }}
                      >
                        +{formatCurrency(payroll.allowance)}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "right",
                          color: "#f44336",
                          fontFamily: "monospace",
                        }}
                      >
                        -{formatCurrency(payroll.deduction)}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          textAlign: "right",
                          fontWeight: "600",
                          fontFamily: "monospace",
                        }}
                      >
                        {formatCurrency(payroll.netSalary)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "center" }}>
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "12px",
                            fontSize: "12px",
                            fontWeight: "500",
                            background: `${getStatusColor(payroll.status)}15`,
                            color: getStatusColor(payroll.status),
                          }}
                        >
                          {getStatusLabel(payroll.status)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
  
        {/* Detail Modal */}
        {selectedPayroll && (
          <PayrollDetailModal
            payroll={selectedPayroll}
            onClose={() => setSelectedPayroll(null)}
            formatCurrency={formatCurrency}
          />
        )}
      </div>
    );
  }
  
  function PayrollDetailModal({
    payroll,
    onClose,
    formatCurrency,
  }: {
    payroll: Payroll;
    onClose: () => void;
    formatCurrency: (n: number) => string;
  }) {
  
    return (
      <div
        onClick={(e) => e.target === e.currentTarget && onClose()}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "32px",
            maxWidth: "420px",
            width: "90%",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "20px" }}>Chi tiết phiếu lương</h2>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#757575",
              }}
            >
              ×
            </button>
          </div>
  
          <div
            style={{
              marginBottom: "20px",
              padding: "16px",
              background: "#f5f5f5",
              borderRadius: "12px",
            }}
          >
            <div style={{ fontWeight: "600", fontSize: "18px" }}>
              {payroll.employeeName}
            </div>
            <div style={{ color: "#757575", fontSize: "14px" }}>
              {payroll.department}
            </div>
            <div style={{ color: "#757575", fontSize: "14px" }}>
              Tháng {payroll.month}/{payroll.year}
            </div>
          </div>
  
          <div style={{ marginBottom: "16px" }}>
            <h4
              style={{
                margin: "0 0 12px",
                color: "#757575",
                fontSize: "13px",
                textTransform: "uppercase",
              }}
            >
              Chi tiết thu nhập
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <DetailRow
                label="Lương cơ bản"
                value={formatCurrency(payroll.baseSalary)}
              />
              <DetailRow
                label="Tổng phụ cấp"
                value={formatCurrency(payroll.allowance)}
                color="#2e7d32"
              />
            </div>
          </div>
  
          <div style={{ marginBottom: "16px" }}>
            <h4
              style={{
                margin: "0 0 12px",
                color: "#757575",
                fontSize: "13px",
                textTransform: "uppercase",
              }}
            >
              Chi tiết khấu trừ
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <DetailRow
                label="Tổng khấu trừ"
                value={`-${formatCurrency(payroll.deduction)}`}
                color="#c62828"
              />
            </div>
          </div>
  
          <div
            style={{
              padding: "16px",
              background: "linear-gradient(135deg, #1565c0 0%, #42a5f5 100%)",
              borderRadius: "12px",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "16px" }}>Thực nhận</span>
            <span style={{ fontSize: "24px", fontWeight: "700" }}>
              {formatCurrency(payroll.netSalary)}
            </span>
          </div>
        </div>
      </div>
    );
  }

function DetailRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid #f0f0f0",
      }}
    >
      <span style={{ color: "#616161" }}>{label}</span>
      <span
        style={{
          fontWeight: "500",
          fontFamily: "monospace",
          color: color || "#212121",
        }}
      >
        {value}
      </span>
    </div>
  );
}
