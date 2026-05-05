# 📋 Todolist: Admin & User Management Implementation

Dự án: **GoPRP ERP**
Module: **Admin Control & User Profile**
Quy trình: **Design-First, TDD Mandatory**

---

## 🏗️ Phase 1: Contract & Foundation
Thiết lập các định nghĩa dữ liệu và validation chuẩn Zod theo API bàn giao.

- [x] **1.1. Update Contracts**
    - [x] `user.contract.ts`: Bổ sung `UserListSchema`, `UpdateUserRequestSchema`, `UpdateStatusRequestSchema`.
    - [x] `admin.contract.ts`: Kiểm tra lại khớp với `RegisterRequest` của BE.
- [x] **1.2. Shared Models**
    - [x] Cập nhật `entities/user/model/user.model.ts` nếu có field mới (VD: `email`, `phone`, `status`).


---

## 🔗 Phase 2: API Hooks & Data Integration
Xây dựng lớp kết nối dữ liệu sử dụng TanStack Query.

- [ ] **2.1. Admin API Hooks (`adminApi.ts`)**
    - [x] `useRegister()` — POST /register
    - [x] `useResetPassword()` — POST /reset-password
- [x] **2.2. User API Hooks (`userApi.ts`)**
    - [x] `useMe()` — GET /me
    - [x] `useUserDetail(id)` — GET /users/:id
    - [x] `useUsers()` — GET /users (Danh sách user cho admin)
    - [x] `useUpdateUser()` — PUT /users/:id
    - [x] `useDeleteUser()` — DELETE /users/:id
    - [x] `useUpdateUserStatus()` — PATCH /users/:id/status


---

## 🖼️ Phase 3: UI Pages & Components
Phát triển giao diện quản trị và phân quyền Dashboard.

- [x] **3.1. Admin Management Page (`/admin/users`)**
    - [x] `UserTable.tsx`: Bảng hiển thị danh sách user với filter và phân trang.
    - [x] `UserStatusToggle.tsx`: Switch đổi trạng thái `active/inactive` (Tích hợp trong Table).
    - [x] `CreateUserModal.tsx`: Dialog bọc form đăng ký.
    - [x] `EditUserModal.tsx`: Dialog chỉnh sửa thông tin.
- [x] **3.2. Role-Based Dashboard Integration**
    - [x] Tách `AdminDashboardView.tsx` và `MemberDashboardView.tsx`.
    - [x] Cập nhật `app/dashboard/page.tsx` để render view tương ứng theo `user.role`.
- [x] **3.3. Navigation & Guards**
    - [x] Thêm menu "Quản lý User" cho Admin trên Sidebar/Header.
    - [x] Implement Route Guard cho `/admin/*` (Chỉ cho phép role `admin`).


---

## 🧪 Phase 4: Testing & Quality Assurance
Đảm bảo hệ thống chạy đúng kịch bản và bảo mật.

- [x] **4.1. Unit Tests (Vitest)**
    - [x] Test tất cả API hooks mới (mock apiClient).
    - [x] Test logic phân quyền (Admin can see X, Member cannot).
- [x] **4.2. E2E Tests (Playwright)**
    - [x] **Admin Flow:** Đăng nhập -> Tạo User -> Sửa User -> Đổi Status -> Xóa User.
    - [x] **Security Test:** Member cố tình truy cập `/admin/users` -> Redirect hoặc báo lỗi 403.
    - [x] **Reset Password Flow:** Admin reset -> Member đăng nhập bằng pass mặc định `123456`.


---

## ⚠️ Lưu ý quan trọng (Important Notes)
1. **Reset Password:** Pass mặc định là `123456`. Sau khi reset, cần nhắc user đổi pass (nếu có tính năng đổi pass).
2. **Xóa User:** API `DELETE /users/:id` là xóa cứng hay xóa mềm? Cần confirm với BE về ảnh hưởng dữ liệu (VD: User bị xóa thì các giao dịch tài chính của họ sẽ ra sao?).
3. **Phân quyền:** Kiểm tra kỹ `authStore` để tránh tình trạng lộ data admin cho member.
