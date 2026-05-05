---
name: sk-nextjs-a11y
description: Quy trình chuẩn hóa Accessibility cho UI và E2E Test. Kích hoạt khi cần thêm aria-label cho component mới hoặc cập nhật test sang getByLabel.
version: 1.0.0
---

# 🛡️ Skill: A11y-First UI & Testing

> **Khi nào kích hoạt:** Khi tạo mới hoặc cập nhật UI component có element tương tác, hoặc khi viết/sửa E2E test.

---

## Quy Trình 5 Bước: Grep → Map → Batch UI → Batch Test → Verify

### Bước 1: Grep — Quét bản đồ selector hiện tại

Quét toàn bộ `data-testid`, `input[name=`, `button[type=` trong cả UI và Test để biết có bao nhiêu "mối nối" cần cập nhật.

```bash
# Quét UI
grep -rn "data-testid=" src/features/<module>/ui/ --include="*.tsx"

# Quét Test  
grep -rn "data-testid=\|input\[name=\|button\[type=" tests/e2e/<module>/ --include="*.spec.ts"
```

### Bước 2: Map — Lập bảng mapping

Tạo bảng ánh xạ từ selector cũ sang aria-label mới:

```markdown
| Selector cũ                        | aria-label mới          | Component              |
| :--------------------------------- | :---------------------- | :--------------------- |
| `data-testid="finance-tx-amount"`  | `Số tiền giao dịch`    | CreateTransactionForm  |
| `input[name="username"]`           | `Tên đăng nhập`        | LoginForm              |
| `button[type="submit"]`            | `Nút đăng nhập`        | LoginForm              |
```

**Lưu ý:** 
- Tham khảo `FormLabel` hiện tại để chọn nhãn phù hợp.
- Nhãn phải mô tả **mục đích**, không phải loại element.
- Đối với bảng dữ liệu, dùng nhãn **động** chứa ID duy nhất.

### Bước 3: Batch UI — Cập nhật toàn bộ Component

Dùng multi-edit để chèn `aria-label` vào tất cả element tương tác cùng lúc.

**Nguyên tắc:**
- Giữ nguyên `data-testid` cho container/group.
- Thêm `aria-label` TRƯỚC `data-testid` trong thứ tự attribute.
- Đối với Button trong bảng, dùng template literal:

```tsx
<Button aria-label={`Sửa người dùng ${user.username}`} variant="ghost" size="icon">
  <Edit className="h-4 w-4" />
</Button>
```

### Bước 4: Batch Test — Chuyển đổi selector

Thay thế toàn bộ selector trong test sang `getByLabel`:

```typescript
// TRƯỚC
await page.fill('input[name="username"]', 'admin');
await page.click('button[type="submit"]');
await page.fill('[data-testid="finance-tx-amount"]', '5000000');

// SAU
await page.getByLabel('Tên đăng nhập').fill('admin');
await page.getByLabel('Nút đăng nhập').click();
await page.getByLabel('Số tiền giao dịch').fill('5000000');
```

**Pattern cho container scoping:**
```typescript
// Dùng data-testid để scope, getByLabel để target
const attrRow = page.locator('[data-testid="finance-tx-attr-row"]').nth(0);
await attrRow.getByLabel('Ví nguồn phân bổ').selectOption({ label: 'Tiền mặt' });
```

### Bước 5: Verify — Chạy test 1 lần duy nhất

```bash
npx playwright test tests/e2e/<module>/<module>.live.spec.ts --headed
```

- Nếu **PASS** → Cách 3 (Batch) đã triệt để. Done! ✅
- Nếu **FAIL** → Chuyển sang **Cách 1 (TDD)**: Đọc lỗi → Sửa từng điểm → Chạy lại.

---

## Checklist Trước Khi Commit

- [ ] Mọi `<Input>` có `aria-label`
- [ ] Mọi `<select>` / `<SelectTrigger>` có `aria-label`
- [ ] Mọi `<Button>` submit/action có `aria-label`
- [ ] Mọi `<Switch>` có `aria-label` động
- [ ] Test không còn `page.fill('input[name="..."]')`
- [ ] Test không còn `page.click('button[type="submit"]')`
- [ ] Test không còn `.locator('button').nth(N)`
- [ ] Tất cả aria-label viết bằng Tiếng Việt có dấu

---

## Ví Dụ Thực Tế Đã Áp Dụng

### Module Auth (LoginForm)
```tsx
<Input aria-label="Tên đăng nhập" id="username" placeholder="admin" {...field} />
<Input aria-label="Mật khẩu" id="password" type="password" {...field} />
<Button aria-label="Nút đăng nhập" type="submit">Đăng nhập</Button>
```

### Module Admin (UserTable — Nhãn động)
```tsx
<Switch aria-label={`Trạng thái của ${user.username}`} checked={...} />
<Button aria-label={`Sửa người dùng ${user.username}`}>
  <Edit className="h-4 w-4" />
</Button>
<Button aria-label={`Xóa người dùng ${user.username}`}>
  <Trash className="h-4 w-4" />
</Button>
```

### Module Finance (Container Scoping trong Test)
```typescript
const attrRows = page.locator('[data-testid="finance-tx-attr-row"]');
await attrRows.nth(0).getByLabel('Ví nguồn phân bổ').selectOption({ label: 'Tiền mặt' });
await attrRows.nth(1).getByLabel('Ví nguồn phân bổ').selectOption({ label: 'Ngân hàng' });
```
