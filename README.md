<h2>HỆ THỐNG QUẢN LÝ NHÂN SỰ - Nhóm 8 - Kỳ 2 2026 - ĐH Phenikaa</h2>

1. GIỚI THIỆU: Dự án là nền tảng quản trị nhân sự toàn diện tích hợp Trợ lý AI thông minh (Gemini), hỗ trợ quản lý hồ sơ nhân viên, quy trình tuyển dụng đa giai đoạn, quản lý lương và nghỉ phép. Hệ thống được thiết kế hướng tới trải nghiệm người dùng hiện đại và quy trình tự động hóa.

2. CÔNG NGHỆ SỬ DỤNG

- Frontend: React.js (Vite), Zustand (State management), Anime.js (Animations).
- Backend: Node.js (Express), xác thực qua JWT & HttpOnly Cookie.
- AI Service: Tích hợp Google Gemini 2.5 Flash (Xử lý truy vấn thông minh, cá nhân hóa phản hồi).
- Database: MySQL (Cloud hosted on Aiven).
- DevOps: Docker & Docker Compose, Deployment qua Render và Vercel.
- Công cụ hỗ trợ: ngrok (Tunneling), .env management.

3. CÁC TÍNH NĂNG CHÍNH

- Trợ lý AI HRM (Gemini Chatbot):
  - Chế độ Công khai: Hỗ trợ khách vãng lái/ứng viên nộp đơn tìm hiểu về dự án và công ty.
  - Chế độ Cá nhân hóa: Nhận diện danh tính và vai trò người dùng (Admin, Manager, Employee) để giải đáp quy trình chuyên sâu.
  - Tự động hóa FAQ: Phân tích kiến thức hệ thống để hỗ trợ giải quyết thắc mắc về hồ sơ, lương và phép.

- Bảo mật và Xác thực:
  - Xác thực chuẩn Token: Sử dụng cơ chế Double Token (Access & Refresh) lưu trong HttpOnly Cookie.
  - Phân quyền (RBAC): Hệ thống phân quyền chặt chẽ giữa Admin, Manager, HR và Employee.
  - Bảo vệ dữ liệu: Chống CSRF, XSS và Rate Limiting cho toàn bộ API hệ thống.

- Quản lý Tuyển dụng (Recruitment Life-cycle):
  - Đăng tin tuyển dụng (Vacancies): Quản lý chi tiết vị trí, yêu cầu và ngân sách.
  - Tiếp nhận hồ sơ (Candidates): Ứng viên nộp CV trực tuyến, hệ thống phân loại trạng thái.
  - Lịch phỏng vấn (Interviews): Lên lịch, chỉ định người phỏng vấn và ghi nhận kết quả đánh giá.

- Quản lý Nhân sự (Employee Lifecycle):
  - Định danh chuẩn: Mã nhân viên tự động (ID 5 ký tự: 00001).
  - Quy trình tự phục vụ (Self-Service): Nhân viên tự cập nhật thông tin, chờ Manager/HR phê duyệt.
  - Xác thực hồ sơ: Quản lý trạng thái "Đã xác thực" (Verified Badge) sau khi kiểm tra thông tin.

- Lương & Nghỉ phép (Payroll & Leave):
  - Tính lương: Tự động tổng hợp lương cơ bản, phụ cấp và các khoản trừ theo tháng.
  - Quy trình nghỉ phép: Đơn từ duyệt 2 cấp (Manager -> HR) minh bạch và tức thời.

- Tối ưu hiệu năng: Sử dụng Connection Pooling, nén ảnh (Image compression) và cơ chế caching nhẹ.

4. THIẾT KẾ DATABASE

![Database Diagram](backend/database/diagram.png)

5. HƯỚNG DẪN CHẠY DỰ ÁN (Cross-platform)

- Cách 1: Sử dụng Docker (Khuyên dùng cho mọi hệ điều hành)
  Đảm bảo đã cài đặt Docker Desktop. Chạy lệnh tại thư mục gốc:

  ```bash
  docker-compose up --build
  ```
- Cách 2: Chạy thủ công (Linux, macOS, Windows)
  Yêu cầu: Node.js (v18+) và npm installed.

  Bước 1: Cấu hình Backend

  ```bash
  cd backend
  npm install
  npm run init   # Khởi tạo database & dữ liệu mẫu
  npm run dev    # Chạy server tại port 5001
  ```

  Lưu ý: Trên Linux/macOS, nếu gặp lỗi quyền truy cập khi install, sử dụng `sudo` hoặc kiểm tra lại quyền thư mục.

  Bước 2: Cấu hình Frontend

  ```bash
  cd frontend
  npm install
  npm run dev    # Chạy ứng dụng tại port 3000
  ```

6. LIÊN HỆ: 24100093@st.phenikaa-uni.edu.vn
