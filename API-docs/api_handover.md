# 📋 Bàn Giao API Module Finance — Dành Cho Team Frontend

> **Base URL:** `/finance`
> **Authentication:** Mọi request đều yêu cầu Header `Authorization: Bearer <JWT_TOKEN>`. Server sẽ tự extract `userID` từ token.

## 🧭 Mục lục nhanh (Table of Contents)

- [📌 Quy ước chung](#quy-ước-chung)
- [🏦 Nhóm 1: Wallets (Ví / Nguồn tài sản)](#nhóm-1-wallets-ví--nguồn-tài-sản)
    - [1.1. Tạo ví mới](#11-tạo-ví-mới)
    - [1.2. Danh sách ví](#12-danh-sách-ví)
    - [1.3. Sửa ví](#13-sửa-ví)
    - [1.4. Xóa ví](#14-xóa-ví)
    - [1.5. Luật số dư âm (Negative Balance Rules)](#15-luật-số-dư-âm-negative-balance-rules)
    - [1.6. Chuyển tiền giữa 2 ví](#16-chuyển-tiền-giữa-2-ví)
- [🗂️ Nhóm 2: Categories (Danh mục thu/chi)](#nhóm-2-categories-danh-mục-thuchi)
    - [2.1. Tạo danh mục](#21-tạo-danh-mục)
    - [2.2. Danh sách danh mục](#22-danh-sách-danh-mục)
    - [2.3. Sửa danh mục](#23-sửa-danh-mục)
    - [2.4. Xóa danh mục](#24-xóa-danh-mục)
- [💸 Nhóm 3: Transactions (Giao dịch & Phân bổ)](#nhóm-3-transactions-giao-dịch--phân-bổ)
    - [3.1. Ghi nhận giao dịch](#31-ghi-nhận-giao-dịch)
    - [3.2. Lịch sử giao dịch](#32-lịch-sử-giao-dịch)
    - [3.3. Sửa giao dịch](#33-sửa-giao-dịch)
    - [3.4. Xóa giao dịch](#34-xóa-giao-dịch)
- [📊 Nhóm 4: Analytics (Phân tích & Báo cáo)](#nhóm-4-analytics-phân-tích--báo-cáo)
    - [4.1. Dashboard tổng quan](#41-dashboard-tổng-quan)
    - [4.2. Thống kê thu/chi theo kỳ](#42-thống-kê-thuchi-theo-kỳ)
    - [4.3. Thiên kiến chi tiêu](#43-thiên-kiến-chi-tiêu-spending-bias)
    - [4.4. Xu hướng dòng tiền](#44-xu-hướng-dòng-tiền-cash-flow-trend)
    - [4.5. ROI & Phân loại Nguồn](#45-roi--phân-loại-nguồn-source-roi--unique-feature)
    - [4.6. Dự báo & Hoàn vốn](#46-dự-báo--hoàn-vốn-forecast)
    - [4.7. So sánh kỳ trước](#47-so-sánh-kỳ-trước-comparison)
    - [4.8. Điểm Sức khỏe Tài chính](#48-điểm-sức-khỏe-tài-chính-health-score)
- [🛡️ Nhóm 5: Budgets (Ngân sách)](#nhóm-5-budgets-ngân-sách)
    - [5.1. Thiết lập ngân sách](#51-thiết-lập-ngân-sách)
    - [5.2. Trạng thái ngân sách](#52-trạng-thái-ngân-sách)
- [🔐 Authentication & Error Codes](#authentication--error-codes)
- [🧪 Checklist Test Cho Frontend](#checklist-test-cho-frontend)
- [📂 Tài liệu bổ sung](#6-tài-liệu-bổ-sung)

---

**Ngày bàn giao:** 29/04/2026
**Trạng thái Backend:** ✅ IMPLEMENTED & TESTED (74 test cases — 100% PASS)

---

## 📌 Quy ước chung

| Mục | Quy ước |
|---|---|
| **Số tiền (amount, balance)** | Kiểu `string` trong JSON (VD: `"10000"`, `"99.50"`). Dùng thư viện `decimal` để tránh lỗi floating point. FE nên dùng `BigNumber.js` hoặc tương đương |
| **Ngày tháng** | ISO 8601 — `"2026-04-29T10:30:00Z"` |
| **Lỗi** | Luôn trả về `{ "error": "Mô tả lỗi" }` |
| **ID** | Kiểu `number` (uint), auto-increment |
| **Data Isolation** | User A **tuyệt đối** không thể xem/sửa/xóa dữ liệu của User B. Server tự filter theo `userID` từ JWT |

---

## 🏦 Nhóm 1: Wallets (Ví / Nguồn tài sản)

### 1.1. Tạo ví mới
```
POST /finance/wallets
```

**Request Body:**
```json
{
  "name": "Ví Tiền Mặt",
  "type": "cash",
  "initial_balance": "5000000"
}
```
> `type` gồm: `cash`, `bank`, `credit`.
```

**Response `201 Created`:**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Ví Tiền Mặt",
  "type": "cash",
  "balance": "5000000"
}
```

**Lỗi có thể gặp:**

| Code | Khi nào | Response |
|---|---|---|
| `400` | Thiếu `name` hoặc `type` | `{ "error": "Key: 'CreateWalletRequest.Name' Error:..." }` |
| `400` | Ví `cash`/`bank` có `initial_balance < 0` | `{ "error": "Initial balance cannot be negative for this wallet type" }` |
| `400` | `type` không hợp lệ | `{ "error": "Invalid wallet type. Must be cash, bank, or credit" }` |
| `409` | Tên ví đã tồn tại (cùng user) | `{ "error": "Wallet name already exists" }` |

---

### 1.2. Danh sách ví
```
GET /finance/wallets
```

**Response `200 OK`:**
```json
[
  { "id": 1, "user_id": 1, "name": "Ví Tiền Mặt", "type": "cash", "balance": "5000000" },
  { "id": 2, "user_id": 1, "name": "Ví Đầu Tư",   "type": "bank", "balance": "0" }
]
```
> Nếu User chưa có ví nào → trả về mảng rỗng `[]`.

---

### 1.3. Sửa ví
```
PUT /finance/wallets/:id
```

**Request Body:**
```json
{
  "name": "Ví Ngân Hàng VCB"
}
```

**Response `204 No Content`** — Không có body.

**Lỗi có thể gặp:**

| Code | Khi nào |
|---|---|
| `404` | Ví không tồn tại hoặc không thuộc user hiện tại |
| `409` | Tên mới trùng với ví khác |

---

### 1.4. Xóa ví
```
DELETE /finance/wallets/:id
```

**Response `204 No Content`** — Không có body.

**Lỗi có thể gặp:**

| Code | Khi nào |
|---|---|
| `404` | Ví không tồn tại |
| `409` | Ví đang có giao dịch hoặc đang được dùng trong phân bổ (attribution) → Không cho xóa |

---

### 1.5. Luật số dư âm (Negative Balance Rules) 🏛️⚖️

Hệ thống áp dụng luật kiểm soát số dư nghiêm ngặt dựa trên loại ví:

| Loại ví (`type`) | Cho phép số dư âm? | Ý nghĩa |
|---|---|---|
| `cash` | ❌ **KHÔNG** | Tiền mặt trong túi, không thể chi quá số đang có. |
| `bank` | ❌ **KHÔNG** | Tài khoản thanh toán (Debit), không được thấu chi. |
| `credit` | ✅ **CÓ** | Thẻ tín dụng hoặc khoản nợ. Số dư âm biểu thị số tiền đang nợ. |

**Hành vi hệ thống:**
- Khi **Tạo ví**: Không được tạo ví `cash`/`bank` với `initial_balance < 0`.
- Khi **Chi tiêu/Chuyển tiền**: Nếu giao dịch làm ví `cash`/`bank` bị âm -> Trả về lỗi `400`.
- Khi **Xóa khoản thu (Income)**: Nếu việc xóa làm ví bị âm -> Trả về lỗi `400`.

---

### 1.6. Chuyển tiền giữa 2 ví
```
POST /finance/wallets/transfer
```

**Request Body:**
```json
{
  "from_wallet_id": 1,
  "to_wallet_id": 2,
  "amount": "2000000"
}
```

**Response `204 No Content`** — Không có body. Balance 2 ví tự cập nhật (Atomic).

**Lỗi có thể gặp:**

| Code | Khi nào |
|---|---|
| `400` | `from_wallet_id == to_wallet_id` (chuyển cho chính mình) |
| `400` | `amount <= 0` |
| `400` | Ví nguồn (`cash`/`bank`) không đủ số dư để chuyển | `{ "error": "Insufficient balance in source wallet" }` |
| `404` | Ví nguồn hoặc ví đích không tồn tại / không thuộc user |

---

## 🗂️ Nhóm 2: Categories (Danh mục thu/chi)

### 2.1. Tạo danh mục
```
POST /finance/categories
```

**Request Body:**
```json
{
  "name": "Tiền Lương",
  "type": "income"
}
```
> `type` chỉ chấp nhận 2 giá trị: `"income"` hoặc `"expense"`.

**Response `201 Created`:**
```json
{
  "id": 1,
  "user_id": 1,
  "name": "Tiền Lương",
  "type": "income"
}
```

**Lỗi có thể gặp:**

| Code | Khi nào |
|---|---|
| `400` | Thiếu `name` hoặc `type` sai giá trị |
| `409` | Trùng tên + cùng type + cùng user (VD: 2 danh mục "Ăn uống" kiểu "expense") |

> Cho phép trùng tên nhưng KHÁC type (VD: "Nhà" income + "Nhà" expense → OK).

---

### 2.2. Danh sách danh mục
```
GET /finance/categories
```

**Response `200 OK`:**
```json
[
  { "id": 1, "user_id": 1, "name": "Tiền Lương", "type": "income" },
  { "id": 2, "user_id": 1, "name": "Ăn Uống",    "type": "expense" }
]
```

---

### 2.3. Sửa danh mục
```
PUT /finance/categories/:id
```

**Request Body:**
```json
{ "name": "Lương Tháng" }
```

**Response `204 No Content`.**

---

### 2.4. Xóa danh mục
```
DELETE /finance/categories/:id
```

**Response `204 No Content`.**

| Code | Khi nào |
|---|---|
| `409` | Danh mục đang được sử dụng trong giao dịch → Không cho xóa |

---

## 💸 Nhóm 3: Transactions (Giao dịch & Phân bổ)

> ⚡ **Khái niệm quan trọng — Attribution (Phân bổ nguồn):**
> Mỗi giao dịch PHẢI kèm theo ít nhất 1 `attribution` để chỉ rõ "tiền này đến từ nguồn nào" hoặc "chi phí này thuộc về nguồn nào".
> **Quy tắc bắt buộc:** `SUM(attribution.amount) == transaction.amount`

### 3.1. Ghi nhận giao dịch
```
POST /finance/transactions
```

**Request Body:**
```json
{
  "destination_wallet_id": 1,
  "category_id": 2,
  "amount": "500000",
  "transaction_date": "2026-04-29T10:00:00Z",
  "note": "Ăn trưa công ty",
  "attributions": [
    { "source_wallet_id": 1, "amount": "300000" },
    { "source_wallet_id": 2, "amount": "200000" }
  ]
}
```

**Response `201 Created`:**
```json
{
  "id": 1,
  "user_id": 1,
  "destination_wallet_id": 1,
  "category_id": 2,
  "amount": "500000",
  "transaction_date": "2026-04-29T10:00:00Z",
  "note": "Ăn trưa công ty",
  "attributions": [
    { "id": 1, "transaction_id": 1, "source_wallet_id": 1, "amount": "300000" },
    { "id": 2, "transaction_id": 1, "source_wallet_id": 2, "amount": "200000" }
  ]
}
```

**Lỗi có thể gặp:**

| Code | Khi nào |
|---|---|
| `400` | Ví chi tiêu (`cash`/`bank`) không đủ số dư | `{ "error": "Insufficient balance in wallet" }` |
| `403` | `destination_wallet_id` hoặc `source_wallet_id` thuộc user khác | |
| `403` | `category_id` thuộc user khác | |

> **Sau khi tạo thành công:** Balance của `destination_wallet_id` sẽ tự động cập nhật:
> - Category type `income` → Balance **tăng** `amount`
> - Category type `expense` → Balance **giảm** `amount`

---

### 3.2. Lịch sử giao dịch
```
GET /finance/transactions
```

**Response `200 OK`:**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "destination_wallet_id": 1,
    "category_id": 2,
    "amount": "500000",
    "transaction_date": "2026-04-29T10:00:00Z",
    "note": "Ăn trưa công ty",
    "attributions": [...]
  }
]
```

---

### 3.3. Sửa giao dịch
```
PUT /finance/transactions/:id
```

**Request Body:** Cấu trúc giống `POST /transactions`.

**Response `200 OK`:** Trả về transaction đã cập nhật.

> ⚡ **Atomic:** Server sẽ hoàn tác (restore) balance cũ trước, rồi áp balance mới. Nếu việc thay đổi làm ví bị âm (với ví `cash`/`bank`) → Trả về lỗi `400`.

---

### 3.4. Xóa giao dịch
```
DELETE /finance/transactions/:id
```

**Response `204 No Content`.**

**Lỗi có thể gặp:**
| Code | Khi nào |
|---|---|
| `400` | Xóa khoản thu (Income) làm ví (`cash`/`bank`) bị âm số dư |
| `404` | Giao dịch không tồn tại |

> ⚡ **Atomic:** Balance ví sẽ tự động được khôi phục (income → trừ lại, expense → cộng lại).

---

## 📊 Nhóm 4: Analytics (Phân tích & Báo cáo)

### 4.1. Dashboard tổng quan
```
GET /finance/analytics/dashboard
```

**Response `200 OK`:**
```json
{
  "net_worth": "15000000",
  "monthly_income": "20000000",
  "monthly_expense": "5000000",
  "monthly_net_cash_flow": "15000000"
}
```
> User mới chưa có data → tất cả trả về `"0"`.

---

### 4.2. Thống kê thu/chi theo kỳ
```
GET /finance/analytics/report?months=3
```
> `months` mặc định = `1`. Hỗ trợ: `1`, `3`, `6`, `12`.

**Response `200 OK`:**
```json
{
  "total_income": "60000000",
  "total_expense": "15000000",
  "net_cash_flow": "45000000",
  "average_daily": "500000"
}
```

---

### 4.3. Thiên kiến chi tiêu (Spending Bias)
```
GET /finance/analytics/spending-bias?months=1
```

**Response `200 OK`:**
```json
[
  { "category_id": 2, "category_name": "Ăn Uống",    "amount": "3000000", "percentage": "60" },
  { "category_id": 3, "category_name": "Di chuyển",   "amount": "1500000", "percentage": "30" },
  { "category_id": 4, "category_name": "Giải trí",    "amount": "500000",  "percentage": "10" }
]
```
> FE có thể dùng mảng này để vẽ **biểu đồ tròn (Pie Chart)**.

---

### 4.4. Xu hướng dòng tiền (Cash Flow Trend)
```
GET /finance/analytics/trend?months=6
```

**Response `200 OK`:**
```json
[
  { "month": "2026-01", "year": 2026, "income": "20000000", "expense": "5000000", "net": "15000000" },
  { "month": "2026-02", "year": 2026, "income": "18000000", "expense": "6000000", "net": "12000000" }
]
```
> FE có thể dùng mảng này để vẽ **biểu đồ đường/cột (Line/Bar Chart)**.

---

### 4.5. ROI & Phân loại Nguồn (Source ROI) — ⭐ UNIQUE FEATURE
```
GET /finance/analytics/source-roi
```

**Response `200 OK`:**
```json
[
  { "source_id": 1, "source_name": "Cái Nhà",      "income": "10000000", "expense": "3000000", "net_roi": "7000000" },
  { "source_id": 2, "source_name": "Chiếc Xe SH",   "income": "0",        "expense": "2000000", "net_roi": "-2000000" }
]
```
> **Logic phân loại:**
> - `net_roi > 0` → Nguồn này là **TÀI SẢN** (Asset) 🟢
> - `net_roi < 0` → Nguồn này là **TIÊU SẢN** (Liability) 🔴
> - `net_roi = 0` → **Trung tính** (Neutral) ⚪

---

### 4.6. Dự báo & Hoàn vốn (Forecast)
```
GET /finance/analytics/forecast
```

**Response `200 OK`:**
```json
{
  "current_net_worth": "15000000",
  "forecasted_monthly_expense": "5000000",
  "forecasted_end_balance": "10000000",
  "daily_average_expense": "166666",
  "days_remaining": 30,
  "message": "Dự báo cuối tháng bạn còn 10,000,000đ"
}
```

---

### 4.7. So sánh kỳ trước (Comparison)
```
GET /finance/analytics/comparison
```

**Response `200 OK`:**
```json
{
  "current_income": "20000000",
  "prev_income": "18000000",
  "income_change_percent": "11.11",
  "current_expense": "5000000",
  "prev_expense": "6000000",
  "expense_change_percent": "-16.67"
}
```
> `change_percent` âm = giảm so với kỳ trước.

---

### 4.8. Điểm Sức khỏe Tài chính (Health Score)
```
GET /finance/analytics/health-score
```

**Response `200 OK`:**
```json
{
  "total_score": 85,
  "status": "Rất tốt",
  "savings_rate": "75",
  "emergency_fund_months": "3",
  "budget_compliance_rate": "95"
}
```

**Bảng đánh giá `status`:**

| Điểm | Status |
|---|---|
| 80-100 | Rất tốt |
| 60-79 | Khá |
| 40-59 | Trung bình |
| 20-39 | Yếu |
| 0-19 | Nguy hiểm |

---

## 🛡️ Nhóm 5: Budgets (Ngân sách)

### 5.1. Thiết lập ngân sách
```
POST /finance/budgets
```

**Request Body:**
```json
{
  "category_id": 2,
  "amount": "3000000",
  "month": 5,
  "year": 2026
}
```
> Nếu không truyền `month` và `year` → Server tự lấy tháng/năm hiện tại.
> Gửi lại cùng `category_id` + `month` + `year` → **Cập nhật** (Upsert), không tạo trùng.

**Response `201 Created`:**
```json
{ "message": "Budget set successfully" }
```

---

### 5.2. Trạng thái ngân sách
```
GET /finance/budgets/status?month=5&year=2026
```
> Mặc định = tháng/năm hiện tại nếu không truyền.

**Response `200 OK`:**
```json
[
  {
    "category_id": 2,
    "category_name": "Ăn Uống",
    "limit_amount": "3000000",
    "spent_amount": "2800000",
    "remaining": "200000",
    "is_over_budget": false
  },
  {
    "category_id": 3,
    "category_name": "Di chuyển",
    "limit_amount": "1000000",
    "spent_amount": "1200000",
    "remaining": "-200000",
    "is_over_budget": true
  }
]
```

---

## 🔐 Authentication & Error Codes

### Header bắt buộc
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Bảng mã lỗi HTTP tổng hợp

| Code | Ý nghĩa | Khi nào |
|---|---|---|
| `200` | Thành công (có body) | GET, PUT thành công |
| `201` | Tạo mới thành công | POST thành công |
| `204` | Thành công (không body) | DELETE, Transfer, Update thành công |
| `400` | Bad Request | Dữ liệu sai format, **Số dư không đủ (cash/bank)**, **Loại ví không hợp lệ**, Validation fail |
| `401` | Unauthorized | Không có token hoặc token hết hạn |
| `403` | Forbidden | Cố truy cập resource thuộc user khác (wallet, category) |
| `404` | Not Found | Resource không tồn tại hoặc không thuộc user hiện tại |
| `409` | Conflict | Trùng tên ví, trùng danh mục, xóa resource đang được sử dụng |
| `500` | Internal Server Error | Lỗi server không mong muốn |

---

## 🧪 Checklist Test Cho Frontend

### ✅ Happy Path (Luồng chính — Phải test đầu tiên)

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| FE-1 | Tạo ví → Hiển thị trong danh sách | Balance đúng `initial_balance` |
| FE-2 | Tạo 2 ví → Chuyển tiền → Kiểm tra balance cả 2 ví | Ví nguồn giảm, ví đích tăng đúng số tiền |
| FE-3 | Tạo danh mục Income & Expense | Hiển thị đúng trong dropdown |
| FE-4 | Tạo giao dịch (income) → Kiểm tra balance ví tăng | Balance ví đích `+= amount` |
| FE-5 | Tạo giao dịch (expense) → Kiểm tra balance ví giảm | Balance ví đích `-= amount` |
| FE-6 | Tạo giao dịch với 2 attribution (phân bổ 2 nguồn) | Tổng attribution = amount giao dịch |
| FE-7 | Xóa giao dịch → Kiểm tra balance ví được khôi phục | Balance trở về giá trị trước khi có giao dịch |
| FE-8 | Vào Dashboard khi có data | Hiển thị Net Worth, Income, Expense |
| FE-9 | Thiết lập budget → Kiểm tra budget status | `spent_amount` phản ánh đúng chi tiêu thực tế |
| FE-10 | Xem Health Score | Điểm số và trạng thái hiển thị đúng |

### ❌ Negative Path (Bắt lỗi — Form Validation)

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| FE-11 | Tạo ví với tên rỗng | Hiển thị lỗi `400` |
| FE-12 | Tạo ví trùng tên | Hiển thị lỗi `409` "Ví đã tồn tại" |
| FE-13 | Chuyển tiền cho chính mình (cùng ví) | Hiển thị lỗi `400` |
| FE-14 | Tạo giao dịch với `attributions: []` (rỗng) | Hiển thị lỗi `400` |
| FE-15 | Tạo giao dịch mà tổng attribution ≠ amount | Hiển thị lỗi `400` |
| FE-16 | Xóa ví đang có giao dịch | Hiển thị lỗi `409` "Không thể xóa" |
| FE-17 | Xóa danh mục đang được dùng | Hiển thị lỗi `409` "Không thể xóa" |
| FE-25 | Tạo ví `cash`/`bank` với `initial_balance < 0` | Hiển thị lỗi `400` |
| FE-26 | Chi tiêu vượt số dư ví `cash`/`bank` | Hiển thị lỗi `400` (Insufficient balance) |
| FE-27 | Chi tiêu vượt số dư ví `credit` | Thành công, balance âm (Nợ tăng) |
| FE-28 | Xóa khoản thu (Income) làm ví bị âm | Hiển thị lỗi `400` |

### 🔐 Security (Bảo mật — Cô lập dữ liệu)

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| FE-18 | Truy cập trang khi chưa đăng nhập | Redirect về trang Login |
| FE-19 | Token hết hạn → Gọi API | Nhận `401` → Redirect Login |
| FE-20 | Gọi API với wallet_id của user khác | `404` — Không bao giờ thấy data user khác |

### 🧊 Edge Cases (Tình huống đặc biệt)

| # | Kịch bản | Kỳ vọng |
|---|---|---|
| FE-21 | User mới (chưa có data) vào Dashboard | Hiển thị `0` ở tất cả metrics, không crash |
| FE-22 | User mới vào Budget Status | Hiển thị mảng rỗng `[]`, UI thân thiện |
| FE-23 | Nhập số tiền cực lớn (VD: 999,999,999,999) | Không bị overflow, hiển thị đúng |
| FE-24 | Nhập ký tự đặc biệt vào tên ví `'; DROP TABLE--` | Server xử lý an toàn, không crash |

---

## 6. Tài liệu bổ sung
- **Feature Design:** [personal_finance.md](../../plan/finace/personal_finance.md)
- **Test Plan (74 cases):** [personal_finance_test.md](../../plan/finace/personal_finance_test.md)
- **Tiến Độ Backend:** [tiendo.md](../../plan/finace/tiendo.md)

---

## 7. Status: IMPLEMENTED ✅
