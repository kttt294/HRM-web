-- SEED DATA CHO DEMO

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'hr', 'Nhân viên nhân sự'),
(3, 'employee', 'Nhân viên thông thường');

-- 2. Permissions
INSERT INTO permissions (name, description) VALUES
-- Admin permissions
('manage_users', 'Quản lý tài khoản người dùng'),
('manage_roles', 'Quản lý vai trò và phân quyền'),
-- HR permissions  
('manage_employees', 'Quản lý hồ sơ nhân viên'),
('view_employees', 'Xem danh sách nhân viên'),
('create_employees', 'Tạo mới nhân viên'),
('update_employees', 'Cập nhật thông tin nhân viên'),
('delete_employees', 'Xóa nhân viên'),
('manage_recruitment', 'Quản lý tuyển dụng'),
('view_candidates', 'Xem danh sách ứng viên'),
('create_vacancies', 'Tạo vị trí tuyển dụng'),
-- Employee permissions
('view_self', 'Xem thông tin cá nhân'),
('update_self', 'Cập nhật thông tin cá nhân'),
('request_leave', 'Gửi đơn xin nghỉ phép');

-- 3. Role Permissions
-- Admin: ALL
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions;

-- HR: employee + recruitment permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions 
WHERE name IN (
    'manage_employees', 'view_employees', 'create_employees', 'update_employees', 'delete_employees',
    'manage_recruitment', 'view_candidates', 'create_vacancies'
);

-- Employee: self-service only
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions 
WHERE name IN ('view_self', 'update_self', 'request_leave');

-- 4. Departments
INSERT INTO departments (name, description, location) VALUES
('Công nghệ thông tin', 'Phát triển phần mềm và quản trị hệ thống', 'Tầng 3 - Tòa A'),
('Nhân sự', 'Quản lý nguồn nhân lực', 'Tầng 2 - Tòa A'),
('Kế toán', 'Quản lý tài chính', 'Tầng 2 - Tòa B'),
('Marketing', 'Truyền thông và tiếp thị', 'Tầng 4 - Tòa A'),
('Kinh doanh', 'Phát triển kinh doanh', 'Tầng 5 - Tòa A');

