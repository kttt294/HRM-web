# Hướng dẫn sử dụng hệ thống HRM

Chào mừng bạn đến với hệ thống Quản lý Nhân sự (HRM). Đây là tài liệu hướng dẫn sử dụng các chức năng chính của hệ thống.

## 1. Xác thực và Tài khoản (Authentication)
Hệ thống yêu cầu người dùng đăng nhập để truy cập các tính năng.
- **Đăng nhập**: Sử dụng email và mật khẩu đã đăng ký. Hệ thống sẽ trả về mã JWT (JSON Web Token) dùng để xác thực các yêu cầu tiếp theo.
- **Đăng ký**: Nhân viên mới có thể được tạo bởi Admin hoặc HR.
- **Quên mật khẩu**: (Nếu có) Chức năng gửi email khôi phục mật khẩu.

## 2. Quản lý Nhân viên (Employee Management)
Chức năng dành cho HR và Admin để quản lý hồ sơ nhân viên.
- **Danh sách nhân viên**: Xem danh sách toàn bộ nhân viên, tìm kiếm theo tên, phòng ban.
- **Thêm nhân viên mới**: Nhập thông tin cá nhân, vị trí, phòng ban, mức lương cơ bản.
- **Cập nhật hồ sơ**: Chỉnh sửa thông tin liên lạc, chức vụ.
- **Xóa nhân viên**: Vô hiệu hóa hoặc xóa hồ sơ nhân viên khỏi hệ thống.

## 3. Tuyển dụng (Recruitment)
Quy trình tuyển dụng bao gồm 3 phần chính:
### 3.1. Tin tuyển dụng (Vacancies)
- **Tạo tin tuyển dụng**: HR tạo các vị trí tuyển dụng mới với mô tả công việc, yêu cầu, số lượng cần tuyển.
- **Quản lý trạng thái**: Đóng/mở tin tuyển dụng.

### 3.2. Ứng viên (Candidates)
- **Nộp hồ sơ**: Ứng viên nộp CV cho các vị trí tuyển dụng.
- **Xử lý hồ sơ**: HR xem xét, chuyển trạng thái ứng viên (Mới, Đã duyệt, Phỏng vấn, Đã tuyển, Từ chối).
- **Lưu trữ**: Thông tin ứng viên được lưu trữ để tra cứu sau này.

### 3.3. Phỏng vấn (Interviews)
- **Lên lịch phỏng vấn**: Tạo lịch phỏng vấn cho ứng viên với người phỏng vấn.
- **Đánh giá**: Ghi lại kết quả phỏng vấn.

## 4. Quản lý Nghỉ phép (Leave Management)
- **Gửi yêu cầu nghỉ phép**: Nhân viên tạo yêu cầu nghỉ (ốm, việc riêng, phép năm).
- **Duyệt nghỉ phép**: Quản lý hoặc HR xem xét và duyệt/từ chối yêu cầu.
- **Theo dõi số ngày nghỉ**: Hệ thống tự động tính toán số ngày nghỉ còn lại.

## 5. Quản lý Lương (Salary Management)
- **Bảng lương**: HR/Kế toán tạo bảng lương hàng tháng.
- **Tính toán**: Lương được tính dựa trên mức lương cơ bản, ngày công, và các khoản phụ cấp/khấu trừ.
- **Lịch sử lương**: Xem lại lịch sử trả lương của từng nhân viên.

## 6. Quản lý Phòng ban (Departments)
- **Cấu trúc tổ chức**: Tạo và quản lý các phòng ban trong công ty.
- **Phân bổ nhân viên**: Gán nhân viên vào các phòng ban cụ thể.

## 7. Quản lý Người dùng hệ thống (System Users)
- **Phân quyền**: Quản lý các vai trò (Role) như Admin, HR, Manager, Employee.
- **Bảo mật**: Đảm bảo chỉ người dùng có quyền mới truy cập được các chức năng nhạy cảm.
