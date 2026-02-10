/**
 * User model matching RBAC role structure
 * 
 * Roles:
 * - admin: System Admin - quản lý tài khoản, phân quyền
 * - hr: HR Manager - quản lý nhân sự, tuyển dụng
 * - employee: Nhân viên - tự quản lý thông tin cá nhân
 * Lưu ý: Candidate KHÔNG có role vì không cần đăng nhập (public routes)
 */
export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: 'admin' | 'hr' | 'employee';
    permissions: string[];
    avatar?: string;
    employeeId?: string;
    createdAt: string;
    updatedAt?: string;
}

