# Frontend Tests - HRM Web

Suite kiểm thử cho frontend React/TypeScript, sử dụng **Vitest** + **React Testing Library**.

## 🛠 Công cụ sử dụng

| Thư viện | Phiên bản | Mục đích |
|---|---|---|
| `vitest` | v4.x | Test framework (tích hợp Vite, nhanh hơn Jest) |
| `@testing-library/react` | latest | Render và tương tác với React components |
| `@testing-library/jest-dom` | latest | Custom matchers (`toBeInTheDocument`, v.v.) |
| `jsdom` | latest | Giả lập môi trường trình duyệt (DOM) |

##  Cấu trúc

```
src/tests/
├── setup.ts                          # Global setup: mock localStorage, jest-dom matchers
├── unit/
│   ├── jwt.utils.test.ts             # Unit test: decodeJWT
│   ├── rbac.test.ts                  # Unit test: RBAC helper functions
│   ├── auth.store.test.ts            # Unit test: Zustand auth store
│   ├── ui-stores.test.ts             # Unit test: SnackbarStore + UIStore
│   └── auth-fetch.test.ts            # Unit test: getAuthHeaders, authFetch
└── components/
    ├── PermissionGuard.test.tsx      # Component test: Permission-based rendering
    └── RoleGuard.test.tsx            # Component test: Route guards & redirects
```

##  Chạy tests

```bash
# Chạy tất cả tests một lần
npm test

# Chạy ở chế độ watch (auto re-run khi sửa file)
npm run test:watch

# Chạy với báo cáo coverage
npm run test:coverage
```

##  Kết quả

```
Test Files  7 passed (7)
Tests      117 passed (117)
Duration   ~900ms
```

##  Phạm vi kiểm thử

### Unit Tests

#### `jwt.utils.test.ts` — 7 tests
-  Decode token hợp lệ và trả về payload đúng
-  Trả về null khi token rỗng, thiếu cấu trúc, base64 sai
-  Xử lý ký tự đặc biệt base64url (`-`, `_`)

#### `rbac.test.ts` — 34 tests
-  `hasPermission`: check permission cụ thể
-  `hasAnyPermission`: check ít nhất 1 permission
-  `hasAllPermissions`: check toàn bộ permissions
-  `hasRole`: check role (string/array)
-  `canAccessRoute`: check quyền truy cập route tĩnh và dynamic (`:id`)
-  `getDefaultRoute`: redirect route đúng theo role

#### `auth.store.test.ts` — 13 tests
-  Trạng thái khởi tạo chưa đăng nhập
-  `login`: cập nhật state, ưu tiên permissions từ user object
-  `logout`: xóa toàn bộ thông tin xác thực
-  `updateUser`: cập nhật một phần thông tin user
-  `updateAccessToken`: cập nhật token & permissions từ JWT mới
-  `hasRole` helper function

#### `ui-stores.test.ts` — 18 tests
-  `SnackbarStore`: `showSnackbar` (type, duration mặc định), `hideSnackbar`
-  `UIStore`: `toggleSidebar` (nhiều lần), `setSidebarCollapsed`, `openModal`, `closeModal`, `closeSidebar`

#### `auth-fetch.test.ts` — 8 tests
-  `getAuthHeaders`: có/không có token
-  `authFetch`: gắn Authorization header tự động
-  `authFetch`: truyền method, body đúng
-  `authFetch`: tự động refresh token khi 401 và retry request
-  `authFetch`: gọi logout khi refresh token thất bại

### Component Tests

#### `PermissionGuard.test.tsx` — 23 tests
-  `ShowForRoles`: hiển thị/ẩn theo role, fallback, chưa login
-  `ShowForPermission`: hiển thị/ẩn theo permission cụ thể
-  `ShowForAnyPermission`: hiển thị khi có ít nhất 1 permission
-  `HideForRoles`: ẩn khi user có role chỉ định
-  `AdminOnly`, `HROnly`, `HRAndEmployee`, `InternalUsers`

#### `RoleGuard.test.tsx` — 14 tests
-  `ProtectedRoute`: redirect về `/` khi chưa login
-  `RoleGuard`: redirect khi sai role, render khi đúng role
-  `RoleGuard`: redirect đến `redirectTo` tùy chỉnh
-  `AdminRoute`, `HRRoute`, `EmployeeRoute`

##  Ghi chú quan trọng

> **Không sửa logic code gốc**: Toàn bộ test được viết dựa trên hành vi thực tế của code hiện tại.

> **`[]` là truthy trong JavaScript**: `user.permissions || decoded.permissions` với `permissions = []` sẽ giữ `[]` thay vì fallback sang JWT. Test `auth.store` đã document đúng hành vi này.

> **React Router warnings**: Các warning về `v7_startTransition` và `v7_relativeSplatPath` là bình thường với React Router v6, không ảnh hưởng đến kết quả test.
