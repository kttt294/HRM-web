/**
 * ============================================
 * KIỂM SOÁT TRUY CẬP DỰA TRÊN VAI TRÒ (RBAC)
 * ============================================
 * 
 * Permissions hiện được quản lý trong database.
 * Backend cung cấp permissions qua API response.
 * Frontend sử dụng file này để type-safety và bảo vệ routes.
 * 
 * File này định nghĩa:
 * - Các vai trò trong hệ thống
 * - Các loại permission (cho TypeScript)
 * - Cấu hình truy cập routes
 */

// ============================================
// ROLE DEFINITIONS
// ============================================
export enum Role {
    ADMIN = 'admin',        // System Admin - Quản lý tài khoản, phân quyền
    HR = 'hr',              // Human Resources - Quản lý nhân sự, tuyển dụng
    EMPLOYEE = 'employee',  // Nhân viên - Tự quản lý thông tin cá nhân
}

// ============================================
// PERMISSION DEFINITIONS
// Aligned with backend database schema
// ============================================
export enum Permission {
    // ADMIN (System) permissions
    MANAGE_USERS = 'manage_users',        // Quản lý tài khoản người dùng
    MANAGE_ROLES = 'manage_roles',        // Quản lý phân quyền
    VIEW_AUDIT_LOG = 'view_audit_log',    // Xem nhật ký hệ thống
    LOCK_ACCOUNTS = 'lock_accounts',      // Khóa tài khoản
    
    // HR permissions - Employee Management
    MANAGE_EMPLOYEES = 'manage_employees',    // Quản lý hồ sơ nhân viên (toàn quyền)
    VIEW_EMPLOYEES = 'view_employees',        // Xem thông tin nhân viên
    CREATE_EMPLOYEES = 'create_employees',    // Tạo nhân viên mới
    UPDATE_EMPLOYEES = 'update_employees',    // Cập nhật thông tin nhân viên
    DELETE_EMPLOYEES = 'delete_employees',    // Xóa nhân viên
    
    // HR permissions - Recruitment
    MANAGE_RECRUITMENT = 'manage_recruitment', // Quản lý tuyển dụng (toàn quyền)
    VIEW_CANDIDATES = 'view_candidates',       // Xem ứng viên
    CREATE_VACANCIES = 'create_vacancies',     // Tạo vị trí tuyển dụng
    
    // HR permissions - Other
    VIEW_ALL_REPORTS = 'view_all_reports',    // Xem báo cáo
    CREATE_ACCOUNTS = 'create_accounts',      // Tạo tài khoản nhân viên mới
    
    // Employee permissions
    VIEW_SELF = 'view_self',          // Xem hồ sơ cá nhân
    UPDATE_SELF = 'update_self',      // Cập nhật hồ sơ cá nhân
    REQUEST_LEAVE = 'request_leave',  // Xin nghỉ phép
}

// ============================================
// ROUTE ACCESS CONFIGURATION
// ============================================
export const ROUTE_ACCESS: Record<string, Role[]> = {
    // ADMIN routes (System management)
    '/admin/users': [Role.ADMIN],
    '/admin/users/new': [Role.ADMIN],
    '/admin/users/:id': [Role.ADMIN],
    '/admin/roles': [Role.ADMIN],
    '/admin/audit-log': [Role.ADMIN],
    
    // HR routes (Employee management - PIM)
    '/hr/employees': [Role.HR],
    '/hr/employees/new': [Role.HR],
    '/hr/employees/:id': [Role.HR],
    '/hr/employees/:id/edit': [Role.HR],
    
    // HR routes (Recruitment management)
    '/recruitment': [Role.HR],
    '/recruitment/vacancies': [Role.HR],
    '/recruitment/vacancies/new': [Role.HR],
    '/recruitment/candidates': [Role.HR],
    '/recruitment/candidates/new': [Role.HR],
    '/recruitment/candidates/:id': [Role.HR],
    
    // HR routes (Leave & Payroll Management)
    '/hr/leaves': [Role.HR],
    '/hr/payroll': [Role.HR],
    '/hr/departments': [Role.HR],
    
    // Employee routes (self-service - ADMIN + HR + EMPLOYEE)
    '/my-profile': [Role.ADMIN, Role.HR, Role.EMPLOYEE],
    '/my-leaves': [Role.HR, Role.EMPLOYEE],
    '/my-payroll': [Role.HR, Role.EMPLOYEE],
};

// ============================================
// DEFAULT ROUTES PER ROLE
// Redirect đến trang phù hợp sau khi đăng nhập
// ============================================
export const DEFAULT_ROUTE_BY_ROLE: Partial<Record<Role, string>> = {
    [Role.ADMIN]: '/admin/users',
    [Role.HR]: '/my-profile',
    [Role.EMPLOYEE]: '/my-profile',
};

// ============================================
// UNAUTHORIZED ROUTE
// Trang hiển thị khi truy cập trái phép
// ============================================
export const UNAUTHORIZED_ROUTE = '/unauthorized';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Kiểm tra user có permission cụ thể không
 * @param userPermissions - Array of permission strings from backend
 * @param permission - Permission to check
 */
export function hasPermission(userPermissions: string[] | undefined, permission: Permission | string): boolean {
    if (!userPermissions) return false;
    return userPermissions.includes(permission);
}

/**
 * Kiểm tra user có một trong các permissions không
 */
export function hasAnyPermission(userPermissions: string[] | undefined, permissions: Permission[]): boolean {
    if (!userPermissions) return false;
    return permissions.some(p => userPermissions.includes(p));
}

/**
 * Kiểm tra user có tất cả permissions không
 */
export function hasAllPermissions(userPermissions: string[] | undefined, permissions: Permission[]): boolean {
    if (!userPermissions) return false;
    return permissions.every(p => userPermissions.includes(p));
}

/**
 * Kiểm tra user có role cụ thể không
 */
export function hasRole(userRole: string | undefined, allowedRoles: Role | Role[]): boolean {
    if (!userRole) return false;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    return roles.includes(userRole as Role);
}

/**
 * Kiểm tra user có quyền truy cập route không
 */
export function canAccessRoute(userRole: string | undefined, pathname: string): boolean {
    if (!userRole) return false;
    
    // Tìm route config phù hợp (support dynamic routes)
    for (const [routePattern, allowedRoles] of Object.entries(ROUTE_ACCESS)) {
        const regex = new RegExp(
            '^' + routePattern.replace(/:\w+/g, '[^/]+') + '$'
        );
        if (regex.test(pathname)) {
            return allowedRoles.includes(userRole as Role);
        }
    }
    
    // Route không được định nghĩa → cho phép tất cả authenticated users
    return true;
}

/**
 * Lấy default route cho role
 */
export function getDefaultRoute(role: string | undefined): string {
    if (!role) return '/login';
    return DEFAULT_ROUTE_BY_ROLE[role as Role] ?? '/';
}
