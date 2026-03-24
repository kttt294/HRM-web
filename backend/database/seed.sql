-- SEED DATA CHO HRM-WEB (VERSION 4 - EXPANDED DATA)

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'hr', 'Nhân viên nhân sự'),
(3, 'manager', 'Trưởng phòng ban'),
(4, 'employee', 'Nhân viên thông thường');

-- 2. Permissions
INSERT INTO permissions (name, description) VALUES
('manage_users', 'Quản lý tài khoản người dùng'),
('manage_roles', 'Quản lý vai trò và phân quyền'),
('manage_employees', 'Quản lý hồ sơ nhân viên (Toàn quyền)'),
('view_employees', 'Xem danh sách nhân viên'),
('create_employees', 'Tạo nhân viên mới'),
('update_employees', 'Cập nhật thông tin nhân viên'),
('manage_recruitment', 'Quản lý tuyển dụng (Toàn quyền)'),
('view_candidates', 'Xem danh sách ứng viên'),
('view_vacancies', 'Xem tin tuyển dụng'),
('manage_payroll_all', 'Quản lý lương toàn công ty'),
('manage_leave_all', 'Quản lý nghỉ phép toàn công ty'),
('view_dept_employees', 'Xem danh sách nhân viên trong phòng'),
('view_dept_payroll', 'Xem bảng lương nhân viên trong phòng'),
('approve_dept_leave', 'Duyệt nghỉ phép cho nhân viên trong phòng'),
('view_self', 'Xem thông tin cá nhân'),
('update_self', 'Tự cập nhật hồ sơ cá nhân (trừ lương)'),
('view_my_leave', 'Xem đơn nghỉ phép của mình'),
('request_leave', 'Gửi đơn xin nghỉ phép');

-- 3. Role Permissions
INSERT INTO role_permissions (role_id, permission_id) 
SELECT 1, id FROM permissions;

INSERT INTO role_permissions (role_id, permission_id) 
SELECT 2, id FROM permissions 
WHERE name IN (
    'manage_employees', 'view_employees', 'create_employees', 'update_employees',
    'manage_recruitment', 'view_candidates', 'view_vacancies',
    'manage_payroll_all', 'manage_leave_all', 
    'view_self', 'update_self', 'request_leave', 'view_my_leave'
);

INSERT INTO role_permissions (role_id, permission_id) 
SELECT 3, id FROM permissions 
WHERE name IN (
    'view_dept_employees', 'view_dept_payroll', 'approve_dept_leave', 
    'view_self', 'update_self', 'request_leave', 'view_my_leave'
);

INSERT INTO role_permissions (role_id, permission_id) 
SELECT 4, id FROM permissions 
WHERE name IN ('view_self', 'update_self', 'request_leave', 'view_my_leave');

-- 4. Job Titles (3 mẫu)
INSERT INTO job_titles (id, name, description) VALUES
(1, 'Quản lý cấp cao', 'Quản lý chung các bộ phận'),
(2, 'Kỹ sư phần mềm', 'Phát triển và bảo trì phần mềm'),
(3, 'Chuyên viên Nhân sự', 'Tuyển dụng và đào tạo');

-- 5. Departments (3 mẫu)
INSERT INTO departments (id, name, description, location) VALUES
(1, 'Phòng Kỹ thuật', 'Bộ phận phát triển phần mềm và hạ tầng', 'Tầng 3'),
(2, 'Phòng Nhân sự', 'Bộ phận tuyển dụng và quản lý nhân tài', 'Tầng 2'),
(3, 'Phòng Kinh doanh', 'Bộ phận bán hàng và chăm sóc khách hàng', 'Tầng 1');

