import { ReactNode } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { hasPermission, hasRole, Permission, Role } from '../../shared/constants/rbac';

/**
 * ============================================
 * CÁC COMPONENT RENDER CÓ ĐIỀU KIỆN
 * ============================================
 * 
 * Các component này giúp ẩn/hiện UI elements
 * dựa trên role và permission của user.
 * 
 * Lưu ý: Đây chỉ là UI hiding, KHÔNG phải security.
 * Backend vẫn phải validate mọi request.
 */

interface ShowForRolesProps {
    children: ReactNode;
    /** Các role được hiển thị component */
    roles: Role[];
    /** Fallback component khi không có quyền (optional) */
    fallback?: ReactNode;
}

/**
 * Hiển thị children chỉ cho các roles được chỉ định
 */
export function ShowForRoles({ children, roles, fallback = null }: ShowForRolesProps) {
    const { user } = useAuthStore();
    
    if (!user || !hasRole(user.role, roles)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hiển thị children chỉ cho Admin (System)
 */
export function AdminOnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <ShowForRoles roles={[Role.ADMIN]} fallback={fallback}>
            {children}
        </ShowForRoles>
    );
}

/**
 * Hiển thị children chỉ cho HR
 */
export function HROnly({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <ShowForRoles roles={[Role.HR]} fallback={fallback}>
            {children}
        </ShowForRoles>
    );
}

/**
 * Hiển thị children cho HR và Employee
 */
export function HRAndEmployee({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <ShowForRoles roles={[Role.HR, Role.EMPLOYEE]} fallback={fallback}>
            {children}
        </ShowForRoles>
    );
}

/**
 * Hiển thị children cho Admin, HR, và Employee
 */
export function InternalUsers({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
    return (
        <ShowForRoles roles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]} fallback={fallback}>
            {children}
        </ShowForRoles>
    );
}

interface ShowForPermissionProps {
    children: ReactNode;
    /** Permission cần thiết */
    permission: Permission;
    /** Fallback component khi không có quyền */
    fallback?: ReactNode;
}

/**
 * Hiển thị children chỉ khi user có permission cụ thể
 */
export function ShowForPermission({ children, permission, fallback = null }: ShowForPermissionProps) {
    const { user } = useAuthStore();
    
    if (!user || !hasPermission(user.permissions, permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}

/**
 * Hiển thị children khi user có một trong các permissions
 */
export function ShowForAnyPermission({ 
    children, 
    permissions, 
    fallback = null 
}: { 
    children: ReactNode; 
    permissions: Permission[];
    fallback?: ReactNode;
}) {
    const { user } = useAuthStore();
    
    if (!user) return <>{fallback}</>;
    
    const hasAny = permissions.some(p => hasPermission(user.permissions, p));
    if (!hasAny) return <>{fallback}</>;

    return <>{children}</>;
}

/**
 * ============================================
 * CÁC COMPONENT ẨN
 * ============================================
 */

/**
 * Ẩn children với các roles được chỉ định
 */
export function HideForRoles({ children, roles }: { children: ReactNode; roles: Role[] }) {
    const { user } = useAuthStore();
    
    if (user && hasRole(user.role, roles)) {
        return null;
    }

    return <>{children}</>;
}

/**
 * ============================================
 * CUSTOM HOOK KIỂM TRA PERMISSION
 * ============================================
 */
export function usePermissions() {
    const { user, isAuthenticated } = useAuthStore();

    return {
        isAuthenticated,
        role: user?.role as Role | undefined,
        permissions: user?.permissions,
        
        // Check methods
        hasRole: (roles: Role | Role[]) => hasRole(user?.role, roles),
        hasPermission: (permission: Permission) => hasPermission(user?.permissions, permission),
        
        // Role checks
        isAdmin: hasRole(user?.role, [Role.ADMIN]),
        isHR: hasRole(user?.role, [Role.HR]),
        isEmployee: hasRole(user?.role, [Role.EMPLOYEE]),

        
        // Combined checks
        isInternalUser: hasRole(user?.role, [Role.ADMIN, Role.HR, Role.EMPLOYEE]),
        
        // Permission checks
        canManageSystem: hasRole(user?.role, [Role.ADMIN]),
        canManageEmployees: hasPermission(user?.permissions, Permission.MANAGE_EMPLOYEES),
        canManageRecruitment: hasPermission(user?.permissions, Permission.MANAGE_RECRUITMENT),
        canRequestLeave: hasPermission(user?.permissions, Permission.REQUEST_LEAVE),

    };
}
