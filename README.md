HỆ THỐNG QUẢN TRỊ NHÂN SỰ - Nhóm 8 - Kỳ 2 2026 - ĐH Phenikaa

1. GIỚI THIỆU:
   Dự án là nền tảng quản trị nhân sự toàn diện, hỗ trợ quản lý hồ sơ nhân viên, quy trình tuyển dụng và phân quyền hệ thống.
2. CÔNG NGHỆ SỬ DỤNG:

- Frontend: React.js (Vite), Zustand, Anime.js.
- Backend: Node.js (Express), xác thực qua JWT & HttpOnly Cookie.
- Database: MySQL (Cloud hosted on Aiven).
- DevOps: Docker & Docker Compose, Deployment qua Render và Vercel.
- Công cụ hỗ trợ: ngrok (Tunneling phục vụ demo và kiểm thử).

3. CÁC TÍNH NĂNG CHÍNH:

- Quản lý nhân sự: Lưu trữ thông tin, lịch sử công tác.
- Tuyển dụng: Quản lý tin tuyển dụng và hồ sơ ứng viên.
- Bảo mật: Phân quyền RBAC (Admin, Manager, HR, Employee) và bảo vệ XSS/CSRF.
- Tối ưu: Sử dụng Connection Pooling để tăng tốc độ truy vấn database.
- AI (Nhánh ver2): Tích hợp DeepSeek API hỗ trợ phân tích dữ liệu.

4. THIẾT KẾ DATABASE:

![Database Diagram](backend/database/diagram.png)

5. HƯỚNG DẪN CHẠY DỰ ÁN:

- Cách 1 (Docker): Chạy lệnh 'docker-compose up --build'.
- Cách 2 (Manual):
  + Backend: 'npm install' -> 'npm run init' -> 'npm run dev' (Port 5001).
  + Frontend: 'npm install' -> 'npm run dev' (Port 3000).

6. LIÊN HỆ: 24100093@st.phenikaa-uni.edu.vn
