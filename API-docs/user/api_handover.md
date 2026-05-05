# 📋 Bàn Giao API Module User Management — Dành Cho Team Frontend

> **Base URL:** `/api`
> **Authentication:** Các API này yêu cầu Header `Authorization: Bearer <JWT_TOKEN>` và tài khoản phải có quyền `admin`.

## 🧭 Mục lục nhanh
- [📌 Quy ước chung](#quy-ước-chung)
- [👥 Quản lý người dùng (Admin Only)](#quản-lý-người-dùng-admin-only)
    - [1.1. Danh sách người dùng](#11-danh-sách-người-dùng)
    - [1.2. Xem thông tin cá nhân (Profile)](#12-xem-thông-tin-cá-nhân-profile)
    - [1.3. Sửa thông tin người dùng](#13-sửa-thông-tin-người-dùng)
    - [1.4. Xóa người dùng](#14-xóa-người-dùng)
    - [1.5. Đổi trạng thái (Kích hoạt/Vô hiệu hóa)](#15-đổi-trạng-thái-kích-hoạtvô-hiệu-hóa)

---

## 📌 Quy ước chung
- **Role:** Gồm `admin` và `member`.
- **Status:** Gồm `active` và `inactive`.
- **Lỗi:** Trả về `{ "error": "Mô tả lỗi" }`.

---

## 👥 Quản lý người dùng (Admin Only)

### 1.1. Danh sách người dùng
```
GET /api/users
```
**Response `200 OK`:**
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
  },
  {
    "id": 2,
    "username": "hung_dev",
    "full_name": "Nguyen Van Hung",
    "role": "member",
    "email": "hung@naicode.com",
    "phone": "0907654321",
    "status": "inactive"
  }
]
```

---

### 1.2. Xem thông tin cá nhân (Profile)
```
GET /api/me
```
**Response `200 OK`:** Trả về object User của người đang đăng nhập.

---

### 1.3. Sửa thông tin người dùng
```
PUT /api/users/:id
```
**Request Body:**
```json
{
  "full_name": "Hùng Đẹp Trai",
  "role": "admin",
  "email": "hungnew@naicode.com",
  "phone": "0988888888"
}
```
**Response `204 No Content`**

---

### 1.4. Xóa người dùng
```
DELETE /api/users/:id
```
**Response `204 No Content`**

---

### 1.5. Đổi trạng thái (Kích hoạt/Vô hiệu hóa)
```
PATCH /api/users/:id/status
```
**Request Body:**
```json
{
  "status": "inactive"
}
```
**Response `204 No Content`**

---

**Cập nhật ngày:** 29/04/2026
**Trạng thái Backend:** ✅ ĐÃ XONG & ĐÃ TEST (ALL PASS)
