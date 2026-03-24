import { Employee, EmployeeSearchParams } from "../models/employee.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/employees";

export const employeeApi = {
  async getAll(params?: EmployeeSearchParams): Promise<Employee[]> {
    const queryParams = new URLSearchParams();
    if (params?.employeeName) queryParams.append("name", params.employeeName);
    if (params?.employeeId) queryParams.append("id", params.employeeId);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.departmentId)
      queryParams.append("departmentId", params.departmentId);
    if (params?.profileStatus)
      queryParams.append("profileStatus", params.profileStatus);
    if (params?.educationLevel)
      queryParams.append("educationLevel", params.educationLevel);
    if (params?.englishCertificate)
      queryParams.append("englishCertificate", params.englishCertificate);
    if (params?.schoolName)
      queryParams.append("schoolName", params.schoolName);
    if (params?.tenure)
      queryParams.append("tenure", params.tenure);
    if (params?.totalLeaveDays) {
      queryParams.append("totalLeaveDays", String(params.totalLeaveDays));
      queryParams.append("totalLeaveDaysOp", params.totalLeaveDaysOp || 'gte');
    }
    if (params?.remainingLeaveDays) {
      queryParams.append("remainingLeaveDays", String(params.remainingLeaveDays));
      queryParams.append("remainingLeaveDaysOp", params.remainingLeaveDaysOp || 'gte');
    }
    if (params?.baseSalary) {
      queryParams.append("baseSalary", String(params.baseSalary));
      queryParams.append("baseSalaryOp", params.baseSalaryOp || 'gte');
    }

    const response = await authFetch(`${API_BASE}?${queryParams}`);
    if (!response.ok) throw new Error("Failed to fetch employees");
    return response.json();
  },

  async getMe(): Promise<Employee> {
    const response = await authFetch(`${API_BASE}/me`);
    if (!response.ok) throw new Error("Failed to fetch my profile");
    return response.json();
  },

  async updateMe(data: Partial<Employee>): Promise<Employee> {
    const response = await authFetch(`${API_BASE}/me`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorBody = await response.text();
      console.error('updateMe failed:', response.status, errorBody);
      throw new Error(errorBody || "Failed to update my profile");
    }
    return response.json();
  },

  async getById(id: string): Promise<Employee> {
    const response = await authFetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch employee");
    return response.json();
  },

  async create(data: Partial<Employee>): Promise<Employee> {
    const response = await authFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create employee");
    }
    return response.json();
  },

  async update(id: string, data: Partial<Employee>): Promise<Employee> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update employee");
    }
    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete employee");
  },

  async updateRole(id: string, roleId: number): Promise<void> {
    const response = await authFetch(`${API_BASE}/${id}/role`, {
      method: "PATCH",
      body: JSON.stringify({ roleId }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update role");
    }
  },

  async verifyProfile(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/${id}/verify`, {
      method: "POST"
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to verify profile");
    }
  },

  async getPendingUpdates(): Promise<any[]> {
    const response = await authFetch(`${API_BASE}/pending-updates`);
    if (!response.ok) throw new Error("Failed to fetch pending updates");
    return response.json();
  },

  async approveUpdate(updateId: number): Promise<void> {
    const response = await authFetch(`${API_BASE}/updates/${updateId}/approve`, {
      method: "POST"
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to approve update");
    }
  },

  async rejectUpdate(updateId: number, notes?: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/updates/${updateId}/reject`, {
      method: "POST",
      body: JSON.stringify({ notes })
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to reject update");
    }
  },
};