-- 5. Users
-- Password: admin/demo123, hr/demo123, nhanvien/demo123
INSERT INTO users (username, password, full_name, role_id, status) VALUES
('admin', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Demo Admin', 1, 'active'),
('hr', '$2a$10$smM0E3P90WCinwcqbB9Dhe/fmQvjnTFBVUu/.JaJkb/Kn0BiDzkBm', 'Demo HR', 2, 'active'),
('nhanvien', '$2a$10$XP1Kju4QmxLQUTLv0pc7/.MgILCtA5YzRM9/6N9hkI4LxxqVqXJ7e', 'Demo Employee', 3, 'active');

-- 6. Employees
INSERT INTO employees (id, user_id, full_name, date_of_birth, gender, national_id, address, phone, department_id, job_title, hire_date, status, base_salary, allowance, employee_type) VALUES
('NV001', 2, 'Lê Văn HR', '1990-01-01', 'male',   '012345678001', '123 Đường ABC, Quận 1, TP. Hà Nội', '0901234567', 2, 'Giám đốc Nhân sự',    '2020-01-01', 'active',    30000000, 5000000, 'full_time'),
('NV002', 3, 'Trần Thị Nhan Vien',  '1992-05-15', 'female', '012345678002', '456 Đường XYZ, Quận 2, TP. Hà Nội', '0912345678', 2, 'Quản lý Nhân sự',     '2021-03-15', 'active',    20000000, 3000000, 'full_time'),
('NV003', NULL, 'Nguyễn Văn A',  '1995-08-20', 'male',   '012345678003', '789 Đường DEF, Quận 3, TP. Hà Nội', '0923456789', 1, 'Lập trình viên',      '2022-06-01', 'active',    15000000, 2000000, 'full_time'),
('NV004', NULL, 'Phạm Thị B', '1998-03-10', 'female', '012345678004', '123 Đường GHI, Quận 4, TP. Hà Nội', '0934567890', 4, 'Marketing Executive', '2023-01-15', 'probation', 12000000, 1500000, 'full_time'),
('NV005', NULL, 'Hoàng Văn C',  '1993-11-25', 'male',   '012345678005', '456 Đường JKL, Quận 5, TP. Hà Nội', '0945678901', 1, 'Senior Developer',    '2020-09-01', 'active',    25000000, 4000000, 'full_time');

-- Update supervisor
UPDATE employees SET supervisor_id = 'NV001' WHERE id IN ('NV002', 'NV004');
UPDATE employees SET supervisor_id = 'NV005' WHERE id = 'NV003';

-- 7. Salary Records
INSERT INTO salary_records (employee_id, month, year, base_salary, allowance, deduction, net_salary, status) VALUES
('NV001', 1, 2026, 30000000, 5000000, 3500000, 31500000, 'paid'),
('NV002', 1, 2026, 20000000, 3000000, 2300000, 20700000, 'paid'),
('NV003', 1, 2026, 15000000, 2000000, 1700000, 15300000, 'paid'),
('NV004', 1, 2026, 12000000, 1500000, 1350000, 12150000, 'paid'),
('NV005', 1, 2026, 25000000, 4000000, 2900000, 26100000, 'paid'),
('NV001', 2, 2026, 30000000, 5000000, 3500000, 31500000, 'confirmed'),
('NV002', 2, 2026, 20000000, 3000000, 2300000, 20700000, 'draft'),
('NV003', 2, 2026, 15000000, 2000000, 1700000, 15300000, 'draft');

-- 8. Vacancies
INSERT INTO vacancies (title, job_title, department_id, description, requirements, number_of_positions, min_salary, max_salary, deadline, status) VALUES
('Tuyển Lập trình viên React', 'Frontend Developer', 1, 
'Phát triển ứng dụng web với React và TypeScript', 
'- Kinh nghiệm 1-2 năm React\n- Biết TypeScript, Git\n- Tiếng Anh đọc hiểu tốt', 
2, 15000000, 25000000, '2026-03-31', 'open'),
('Nhân viên Marketing', 'Marketing Executive', 4, 
'Thực hiện các chiến dịch marketing online', 
'- Tốt nghiệp Đại học Marketing\n- Biết Facebook Ads, Google Ads', 
1, 10000000, 15000000, '2026-04-15', 'open'),
('Kế toán trưởng', 'Chief Accountant', 3,
'Quản lý toàn bộ công tác kế toán',
'- Tốt nghiệp Đại học Kế toán\n- Có chứng chỉ CPA\n- Kinh nghiệm 5+ năm',
1, 20000000, 30000000, '2026-05-01', 'draft');

-- 9. Candidates
INSERT INTO candidates (vacancy_id, full_name, email, phone, status, applied_at) VALUES
(1, 'Nguyễn Văn A', 'nguyenvana@email.com', '0971234567', 'interviewing', '2026-02-01'),
(1, 'Trần Thị B', 'tranthib@email.com', '0982345678', 'screening',   '2026-02-05'),
(2, 'Lê Văn C', 'levanc@email.com', '0993456789', 'new',         '2026-02-10'),
(1, 'Phạm Minh D', 'phaminhd@email.com', '0904567891', 'rejected',    '2026-01-25'),
(2, 'Võ Thị E', 'vothie@email.com', '0915678902', 'offered',     '2026-02-08');

-- 10. Interviews
INSERT INTO interviews (candidate_id, vacancy_id, interviewer_id, interview_date, location, title, status, result) VALUES
(1, 1, 'NV005', '2026-02-15 14:00:00', 'Phòng họp A - Tầng 3', 'Phỏng vấn kỹ thuật', 'completed', 'passed'),
(1, 1, 'NV001', '2026-02-20 10:00:00', 'Phòng họp B - Tầng 2', 'Phỏng vấn HR',        'scheduled', 'pending'),
(5, 2, 'NV001', '2026-02-25 15:00:00', 'Phòng họp A - Tầng 4', 'Phỏng vấn HR',        'scheduled', 'pending');

-- 11. Leave Requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status, approved_by) VALUES
('NV003', 'annual', '2026-03-01', '2026-03-03', 'Nghỉ du lịch cùng gia đình', 'approved', 'Trần Thị HR'),
('NV004', 'sick',   '2026-02-20', '2026-02-21', 'Bị cảm sốt',                'pending',  NULL    ),
('NV005', 'annual', '2026-04-10', '2026-04-15', 'Nghỉ phép hè',              'pending',  NULL    );
