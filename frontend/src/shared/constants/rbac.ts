/**
 * ============================================
 * ROLE-BASED ACCESS CONTROL (RBAC)
 * ============================================
 * 
 * Đây là mô phỏng phân quyền frontend-only.
 * Trong production, việc phân quyền PHẢI được validate ở backend.
 * Frontend chỉ nên ẩn UI, backend mới thực sự chặn request.
 * 
 * File này định nghĩa:
 * - Các role trong hệ thống
 * - Permissions cho mỗi role
 * - Route access patterns
 */

// ============================================
// ROLE DEFINITIONS
// ============================================
// Note: CANDIDATE role removed - candidate routes are PUBLIC (no authentication needed)
export enum Role {
    ADMIN = 'admin',        // System Admin - Quản lý tài khoản, phân quyền
    HR = 'hr',              // Human Resources - Quản lý nhân sự, tuyển dụng
    EMPLOYEE = 'employee',  // Nhân viên - Tự quản lý thông tin cá nhân
}

// ============================================
// PERMISSION DEFINITIONS
// ============================================
export enum Permission {
    // ADMIN (System) permissions
    MANAGE_USERS = 'manage_users',        // Quản lý tài khoản người dùng
    MANAGE_ROLES = 'manage_roles',        // Quản lý phân quyền
    VIEW_AUDIT_LOG = 'view_audit_log',    // Xem nhật ký hệ thống
    LOCK_ACCOUNTS = 'lock_accounts',      // Khóa tài khoản
    
    // HR permissions
    MANAGE_EMPLOYEES = 'manage_employees',    // Quản lý hồ sơ nhân viên
    MANAGE_RECRUITMENT = 'manage_recruitment', // Quản lý tuyển dụng
    VIEW_ALL_REPORTS = 'view_all_reports',    // Xem báo cáo
    CREATE_ACCOUNTS = 'create_accounts',      // Tạo tài khoản nhân viên mới
    MANAGE_CONTRACTS = 'manage_contracts',    // Quản lý hợp đồng
    
    // Employee permissions
    VIEW_SELF = 'view_self',
    UPDATE_SELF = 'update_self',
    REQUEST_LEAVE = 'request_leave',
    VIEW_COMPANY_INFO = 'view_company_info',
}

// ============================================
// ROLE-PERMISSION MAPPING
// ============================================
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
        // ADMIN chỉ có quyền quản lý hệ thống
        Permission.MANAGE_USERS,
        Permission.MANAGE_ROLES,
        Permission.VIEW_AUDIT_LOG,
        Permission.LOCK_ACCOUNTS,
        // ADMIN cũng có thể xem thông tin cá nhân
        Permission.VIEW_SELF,
        Permission.UPDATE_SELF,
    ],
    [Role.HR]: [
        // HR có toàn quyền quản lý nhân sự
        Permission.MANAGE_EMPLOYEES,
        Permission.MANAGE_RECRUITMENT,
        Permission.VIEW_ALL_REPORTS,
        Permission.CREATE_ACCOUNTS,
        Permission.MANAGE_CONTRACTS,
        // HR cũng có thể xem thông tin cá nhân
        Permission.VIEW_SELF,
        Permission.UPDATE_SELF,
        Permission.REQUEST_LEAVE,
        Permission.VIEW_COMPANY_INFO,
    ],
    [Role.EMPLOYEE]: [
        Permission.VIEW_SELF,
        Permission.UPDATE_SELF,
        Permission.REQUEST_LEAVE,
        Permission.VIEW_COMPANY_INFO,
    ],
};

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
    '/pim/employees': [Role.HR],
    '/pim/employees/new': [Role.HR],
    '/pim/employees/:id': [Role.HR],
    '/pim/employees/:id/edit': [Role.HR],
    
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
    
    // Candidate routes: PUBLIC (không cần auth)
    // /jobs, /apply - không cần định nghĩa vì là public routes
};

// ============================================
// DEFAULT ROUTES PER ROLE
// Redirect đến trang phù hợp sau khi đăng nhập
// ============================================
export const DEFAULT_ROUTE_BY_ROLE: Partial<Record<Role, string>> = {
    [Role.ADMIN]: '/admin/users',
    [Role.HR]: '/pim/employees',
    [Role.EMPLOYEE]: '/my-profile',
    // CANDIDATE: removed - không cần đăng nhập
};

// ============================================
// UNAUTHORIZED ROUTE
// Trang hiển thị khi truy cập trái phép
// ============================================`
export const UNAUTHORIZED_ROUTE = '/unauthorized';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Kiểm tra user có permission cụ thể không
 */
export function hasPermission(role: Role | string | undefined, permission: Permission): boolean {
    if (!role) return false;
    const userRole = role as Role;
    const permissions = ROLE_PERMISSIONS[userRole];
    return permissions?.includes(permission) ?? false;
}

/**
 * Kiểm tra user có một trong các permissions không
 */
export function hasAnyPermission(role: Role | string | undefined, permissions: Permission[]): boolean {
    return permissions.some(p => hasPermission(role, p));
}

/**
 * Kiểm tra user có tất cả permissions không
 */
export function hasAllPermissions(role: Role | string | undefined, permissions: Permission[]): boolean {
    return permissions.every(p => hasPermission(role, p));
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

