import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { canAccessRoute, getDefaultRoute, Role } from '../../shared/constants/rbac';

/**
 * ============================================
 * ROLE-BASED ROUTE GUARD
 * ============================================
 * 
 * Component này bảo vệ routes dựa trên:
 * 1. Authentication state (đã đăng nhập chưa)
 * 2. Role/Permission (có quyền truy cập không)
 * 
 * Lưu ý: Đây là frontend guard chỉ để UX.
 * Backend PHẢI validate quyền cho mọi API request.
 */

interface RoleGuardProps {
    children: ReactNode;
    /** Các role được phép truy cập. Nếu không truyền, chỉ check authentication */
    allowedRoles?: Role[];
    /** Redirect đến đâu nếu không có quyền */
    redirectTo?: string;
}

export function RoleGuard({ 
    children, 
    allowedRoles,
    redirectTo 
}: RoleGuardProps) {
    const { isAuthenticated, user } = useAuthStore();
    const location = useLocation();

    // ============================================
    // CHECK 1: Authentication
    // ============================================
    if (!isAuthenticated || !user) {
        // Chưa đăng nhập → redirect đến login
        // Lưu lại đường dẫn hiện tại để redirect sau khi login
        return (
            <Navigate 
                to="/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    // ============================================
    // CHECK 2: Role-based access
    // ============================================
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role as Role;
        const hasAccess = allowedRoles.includes(userRole);

        if (!hasAccess) {
            // Không có quyền → redirect đến trang phù hợp
            const destination = redirectTo || getDefaultRoute(user.role);
            return <Navigate to={destination} replace />;
        }
    }

    // ============================================
    // CHECK 3: Route-level access (từ ROUTE_ACCESS config)
    // ============================================
    if (!canAccessRoute(user.role, location.pathname)) {
        const destination = redirectTo || getDefaultRoute(user.role);
        return <Navigate to={destination} replace />;
    }

    // Có quyền → render children
    return <>{children}</>;
}

/**
 * ============================================
 * PROTECTED ROUTE (chỉ check authentication)
 * ============================================
 */
interface ProtectedRouteProps {
    children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate 
                to="/login" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    return <>{children}</>;
}

/**
 * ============================================
 * ADMIN ONLY ROUTE
 * ============================================
 */
export function AdminRoute({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={[Role.ADMIN]}>
            {children}
        </RoleGuard>
    );
}

/**
 * ============================================
 * HR ONLY ROUTE (Human Resources)
 * ============================================
 */
export function HRRoute({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={[Role.HR]}>
            {children}
        </RoleGuard>
    );
}

/**
 * ============================================
 * EMPLOYEE ROUTE (Admin + HR + Employee)
 * ============================================
 */
export function EmployeeRoute({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]}>
            {children}
        </RoleGuard>
    );
}
