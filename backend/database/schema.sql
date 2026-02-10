-- Bảng Roles (các vai trò)
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name)
);

-- Bảng Permissions (các quyền)
CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_category (category)
);

-- Bảng Role_Permissions (quan hệ nhiều-nhiều)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- =============================================
-- Core Application Tables
-- =============================================

-- Bảng Users (Tài khoản đăng nhập)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    role_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Bảng Employees (Thông tin nhân viên chi tiết)
CREATE TABLE IF NOT EXISTS employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT UNIQUE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    national_id VARCHAR(20),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    job_title VARCHAR(100),
    department VARCHAR(100),
    supervisor_id INT,
    hire_date DATE,
    status ENUM('active', 'inactive', 'on_leave') DEFAULT 'active',
    salary DECIMAL(15, 2),
    allowance DECIMAL(15, 2) DEFAULT 0,
    bank_account VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_status (status),
    INDEX idx_department (department)
);

-- Bảng Salary Records (Bảng lương chi tiết)
CREATE TABLE IF NOT EXISTS salary_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    base_salary DECIMAL(15, 2) NOT NULL,
    allowance_housing DECIMAL(15, 2) DEFAULT 0,
    allowance_transport DECIMAL(15, 2) DEFAULT 0,
    allowance_meal DECIMAL(15, 2) DEFAULT 0,
    allowance_other DECIMAL(15, 2) DEFAULT 0,
    deduction_insurance DECIMAL(15, 2) DEFAULT 0,
    deduction_tax DECIMAL(15, 2) DEFAULT 0,
    deduction_other DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2) NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    status ENUM('draft', 'confirmed', 'paid') DEFAULT 'draft',
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_month (employee_id, month, year),
    INDEX idx_status (status)
);

-- Bảng Vacancies (Vị trí tuyển dụng)
CREATE TABLE IF NOT EXISTS vacancies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    description TEXT,
    requirements TEXT,
    number_of_positions INT DEFAULT 1,
    min_salary DECIMAL(15, 2),
    max_salary DECIMAL(15, 2),
    status ENUM('open', 'closed', 'on_hold', 'draft') DEFAULT 'draft',
    posted_date DATE,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- Bảng Candidates (Ứng viên)
CREATE TABLE IF NOT EXISTS candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    vacancy_id INT,
    resume_url VARCHAR(500),
    applied_position VARCHAR(200),
    status ENUM('pending', 'screening', 'interview', 'offer', 'hired', 'rejected') DEFAULT 'pending',
    notes TEXT,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_vacancy (vacancy_id)
);

-- Bảng Interviews (Lịch phỏng vấn)
CREATE TABLE IF NOT EXISTS interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    vacancy_id INT,
    title VARCHAR(200),
    interview_date DATETIME NOT NULL,
    location VARCHAR(200),
    interviewer_id INT,
    interviewer_name VARCHAR(100),
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    result ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE SET NULL,
    FOREIGN KEY (interviewer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_candidate (candidate_id),
    INDEX idx_date (interview_date),
    INDEX idx_status (status)
);

-- =============================================
-- Seed Data: Roles
-- =============================================
INSERT INTO roles (name, description) VALUES
('admin', 'System Administrator - Full access'),
('hr', 'HR Manager - Manage employees and recruitment'),
('employee', 'Employee - Limited access');

-- =============================================
-- Seed Data: Permissions
-- =============================================
INSERT INTO permissions (name, description, category) VALUES
-- User Management
('manage_users', 'Create, update, delete user accounts', 'user_management'),
('manage_roles', 'Assign roles to users', 'user_management'),
('view_audit_log', 'View system audit logs', 'user_management'),
('lock_accounts', 'Lock/unlock user accounts', 'user_management'),

-- Employee Management
('manage_employees', 'Full CRUD on employee records', 'employee_management'),
('view_employees', 'View employee information', 'employee_management'),
('create_employees', 'Create new employee records', 'employee_management'),
('update_employees', 'Update employee information', 'employee_management'),
('delete_employees', 'Delete employee records', 'employee_management'),

-- Recruitment
('manage_recruitment', 'Manage job vacancies and candidates', 'recruitment'),
('view_candidates', 'View candidate applications', 'recruitment'),
('create_vacancies', 'Post new job vacancies', 'recruitment'),

-- Reports
('view_all_reports', 'Access all system reports', 'reports'),

-- Self Management
('view_self', 'View own profile', 'self_management'),
('update_self', 'Update own profile', 'self_management'),
('request_leave', 'Request leave/time off', 'self_management'),

-- Account Creation
('create_accounts', 'Create new user accounts', 'user_management');

-- =============================================
-- Seed Data: Role-Permission Mapping
-- =============================================

-- Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin';

-- HR: Employee & Recruitment permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'hr'
AND p.name IN (
    'manage_employees', 'view_employees', 'create_employees', 'update_employees',
    'manage_recruitment', 'view_candidates', 'create_vacancies',
    'view_all_reports', 'create_accounts'
);

-- Employee: Self-management only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'employee'
AND p.name IN ('view_self', 'update_self', 'request_leave');