-- 6. Users (10 mẫu)
-- Password mặc định: 'password123' mã hóa bcrypt $2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe
INSERT INTO users (id, username, password, full_name, role_id, status) VALUES
(1, 'admin_system', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Nguyễn Quản Trị', 1, 'active'),
(2, 'hr_manager', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Lê Thị Tuyển', 2, 'active'),
(3, 'tech_lead', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Trần Văn Kỹ', 3, 'active'),
(4, 'sale_lead', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Phạm Công Doanh', 3, 'active'),
(5, 'dev_01', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Nguyễn Văn Dev', 4, 'active'),
(6, 'dev_02', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Lê Hoàng Code', 4, 'active'),
(7, 'sale_01', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Trần Thị Bán', 4, 'active'),
(8, 'sale_02', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Lý Văn Chốt', 4, 'active'),
(9, 'hr_staff', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Ngô Thị Hồ', 4, 'active'),
(10, 'dev_senior', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Vũ Văn Cứng', 4, 'active');

-- 7. Employees (Nạp đủ các cột PIM)
INSERT INTO employees (
    id, user_id, full_name, personal_email, phone, 
    date_of_birth, gender, marital_status, national_id, tax_id, insurance_id,
    permanent_address, current_address,
    emergency_contact_name, emergency_contact_relationship, emergency_contact_phone,
    department_id, job_title_id, hire_date, status, employee_type,
    experience, work_process, profile_status,
    total_leave_days, remaining_leave_days, 
    base_salary, allowance, dependents_count, bank_name, bank_account, supervisor_id
) VALUES
(1, 1, 'Nguyễn Quản Trị', 'admin@gmail.com', '0123000001', '1985-01-01', 'male', 'married', '100000000001', 'TAX001', 'INS001', 'Hà Nội', 'Hoàn Kiếm, Hà Nội', 'Trần Thị Thảo', 'Vợ', '0999000111', NULL, 1, '2015-01-01', 'active', 'full_time', '10 năm quản lý dự án', 'Gia nhập từ ngày đầu thành lập công ty', 'verified', 20, 20.0, 60000000, 5000000, 2, 'Vietcombank', '000111222333', NULL),
(2, 2, 'Lê Thị Tuyển', 'tuyenlt@gmail.com', '0123000002', '1990-05-15', 'female', 'single', '100000000002', 'TAX002', 'INS002', 'Hải Phòng', 'Thanh Xuân, Hà Nội', 'Lê Văn Bốn', 'Bố', '0999000222', 2, 3, '2016-03-20', 'active', 'full_time', '5 năm làm HR tại tập đoàn F', 'Quản lý tuyển dụng và phúc lợi', 'verified', 15, 15.0, 30000000, 2000000, 0, 'Techcombank', '000222333444', 1),
(3, 3, 'Trần Văn Kỹ', 'kytv@gmail.com', '0123000003', '1988-10-10', 'male', 'married', '100000000003', 'TAX003', 'INS003', 'Đà Nẵng', 'Cầu Giấy, Hà Nội', 'Nguyễn Thị Hoa', 'Vợ', '0999000333', 1, 1, '2017-06-12', 'active', 'full_time', '8 năm làm tech lead tại startup', 'Trưởng phòng kỹ thuật từ 2020', 'verified', 15, 12.0, 45000000, 3000000, 1, 'BIDV', '000333444555', 1),
(4, 4, 'Phạm Công Doanh', 'doanhpc@gmail.com', '0123000004', '1989-02-28', 'male', 'married', '100000000004', 'TAX004', 'INS004', 'Cần Thơ', 'Đống Đa, Hà Nội', 'Lê Thị Thu', 'Vợ', '0999000444', 3, 1, '2018-09-01', 'active', 'full_time', '7 năm quản lý bán hàng', 'Xây dựng team kinh doanh miền Bắc', 'verified', 15, 15.0, 35000000, 4000000, 1, 'Agribank', '000444555666', 1),
(5, 5, 'Nguyễn Văn Dev', 'devvn@gmail.com', '0123000005', '1995-12-12', 'male', 'single', '100000000005', 'TAX005', 'INS005', 'Thái Bình', 'Mỹ Đình, Hà Nội', 'Nguyễn Văn Năm', 'Bố', '0999000555', 1, 2, '2020-01-01', 'active', 'intern', '3 năm làm Java dev', 'Lập trình viên chính dự án ERP', 'verified', 12, 10.0, 20000000, 1000000, 0, 'VPBank', '000555666777', 3),
(6, 6, 'Lê Hoàng Code', 'codehl@gmail.com', '0123000006', '1996-06-06', 'male', 'single', '100000000006', 'TAX006', 'INS006', 'Quảng Ninh', 'Nam Từ Liêm, Hà Nội', 'Hoàng Minh', 'Mẹ', '0999000666', 1, 2, '2021-02-01', 'active', 'contract', '2 năm làm Node.js', 'Phát triển module Payroll', 'verified', 12, 12.0, 18000000, 1000000, 0, 'Vietinbank', '000666777888', 3),
(7, 7, 'Trần Thị Bán', 'bantt@gmail.com', '0123000007', '1993-03-03', 'female', 'married', '100000000007', 'TAX007', 'INS007', 'Hưng Yên', 'Ba Đình, Hà Nội', 'Trần Văn Bảy', 'Chồng', '0999000777', 3, 2, '2022-04-10', 'active', 'full_time', '4 năm sales bất động sản', 'Thực hiện các hợp đồng lớn mảng Gov', 'verified', 12, 11.0, 15000000, 1500000, 1, 'Sacombank', '000777888999', 4),
(8, 8, 'Lý Văn Chốt', 'chotlv@gmail.com', '0123000008', '1994-11-20', 'male', 'single', '100000000008', 'TAX008', 'INS008', 'Lâm Đồng', 'Tây Hồ, Hà Nội', 'Lý Văn Tám', 'Anh trai', '0999000888', 3, 2, '2022-05-15', 'active', 'part_time', '3 năm làm telesale', 'Xử lý các khách hàng khó tính', 'verified', 12, 12.0, 16000000, 1500000, 0, 'MBBank', '000888999000', 4),
(9, 9, 'Ngô Thị Hồ', 'hont@gmail.com', '0123000009', '1997-08-08', 'female', 'single', '100000000009', 'TAX009', 'INS009', 'Bắc Ninh', 'Long Biên, Hà Nội', 'Đỗ Thị Chín', 'Mẹ', '0999000999', 2, 3, '2023-01-15', 'active', 'contract', '1 năm admin văn phòng', 'Hỗ trợ nghiệp vụ BHXH và hồ sơ', 'verified', 12, 12.0, 14000000, 1000000, 0, 'VIB', '000999000111', 2),
(10, 10, 'Vũ Văn Cứng', 'cungvv@gmail.com', '0123000010', '1990-10-10', 'male', 'married', '100000000010', 'TAX010', 'INS010', 'Thanh Hóa', 'Hà Đông, Hà Nội', 'Vũ Thị Mười', 'Vợ', '0999000000', 1, 2, '2020-05-01', 'active', 'remote', '10 năm lập trình C++', 'Chuyên gia tối ưu hiệu năng', 'verified', 15, 14.0, 28000000, 2000000, 1, 'SCB', '000000111222', 3);

-- Cập nhật manager_id cho các phòng ban (ID của employee)
UPDATE departments SET manager_id = 3 WHERE id = 1;
UPDATE departments SET manager_id = 2 WHERE id = 2;
UPDATE departments SET manager_id = 4 WHERE id = 3;

-- 8. Salary Records (Tháng 1, 2, 3 năm 2024 cho đủ 10 nhân viên)
INSERT INTO salary_records (employee_id, month, year, base_salary, allowance, deduction, net_salary, status)
SELECT 
    e.id, 
    m.month, 
    2024, 
    e.base_salary, 
    e.allowance, 
    500000, 
    (e.base_salary + e.allowance - 500000), 
    'paid'
FROM employees e
CROSS JOIN (SELECT 1 AS month UNION SELECT 2 UNION SELECT 3) m;


-- 9. Employee Degrees (Updated)
INSERT INTO employee_degrees (employee_id, education_level, school_name, degree_classification, major, graduation_year, english_certificate, english_score) VALUES
(1, 'university', 'Đại học Bách Khoa', 'excellent', 'Quản trị mạng', 2007, 'ielts', '7.0'),
(2, 'master', 'Đại học Kinh tế Quốc dân', 'good', 'Quản trị nhân lực', 2012, 'toeic', '850'),
(3, 'university', 'Đại học Công nghệ - ĐHQGHN', 'excellent', 'Công nghệ thông tin', 2010, 'ielts', '6.5'),
(4, 'university', 'Đại học Ngoại thương', 'good', 'Kinh tế quốc tế', 2011, 'toefl', '95'),
(5, 'university', 'Đại học FPT', 'average', 'Kỹ thuật phần mềm', 2018, 'toeic', '780'),
(6, 'university', 'Đại học Giao thông Vận tải', 'good', 'Công nghệ thông tin', 2019, 'vstep', 'B2'),
(7, 'university', 'Đại học Thương mại', 'good', 'Marketing', 2015, 'toeic', '600'),
(8, 'university', 'Đại học Mở', 'average', 'Quản trị kinh doanh', 2016, 'none', NULL),
(9, 'university', 'Đại học Công nghiệp', 'good', 'Quản trị văn phòng', 2020, 'vstep', 'B1'),
(10, 'master', 'Học viện Bưu chính Viễn thông', 'excellent', 'Khoa học máy tính', 2013, 'ielts', '7.5');

-- 10. Vacancies (3 mẫu)
INSERT INTO vacancies (id, title, job_title_id, department_id, recruiter_id, description, requirements, number_of_positions, min_salary, max_salary, deadline, status) VALUES
(1, 'Tuyển dụng Kỹ sư Java Backend', 2, 1, 2, 'Phát triển các dịch vụ backend cho hệ thống HRM', '2+ năm kinh nghiệm Java. Am hiểu MySQL.', 2, 15000000, 25000000, '2025-06-30', 'open'),
(2, 'Tuyển dụng Chuyên viên Tuyển dụng', 3, 2, 2, 'Tìm kiếm và phỏng vấn ứng viên tiềm năng', 'Có kinh nghiệm tuyển dụng mảng IT là lợi thế.', 1, 10000000, 18000000, '2025-05-15', 'open'),
(3, 'Tuyển dụng Nhân viên Kinh doanh', 1, 3, 4, 'Tìm kiếm khách hàng mới cho sản phẩm phần mềm', 'Giao tiếp tốt, chịu được áp lực doanh số.', 5, 8000000, 12000000, '2025-04-30', 'open');

-- 11. Candidates (10 mẫu)
INSERT INTO candidates (id, vacancy_id, full_name, email, phone, resume_url, status) VALUES
(1, 1, 'Nguyễn Văn Ứng', 'ungnv@gmail.com', '0901000001', 'https://cv.com/ungnv.pdf', 'interviewing'),
(2, 1, 'Trần Thị Tuyển', 'tuyentt@gmail.com', '0901000002', 'https://cv.com/tuyentt.pdf', 'screening'),
(3, 1, 'Lê Văn Code', 'codelv@gmail.com', '0901000003', 'https://cv.com/codelv.pdf', 'new'),
(4, 2, 'Phạm Thị Nhân', 'nhanpt@gmail.com', '0901000004', 'https://cv.com/nhanpt.pdf', 'hired'),
(5, 2, 'Ngô Văn Sự', 'sunv@gmail.com', '0901000005', 'https://cv.com/sunv.pdf', 'rejected'),
(6, 3, 'Vũ Thị Sales', 'salesvt@gmail.com', '0901000006', 'https://cv.com/salesvt.pdf', 'interviewing'),
(7, 3, 'Đỗ Văn Chốt', 'chotdv@gmail.com', '0901000007', 'https://cv.com/chotdv.pdf', 'new'),
(8, 3, 'Hoàng Thị Deal', 'dealht@gmail.com', '0901000008', 'https://cv.com/dealht.pdf', 'screening'),
(9, 1, 'Bùi Văn Pro', 'provb@gmail.com', '0901000009', 'https://cv.com/provb.pdf', 'interviewing'),
(10, 3, 'Đặng Thị Khách', 'khachdt@gmail.com', '0901000010', 'https://cv.com/khachdt.pdf', 'new');

-- 12. Interviews (5 mẫu)
INSERT INTO interviews (id, candidate_id, interviewer_id, interview_date, location, status, result, notes) VALUES
(1, 1, 3, '2025-03-25 09:00:00', 'Phòng họp 3.1', 'scheduled', 'pending', 'Phỏng vấn kỹ thuật vòng 1'),
(2, 4, 3, '2025-03-20 14:00:00', 'Phòng họp 2.1', 'completed', 'passed', 'Ứng viên rất phù hợp'),
(3, 6, 4, '2025-03-26 10:30:00', 'Online Zoom', 'scheduled', 'pending', 'Vòng phỏng văn kỹ năng mềm'),
(4, 9, 3, '2025-03-24 15:00:00', 'Phòng họp 3.2', 'completed', 'passed', 'Technical test đạt điểm cao'),
(5, 5, 2, '2025-03-15 11:00:00', 'Phòng họp 2.1', 'completed', 'failed', 'Kinh nghiệm chưa thực sự phù hợp');
