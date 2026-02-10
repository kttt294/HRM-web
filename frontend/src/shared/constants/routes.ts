export const ROUTES = {
  // Auth
  HOME: "/",
  LOGIN: "/login",

  // Admin System Management
  ADMIN_USERS: "/admin/users",
  ADMIN_USERS_NEW: "/admin/users/new",
  ADMIN_ROLES: "/admin/roles",

  // HR - Employee Management (PIM)
  EMPLOYEES: "/pim/employees",
  EMPLOYEE_NEW: "/pim/employees/new",
  EMPLOYEE_DETAIL: "/pim/employees/:id",
  EMPLOYEE_EDIT: "/pim/employees/:id/edit",

  // HR - Leave & Payroll Management
  LEAVE_MANAGEMENT: "/hr/leaves",
  PAYROLL_LIST: "/hr/payroll",
  DEPARTMENTS: "/hr/departments",

  // HR - Recruitment
  RECRUITMENT: "/recruitment",
  VACANCIES: "/recruitment/vacancies",
  VACANCY_NEW: "/recruitment/vacancies/new",
  VACANCY_DETAIL: "/recruitment/vacancies/:id",
  VACANCY_EDIT: "/recruitment/vacancies/:id/edit",
  CANDIDATES: "/recruitment/candidates",
  CANDIDATE_NEW: "/recruitment/candidates/new",
  CANDIDATE_DETAIL: "/recruitment/candidates/:id",

  // Employee Self-Service
  MY_PROFILE: "/my-profile",
  MY_LEAVES: "/my-leaves",
  MY_PAYROLL: "/my-payroll",

  // Candidate Portal (Public - không cần đăng nhập)
  JOBS: "/jobs",
  APPLY_JOB: "/apply",
};
