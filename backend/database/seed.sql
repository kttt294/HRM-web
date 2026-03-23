-- SEED DATA CHO DEMO HRM-WEB (VERSION 3 - FULL FIELDS - 10 OBJECTS PER TABLE)

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'admin', 'Quản trị viên hệ thống'),
(2, 'hr_manager', 'Trưởng phòng nhân sự'),
(3, 'hr_staff', 'Nhân viên nhân sự'),
(4, 'tech_manager', 'Trưởng phòng kỹ thuật'),
(5, 'tech_lead', 'Trưởng nhóm kỹ thuật'),
(6, 'senior_dev', 'Lập trình viên Senior'),
(7, 'junior_dev', 'Lập trình viên Junior'),
(8, 'marketing_manager', 'Trưởng phòng Marketing'),
(9, 'marketing_staff', 'Nhân viên Marketing'),
(10, 'accountant', 'Kế toán viên');

-- 2. Permissions
INSERT INTO permissions (id, name, description) VALUES
(1, 'manage_users', 'Quản lý tài khoản người dùng'),
(2, 'manage_roles', 'Quản lý vai trò và phân quyền'),
(3, 'manage_employees', 'Quản lý hồ sơ nhân viên'),
(4, 'view_employees', 'Xem danh sách nhân viên'),
(5, 'manage_recruitment', 'Quản lý tuyển dụng'),
(6, 'view_vacancies', 'Xem tin tuyển dụng'),
(7, 'manage_payroll', 'Quản lý lương'),
(8, 'view_payroll', 'Xem bảng lương'),
(9, 'approve_leave', 'Duyệt nghỉ phép'),
(10, 'request_leave', 'Gửi đơn xin nghỉ phép');

