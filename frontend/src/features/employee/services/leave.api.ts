/**
 * ============================================
 * LEAVE REQUEST MOCK API
 * ============================================
 */

import { LeaveRequest, LeaveBalance } from '../models/leave.model';

// Mock leave requests
let leaveRequests: LeaveRequest[] = [
    {
        id: '1',
        employeeId: '1',
        leaveType: 'annual',
        startDate: '2026-02-10',
        endDate: '2026-02-12',
        reason: 'Về quê thăm gia đình',
        status: 'pending',
        createdAt: '2026-02-01T08:00:00Z',
    },
    {
        id: '2',
        employeeId: '2',
        leaveType: 'sick',
        startDate: '2026-01-28',
        endDate: '2026-01-29',
        reason: 'Bị cảm, cần nghỉ ngơi',
        status: 'approved',
        approvedBy: 'HR Manager',
        approvedAt: '2026-01-27T14:00:00Z',
        createdAt: '2026-01-27T09:00:00Z',
    },
    {
        id: '3',
        employeeId: '3',
        leaveType: 'annual',
        startDate: '2026-02-20',
        endDate: '2026-02-25',
        reason: 'Đi du lịch Đà Nẵng',
        status: 'pending',
        createdAt: '2026-02-03T10:00:00Z',
    },
    {
        id: '4',
        employeeId: '1',
        leaveType: 'unpaid',
        startDate: '2026-01-15',
        endDate: '2026-01-16',
        reason: 'Việc cá nhân',
        status: 'rejected',
        approvedBy: 'HR Manager',
        approvedAt: '2026-01-14T16:00:00Z',
        createdAt: '2026-01-13T11:00:00Z',
    },
    {
        id: '5',
        employeeId: '4',
        leaveType: 'annual',
        startDate: '2026-03-01',
        endDate: '2026-03-03',
        reason: 'Đám cưới bạn',
        status: 'pending',
        createdAt: '2026-02-04T08:30:00Z',
    },
    {
        id: '6',
        employeeId: '5',
        leaveType: 'sick',
        startDate: '2026-02-05',
        endDate: '2026-02-05',
        reason: 'Đau đầu, sốt nhẹ',
        status: 'approved',
        approvedBy: 'HR Manager',
        approvedAt: '2026-02-05T07:00:00Z',
        createdAt: '2026-02-05T06:30:00Z',
    },
    {
        id: '7',
        employeeId: '2',
        leaveType: 'annual',
        startDate: '2026-02-14',
        endDate: '2026-02-14',
        reason: 'Valentine với gia đình',
        status: 'pending',
        createdAt: '2026-02-04T15:00:00Z',
    },
    {
        id: '8',
        employeeId: '1',
        leaveType: 'annual',
        startDate: '2025-12-30',
        endDate: '2026-01-02',
        reason: 'Nghỉ Tết Dương lịch',
        status: 'approved',
        approvedBy: 'HR Manager',
        approvedAt: '2025-12-25T10:00:00Z',
        createdAt: '2025-12-20T09:00:00Z',
    },
];

// Mock employee names
const EMPLOYEE_NAMES: Record<string, string> = {
    '1': 'Nguyễn Văn A',
    '2': 'Trần Thị B',
    '3': 'Lê Văn C',
    '4': 'Phạm Thị D',
    '5': 'Hoàng Văn E',
};

// Simulated delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let nextId = 9;

export const leaveApi = {
    /**
     * Get all leave requests (for HR)
     */
    async getAll(params?: { status?: string; leaveType?: string }): Promise<{ requests: (LeaveRequest & { employeeName: string })[]; total: number }> {
        await delay(300);
        
        let result = [...leaveRequests];
        
        if (params?.status) {
            result = result.filter(r => r.status === params.status);
        }
        if (params?.leaveType) {
            result = result.filter(r => r.leaveType === params.leaveType);
        }
        
        // Sort by createdAt descending
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        const withNames = result.map(r => ({
            ...r,
            employeeName: EMPLOYEE_NAMES[r.employeeId] || 'Unknown',
        }));
        
        return { requests: withNames, total: withNames.length };
    },

    /**
     * Get leave requests for specific employee
     */
    async getByEmployee(employeeId: string): Promise<LeaveRequest[]> {
        await delay(300);
        return leaveRequests
            .filter(r => r.employeeId === employeeId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },

    /**
     * Get current user's leave requests (mock: employee ID 1)
     */
    async getMyRequests(): Promise<LeaveRequest[]> {
        return this.getByEmployee('1');
    },

    /**
     * Get leave balance for employee
     */
    async getBalance(employeeId: string): Promise<LeaveBalance> {
        await delay(200);
        return {
            employeeId,
            annualLeave: 12,
            sickLeave: 10,
            usedAnnualLeave: 3,
            usedSickLeave: 1,
        };
    },

    /**
     * Create new leave request
     */
    async create(data: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>): Promise<LeaveRequest> {
        await delay(400);
        
        const newRequest: LeaveRequest = {
            ...data,
            id: String(nextId++),
            status: 'pending',
            createdAt: new Date().toISOString(),
        };
        
        leaveRequests.unshift(newRequest);
        return newRequest;
    },

    /**
     * Approve leave request (HR only)
     */
    async approve(id: string): Promise<LeaveRequest> {
        await delay(300);
        
        const request = leaveRequests.find(r => r.id === id);
        if (!request) throw new Error('Không tìm thấy đơn nghỉ phép');
        if (request.status !== 'pending') throw new Error('Đơn đã được xử lý');
        
        request.status = 'approved';
        request.approvedBy = 'HR Manager';
        request.approvedAt = new Date().toISOString();
        request.updatedAt = new Date().toISOString();
        
        return request;
    },

    /**
     * Reject leave request (HR only)
     */
    async reject(id: string, reason?: string): Promise<LeaveRequest> {
        await delay(300);
        
        const request = leaveRequests.find(r => r.id === id);
        if (!request) throw new Error('Không tìm thấy đơn nghỉ phép');
        if (request.status !== 'pending') throw new Error('Đơn đã được xử lý');
        
        request.status = 'rejected';
        request.approvedBy = 'HR Manager';
        request.approvedAt = new Date().toISOString();
        request.updatedAt = new Date().toISOString();
        
        return request;
    },

    /**
     * Cancel leave request (Employee only, pending status)
     */
    async cancel(id: string): Promise<void> {
        await delay(300);
        
        const index = leaveRequests.findIndex(r => r.id === id);
        if (index === -1) throw new Error('Không tìm thấy đơn nghỉ phép');
        if (leaveRequests[index].status !== 'pending') throw new Error('Chỉ có thể hủy đơn đang chờ duyệt');
        
        leaveRequests.splice(index, 1);
    },
};
