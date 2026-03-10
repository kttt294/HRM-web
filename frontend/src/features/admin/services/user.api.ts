import { SystemUser, CreateUserDto, UpdateUserDto } from "../models/user.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/users";

export const userApi = {
  async getUsers(params?: {
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{ users: SystemUser[] }> {
    const queryParams = new URLSearchParams();
    if (params?.role) queryParams.append("role", params.role);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.search) queryParams.append("search", params.search);
    const response = await authFetch(`${API_BASE}?${queryParams}`);
    if (!response.ok) throw new Error("Failed to fetch users");
    const users = await response.json();
    return { users };
  },

  async getUserById(id: string): Promise<SystemUser> {
    const response = await authFetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch user");
    return response.json();
  },

  async createUser(data: CreateUserDto): Promise<SystemUser> {
    // Convert role string to roleId number
    const roleIdMap: Record<string, number> = {
      'admin': 1,
      'hr': 2,
      'manager': 3,
      'employee': 4,
    };
    
    const payload = {
      ...data,
      roleId: roleIdMap[data.role],
    };
    
    const response = await authFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create user");
    }
    return response.json();
  },

  async updateUser(id: string, data: UpdateUserDto): Promise<SystemUser> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update user");
    }
    return response.json();
  },

  async deleteUser(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete user");
    }
  },

  async resetPassword(id: string): Promise<{ tempPassword: string }> {
    const response = await authFetch(`${API_BASE}/${id}/reset-password`, {
      method: "POST",
    });
    if (!response.ok) throw new Error("Failed to reset password");
    return response.json();
  },

  async toggleLock(id: string): Promise<SystemUser> {
    const response = await authFetch(`${API_BASE}/${id}/toggle-lock`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Failed to toggle lock status");
    return response.json();
  },
};