-- 3. Role Permissions (10 role_permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
(1, 6), (1, 7), (1, 8), (1, 9), (1, 10);

-- 4. Job Titles
INSERT INTO job_titles (id, name, description) VALUES
(1, 'Giám đốc', 'CEO / Director'),
(2, 'Trưởng phòng Nhân sự', 'HR Manager'),
(3, 'Trưởng phòng Kỹ thuật', 'Tech Manager'),
(4, 'Trưởng phòng Marketing', 'Marketing Manager'),
(5, 'Trưởng phòng Kế toán', 'Accounting Manager'),
(6, 'Lập trình viên Senior', 'Senior Developer'),
(7, 'Lập trình viên Junior', 'Junior Developer'),
(8, 'Chuyên viên Nhân sự', 'HR Executive'),
(9, 'Chuyên viên Marketing', 'Marketing Executive'),
(10, 'Kế toán viên', 'Accountant');

-- 5. Departments
INSERT INTO departments (id, name, description, location) VALUES
(1, 'Ban Giám Đốc', 'Board of Directors', 'Tầng 5'),
(2, 'Phòng Nhân sự', 'HR Department', 'Tầng 4'),
(3, 'Phòng Kỹ thuật IT', 'IT Department', 'Tầng 3'),
(4, 'Phòng Marketing', 'Marketing Department', 'Tầng 2'),
(5, 'Phòng Kế toán', 'Accounting', 'Tầng 2'),
(6, 'Phòng Kinh doanh', 'Sales Department', 'Tầng 1'),
(7, 'Phòng Chăm sóc Khách hàng', 'Customer Service', 'Tầng 1'),
(8, 'Phòng Nghiên cứu & Phát triển', 'R&D', 'Tầng 3'),
(9, 'Phòng Hành chính', 'Admin Department', 'Tầng 4'),
(10, 'Phòng Pháp chế', 'Legal Department', 'Tầng 5');

-- 6. Users
INSERT INTO users (id, username, password, full_name, role_id, status) VALUES
(1, 'admin1', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Trần Admin', 1, 'active'),
(2, 'hr1', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Lê HR', 2, 'active'),
(3, 'hr2', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Phạm HR', 3, 'active'),
(4, 'tech1', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Nguyễn Tech Manager', 4, 'active'),
(5, 'tech2', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Hoàng Tech Lead', 5, 'active'),
(6, 'dev1', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Đinh Senior Dev', 6, 'active'),
(7, 'dev2', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Vũ Junior Dev', 7, 'active'),
(8, 'mkt1', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Bùi MKT Manager', 8, 'active'),
(9, 'mkt2', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Tô MKT Staff', 9, 'active'),
(10, 'acc1', '$2a$10$EFWbI/.7X79oKSoigybUQuOGJKF7IZQIX/OLkGTH8MRoQZSOOsPBe', 'Lý Accountant', 10, 'active');

-- 7. Employees
INSERT INTO employees (
    id, user_id, full_name, personal_email, phone, 
    date_of_birth, gender, national_id, tax_id, insurance_id,
    permanent_address, current_address, department_id, job_title_id, hire_date, 
    status, base_salary, total_leave_days, remaining_leave_days, profile_status, supervisor_id
) VALUES
(1, 1, 'Trần Admin', 'tranadmin@gmail.com', '0911111111', '1980-01-01', 'male', '001080000001', 'TAX111', 'INS111', 'Hà Nội', 'Hà Nội', 1, 1, '2015-01-01', 'active', 60000000, 20, 20, 'verified', NULL),
(2, 2, 'Lê HR', 'lehr@gmail.com', '0922222222', '1985-02-02', 'female', '002085000002', 'TAX222', 'INS222', 'Hà Nội', 'Hà Nội', 2, 2, '2016-02-01', 'active', 40000000, 18, 15, 'verified', 1),
(3, 3, 'Phạm HR', 'phamhr@gmail.com', '0933333333', '1990-03-03', 'female', '003090000003', 'TAX333', 'INS333', 'Hải Phòng', 'Hà Nội', 2, 8, '2020-03-01', 'active', 20000000, 15, 12, 'verified', 2),
(4, 4, 'Nguyễn Tech Manager', 'nguyentech@gmail.com', '0944444444', '1982-04-04', 'male', '004082000004', 'TAX444', 'INS444', 'Hà Nội', 'Hà Nội', 3, 3, '2017-04-01', 'active', 55000000, 18, 10, 'verified', 1),
(5, 5, 'Hoàng Tech Lead', 'hoangtech@gmail.com', '0955555555', '1988-05-05', 'male', '005088000005', 'TAX555', 'INS555', 'Nam Định', 'Hà Nội', 3, 6, '2019-05-01', 'active', 45000000, 15, 14, 'verified', 4),
(6, 6, 'Đinh Senior Dev', 'dinhdev@gmail.com', '0966666666', '1992-06-06', 'male', '006092000006', 'TAX666', 'INS666', 'Ninh Bình', 'Hà Nội', 3, 6, '2021-06-01', 'active', 35000000, 15, 8, 'verified', 5),
(7, 7, 'Vũ Junior Dev', 'vudev@gmail.com', '0977777777', '1998-07-07', 'male', '007098000007', 'TAX777', 'INS777', 'Thái Bình', 'Hà Nội', 3, 7, '2023-07-01', 'active', 15000000, 12, 12, 'verified', 5),
(8, 8, 'Bùi MKT Manager', 'buimkt@gmail.com', '0988888888', '1986-08-08', 'female', '008086000008', 'TAX888', 'INS888', 'Hà Nội', 'Hà Nội', 4, 4, '2018-08-01', 'active', 40000000, 18, 18, 'verified', 1),
(9, 9, 'Tô MKT Staff', 'tomkt@gmail.com', '0999999999', '1995-09-09', 'female', '009095000009', 'TAX999', 'INS999', 'Hải Dương', 'Hà Nội', 4, 9, '2022-09-01', 'active', 18000000, 12, 5, 'verified', 8),
(10, 10, 'Lý Accountant', 'lyacc@gmail.com', '0900000000', '1991-10-10', 'female', '010091000010', 'TAX101', 'INS101', 'Hà Nội', 'Hà Nội', 5, 10, '2020-10-01', 'active', 22000000, 15, 15, 'verified', 1);

-- 8. Vacancies
INSERT INTO vacancies (id, title, job_title_id, department_id, recruiter_id, description, requirements, number_of_positions, min_salary, max_salary, deadline, status) VALUES
(1, 'Tuyển Frontend Developer', 7, 3, 2, 'Làm việc với ReactJS...', '1 năm kinh nghiệm ReactJS', 2, 10000000, 20000000, '2024-12-31', 'open'),
(2, 'Tuyển Backend Developer', 6, 3, 2, 'Làm việc với NodeJS...', '3 năm kinh nghiệm NodeJS', 1, 20000000, 40000000, '2024-12-31', 'open'),
(3, 'Tuyển HR Specialist', 8, 2, 2, 'Tuyển dụng và C&B...', '2 năm kinh nghiệm nhân sự', 1, 15000000, 25000000, '2024-10-31', 'closed'),
(4, 'Tuyển Marketing Executive', 9, 4, 8, 'Chạy ads, content...', 'Không yêu cầu kinh nghiệm', 3, 8000000, 15000000, '2024-11-30', 'open'),
(5, 'Tuyển Kế toán trưởng', 5, 5, 2, 'Quản lý tài chính...', '5 năm kinh nghiệm kế toán', 1, 30000000, 50000000, '2024-09-30', 'closed'),
(6, 'Tuyển Sales Executive', 8, 6, 2, 'Bán hàng B2B...', '1 năm kinh nghiệm sales', 5, 10000000, 30000000, '2024-12-31', 'open'),
(7, 'Tuyển Chuyên viên CSKH', 8, 7, 2, 'Hỗ trợ khách hàng...', 'Giao tiếp tốt', 4, 8000000, 12000000, '2024-12-31', 'open'),
(8, 'Tuyển Kỹ sư R&D', 6, 8, 4, 'Nghiên cứu công nghệ mới...', 'Giỏi toán, thuật toán', 2, 25000000, 45000000, '2024-12-31', 'open'),
(9, 'Tuyển Chuyên viên Pháp chế', 8, 10, 2, 'Xử lý hợp đồng...', 'Cử nhân luật', 1, 15000000, 25000000, '2024-12-31', 'open'),
(10, 'Tuyển UI/UX Designer', 7, 3, 2, 'Thiết kế giao diện...', 'Có portfolio Figma', 1, 15000000, 25000000, '2025-01-31', 'open');

-- 9. Candidates
INSERT INTO candidates (id, vacancy_id, full_name, email, phone, resume_url, status) VALUES
(1, 1, 'Trần Văn FE', 'fe@gmail.com', '0911112222', 'https://cv.com/fe.pdf', 'interviewing'),
(2, 2, 'Lê Văn BE', 'be@gmail.com', '0922223333', 'https://cv.com/be.pdf', 'hired'),
(3, 4, 'Phạm Thi MKT', 'thmkt@gmail.com', '0933334444', 'https://cv.com/thmkt.pdf', 'screening'),
(4, 6, 'Hoàng Văn Sales', 'sales@gmail.com', '0944445555', 'https://cv.com/sales.pdf', 'rejected'),
(5, 7, 'Nguyễn CSKH', 'cskh@gmail.com', '0955556666', 'https://cv.com/cskh.pdf', 'offered'),
(6, 8, 'Vũ AI', 'ai@gmail.com', '0966667777', 'https://cv.com/ai.pdf', 'new'),
(7, 10, 'Đinh Design', 'design@gmail.com', '0977778888', 'https://cv.com/design.pdf', 'interviewing'),
(8, 1, 'Lý Frontend', 'lyfe@gmail.com', '0988889999', 'https://cv.com/lyfe.pdf', 'rejected'),
(9, 2, 'Trịnh Backend', 'trinhbe@gmail.com', '0999990000', 'https://cv.com/trinhbe.pdf', 'screening'),
(10, 4, 'Tô Digital', 'digital@gmail.com', '0900001111', 'https://cv.com/digital.pdf', 'new');

-- 10. Interviews
INSERT INTO interviews (id, candidate_id, interviewer_id, interview_date, location, status, result, notes) VALUES
(1, 1, 5, '2024-10-01 09:00:00', 'Phòng họp 1', 'completed', 'passed', 'Tốt, pass vòng 1'),
(2, 2, 4, '2024-09-15 10:00:00', 'Phòng họp 2', 'completed', 'passed', 'Rất xuất sắc'),
(3, 3, 8, '2024-10-05 14:00:00', 'Phòng họp 3', 'scheduled', 'pending', 'Chưa phỏng vấn'),
(4, 4, 2, '2024-09-20 15:00:00', 'Online', 'completed', 'failed', 'Kinh nghiệm chưa phù hợp'),
(5, 5, 2, '2024-09-25 09:30:00', 'Online', 'completed', 'passed', 'Giao tiếp tốt'),
(6, 7, 5, '2024-10-10 10:00:00', 'Phòng họp 1', 'scheduled', 'pending', 'Lịch tuần sau'),
(7, 8, 5, '2024-09-10 14:00:00', 'Phòng họp 2', 'completed', 'failed', 'Yếu ReactJS'),
(8, 2, 1, '2024-09-17 10:00:00', 'Phòng CEO', 'completed', 'passed', 'Đã chốt lương'),
(9, 1, 4, '2024-10-05 09:00:00', 'Phòng Tech', 'scheduled', 'pending', 'Vòng 2'),
(10, 5, 1, '2024-09-28 10:00:00', 'Phòng CEO', 'completed', 'passed', 'Đã gửi offer');

-- Cập nhật Manager cho các phòng ban sau khi đã tạo Employee
UPDATE departments SET manager_id = 1 WHERE id = 1;
UPDATE departments SET manager_id = 2 WHERE id = 2;
UPDATE departments SET manager_id = 4 WHERE id = 3;
UPDATE departments SET manager_id = 8 WHERE id = 4;
UPDATE departments SET manager_id = 10 WHERE id = 5;

-- 11. Leave Requests
INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, manager_status, hr_status, status, approved_by, approved_at) VALUES
(1, 1, 'annual', '2025-01-10', '2025-01-12', 'Nghỉ phép cá nhân', 'approved', 'approved', 'approved', 2, '2025-01-05 10:00:00'),
(2, 2, 'sick', '2025-02-15', '2025-02-16', 'Ốm đau', 'approved', 'approved', 'approved', 1, '2025-02-15 08:00:00'),
(3, 3, 'annual', '2025-03-20', '2025-03-21', 'Về quê', 'approved', 'pending', 'pending', NULL, NULL),
(4, 4, 'annual', '2025-04-10', '2025-04-15', 'Du lịch gia đình', 'approved', 'approved', 'approved', 1, '2025-04-01 09:00:00'),
(5, 5, 'sick', '2025-05-02', '2025-05-03', 'Sốt virus', 'pending', 'pending', 'pending', NULL, NULL),
(6, 6, 'annual', '2025-06-05', '2025-06-06', 'Giải quyết việc gia đình', 'approved', 'approved', 'approved', 4, '2025-06-01 10:00:00'),
(7, 7, 'unpaid', '2025-07-10', '2025-07-15', 'Nghỉ không lương', 'rejected', 'rejected', 'rejected', 4, '2025-07-05 14:00:00'),
(8, 8, 'annual', '2025-08-20', '2025-08-21', 'Nghỉ phép năm', 'approved', 'approved', 'approved', 1, '2025-08-15 09:00:00'),
(9, 9, 'sick', '2025-09-10', '2025-09-11', 'Khám sức khỏe', 'approved', 'pending', 'pending', NULL, NULL),
(10, 10, 'annual', '2025-10-01', '2025-10-05', 'Cưới hỏi', 'approved', 'approved', 'approved', 1, '2025-09-25 10:00:00');

-- 12. Salary Records
INSERT INTO salary_records (id, employee_id, month, year, base_salary, allowance, deduction, net_salary, status) VALUES
(1, 1, 10, 2024, 60000000, 5000000, 2000000, 63000000, 'paid'),
(2, 2, 10, 2024, 40000000, 3000000, 1500000, 41500000, 'paid'),
(3, 3, 10, 2024, 20000000, 2000000, 1000000, 21000000, 'paid'),
(4, 4, 10, 2024, 55000000, 4000000, 2000000, 57000000, 'paid'),
(5, 5, 10, 2024, 45000000, 3000000, 1500000, 46500000, 'confirmed'),
(6, 6, 10, 2024, 35000000, 2000000, 1000000, 36000000, 'confirmed'),
(7, 7, 10, 2024, 15000000, 1000000, 500000, 15500000, 'draft'),
(8, 8, 10, 2024, 40000000, 3000000, 1500000, 41500000, 'paid'),
(9, 9, 10, 2024, 18000000, 2000000, 1000000, 19000000, 'draft'),
(10, 10, 10, 2024, 22000000, 2000000, 1000000, 23000000, 'confirmed');

-- 13. Profile Updates
INSERT INTO profile_updates (id, employee_id, data) VALUES
(1, 1, '{"phone": "0911111112"}'),
(2, 2, '{"current_address": "Cầu Giấy, Hà Nội"}'),
(3, 3, '{"personal_email": "newemail3@gmail.com"}'),
(4, 4, '{"marital_status": "married"}'),
(5, 5, '{"emergency_contact_phone": "0988888888"}'),
(6, 6, '{"bank_account": "1234567890"}'),
(7, 7, '{"education": "Thạc sĩ CNTT"}'),
(8, 8, '{"tax_id": "TAX888_NEW"}'),
(9, 9, '{"insurance_id": "INS999_NEW"}'),
(10, 10, '{"phone": "0900000001"}');
