/**
 * User model matching RBAC role structure
 * 
 * Roles:
 * - admin: System Admin - quản lý tài khoản, phân quyền
 * - hr: HR Manager - quản lý nhân sự, tuyển dụng
 * - employee: Nhân viên - tự quản lý thông tin cá nhân
 * - candidate: Ứng viên - ứng tuyển việc làm
 */
export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: 'admin' | 'hr' | 'employee' | 'candidate';
    permissions: string[];
    avatar?: string;
    employeeId?: string;
    createdAt: string;
    updatedAt?: string;
}

