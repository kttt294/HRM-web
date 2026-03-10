-- SEED DATA CHO DEMO HRM-WEB (VERSION 3 - FULL FIELDS)

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'hr', 'Nhân viên nhân sự'),
(3, 'manager', 'Trưởng phòng ban'),
(4, 'employee', 'Nhân viên thông thường');

-- 2. Permissions
INSERT INTO permissions (name, description) VALUES
-- Admin
('manage_users', 'Quản lý tài khoản người dùng'),
('manage_roles', 'Quản lý vai trò và phân quyền'),
-- HR (PIM)
('manage_employees', 'Quản lý hồ sơ nhân viên (Toàn quyền)'),
('view_employees', 'Xem danh sách nhân viên'),
('create_employees', 'Tạo nhân viên mới'),
('update_employees', 'Cập nhật thông tin nhân viên'),
-- HR (Recruitment)
('manage_recruitment', 'Quản lý tuyển dụng (Toàn quyền)'),
('view_candidates', 'Xem danh sách ứng viên'),
('view_vacancies', 'Xem tin tuyển dụng'),
-- HR (Payroll & Leave)
('manage_payroll_all', 'Quản lý lương toàn công ty'),
('manage_leave_all', 'Quản lý nghỉ phép toàn công ty'),
-- Manager
('view_dept_employees', 'Xem danh sách nhân viên trong phòng'),
('view_dept_payroll', 'Xem bảng lương nhân viên trong phòng'),
('approve_dept_leave', 'Duyệt nghỉ phép cho nhân viên trong phòng'),
-- Employee
('view_self', 'Xem thông tin cá nhân'),
('update_self', 'Tự cập nhật hồ sơ cá nhân (trừ lương)'),
('view_my_leave', 'Xem đơn nghỉ phép của mình'),
('request_leave', 'Gửi đơn xin nghỉ phép');

-- 3. Role Permissions
-- Admin (1) lấy TẤT CẢ permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions;

-- HR (2) lấy các quyền quản lý nhân sự & tuyển dụng
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 2, id FROM permissions 
WHERE name IN (
    'manage_employees', 'view_employees', 'create_employees', 'update_employees',
    'manage_recruitment', 'view_candidates', 'view_vacancies',
    'manage_payroll_all', 'manage_leave_all', 
    'view_self', 'update_self', 'request_leave', 'view_my_leave'
);

-- Manager (3) 
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 3, id FROM permissions 
WHERE name IN (
    'view_dept_employees', 'view_dept_payroll', 'approve_dept_leave', 
    'view_self', 'update_self', 'request_leave', 'view_my_leave'
);

-- Employee (4)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 4, id FROM permissions 
WHERE name IN ('view_self', 'update_self', 'request_leave', 'view_my_leave');

-- 4. Job Titles
INSERT INTO job_titles (id, name, description) VALUES
(1, 'Giám đốc điều hành', 'CEO'),
(2, 'Trưởng phòng Nhân sự', 'HR Manager'),
(3, 'Trưởng phòng Kỹ thuật', 'Tech Manager'),
(4, 'Lập trình viên Senior', '3+ năm kinh nghiệm'),
(5, 'Lập trình viên Junior', 'Mới ra trường'),
(6, 'Chuyên viên Marketing', 'Content & Ads');

-- 5. Departments
INSERT INTO departments (id, name, description, location) VALUES
(1, 'Công nghệ thông tin', 'IT Department', 'Tầng 3'),
(2, 'Nhân sự', 'HR Department', 'Tầng 2'),
(3, 'Tài chính', 'Accounting', 'Tầng 2');

