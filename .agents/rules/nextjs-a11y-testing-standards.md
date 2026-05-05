# ♿ CHUẨN ACCESSIBILITY & TESTING — Luật A11y-First

> **Mức độ:** CRITICAL  
> **Phạm vi:** Toàn bộ UI Components & E2E Tests  
> **Nguyên tắc cốt lõi:** Nếu một người dùng khiếm thị không dùng được, thì test cũng không nên dùng selector đó.

---

## 1. QUY TẮC UI — aria-label Bắt Buộc

### 1.1 Mọi element tương tác PHẢI có `aria-label`

Áp dụng cho: `<Input>`, `<select>`, `<Button>`, `<Switch>`, `<SelectTrigger>`, và bất kỳ element nào user có thể click/type.

```tsx
// ✅ ĐÚNG
<Input aria-label="Tên ví" placeholder="Ví dụ: Tiền mặt..." {...field} />
<Button aria-label="Xác nhận tạo ví" type="submit">Tạo ví mới</Button>
<select aria-label="Loại ví" {...field}>...</select>
<Switch aria-label={`Trạng thái của ${user.username}`} />

// ❌ SAI — Thiếu aria-label
<Input placeholder="Ví dụ: Tiền mặt..." {...field} />
<Button type="submit">Tạo ví mới</Button>
```

### 1.2 Nhãn phải mô tả MỤC ĐÍCH, không phải loại element

```tsx
// ✅ ĐÚNG — Mô tả mục đích
aria-label="Số tiền giao dịch"
aria-label="Danh mục giao dịch"
aria-label="Xác nhận giao dịch"

// ❌ SAI — Mô tả loại element
aria-label="input số tiền"
aria-label="nút submit"
aria-label="select box"
```

### 1.3 Nhãn ĐỘNG cho bảng dữ liệu (Table Actions)

Khi một bảng hiển thị nhiều hàng, mỗi nút thao tác **PHẢI** có nhãn chứa thông tin định danh duy nhất của hàng đó:

```tsx
// ✅ ĐÚNG — Nhãn động, không bao giờ trùng
<Button aria-label={`Sửa người dùng ${user.username}`} />
<Button aria-label={`Xóa người dùng ${user.username}`} />
<Switch aria-label={`Trạng thái của ${user.username}`} />

// ❌ SAI — Nhãn tĩnh, Playwright sẽ tìm thấy nhiều element
<Button aria-label="Sửa" />
<Button aria-label="Xóa" />
```

### 1.4 Giữ `data-testid` làm fallback cho Container/Group

`data-testid` chỉ nên dùng cho các element KHÔNG tương tác trực tiếp, như container, row wrapper, loading state:

```tsx
// ✅ OK — Container/Group dùng data-testid
<div data-testid="finance-tx-attr-row">...</div>
<div data-testid="wallet-list-loading">...</div>

// ❌ KHÔNG NÊN — Element tương tác chỉ có data-testid
<Input data-testid="finance-wallet-name-input" />  // Thiếu aria-label!
```

---

## 2. QUY TẮC TEST — Ưu Tiên getByLabel

### 2.1 Thứ tự ưu tiên Selector (Playwright)

| Ưu tiên | Locator | Khi nào dùng |
| :---: | :--- | :--- |
| 🥇 1 | `page.getByLabel('...')` | Input, Select, Button có aria-label |
| 🥈 2 | `page.getByRole('...', { name: '...' })` | Button, Link, Tab có text rõ ràng |
| 🥉 3 | `page.getByText('...')` | Kiểm tra nội dung hiển thị, toast |
| 4 | `page.locator('[data-testid="..."]')` | Container, group, fallback |
| ⛔ 5 | `page.locator('td').last().locator('button').nth(2)` | **TUYỆT ĐỐI CẤM** |

### 2.2 Pattern chuẩn cho E2E Test

```typescript
// ✅ ĐÚNG — Dùng getByLabel, dễ đọc như ngôn ngữ tự nhiên
await page.getByLabel('Tên ví').fill('Tiền mặt');
await page.getByLabel('Loại ví').selectOption('cash');
await page.getByLabel('Xác nhận tạo ví').click();

// ✅ ĐÚNG — Nhãn động cho thao tác trên bảng
await page.getByLabel(`Sửa người dùng ${username}`).click();
await page.getByLabel(`Trạng thái của ${username}`).click();

// ❌ SAI — CSS selector dễ gãy
await page.fill('[data-testid="finance-wallet-name-input"]', 'Tiền mặt');
await page.click('button[type="submit"]');
await userRow.locator('td').last().locator('button').nth(0).click();
```

### 2.3 Fallback cho Container

Khi cần tương tác với element bên trong một container (ví dụ: dòng phân bổ), dùng `data-testid` để scope container rồi `getByLabel` cho element bên trong:

```typescript
// ✅ ĐÚNG — Kết hợp data-testid (scope) + getByLabel (target)
const attrRow = page.locator('[data-testid="finance-tx-attr-row"]').nth(0);
await attrRow.getByLabel('Ví nguồn phân bổ').selectOption({ label: 'Tiền mặt' });

// ❌ SAI — Dùng locator('select') trơ trụi
const attrRow = page.locator('[data-testid="finance-tx-attr-row"]').nth(0);
await attrRow.locator('select').selectOption({ label: 'Tiền mặt' });
```

