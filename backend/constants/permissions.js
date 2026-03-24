/**
 * Danh sách hằng số các Permission trong hệ thống
 * Giúp đồng bộ giữa DB Seed và Middleware Backend
 */
const PERMISSIONS = {
    // Quản lý hệ thống (Admin)
    MANAGE_USERS: 'manage_users',
    MANAGE_ROLES: 'manage_roles',

    // Nhân sự (HR/PIM)
    MANAGE_EMPLOYEES: 'manage_employees',
    VIEW_EMPLOYEES: 'view_employees',
    CREATE_EMPLOYEES: 'create_employees',
    UPDATE_EMPLOYEES: 'update_employees',

    // Tuyển dụng (Recruitment)
    MANAGE_RECRUITMENT: 'manage_recruitment',
    VIEW_CANDIDATES: 'view_candidates',
    VIEW_VACANCIES: 'view_vacancies',

    // Lương & Nghỉ phép (Payroll & Leave)
    MANAGE_PAYROLL_ALL: 'manage_payroll_all',
    MANAGE_LEAVE_ALL: 'manage_leave_all',

    // Quyền của Manager (Phòng ban)
    VIEW_DEPT_EMPLOYEES: 'view_dept_employees',
    VIEW_DEPT_PAYROLL: 'view_dept_payroll',
    APPROVE_DEPT_LEAVE: 'approve_dept_leave',

    // Quyền cơ bản của Employee (Cá nhân)
    VIEW_SELF: 'view_self',
    UPDATE_SELF: 'update_self',
    VIEW_MY_LEAVE: 'view_my_leave',
    REQUEST_LEAVE: 'request_leave'
};

module.exports = PERMISSIONS;
