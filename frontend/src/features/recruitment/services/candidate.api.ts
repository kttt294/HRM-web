import { Candidate } from "../models/candidate.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/recruitment/candidates";

export const candidateApi = {
  async getAll(): Promise<Candidate[]> {
    const response = await authFetch(API_BASE);
    if (!response.ok) throw new Error("Failed to fetch candidates");
    return response.json();
  },

  async getById(id: string): Promise<Candidate> {
    const response = await authFetch(`${API_BASE}/${id}`);
    if (!response.ok) throw new Error("Failed to fetch candidate");
    return response.json();
  },

  async create(data: Partial<Candidate>): Promise<Candidate> {
    const response = await authFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to create candidate");
    return response.json();
  },

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update candidate");
    return response.json();
  },

  async updateStatus(id: string, status: string): Promise<Candidate> {
    const response = await authFetch(`${API_BASE}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (!response.ok) throw new Error("Failed to update candidate status");
    return response.json();
  },
};
