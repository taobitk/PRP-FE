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

---

## 👤 2. User Module

### 2.1 Lấy thông tin cá nhân (Get Me)
Dùng để hiển thị thông tin người dùng đang đăng nhập (Profile).
- **Endpoint:** `GET /me`
- **Auth Required:** Yes (Bearer Token)

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

## 🛡️ 3. Admin Control (Management)

### 3.1 Đăng ký User mới (Admin Only)
- **Endpoint:** `POST /register`
- **Auth Required:** Yes (Admin Token)

#### Request Body
```json
{
  "username": "staff_01",
  "fullname": "Nguyen Van A",
  "role": "member",
  "email": "a.nguyen@example.com",
  "phone": "0988777666"
}
```

#### Success Response (201 Created)
```json
{
  "id": 10,
  "username": "staff_01",
  "full_name": "Nguyen Van A",
  "role": "member"
}
```

---

## 💰 4. Finance Module (Core Business)

Module quản lý tài chính cá nhân, tài sản và dòng tiền.
**Chi tiết bàn giao:** [Tài liệu bàn giao Finance API](./finace/api_handover.md)

### 4.1 Quản lý Ví (Wallets)
- `POST /finance/wallets`: Tạo ví mới.
- `GET /finance/wallets`: Danh sách ví.
- `POST /finance/wallets/transfer`: Chuyển tiền nội bộ.

### 4.2 Giao dịch (Transactions)
- `POST /finance/transactions`: Ghi nhận thu/chi (kèm phân bổ nguồn).
- `GET /finance/transactions`: Lịch sử giao dịch chi tiết.

### 4.3 Phân tích & Báo cáo (Analytics)
- `GET /finance/analytics/dashboard`: Chỉ số Net worth, Cash flow.
- `GET /finance/analytics/health-score`: Điểm sức khỏe tài chính.
- `GET /finance/analytics/source-roi`: Phân tích Asset/Liability.

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
- `403 Forbidden`: Không có quyền truy cập (Yêu cầu Admin).
- `404 Not Found`: Không tìm thấy dữ liệu.
- `409 Conflict`: Dữ liệu đã tồn tại (Username, Email...) hoặc lỗi logic (Xóa ví đang dùng).
- `500 Internal Error`: Lỗi hệ thống.

---
*Ngày cập nhật: 29/04/2026*
