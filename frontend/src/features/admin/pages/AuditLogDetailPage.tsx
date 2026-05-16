import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuditLog } from "../models/audit-log.model";
import { auditLogApi } from "../services/audit-log.api";
import { Button } from "../../../components/ui/Button";
import { useSnackbarStore } from "../../../store/snackbar.store";
import { getAvatarUrl } from "../../../shared/utils/avatar.util";

export function AuditLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbarStore();
  const [log, setLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchLogDetails(parseInt(id));
    }
  }, [id]);

  const fetchLogDetails = async (logId: number) => {
    setLoading(true);
    try {
      const data = await auditLogApi.getAuditLogById(logId);
      setLog(data);
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : "Lỗi tải chi tiết log", "error");
      navigate("/admin/audit-logs");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };

  const getMethodColor = (method: string | null) => {
    switch (method?.toUpperCase()) {
      case "GET": return { bg: "#e3f2fd", color: "#1976d2" };
      case "POST": return { bg: "#e8f5e9", color: "#2e7d32" };
      case "PUT":
      case "PATCH": return { bg: "#fff3e0", color: "#f57c00" };
      case "DELETE": return { bg: "#ffebee", color: "#c62828" };
      default: return { bg: "#f5f5f5", color: "#757575" };
    }
  };

  const getStatusColor = (statusCode: number | null) => {
    if (!statusCode) return { bg: "#f5f5f5", color: "#757575" };
    if (statusCode >= 200 && statusCode < 300) return { bg: "#e8f5e9", color: "#2e7d32" };
    if (statusCode >= 400 && statusCode < 500) return { bg: "#fff3e0", color: "#f57c00" };
    if (statusCode >= 500) return { bg: "#ffebee", color: "#c62828" };
    return { bg: "#f5f5f5", color: "#757575" };
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Đang tải chi tiết log...</div>;
  }

  if (!log) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Không tìm thấy bản ghi log.</div>;
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Button variant="secondary" onClick={() => navigate("/admin/audit-logs")}>
            &larr; Quay lại
          </Button>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 600, margin: 0, color: "#212121" }}>Chi tiết Audit Log #{log.id}</h1>
            <p style={{ margin: "4px 0 0 0", color: "#757575", fontSize: "14px" }}>{formatDate(log.created_at)}</p>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        
        {/* General Info Card */}
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 20px 0", paddingBottom: "12px", borderBottom: "1px solid #eeeeee", color: "#1976d2" }}>
            Thông tin Request (General)
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <InfoRow label="Action" value={<span style={{ fontWeight: 600, color: "#424242" }}>{log.action}</span>} />
            
            <InfoRow label="URL Endpoint" value={
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {log.method && (
                  <span style={{
                    padding: "2px 6px", borderRadius: "4px", fontSize: "12px", fontWeight: 600,
                    backgroundColor: getMethodColor(log.method).bg,
                    color: getMethodColor(log.method).color,
                  }}>
                    {log.method}
                  </span>
                )}
                <span style={{ wordBreak: "break-all", fontFamily: "monospace", fontSize: "13px" }}>{log.endpoint || "N/A"}</span>
              </div>
            } />
            
            <InfoRow label="Status Code" value={
              log.status_code ? (
                <span style={{
                  padding: "4px 8px", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
                  backgroundColor: getStatusColor(log.status_code).bg,
                  color: getStatusColor(log.status_code).color,
                }}>
                  {log.status_code}
                </span>
              ) : "N/A"
            } />
            
            <InfoRow label="Response Time" value={log.response_time ? `${log.response_time} ms` : "N/A"} />
            <InfoRow label="IP Address" value={<span style={{ fontFamily: "monospace" }}>{log.ip_address || "N/A"}</span>} />
            <InfoRow label="User Agent" value={<span style={{ fontSize: "13px", color: "#616161" }}>{log.user_agent || "N/A"}</span>} />
            
            <InfoRow label="Target Resource" value={
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ background: "#f5f5f5", padding: "2px 8px", borderRadius: "4px", fontSize: "13px" }}>{log.resource || "N/A"}</span>
                {log.resource_id && <span style={{ background: "#e3f2fd", color: "#1976d2", padding: "2px 8px", borderRadius: "4px", fontSize: "13px" }}>ID: {log.resource_id}</span>}
              </div>
            } />
          </div>
        </div>

        {/* User Context Card */}
        <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 20px 0", paddingBottom: "12px", borderBottom: "1px solid #eeeeee", color: "#9c27b0" }}>
            Người thực hiện (User Context)
          </h2>
          
          {log.user_id ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
                <img 
                  src={getAvatarUrl(log.user_avatar, log.full_name || log.username || "User")} 
                  alt="avatar" 
                  style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "3px solid #f5f5f5" }} 
                />
                <div>
                  <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", color: "#212121" }}>{log.full_name || "N/A"}</h3>
                  <div style={{ color: "#757575", fontSize: "14px", marginBottom: "8px" }}>@{log.username}</div>
                  <span style={{ background: "#e3f2fd", color: "#1976d2", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 500 }}>
                    {log.role_name || "N/A"}
                  </span>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <InfoRow label="User ID" value={`#${log.user_id}`} />
                <InfoRow label="Employee ID" value={log.employee_id ? `#${log.employee_id}` : "N/A"} />
                <InfoRow label="Phòng ban" value={log.department_name || "N/A"} />
                <InfoRow label="Chức vụ" value={log.job_title_name || "N/A"} />
              </div>
              
              {log.employee_id && (
                <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #eeeeee" }}>
                  <Button 
                    onClick={() => navigate(`/hr/employees/${log.employee_id}`)}
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    Xem hồ sơ nhân viên
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: "center", color: "#757575", padding: "20px" }}>
              Không có thông tin người dùng (System Action / Unauthenticated)
            </div>
          )}
        </div>
      </div>

      {/* Data Changes Card */}
      <div style={{ background: "white", borderRadius: "12px", padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 600, margin: "0 0 20px 0", paddingBottom: "12px", borderBottom: "1px solid #eeeeee", color: "#4caf50" }}>
          Dữ liệu thay đổi (Payload / Details)
        </h2>
        
        {log.details ? (
          <div style={{ background: "#1e1e1e", borderRadius: "8px", padding: "16px", overflowX: "auto" }}>
            <pre style={{ margin: 0, color: "#d4d4d4", fontSize: "13px", fontFamily: "Consolas, monospace" }}>
              {JSON.stringify(typeof log.details === 'string' ? JSON.parse(log.details) : log.details, null, 2)}
            </pre>
          </div>
        ) : (
          <div style={{ textAlign: "center", color: "#757575", padding: "40px", background: "#f9f9f9", borderRadius: "8px" }}>
            Không có dữ liệu payload/details đi kèm.
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", alignItems: "baseline" }}>
      <div style={{ color: "#757575", fontSize: "14px", fontWeight: 500 }}>{label}</div>
      <div style={{ color: "#212121", fontSize: "14px", wordBreak: "break-word" }}>{value}</div>
    </div>
  );
}
