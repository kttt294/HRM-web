import { authFetch } from "../../../utils/auth-fetch";

export const jobTitleApi = {
  async getAll() {
    try {
      const response = await authFetch("/api/job-titles");
      if (!response.ok) return [];
      return response.json();
    } catch (err) {
      console.warn("Job Title API failed, using empty list", err);
      return [];
    }
  }
};
