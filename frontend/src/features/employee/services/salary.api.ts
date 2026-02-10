const API_BASE = '/api/salary';

export interface SalaryRecord {
    id: string;
    employeeId: string;
    baseSalary: number;
    allowance: number;
    deductions: number;
    netSalary: number;
    month: string;
    year: number;
}

export const salaryApi = {
    async getByEmployee(employeeId: string): Promise<SalaryRecord[]> {
        const response = await fetch(`${API_BASE}?employeeId=${employeeId}`);
        if (!response.ok) throw new Error('Failed to fetch salary records');
        return response.json();
    },

    async getById(id: string): Promise<SalaryRecord> {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch salary record');
        return response.json();
    },

    async update(id: string, data: Partial<SalaryRecord>): Promise<SalaryRecord> {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update salary record');
        return response.json();
    },
};