-- 6. Users
INSERT INTO users (id, username, password, full_name, role_id, status) VALUES
(1, 'admin', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'System Admin', 1, 'active'),
(2, 'hr', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Trần Thị HR', 2, 'active'),
(3, 'manager', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Nguyễn Văn Tech', 3, 'active'),
(4, 'nhanvien', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Lê Văn A', 4, 'active');

-- 7. Employees (Nạp dữ liệu mẫu đầy đủ các trường mới)
INSERT INTO employees (
    id, user_id, full_name, personal_email, phone, 
    date_of_birth, gender, national_id, tax_id, insurance_id,
    permanent_address, current_address, department_id, job_title_id, hire_date, 
    status, base_salary, total_leave_days, remaining_leave_days, profile_status, supervisor_id
) VALUES
(1, 2, 'Trần Thị HR', 'hr@personal.com', '0912345678', '1990-05-10', 'female', '012345678901', 'TAX001', 'INS001', 'Hà Nội', 'Thanh Xuân, Hà Nội', 2, 2, '2020-01-01', 'active', 25000000, 15, 15, 'verified', NULL),
(2, 3, 'Nguyễn Văn Tech', 'tech@personal.com', '0922345678', '1988-12-25', 'male', '012345678902', 'TAX002', 'INS002', 'Hải Phòng', 'Cầu Giấy, Hà Nội', 1, 3, '2020-05-15', 'active', 40000000, 15, 12, 'verified', 1),
(3, 4, 'Lê Văn A', 'levana@gmail.com', '0932345678', '1995-02-20', 'male', '012345678903', 'TAX003', 'INS003', 'Nghệ An', 'Mỹ Đình, Hà Nội', 1, 5, '2023-08-20', 'active', 15000000, 12, 11.5, 'pending', 2),
(4, 1, 'Hệ thống Admin', 'admin@hrm.com', '0942345678', '1985-01-01', 'male', '012345678904', 'TAX004', 'INS004', 'Hà Nội', 'Đống Đa, Hà Nội', NULL, 1, '2019-01-01', 'active', 50000000, 20, 20, 'verified', NULL);

-- 8. Cập nhật Manager
UPDATE departments SET manager_id = 2 WHERE id = 1;
UPDATE departments SET manager_id = 1 WHERE id = 2;

-- 9. Vacancies
INSERT INTO vacancies (id, title, job_title_id, department_id, recruiter_id, description, requirements, number_of_positions, min_salary, max_salary, deadline, status) VALUES
(1, 'Tuyển dụng Lập trình viên Senior Java', 4, 1, 1, 'Làm việc với các dự án lớn, xây dựng hệ thống core CRM...', 'Tối thiểu 3 năm kinh nghiệm với Java Spring Boot. Tiếng Anh đọc hiểu tốt.', 2, 20000000, 35000000, '2027-12-31', 'open'),
(2, 'Tuyển dụng Chuyên viên Marketing Tương tác', 6, 2, 1, 'Quản trị các kênh truyền thông xã hội, lên plan nội dung hằng tháng', 'Sáng tạo, hiểu biết về các nền tảng Tiktok, Facebook. Có 1 năm kinh nghiệm trở lên.', 1, 10000000, 15000000, '2027-10-15', 'open'),
(3, 'Thực tập sinh Lập trình', 5, 1, 2, 'Thực tập sinh cho dự án internal, có cơ hội thăng tiến lên nhân viên chính thức.', 'Sinh viên năm cuối các trường CNTT, nắm vững kiến thức cơ bản về OOP, Database.', 5, 3000000, 5000000, '2027-08-30', 'closed');

-- 10. Candidates
INSERT INTO candidates (id, vacancy_id, full_name, email, phone, resume_url, status) VALUES
(1, 1, 'Nguyễn Văn Ứng Viên', 'ungvien1@gmail.com', '0987654321', 'https://example.com/cv/ungvien1.pdf', 'interviewing'),
(2, 1, 'Trần Thị Giỏi', 'gioidt@gmail.com', '0911223344', 'https://example.com/cv/gioidt.pdf', 'screening'),
(3, 2, 'Lê Marketing', 'lektm@gmail.com', '0955667788', 'https://example.com/cv/lektm.pdf', 'new'),
(4, 3, 'Phạm Thực Tập', 'phamtt@gmail.com', '0999888777', 'https://example.com/cv/phamtt.pdf', 'hired');

-- 11. Interviews
INSERT INTO interviews (id, candidate_id, interviewer_id, interview_date, location, status, result, notes) VALUES
(1, 1, 2, '2027-09-10 09:00:00', 'Phòng họp Tầng 3', 'completed', 'passed', 'Ứng viên nắm vững kiến thức, thái độ tốt, phù hợp văn hóa.'),
(2, 1, 1, '2027-09-15 14:00:00', 'Phòng họp Tầng 3', 'scheduled', 'pending', 'Vòng phỏng vấn thứ 2 với Manager'),
(3, 2, 2, '2027-09-12 10:00:00', 'Online qua Zoom', 'completed', 'failed', 'Ứng viên chưa hiểu rõ về Spring Boot, cần thêm thời gian trau dồi.'),
(4, 4, 2, '2027-07-20 15:30:00', 'Phòng họp Tầng 2', 'completed', 'passed', 'Ứng viên tiềm năng, đã offer thành công.');

