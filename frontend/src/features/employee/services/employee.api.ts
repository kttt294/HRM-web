import { Employee, EmployeeSearchParams } from '../models/employee.model';

const API_BASE = '/api/employees';

export const employeeApi = {
    async getAll(params?: EmployeeSearchParams): Promise<Employee[]> {
        const queryParams = new URLSearchParams();
        if (params?.employeeName) queryParams.append('name', params.employeeName);
        if (params?.employeeId) queryParams.append('id', params.employeeId);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.departmentId) queryParams.append('departmentId', params.departmentId);

        const response = await fetch(`${API_BASE}?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch employees');
        return response.json();
    },

    async getById(id: string): Promise<Employee> {
        const response = await fetch(`${API_BASE}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch employee');
        return response.json();
    },

    async create(data: Partial<Employee>): Promise<Employee> {
        const response = await fetch(API_BASE, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to create employee');
        return response.json();
    },

    async update(id: string, data: Partial<Employee>): Promise<Employee> {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update employee');
        return response.json();
    },

    async delete(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete employee');
    },
};