---

## 3. QUY TẮC NGÔN NGỮ

### 3.1 aria-label sử dụng Tiếng Việt

Vì đây là ứng dụng nội bộ Tiếng Việt, tất cả aria-label **PHẢI** viết bằng Tiếng Việt có dấu:

```tsx
// ✅ ĐÚNG
aria-label="Số tiền giao dịch"
aria-label="Xác nhận tạo ví"

// ❌ SAI
aria-label="transaction-amount"
aria-label="submit-wallet"
```

### 3.2 Quy ước đặt tên

| Loại element | Pattern | Ví dụ |
| :--- | :--- | :--- |
| Input | `[Tên trường]` | "Tên ví", "Số tiền giao dịch" |
| Select | `[Tên trường]` | "Loại ví", "Danh mục giao dịch" |
| Submit Button | `Xác nhận [hành động]` | "Xác nhận tạo ví", "Xác nhận giao dịch" |
| Action Button | `[Hành động] [đối tượng] [ID]` | "Sửa người dùng admin" |
| Toggle | `[Tên thuộc tính] của [ID]` | "Trạng thái của admin" |

---

## 4. KIỂM TRA TUÂN THỦ

Một Pull Request được coi là **KHÔNG HỢP LỆ** nếu:

- [ ] Có element tương tác mới mà thiếu `aria-label`.
- [ ] Test E2E mới dùng `page.fill('input[name="..."]')` thay vì `page.getByLabel('...')`.
- [ ] Test E2E dùng `locator('button').nth(N)` để click nút trong bảng.
- [ ] aria-label viết bằng tiếng Anh hoặc dùng kebab-case.
- [ ] Action kích hoạt API nhưng **không có** `waitForResponse` tương ứng (xem Mục 5).

---

## 5. QUY ƯỚC API ASSERTION — waitForResponse Bắt Buộc

> **Mục tiêu:** Mọi lời gọi API trong E2E Test phải được xác minh **chắc chắn** bằng `waitForResponse` có đủ **URL + Method**. Điều này giúp Script Scanner tự động biết API nào đã được test mà không cần suy luận.

### 5.1 Pattern chuẩn bắt buộc

Mỗi action có kích hoạt một lời gọi API **BẮT BUỘC** phải dùng `Promise.all` kết hợp `waitForResponse` với **đủ hai điều kiện**: `url().includes(...)` và `request().method() ===`:

```typescript
// ✅ ĐÚNG — Đủ cả URL + Method, Script Scanner đọc được
const [res] = await Promise.all([
  page.waitForResponse(
    r => r.url().includes('/finance/wallets') && r.request().method() === 'POST'
  ),
  page.getByLabel('Xác nhận tạo ví').click()
]);
expect(res.status()).toBe(201);

// ❌ SAI — Chỉ có Method, không biết URL nào được gọi
const [res] = await Promise.all([
  page.waitForResponse(r => r.request().method() === 'POST'),
  page.getByLabel('Xác nhận tạo ví').click()
]);

// ❌ SAI — Chỉ có URL, không biết Method
const [res] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/finance/wallets')),
  page.getByLabel('Xác nhận tạo ví').click()
]);
```

### 5.2 Bắt buộc kèm status assertion

Sau khi có `waitForResponse`, **PHẢI** kiểm tra status code để đảm bảo API thực sự thành công:

```typescript
// ✅ ĐÚNG — Verify cả URL, Method lẫn Status
const [res] = await Promise.all([
  page.waitForResponse(
    r => r.url().includes('/users') && r.request().method() === 'DELETE'
  ),
  page.getByLabel(`Xóa người dùng ${username}`).click()
]);
expect(res.status()).toBe(204);

// ❌ SAI — Bắt response nhưng không kiểm tra status
const [res] = await Promise.all([
  page.waitForResponse(r => r.url().includes('/users') && r.request().method() === 'DELETE'),
  page.getByLabel(`Xóa người dùng ${username}`).click()
]);
// Thiếu: expect(res.status()).toBe(204)
```

### 5.3 Bảng Status Code chuẩn theo HTTP Method

| Method | Action | Expected Status |
| :--- | :--- | :---: |
| `GET` | Lấy danh sách / chi tiết | `200` |
| `POST` | Tạo mới | `201` |
| `PUT` / `PATCH` | Cập nhật | `200` |
| `DELETE` | Xóa | `204` |

### 5.4 Ngoại lệ — GET không cần waitForResponse

Các lời gọi `GET` tự động khi trang load (không phải do user action) **không bắt buộc** phải có `waitForResponse`. Thay vào đó, kiểm tra bằng cách xác nhận dữ liệu đã hiển thị trên UI:

```typescript
// ✅ OK — GET tự động khi goto, kiểm tra bằng UI
await page.goto('/finance/wallets');
await expect(page.getByText('Danh sách ví')).toBeVisible();

// ✅ ĐÚNG — GET do user action (search, filter) thì PHẢI có waitForResponse
const [res] = await Promise.all([
  page.waitForResponse(
    r => r.url().includes('/finance/transactions') && r.request().method() === 'GET'
  ),
  page.getByLabel('Lọc giao dịch').click()
]);
```

