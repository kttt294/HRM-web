import { Vacancy } from "../models/vacancy.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/recruitment";

export const recruitmentApi = {
  async getVacancies(): Promise<Vacancy[]> {
    const response = await authFetch(`${API_BASE}/vacancies`);
    if (!response.ok) throw new Error("Failed to fetch vacancies");
    return response.json();
  },

  async getVacancyById(id: string): Promise<Vacancy> {
    const response = await authFetch(`${API_BASE}/vacancies/${id}`);
    if (!response.ok) throw new Error("Failed to fetch vacancy");
    return response.json();
  },

  async createVacancy(data: Partial<Vacancy>): Promise<Vacancy> {
    const response = await authFetch(`${API_BASE}/vacancies`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Create vacancy failed:', response.status, errorData);
      throw new Error(errorData.message || `Failed to create vacancy: ${response.status}`);
    }
    
    return response.json();
  },

  async updateVacancy(id: string, data: Partial<Vacancy>): Promise<Vacancy> {
    const response = await authFetch(`${API_BASE}/vacancies/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Update vacancy failed:', response.status, errorData);
      throw new Error(errorData.message || `Failed to update vacancy: ${response.status}`);
    }
    
    return response.json();
  },

  async deleteVacancy(id: string): Promise<void> {
    const response = await authFetch(`${API_BASE}/vacancies/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete vacancy");
  },
};
