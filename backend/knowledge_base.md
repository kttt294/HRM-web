# Hệ thống Quản trị Nhân sự

## 1. Cơ cấu vai trò & Phân quyền (Permissions)

### Quản trị viên (Admin)

- Toàn quyền truy cập mọi chức năng.
- Quản lý tài khoản, phân quyền (Roles).
- Quản lý danh mục phòng ban, chức danh.

### Nhân sự (HR)

- Quản lý hồ sơ nhân viên toàn công ty.
- Duyệt các yêu cầu cập nhật hồ sơ từ nhân viên.
- Quản lý tuyển dụng, bảng lương, bảo hiểm.

### Quản lý (Manager)

- Xem thông tin nhân viên **trong phòng ban mình phụ trách**.
- Duyệt yêu cầu cập nhật hồ sơ của nhân viên thuộc phòng mình.
- Quản lý nghỉ phép của nhân viên trong phòng.
- **Tại sao tôi không xem được nhân viên khác?** Manager chỉ có quyền xem nhân viên thuộc phòng ban mình quản lý để đảm bảo tính bảo mật và chuyên môn hóa.

### Nhân viên (Employee)

- Xem thông tin cá nhân, gửi yêu cầu cập nhật hồ sơ.
- Quản lý nghỉ phép cá nhân.

## 2. Các quy trình quan trọng

### Cập nhật hồ sơ (Profile Update)

- Khi nhân viên sửa thông tin cá nhân (Họ tên, ngày sinh, địa chỉ, ảnh đại diện...), thông tin cũ vẫn được giữ nguyên.
- Trạng thái hồ sơ chuyển sang **"Đang chờ duyệt" (Pending)**.
- HR hoặc Manager (trưởng phòng) phải vào mục **"Duyệt hồ sơ"** để kiểm tra (So sánh bản cũ và bản mới) và bấm "Chấp nhận".
- **Tại sao tôi cập nhật xong mà không thấy thay đổi?** Dữ liệu mới chỉ được áp dụng vào hồ sơ chính thức sau khi HR hoặc Manager phê duyệt. Bạn hãy kiên nhẫn chờ nhé!

### Quản lý nghỉ phép (Leave Request)

- Nhân viên gửi đơn nghỉ phép kèm lý do.
- Manager duyệt bước 1.
- HR duyệt bước 2 (cuối cùng) để trừ vào số ngày phép còn lại.

## 3. Các câu hỏi thường gặp (FAQ)

**Q: Tại sao tôi không thấy nút "Sửa" nhân viên?**
A: Chức năng sửa trực tiếp hồ sơ nhân viên chỉ dành cho HR và Admin. Manager chỉ có quyền xem và duyệt yêu cầu cập nhật từ nhân viên.

**Q: Tôi là Manager nhưng vào trang danh sách nhân viên lại không thấy ai?**
A: Có thể bạn chưa được bổ nhiệm làm "Trưởng phòng" của bất kỳ phòng ban nào trong mục Quản lý phòng ban. Hãy liên hệ Admin để kiểm tra lại `manager_id` của phòng ban.

**Q: Làm sao để đổi mật khẩu?**
A: Bạn vào mục "Hồ sơ của tôi", có nút "Đổi mật khẩu" màu xám bên cạnh nút "Cập nhật hồ sơ".

**Q: Tôi đã được duyệt cập nhật hồ sơ nhưng thông tin vẫn cũ?**
A: Hãy thử F5 (tải lại trang). Nếu vẫn không được, có thể trình duyệt đang lưu cache cũ (dù hiếm khi xảy ra trong hệ thống này).

**Q: Manager có thể xóa nhân viên không?**
A: Không. Chỉ Admin và HR mới có quyền xóa hoặc thay đổi hợp đồng nhân viên.
