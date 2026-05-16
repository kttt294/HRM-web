-- Set charset thành UTF-8
ALTER DATABASE defaultdb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Vô hiệu hóa kiểm tra khóa ngoại để có thể DROP/CREATE lại sạch sẽ
SET FOREIGN_KEY_CHECKS = 0;

-- Xóa các bảng cũ nếu tồn tại (theo thứ tự ngược lại hoặc dùng FOREIGN_KEY_CHECKS=0)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS employee_certificates;
DROP TABLE IF EXISTS employee_degrees;
DROP TABLE IF EXISTS profile_updates;
DROP TABLE IF EXISTS interviews;
DROP TABLE IF EXISTS candidates;
DROP TABLE IF EXISTS vacancies;
DROP TABLE IF EXISTS salary_records;
DROP TABLE IF EXISTS leave_requests;
DROP TABLE IF EXISTS employees;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS job_titles;
DROP TABLE IF EXISTS role_permissions;
DROP TABLE IF EXISTS permissions;
DROP TABLE IF EXISTS roles;

-- Kích hoạt lại kiểm tra khóa ngoại
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Bảng Roles (Admin, HR, Manager, Employee)
CREATE TABLE IF NOT EXISTS roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Permissions
CREATE TABLE IF NOT EXISTS permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng Role_Permissions
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- 4. Bảng Job Titles (Chức vụ)
CREATE TABLE IF NOT EXISTS job_titles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng Departments (Phòng ban)
CREATE TABLE IF NOT EXISTS departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description VARCHAR(255),
    location VARCHAR(255),
    manager_id INT(5) ZEROFILL NULL, -- Khóa ngoại trỏ đến employees.id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Bảng Users (Tài khoản hệ thống)
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role_id INT NOT NULL,
    avatar VARCHAR(255),
    status ENUM('active', 'locked') DEFAULT 'active',
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    INDEX idx_username (username)
);

-- 7. Bảng Refresh Tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 8. Bảng Employees (Thông tin chi tiết nhân sự đầy đủ)
CREATE TABLE IF NOT EXISTS employees (
    id INT(5) ZEROFILL PRIMARY KEY AUTO_INCREMENT, -- ID tự tăng, hiển thị 5 ký tự (VD: 00001)
    user_id INT UNIQUE,
    
    -- Thông tin cơ bản (Nhân viên tự nhập được)
    full_name VARCHAR(100) NOT NULL,
    personal_email VARCHAR(100),
    avatar_url LONGTEXT,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed') DEFAULT 'single',

    -- Định danh & Pháp lý (Nhân viên tự nhập được)
    national_id VARCHAR(20), -- CCCD/CMND
    tax_id VARCHAR(20),      -- Mã số thuế
    insurance_id VARCHAR(20), -- Mã số BHXH
    permanent_address TEXT,  -- Hộ khẩu thường trú
    current_address TEXT,    -- Chỗ ở hiện tại

    -- Liên lạc khẩn cấp (Nhân viên tự nhập được)
    emergency_contact_name VARCHAR(100),
    emergency_contact_relationship VARCHAR(50),
    emergency_contact_phone VARCHAR(20),

    -- Thông tin công việc (CHỈ HR/ADMIN nhập)
    department_id INT,
    job_title_id INT,
    hire_date DATE,
    status ENUM('active', 'probation', 'resigned', 'terminated', 'on_leave') DEFAULT 'active',
    employee_type ENUM('full_time', 'part_time', 'intern', 'contract', 'remote') DEFAULT 'full_time',

    -- Hồ sơ tự thuật (Nhân viên tự nhập được)
    experience TEXT,        -- Kinh nghiệm làm việc trước đây
    work_process TEXT,      -- Quá trình làm việc tại công ty

    -- Trạng thái xác thực hồ sơ (CHỈ HR/MANAGER nhập)
    profile_status ENUM('pending', 'verified') DEFAULT 'pending',
    verified_by INT(5) ZEROFILL NULL, -- ID của HR hoặc Manager xác thực

    -- Quản lý phép (CHỈ HR/ADMIN nhập)
    total_leave_days INT DEFAULT 12, -- Tổng ngày phép theo chế độ
    remaining_leave_days DECIMAL(4,1) DEFAULT 12.0, -- Ngày phép còn lại thực tế

    -- Thông tin lương & Ngân hàng (CHỈ HR/ADMIN nhập lương, NV nhập ngân hàng)
    base_salary DECIMAL(15, 2) DEFAULT 0,
    allowance DECIMAL(15, 2) DEFAULT 0,
    dependents_count INT DEFAULT 0, -- Số người phụ thuộc (Tính thuế TNCN)
    bank_name VARCHAR(100),         -- Tên ngân hàng
    bank_account VARCHAR(255),
    supervisor_id INT(5) ZEROFILL NULL, -- Người quản lý trực tiếp

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (job_title_id) REFERENCES job_titles(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES employees(id) ON DELETE SET NULL,
    FOREIGN KEY (supervisor_id) REFERENCES employees(id) ON DELETE SET NULL,
    
    INDEX idx_full_name (full_name),
    INDEX idx_department (department_id),
    INDEX idx_status (status)
);

-- Thêm khóa ngoại manager_id cho bảng departments (Nếu chạy lần đầu thì bỏ comment dòng dưới)
-- ALTER TABLE departments ADD CONSTRAINT fk_dept_manager FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL;

-- 10. Bảng Leave Requests (Đơn nghỉ phép)
CREATE TABLE IF NOT EXISTS leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT(5) ZEROFILL NOT NULL,
    leave_type ENUM('annual', 'sick', 'unpaid', 'maternity', 'other') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    
    -- Quy trình duyệt 2 cấp
    manager_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    hr_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    
    -- Trạng thái cuối cùng của đơn
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending', 
    
    approved_by INT(5) ZEROFILL NULL, -- Người chốt cuối cùng
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- 11. Bảng Salary Records (Bảng lương)
CREATE TABLE IF NOT EXISTS salary_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT(5) ZEROFILL NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    base_salary DECIMAL(15, 2) NOT NULL,
    allowance DECIMAL(15, 2) DEFAULT 0,
    deduction DECIMAL(15, 2) DEFAULT 0,
    net_salary DECIMAL(15, 2) NOT NULL,
    status ENUM('draft', 'confirmed', 'paid') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    UNIQUE KEY unique_payroll (employee_id, month, year)
);

