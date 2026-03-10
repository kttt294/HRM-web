export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveType: 'annual' | 'sick' | 'unpaid' | 'maternity' | 'other';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    managerStatus: 'pending' | 'approved' | 'rejected';
    hrStatus: 'pending' | 'approved' | 'rejected';
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
    updatedAt?: string;
}

export interface LeaveBalance {
    employeeId: string;
    annualLeave: number;
    sickLeave: number;
    usedAnnualLeave: number;
    usedSickLeave: number;
}
