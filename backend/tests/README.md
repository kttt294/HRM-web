# Hướng dẫn Kiểm thử (Testing Documentation) - HRM Backend

Thư mục này chứa toàn bộ các bài kiểm thử (tests) của phần Backend hệ thống HRM. Chúng tôi sử dụng **Jest** làm khung kiểm thử chính (Test Runner & Assertion Library) và **Supertest** để thực hiện kiểm thử tích hợp cho các HTTP API endpoints.

---

## Cấu trúc thư mục `tests`

```text
tests/
├── README.md               # Tài liệu hướng dẫn này
├── integration/            # Kiểm thử tích hợp (Integration Tests)
│   └── auth.test.js        # Kiểm thử luồng API Login & Logout thực tế
└── unit/                   # Kiểm thử đơn vị (Unit Tests)
    ├── authController.test.js      # Kiểm thử logic đăng nhập & đăng xuất
    ├── authMiddleware.test.js      # Kiểm thử middleware xác thực JWT
    ├── departmentController.test.js # Kiểm thử các tác vụ CRUD phòng ban
    ├── jwt.test.js                 # Kiểm thử các hàm tạo & giải mã JWT
    ├── permissions.test.js         # Kiểm thử các logic và helper phân quyền
    └── validateRequest.test.js     # Kiểm thử middleware xác thực dữ liệu đầu vào
```

---

## Các lệnh chạy kiểm thử

Tất cả các lệnh cần được thực thi từ thư mục `backend/`:

### 1. Chạy toàn bộ các bài test
Chạy toàn bộ các test suites ở cả thư mục `unit` và `integration`:
```bash
npm run test
```
*Lưu ý: Lệnh này sử dụng biến môi trường `NODE_ENV=test` và các tham số tối ưu hóa như `--forceExit` (buộc đóng các kết nối treo) và `--detectOpenHandles` (phát hiện các tác vụ chưa hoàn thành).*

### 2. Xem độ bao phủ mã nguồn (Code Coverage Report)
Để kiểm tra xem bao nhiêu phần trăm dòng code đã được kiểm thử bao phủ:
```bash
npx jest --coverage
```
Báo cáo chi tiết dạng HTML sẽ được sinh ra tại thư mục `backend/coverage/lcov-report/index.html`. Bạn có thể mở tệp này bằng trình duyệt để xem chi tiết dòng code nào đã hoặc chưa được chạy qua kiểm thử.

### 3. Chạy một file test cụ thể
Nếu bạn chỉ muốn chạy riêng lẻ một tệp kiểm thử trong lúc phát triển:
```bash
npx jest tests/unit/permissions.test.js
```

---

## Hướng dẫn & Quy định viết Test mới

Để đảm bảo tính độc lập và tốc độ thực thi nhanh của bộ test, vui lòng tuân thủ các quy tắc sau:

### 1. Không kết nối cơ sở dữ liệu thật trong Unit Test
Unit test chỉ tập trung vào kiểm tra logic của hàm/controller/middleware. Mọi truy vấn cơ sở dữ liệu (`db.query`) phải được **mock** bằng cách sử dụng `jest.mock`.

*Ví dụ cấu hình mock database:*
```javascript
const db = require('../../config/database');
jest.mock('../../config/database', () => ({
    query: jest.fn()
}));

// Giả lập dữ liệu trả về từ MySQL
db.query.mockResolvedValueOnce([[{ id: 1, name: 'Phòng Mới' }]]);
```

### 2. Mock các module phụ thuộc (Dependencies)
Khi test một Controller, hãy mock tất cả các module tiện ích (như JWT, Permissions, Mailer) để cô lập phạm vi kiểm thử:
```javascript
jest.mock('../../utils/jwt', () => ({
    generateAccessToken: jest.fn(() => 'mock-token'),
    generateRefreshToken: jest.fn()
}));
```

### 3. Dọn dẹp Mock trước mỗi test case
Luôn sử dụng `jest.clearAllMocks()` hoặc `jest.resetAllMocks()` trong block `beforeEach` để tránh trạng thái từ test case trước ảnh hưởng đến test case sau.
```javascript
beforeEach(() => {
    jest.clearAllMocks();
});
```