-- 12. Bảng Vacancies (Tin tuyển dụng)
CREATE TABLE IF NOT EXISTS vacancies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    job_title_id INT,
    department_id INT,
    recruiter_id INT(5) ZEROFILL NULL, -- Người phụ trách tin này
    description TEXT,
    requirements TEXT,
    number_of_positions INT DEFAULT 1,
    min_salary DECIMAL(15, 2),
    max_salary DECIMAL(15, 2),
    deadline DATE,
    status ENUM('draft', 'open', 'closed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (job_title_id) REFERENCES job_titles(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (recruiter_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 13. Bảng Candidates (Ứng viên)
CREATE TABLE IF NOT EXISTS candidates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    vacancy_id INT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    resume_url VARCHAR(500),
    notes TEXT,
    status ENUM('new', 'screening', 'interviewing', 'offered', 'hired', 'rejected') DEFAULT 'new',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES vacancies(id) ON DELETE SET NULL
);

-- 14. Bảng Interviews (Lịch phỏng vấn)
CREATE TABLE IF NOT EXISTS interviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    candidate_id INT NOT NULL,
    interviewer_id INT(5) ZEROFILL NULL,
    interview_date DATETIME NOT NULL,
    location VARCHAR(200),
    status ENUM('scheduled', 'completed', 'cancelled') DEFAULT 'scheduled',
    result ENUM('pending', 'passed', 'failed') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
    FOREIGN KEY (interviewer_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- 15. Bảng Profile Updates (Lưu tạm các thay đổi hồ sơ chờ duyệt)
CREATE TABLE IF NOT EXISTS profile_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT(5) ZEROFILL NOT NULL,
    data JSON NOT NULL, -- Chứa các thông tin nhân viên muốn cập nhật dạng key-value
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    processed_by INT(5) ZEROFILL NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by) REFERENCES employees(id) ON DELETE SET NULL
);

-- 16. Bảng Employee Degrees (Thông tin bằng cấp chính - Đại học, Cao đẳng...)
CREATE TABLE IF NOT EXISTS employee_degrees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT(5) ZEROFILL NOT NULL,
    
    education_level ENUM('under_high_school', 'high_school', 'college', 'university', 'master', 'phd') NOT NULL, 
    school_name VARCHAR(255),
    degree_classification ENUM('average', 'good', 'excellent') NULL, 
    major VARCHAR(255), 
    graduation_year YEAR NULL, 
    certificate_file_url TEXT, 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 17. Bảng Employee Certificates (Các loại chứng chỉ - Ngoại ngữ, Chuyên môn...)
CREATE TABLE IF NOT EXISTS employee_certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT(5) ZEROFILL NOT NULL,
    
    certificate_type ENUM('vstep', 'ielts', 'toeic', 'toefl') NOT NULL,
    score VARCHAR(50), 
    issue_date DATE NULL, 
    expiry_date DATE NULL, 
    provider VARCHAR(255), -- Nơi cấp
    certificate_file_url TEXT, 
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

-- 18. Bảng Audit Logs (Lịch sử hoạt động)
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NULL,
    employee_id INT(5) ZEROFILL NULL,
    username VARCHAR(50),                -- Lưu username tại thời điểm thực hiện
    full_name VARCHAR(100),              -- Lưu tên nhân viên tại thời điểm thực hiện
    action VARCHAR(100) NOT NULL,        -- VD: LOGIN, CREATE_EMPLOYEE, UPDATE_SALARY...
    resource VARCHAR(100),               -- VD: employees, salary_records, departments...
    resource_id VARCHAR(50),             -- ID của bản ghi bị tác động
    details JSON,                        -- Chi tiết thay đổi (old_value, new_value)
    ip_address VARCHAR(45),              -- IPv4 hoặc IPv6
    user_agent TEXT,                     -- Thông tin trình duyệt/thiết bị
    method VARCHAR(10),                  -- HTTP Method (GET, POST, PUT, DELETE)
    endpoint VARCHAR(500),               -- URL endpoint được truy cập
    status_code INT,                     -- HTTP Response Status Code
    response_time INT,                   -- Thời gian xử lý request (ms)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_resource (resource),
    INDEX idx_created_at (created_at),
    INDEX idx_status_code (status_code),
    INDEX idx_method (method)
);
