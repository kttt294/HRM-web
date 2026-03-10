import { LeaveRequest, LeaveBalance } from "../models/leave.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/leaves";

export const leaveApi = {
  async getAll(params?: { status?: string; leaveType?: string }): Promise<{
    requests: (LeaveRequest & { employeeName: string })[];
    total: number;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.leaveType) queryParams.append("leaveType", params.leaveType);
    const response = await authFetch(`${API_BASE}?${queryParams}`);
    if (!response.ok) throw new Error("Failed to fetch leave requests");
    return response.json();
  },

  async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    const response = await authFetch(`${API_BASE}/employee/${employeeId}`);
    if (!response.ok) throw new Error("Failed to fetch leave requests");
    return response.json();
  },

  async getMyRequests(): Promise<LeaveRequest[]> {
    const response = await authFetch(`${API_BASE}/my`);
    if (!response.ok) throw new Error("Failed to fetch my leave requests");
    return response.json();
  },

  async getMyBalance(): Promise<LeaveBalance> {
    const response = await authFetch(`${API_BASE}/my/balance`);
    if (!response.ok) throw new Error("Failed to fetch my leave balance");
    return response.json();
  },

  async getBalance(employeeId: string): Promise<LeaveBalance> {
    const response = await authFetch(`${API_BASE}/balance/${employeeId}`);
    if (!response.ok) throw new Error("Failed to fetch leave balance");
    return response.json();
  },

  async create(
    data: Omit<LeaveRequest, "id" | "status" | "createdAt" | "employeeId" | "managerStatus" | "hrStatus"> & { employeeId?: string },
  ): Promise<LeaveRequest> {
    const response = await authFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create leave request");
    }
    return response.json();
  },

  async approve(id: string): Promise<LeaveRequest> {
    const response = await authFetch(`${API_BASE}/${id}/approve`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to approve leave request");
    return response.json();
  },

  async reject(id: string, reason?: string): Promise<LeaveRequest> {
    const response = await authFetch(`${API_BASE}/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
    if (!response.ok) throw new Error("Failed to reject leave request");
    return response.json();
  },

  async cancel(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to cancel leave request");
  },
};
