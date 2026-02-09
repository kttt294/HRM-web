/**
 * ============================================
 * DEPARTMENT MOCK API
 * ============================================
 */

import { Department } from '../models/department.model';

// Mock data
let departments: Department[] = [
    {
        id: '1',
        name: 'Phòng Công nghệ',
        description: 'Phòng phát triển phần mềm và hệ thống công nghệ thông tin',
        location: 'Tầng 5, Tòa nhà A',
        createdAt: '2024-01-15T00:00:00Z',
    },
    {
        id: '2',
        name: 'Phòng Nhân sự',
        description: 'Quản lý tuyển dụng, đào tạo và phát triển nhân viên',
        location: 'Tầng 3, Tòa nhà A',
        createdAt: '2024-01-15T00:00:00Z',
    },
    {
        id: '3',
        name: 'Phòng Kinh doanh',
        description: 'Phát triển thị trường và chăm sóc khách hàng',
        location: 'Tầng 2, Tòa nhà B',
        createdAt: '2024-02-01T00:00:00Z',
    },
    {
        id: '4',
        name: 'Phòng Kế toán',
        description: 'Quản lý tài chính, kế toán và thuế',
        location: 'Tầng 4, Tòa nhà A',
        createdAt: '2024-02-10T00:00:00Z',
    },
    {
        id: '5',
        name: 'Phòng Marketing',
        description: 'Xây dựng thương hiệu và chiến lược truyền thông',
        location: 'Tầng 6, Tòa nhà B',
        createdAt: '2024-03-01T00:00:00Z',
    },
];

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let nextId = 6;

export const departmentApi = {
    /**
     * Get all departments
     */
    async getAll(): Promise<Department[]> {
        await delay(300);
        return [...departments];
    },

    /**
     * Get department by ID
     */
    async getById(id: string): Promise<Department | null> {
        await delay(200);
        return departments.find(d => d.id === id) || null;
    },

    /**
     * Create new department
     */
    async create(data: Omit<Department, 'id' | 'createdAt'>): Promise<Department> {
        await delay(300);
        const newDepartment: Department = {
            id: String(nextId++),
            ...data,
            createdAt: new Date().toISOString(),
        };
        departments.push(newDepartment);
        return newDepartment;
    },

    /**
     * Update department
     */
    async update(id: string, data: Partial<Omit<Department, 'id' | 'createdAt'>>): Promise<Department | null> {
        await delay(300);
        const index = departments.findIndex(d => d.id === id);
        if (index === -1) return null;
        
        departments[index] = { ...departments[index], ...data };
        return departments[index];
    },

    /**
     * Delete department
     */
    async delete(id: string): Promise<boolean> {
        await delay(200);
        const index = departments.findIndex(d => d.id === id);
        if (index === -1) return false;
        
        departments.splice(index, 1);
        return true;
    },
};
