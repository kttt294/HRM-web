import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuthStore } from '../../store/auth.store';
import { canAccessRoute, getDefaultRoute, Role } from '../../shared/constants/rbac';

/**
 * ============================================
 * BẢO VỆ ROUTE DỰA TRÊN VAI TRÒ
 * ============================================
 * 
 * Component này bảo vệ routes dựa trên:
 * 1. Trạng thái xác thực (đã đăng nhập chưa)
 * 2. Vai trò/Quyền (có quyền truy cập không)
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
    // KIỂM TRA 1: Xác thực
    // ============================================
    if (!isAuthenticated || !user) {
        // Chưa đăng nhập → redirect đến trang chủ (EntryPage)
        // Lưu lại đường dẫn hiện tại để redirect sau khi login
        return (
            <Navigate 
                to="/" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    // ============================================
    // KIỂM TRA 2: Truy cập theo vai trò
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
    // KIỂM TRA 3: Truy cập cấp route (từ ROUTE_ACCESS config)
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
 * ROUTE BẢO VỆ (chỉ kiểm tra xác thực)
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
                to="/" 
                state={{ from: location }} 
                replace 
            />
        );
    }

    return <>{children}</>;
}

/**
 * ============================================
 * ROUTE CHỈ DÀNH CHO ADMIN
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
 * ROUTE CHỈ DÀNH CHO HR (Nhân sự)
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
 * ROUTE NHÂN VIÊN (Admin + HR + Employee)
 * ============================================
 */
export function EmployeeRoute({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]}>
            {children}
        </RoleGuard>
    );
}
