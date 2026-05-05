# 📖 GoPRP API Specification (Unified)

Tài liệu hướng dẫn tích hợp toàn bộ API hệ thống GoPRP cho Frontend (FE).
**Base URL:** `http://localhost:8080/api`

---

## 🔐 Authentication Header
Mọi API (trừ Login) đều yêu cầu Header xác thực:
`Authorization: Bearer <access_token>`

---

## 🏗️ 1. Authentication Module

### 1.1 Đăng nhập (Login)
Lấy Token để truy cập hệ thống.
- **Endpoint:** `POST /login`
- **Auth Required:** No

#### Request Body
```json
{
  "username": "admin",
  "password": "password123"
}
```

#### Success Response (200 OK)
```json
{
  "access_token": "eyJhbGciOiJIUzI1Ni...",
  "expires_at": "2026-04-28T22:50:00Z",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 1.2 Đổi mật khẩu (Change Password)
Người dùng tự đổi mật khẩu cá nhân.
- **Endpoint:** `POST /change-password`
- **Auth Required:** Yes

#### Request Body
```json
{
  "old_password": "mật_khẩu_cũ",
  "new_password": "mật_khẩu_mới_ít_nhất_6_ký_tự"
}
```

#### Success Response (200 OK)
```json
{
  "message": "Mật khẩu đã được đổi thành công"
}
```

---

## 👤 2. User Module (Profile)

### 2.1 Lấy thông tin cá nhân (Get Me)
Dùng để hiển thị thông tin người dùng đang đăng nhập.
- **Endpoint:** `GET /me`
- **Auth Required:** Yes

#### Success Response (200 OK)
```json
{
  "data": {
    "id": 1,
    "username": "admin",
    "full_name": "System Administrator",
    "role": "admin",
    "email": "admin@example.com",
    "phone": "0912345678",
    "status": "active"
  }
}
```

---

## 🛡️ 3. Admin Control (User Management)

### 3.1 Đăng ký User mới
- **Endpoint:** `POST /register`
- **Auth Required:** Yes (Admin Only)

#### Request Body
```json
{
  "username": "staff_01",
  "password": "password123",
  "fullname": "Nguyen Van A",
  "role": "member",
  "email": "a.nguyen@example.com",
  "phone": "0988777666"
}
```

### 3.2 Danh sách tất cả người dùng
- **Endpoint:** `GET /users`
- **Auth Required:** Yes (Admin Only)

#### Success Response (200 OK)
```json
[
  {
    "id": 1,
    "username": "admin",
    "full_name": "System Administrator",
    "role": "admin",
    "email": "admin@naicode.com",
    "phone": "0901234567",
    "status": "active"
  }
]
```

### 3.3 Cập nhật / Xóa / Đổi trạng thái User
- **PUT /users/:id**: Cập nhật thông tin (fullname, role, email, phone).
- **DELETE /users/:id**: Xóa vĩnh viễn user.
- **PATCH /users/:id/status**: Đổi trạng thái (`active`/`inactive`).

### 3.4 Reset Mật khẩu (Admin Reset)
Admin đặt lại mật khẩu cho nhân viên.
- **Endpoint:** `POST /reset-password`
- **Auth Required:** Yes (Admin Only)

#### Request Body
```json
{
  "user_id": 2,
  "new_password": "mật_khẩu_mới_tùy_chọn"
}
```
*Lưu ý: Nếu không truyền `new_password`, mật khẩu sẽ mặc định về `123456`.*

---

## 💰 4. Finance Module (Core Business)

Module quản lý tài chính cá nhân, tài sản và dòng tiền.
**Chi tiết bàn giao:** [Tài liệu bàn giao Finance API](./finace/api_handover.md)

### 4.1 Quản lý Ví (Wallets)
- `POST /finance/wallets`: Tạo ví mới. Yêu cầu trường `type` (`cash`, `bank`, `credit`).
- `GET /finance/wallets`: Danh sách ví.
- `POST /finance/wallets/transfer`: Chuyển tiền nội bộ.

### 4.2 Giao dịch (Transactions)
- `POST /finance/transactions`: Ghi nhận thu/chi (kèm phân bổ nguồn).
- `GET /finance/transactions`: Lịch sử giao dịch chi tiết.

### 4.3 Phân tích & Báo cáo (Analytics)
- `GET /finance/analytics/dashboard`: Chỉ số Net worth, Cash flow.
- `GET /finance/analytics/health-score`: Điểm sức khỏe tài chính.

---

## 🛠️ Error Handling (Standard)
Hệ thống trả về lỗi theo cấu trúc:
```json
{
  "error": "Thông báo lỗi chi tiết"
}
```
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ.
- `401 Unauthorized`: Token không hợp lệ hoặc hết hạn.
- `403 Forbidden`: Không có quyền truy cập.
- `404 Not Found`: Không tìm thấy dữ liệu.
- `409 Conflict`: Dữ liệu đã tồn tại hoặc lỗi logic nghiệp vụ.
- `500 Internal Error`: Lỗi hệ thống.

---
*Ngày cập nhật: 30/04/2026*
*Trạng thái: ✅ ĐÃ HOÀN THIỆN TOÀN BỘ LOGIC USER & AUTH*
