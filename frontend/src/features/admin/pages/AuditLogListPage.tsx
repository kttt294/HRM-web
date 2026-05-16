import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuditLog, AuditLogFilters } from "../models/audit-log.model";
import { auditLogApi } from "../services/audit-log.api";
import { Input } from "../../../components/ui/Input";
import { Select } from "../../../components/ui/Select";
import anime from "animejs";
import { useSnackbarStore } from "../../../store/snackbar.store";
import { getAvatarUrl } from "../../../shared/utils/avatar.util";

export function AuditLogListPage() {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { showSnackbar } = useSnackbarStore();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 20,
    search: "",
    statusCode: "",
    method: "",
    startDate: "",
    endDate: "",
  });
  
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchLogs();
  }, [filters.page, filters.limit, filters.search, filters.statusCode, filters.method, filters.startDate, filters.endDate]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await auditLogApi.getAuditLogs(filters);
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Lỗi tải danh sách log", "error");
    } finally {
      setLoading(false);
    }
  };

  // Animation
  useEffect(() => {
    if (containerRef.current && !loading) {
      anime({
        targets: containerRef.current.querySelectorAll(".log-row"),
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 400,
        delay: anime.stagger(30),
        easing: "easeOutQuart",
      });
    }
  }, [loading, logs]);

  const handleFilterChange = (key: keyof AuditLogFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 })); // Reset to page 1 on filter change
  };

  const getMethodColor = (method: string | null) => {
    switch (method?.toUpperCase()) {
      case "GET": return { bg: "#e3f2fd", color: "#1976d2" }; // Xanh
      case "POST": return { bg: "#e8f5e9", color: "#2e7d32" }; // Xanh lá
      case "PUT":
      case "PATCH": return { bg: "#fff3e0", color: "#f57c00" }; // Cam
      case "DELETE": return { bg: "#ffebee", color: "#c62828" }; // Đỏ
      default: return { bg: "#f5f5f5", color: "#757575" };
    }
  };

  const getStatusColor = (statusCode: number | null) => {
    if (!statusCode) return { bg: "#f5f5f5", color: "#757575" };
    if (statusCode >= 200 && statusCode < 300) return { bg: "#e8f5e9", color: "#2e7d32" }; // 2xx Xanh lá
    if (statusCode >= 400 && statusCode < 500) return { bg: "#fff3e0", color: "#f57c00" }; // 4xx Cam
    if (statusCode >= 500) return { bg: "#ffebee", color: "#c62828" }; // 5xx Đỏ
    return { bg: "#f5f5f5", color: "#757575" };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  return (
    <div ref={containerRef}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-section">
          <h1>Lịch sử hoạt động (Audit Logs)</h1>
          <p className="page-subtitle">Giám sát và theo dõi các thao tác trên hệ thống</p>
        </div>
      </div>


      {/* Filters */}
      <div style={{
        display: "flex",
        gap: "16px",
        marginBottom: "24px",
        flexWrap: "wrap",
        alignItems: "flex-end",
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
      }}>
        <div style={{ flex: 1, minWidth: "250px" }}>
          <Input
            label="Tìm kiếm người dùng"
            placeholder="Username, họ tên..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        
        <div style={{ width: "150px" }}>
          <Select
            label="Phương thức"
            value={filters.method || ""}
            onChange={(e) => handleFilterChange("method", e.target.value)}
            options={[
              { value: "", label: "Tất cả Method" },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "PATCH", label: "PATCH" },
              { value: "DELETE", label: "DELETE" },
            ]}
          />
        </div>

        <div style={{ width: "160px" }}>
          <Select
            label="Trạng thái HTTP"
            value={filters.statusCode || ""}
            onChange={(e) => handleFilterChange("statusCode", e.target.value)}
            options={[
              { value: "", label: "Tất cả Trạng thái" },
              { value: "2xx", label: "Thành công (2xx)" },
              { value: "4xx", label: "Lỗi Client (4xx)" },
              { value: "5xx", label: "Lỗi Server (5xx)" },
            ]}
          />
        </div>

        <div style={{ width: "150px" }}>
          <Input
            label="Từ ngày"
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
          />
        </div>
        <div style={{ width: "150px" }}>
          <Input
            label="Đến ngày"
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div style={{
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        {loading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#757575" }}>Đang tải dữ liệu...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#757575" }}>Không tìm thấy bản ghi nào phù hợp.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
              <thead>
                <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #e0e0e0" }}>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px", color: "#424242" }}>Thời gian</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px", color: "#424242" }}>Người dùng</th>
                  <th style={{ padding: "14px 16px", textAlign: "left", fontSize: "13px", color: "#424242" }}>Hành động</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "13px", color: "#424242" }}>Method</th>
                  <th style={{ padding: "14px 16px", textAlign: "center", fontSize: "13px", color: "#424242" }}>Status</th>
                  <th style={{ padding: "14px 16px", textAlign: "right", fontSize: "13px", color: "#424242" }}>Thời gian xử lý</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr 
                    key={log.id} 
                    className="log-row"
                    onClick={() => navigate(`/admin/audit-logs/${log.id}`)}
                    style={{ 
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "background 0.2s",
                      opacity: 0, // for initial animejs state
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <td style={{ padding: "12px 16px", fontSize: "13px", color: "#616161", whiteSpace: "nowrap" }}>
                      {formatDate(log.created_at)}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <img 
                          src={getAvatarUrl(log.user_avatar, log.full_name || log.username || "User")} 
                          alt="avatar" 
                          style={{ width: "32px", height: "32px", borderRadius: "50%", objectFit: "cover" }} 
                        />
                        <div>
                          <div style={{ fontWeight: 500, fontSize: "14px", color: "#212121" }}>{log.full_name || log.username || "System"}</div>
                          <div style={{ fontSize: "12px", color: "#757575" }}>{log.role_name || "N/A"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 500, color: "#1976d2", fontSize: "13px" }}>{log.action}</div>
                      <div style={{ fontSize: "12px", color: "#757575" }}>
                        {log.resource ? `${log.resource} ${log.resource_id ? `(#${log.resource_id})` : ""}` : "-"}
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {log.method ? (
                        <span style={{
                          padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 600,
                          backgroundColor: getMethodColor(log.method).bg,
                          color: getMethodColor(log.method).color,
                        }}>
                          {log.method}
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      {log.status_code ? (
                         <span style={{
                          padding: "4px 8px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                          backgroundColor: getStatusColor(log.status_code).bg,
                          color: getStatusColor(log.status_code).color,
                        }}>
                          {log.status_code}
                        </span>
                      ) : "-"}
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", color: "#616161" }}>
                      {log.response_time ? `${log.response_time} ms` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e0e0e0" }}>
            <span style={{ fontSize: "13px", color: "#757575" }}>Trang {filters.page} / {totalPages}</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                disabled={filters.page === 1}
                onClick={() => handleFilterChange("page", (filters.page || 1) - 1)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", background: filters.page === 1 ? "#f5f5f5" : "white", cursor: filters.page === 1 ? "not-allowed" : "pointer" }}
              >
                Trước
              </button>
              <button 
                disabled={filters.page === totalPages}
                onClick={() => handleFilterChange("page", (filters.page || 1) + 1)}
                style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #d9d9d9", background: filters.page === totalPages ? "#f5f5f5" : "white", cursor: filters.page === totalPages ? "not-allowed" : "pointer" }}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


