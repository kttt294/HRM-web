/**
 * ============================================
 * APP ROUTER WITH ROLE-BASED ACCESS CONTROL
 * ============================================
 * 
 * Router được cấu hình với:
 * 1. Public routes: Ai cũng truy cập được (bao gồm candidate routes)
 * 2. Protected routes: Chỉ authenticated users (ADMIN/HR/EMPLOYEE)
 * 3. Admin routes: Chỉ System Admin (quản lý tài khoản, phân quyền)
 * 4. HR routes: Chỉ HR (quản lý nhân sự, tuyển dụng)
 * 5. Employee routes: Admin + HR + Employee
 * 
 * LƯU Ý: Candidate routes là PUBLIC - không cần đăng nhập!
 * 
 * Lưu ý: Đây là frontend routing guard.
 * Backend vẫn phải validate quyền cho mọi API.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { CandidateLayout } from '../components/layout/CandidateLayout';
import { RoleGuard, AdminRoute, HRRoute } from '../components/guards/RoleGuard';
import { ROUTES } from '../shared/constants/routes';
import { Role, getDefaultRoute } from '../shared/constants/rbac';
import { useAuthStore } from '../store/auth.store';

// Auth pages
import { LoginPage } from '../features/auth/pages/LoginPage';

// Employee pages
import { EmployeeListPage } from '../features/employee/pages/EmployeeListPage';
import { EmployeeDetailPage } from '../features/employee/pages/EmployeeDetailPage';
import { EmployeeFormPage } from '../features/employee/pages/EmployeeFormPage';

// Recruitment pages
import { RecruitmentDashboardPage } from '../features/recruitment/pages/RecruitmentDashboardPage';
import { VacancyListPage } from '../features/recruitment/pages/VacancyListPage';
import { CandidateListPage } from '../features/recruitment/pages/CandidateListPage';
import { CandidateDetailPage } from '../features/recruitment/pages/CandidateDetailPage';
import { CandidateFormPage } from '../features/recruitment/pages/CandidateFormPage';
import { VacancyFormPage } from '../features/recruitment/pages/VacancyFormPage';

// Pages for other roles
import { UnauthorizedPage } from '../features/common/pages/UnauthorizedPage';
import { MyProfilePage } from '../features/employee/pages/MyProfilePage';
import { JobListPage } from '../features/candidate/pages/JobListPage';
import { ApplicationFormPage } from '../features/candidate/pages/ApplicationFormPage';

import { EntryPage } from '../features/common/pages/EntryPage';

// Admin pages
import { UserListPage } from '../features/admin/pages/UserListPage';
import { UserFormPage } from '../features/admin/pages/UserFormPage';

// HR Leave & Payroll pages
import { LeaveManagementPage } from '../features/hr/pages/LeaveManagementPage';
import { PayrollListPage } from '../features/hr/pages/PayrollListPage';
import { DepartmentListPage } from '../features/hr/pages/DepartmentListPage';

// Employee Self-Service pages
import { MyLeaveRequestsPage } from '../features/employee/pages/MyLeaveRequestsPage';
import { MyPayrollPage } from '../features/employee/pages/MyPayrollPage';

// Placeholder for Role Management (to be implemented later)
function RoleManagementPage() {
    return (
        <div className="page-header">
            <h1>Phân quyền hệ thống</h1>
            <p className="page-subtitle">Tính năng đang phát triển...</p>
        </div>
    );
}

/**
 * Smart Home Redirect
 * Redirect đến trang phù hợp dựa trên role
 * Hoặc hiển thị Landing Page nếu chưa đăng nhập
 */
