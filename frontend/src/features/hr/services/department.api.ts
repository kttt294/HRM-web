import { Department } from "../models/department.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/departments";

export const departmentApi = {
  async getAll(): Promise<Department[]> {
    const response = await authFetch(API_BASE);
    if (!response.ok) throw new Error("Failed to fetch departments");
    return response.json();
  },

  async getById(id: string): Promise<Department | null> {
    const response = await authFetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error("Failed to fetch department");
    }
    return response.json();
  },

  async create(
    data: Omit<Department, "id" | "createdAt">,
  ): Promise<Department> {
    const response = await authFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to create department");
    }
    return response.json();
  },

  async update(
    id: string,
    data: Partial<Omit<Department, "id" | "createdAt">>,
  ): Promise<Department | null> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to update department");
    }
    return response.json();
  },

  async delete(id: string): Promise<boolean> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      if (response.status === 404) return false;
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || "Failed to delete department");
    }
    return true;
  },
};
