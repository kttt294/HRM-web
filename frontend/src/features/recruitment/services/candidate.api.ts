import { Candidate, CandidateStatus } from "../models/candidate.model";
import { authFetch } from "../../../utils/auth-fetch";

const API_BASE = "/api/recruitment/candidates";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }
  return response.json();
}

export const candidateApi = {
  async getAll(): Promise<Candidate[]> {
    const response = await authFetch(API_BASE);
    return handleResponse<Candidate[]>(response);
  },

  async getById(id: string): Promise<Candidate> {
    const response = await authFetch(`${API_BASE}/${id}`);
    return handleResponse<Candidate>(response);
  },

  async create(data: Partial<Candidate>): Promise<Candidate> {
    const response = await authFetch(API_BASE, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<Candidate>(response);
  },

  async update(id: string, data: Partial<Candidate>): Promise<Candidate> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return handleResponse<Candidate>(response);
  },

  async updateStatus(id: string, status: CandidateStatus): Promise<Candidate> {
    const response = await authFetch(`${API_BASE}/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return handleResponse<Candidate>(response);
  },

  async updateStatusWithNotes(
    id: string,
    data: { status: CandidateStatus; notes: string }
  ): Promise<Candidate> {
    const response = await authFetch(`${API_BASE}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return handleResponse<Candidate>(response);
  },
};

