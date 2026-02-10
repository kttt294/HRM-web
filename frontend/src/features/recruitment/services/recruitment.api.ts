import { Vacancy } from '../models/vacancy.model';

const API_BASE = '/api/recruitment';

export const recruitmentApi = {
    async getVacancies(): Promise<Vacancy[]> {
        const response = await fetch(`${API_BASE}/vacancies`);
        if (!response.ok) throw new Error('Failed to fetch vacancies');
        return response.json();
    },

    async getVacancyById(id: string): Promise<Vacancy> {
        const response = await fetch(`${API_BASE}/vacancies/${id}`);
        if (!response.ok) throw new Error('Failed to fetch vacancy');
        return response.json();
    },

    async createVacancy(data: Partial<Vacancy>): Promise<Vacancy> {
        const response = await fetch(`${API_BASE}/vacancies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create vacancy');
        return response.json();
    },

    async updateVacancy(id: string, data: Partial<Vacancy>): Promise<Vacancy> {
        const response = await fetch(`${API_BASE}/vacancies/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update vacancy');
        return response.json();
    },

    async deleteVacancy(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/vacancies/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete vacancy');
    },
};
