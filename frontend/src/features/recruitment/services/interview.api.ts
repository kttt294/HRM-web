import { Interview } from "../models/interview.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/recruitment/interviews";

export const interviewApi = {
  async getAll(): Promise<Interview[]> {
    const response = await authFetch(API_BASE);
    if (!response.ok) throw new Error("Failed to fetch interviews");
    return response.json();
  },

  async getByCandidateId(candidateId: string): Promise<Interview[]> {
    const response = await authFetch(`${API_BASE}?candidateId=${candidateId}`);
    if (!response.ok) throw new Error("Failed to fetch interviews");
    return response.json();
  },

  async getById(id: string): Promise<Interview> {
    const response = await authFetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch interview");
    return response.json();
  },

  async create(data: Partial<Interview>): Promise<Interview> {
    const response = await authFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create interview");
    return response.json();
  },

  async update(id: string, data: Partial<Interview>): Promise<Interview> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update interview");
    return response.json();
  },

  async updateResult(
    id: string,
    result: string,
    notes: string,
  ): Promise<Interview> {
    const response = await authFetch(`${API_BASE}/${id}/result`, {
      method: "PATCH",
      body: JSON.stringify({ result, notes }),
    });
    if (!response.ok) throw new Error("Failed to update interview result");
    return response.json();
  },
};
