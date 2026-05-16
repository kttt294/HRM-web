import { authFetch } from "../../../utils/auth-fetch";
import {
  AuditLog,
  AuditLogFilters,
  AuditLogPaginationResponse,
  AuditLogStats,
} from "../models/audit-log.model";

const API_BASE = "/api/audit-logs";

export const auditLogApi = {
  /**
   * Lấy danh sách audit log có phân trang và filter
   */
  async getAuditLogs(
    filters: AuditLogFilters
  ): Promise<AuditLogPaginationResponse> {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, String(value));
      }
    });

    const response = await authFetch(`${API_BASE}?${queryParams}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit logs");
    }
    return response.json();
  },

  /**
   * Lấy chi tiết một bản ghi audit log
   */
  async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await authFetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit log details");
    }
    return response.json();
  },

  /**
   * Lấy thống kê tổng quan audit logs
   */
  async getAuditLogStats(): Promise<AuditLogStats> {
    const response = await authFetch(`${API_BASE}/stats`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch audit log stats");
    }
    return response.json();
  },
};