function HomeRedirect() {
    const { user, isAuthenticated } = useAuthStore();
    
    if (!isAuthenticated || !user) {
        return <EntryPage />;
    }
    
    const defaultRoute = getDefaultRoute(user.role);
    return <Navigate to={defaultRoute} replace />;
}

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* ============================================
                    PUBLIC ROUTES
                    Ai cũng truy cập được
                ============================================ */}
                {/* Landing Page (Home) */}
                <Route path={ROUTES.HOME} element={<HomeRedirect />} />
                
                <Route path={ROUTES.LOGIN} element={<LoginPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />

                {/* ============================================
                    PUBLIC CANDIDATE ROUTES
                    Ứng viên KHÔNG cần đăng nhập
                ============================================ */}
                <Route element={<CandidateLayout />}>
                    <Route path={ROUTES.JOBS} element={<JobListPage />} />
                    <Route path={ROUTES.APPLY_JOB} element={<ApplicationFormPage />} />
                </Route>

                {/* ============================================
                    PROTECTED ROUTES (requires authentication)
                    Dành cho ADMIN, HR, và EMPLOYEE
                ============================================ */}
                <Route element={
                    <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]}>
                        <MainLayout />
                    </RoleGuard>
                }>
                    {/* ============================================
                        ADMIN ONLY ROUTES
                        Quản lý hệ thống (tài khoản, phân quyền)
                    ============================================ */}
                    <Route path="/admin/users" element={
                        <AdminRoute><UserListPage /></AdminRoute>
                    } />
                    <Route path="/admin/users/new" element={
                        <AdminRoute><UserFormPage /></AdminRoute>
                    } />
                    <Route path="/admin/roles" element={
                        <AdminRoute><RoleManagementPage /></AdminRoute>
                    } />

                    {/* ============================================
                        HR ONLY ROUTES
                        Quản lý nhân sự và tuyển dụng
                    ============================================ */}
                    
                    {/* Employee Management (PIM) */}
                    <Route path={ROUTES.EMPLOYEES} element={
                        <HRRoute><EmployeeListPage /></HRRoute>
                    } />
                    <Route path={ROUTES.EMPLOYEE_DETAIL} element={
                        <HRRoute><EmployeeDetailPage /></HRRoute>
                    } />
                    <Route path={ROUTES.EMPLOYEE_NEW} element={
                        <HRRoute><EmployeeFormPage /></HRRoute>
                    } />
                    <Route path={ROUTES.EMPLOYEE_EDIT} element={
                        <HRRoute><EmployeeFormPage /></HRRoute>
                    } />

                    {/* Recruitment Management */}
                    <Route path={ROUTES.RECRUITMENT} element={
                        <HRRoute><RecruitmentDashboardPage /></HRRoute>
                    } />
                    <Route path={ROUTES.VACANCIES} element={
                        <HRRoute><VacancyListPage /></HRRoute>
                    } />
                    <Route path={ROUTES.VACANCY_NEW} element={
                        <HRRoute><VacancyFormPage /></HRRoute>
                    } />
                    <Route path={ROUTES.CANDIDATES} element={
                        <HRRoute><CandidateListPage /></HRRoute>
                    } />
                    <Route path={ROUTES.CANDIDATE_NEW} element={
                        <HRRoute><CandidateFormPage /></HRRoute>
                    } />
                    <Route path={ROUTES.CANDIDATE_DETAIL} element={
                        <HRRoute><CandidateDetailPage /></HRRoute>
                    } />

                    {/* Leave & Payroll Management (HR) */}
                    <Route path={ROUTES.LEAVE_MANAGEMENT} element={
                        <HRRoute><LeaveManagementPage /></HRRoute>
                    } />
                    <Route path={ROUTES.PAYROLL_LIST} element={
                        <HRRoute><PayrollListPage /></HRRoute>
                    } />
                    <Route path={ROUTES.DEPARTMENTS} element={
                        <HRRoute><DepartmentListPage /></HRRoute>
                    } />

                    {/* ============================================
                        EMPLOYEE ROUTES
                        Admin, HR, và Employee đều truy cập được
                    ============================================ */}
                    <Route path={ROUTES.MY_PROFILE} element={
                        <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]}>
                            <MyProfilePage />
                        </RoleGuard>
                    } />
                    <Route path={ROUTES.MY_LEAVES} element={
                        <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]}>
                            <MyLeaveRequestsPage />
                        </RoleGuard>
                    } />
                    <Route path={ROUTES.MY_PAYROLL} element={
                        <RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]}>
                            <MyPayrollPage />
                        </RoleGuard>
                    } />
                </Route>

                {/* Catch all - redirect to home */}
                <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
        </BrowserRouter>
    );
}


