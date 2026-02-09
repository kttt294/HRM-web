/**
 * ============================================
 * PAYROLL MOCK API
 * ============================================
 */

import { Payroll } from '../models/payroll.model';

// Mock employees for payroll
const EMPLOYEES = [
    { id: '1', name: 'Nguyễn Văn A', department: 'Phòng Công nghệ' },
    { id: '2', name: 'Trần Thị B', department: 'Phòng Nhân sự' },
    { id: '3', name: 'Lê Văn C', department: 'Phòng Kinh doanh' },
    { id: '4', name: 'Phạm Thị D', department: 'Phòng Kế toán' },
    { id: '5', name: 'Hoàng Văn E', department: 'Phòng Công nghệ' },
];

// Generate mock payroll data
const generatePayroll = (): Payroll[] => {
    const payrolls: Payroll[] = [];
    let id = 1;
    
    // Generate 6 months of payroll for each employee
    const currentDate = new Date();
    for (let monthOffset = 0; monthOffset < 6; monthOffset++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthOffset, 1);
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        
        for (const emp of EMPLOYEES) {
            const baseSalary = 15000000 + Math.floor(Math.random() * 10000000);
            const allowances = {
                housing: 2000000,
                transport: 500000,
                meal: 800000,
                other: Math.floor(Math.random() * 1000000),
            };
            const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);
            
            const grossSalary = baseSalary + totalAllowances;
            const deductions = {
                insurance: Math.floor(grossSalary * 0.105),
                tax: Math.floor(grossSalary * 0.1),
                other: 0,
            };
            const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);
            
            payrolls.push({
                id: String(id++),
                employeeId: emp.id,
                employeeName: emp.name,
                department: emp.department,
                month,
                year,
                baseSalary,
                allowances,
                deductions,
                netSalary: grossSalary - totalDeductions,
                status: monthOffset === 0 ? 'confirmed' : 'paid',
                paidAt: monthOffset > 0 ? new Date(year, month, 5).toISOString() : undefined,
                createdAt: new Date(year, month - 1, 25).toISOString(),
            });
        }
    }
    
    return payrolls;
};

let payrolls = generatePayroll();

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const payrollApi = {
    /**
     * Get all payrolls (for HR)
     */
    async getAll(params?: { month?: number; year?: number }): Promise<{ payrolls: Payroll[]; total: number }> {
        await delay(300);
        
        let result = [...payrolls];
        
        if (params?.month) {
            result = result.filter(p => p.month === params.month);
        }
        if (params?.year) {
            result = result.filter(p => p.year === params.year);
        }
        
        // Sort by date descending
        result.sort((a, b) => {
            if (a.year !== b.year) return b.year - a.year;
            return b.month - a.month;
        });
        
        return { payrolls: result, total: result.length };
    },

    /**
     * Get payroll for specific employee (for Employee self-service)
     */
    async getByEmployee(employeeId: string): Promise<Payroll[]> {
        await delay(300);
        return payrolls.filter(p => p.employeeId === employeeId)
            .sort((a, b) => {
                if (a.year !== b.year) return b.year - a.year;
                return b.month - a.month;
            });
    },

    /**
     * Get payroll by ID
     */
    async getById(id: string): Promise<Payroll | null> {
        await delay(200);
        return payrolls.find(p => p.id === id) || null;
    },

    /**
     * Get current user's payroll (mock: returns employee ID 1)
     */
    async getMyPayroll(): Promise<Payroll[]> {
        await delay(300);
        // In real app, get from auth context
        return this.getByEmployee('1');
    },
};
