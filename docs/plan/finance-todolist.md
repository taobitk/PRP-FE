# 📋 TODO: Module Finance — Frontend

> Tài liệu gốc: [api_handover.md](../../API-docs/api_handover.md)
> Ngày tạo: 29/04/2026

---

## ⚠️ LƯU Ý QUAN TRỌNG

> [!CAUTION]
> **Tiền là `string`, KHÔNG phải `number`.**
> Tất cả các trường tiền (`amount`, `balance`, `initial_balance`...) Backend trả về kiểu `string` (VD: `"5000000"`).
> FE **BẮT BUỘC** dùng thư viện xử lý số chính xác (VD: `big.js` hoặc `Intl.NumberFormat`) để tránh lỗi floating point.
> KHÔNG ĐƯỢC dùng `parseFloat()` rồi tính toán trực tiếp.

> [!IMPORTANT]
> **Attribution (Phân bổ nguồn)** là khái niệm cốt lõi của Transaction.
> Mỗi giao dịch PHẢI kèm ít nhất 1 attribution. Tổng `SUM(attribution.amount)` PHẢI bằng `transaction.amount`.
> Form tạo/sửa giao dịch cần có UI cho phép thêm/bớt dòng phân bổ.

> [!IMPORTANT]
> **Wallet type quyết định luật số dư âm.**
> - `cash`, `bank`: KHÔNG cho phép số dư âm → FE cần validate trước khi submit.
> - `credit`: Cho phép âm (biểu thị nợ).

> [!WARNING]
> **Response `204 No Content` không có body.**
> Các API: Transfer, Update Wallet, Delete Wallet, Delete Category, Delete Transaction đều trả `204`.
> FE không được gọi `res.json()` khi status là `204`.

---

## Phase 1: Contract & Foundation

- [x] Viết lại `finance.contract.ts` đúng 100% với bản bàn giao
  - [x] Wallet: `balance` là `string`, type chỉ có `cash|bank|credit`, có `user_id`
  - [x] Category: Entity hoàn toàn mới (`id, user_id, name, type: income|expense`)
  - [x] Transaction: có `destination_wallet_id`, `category_id`, `transaction_date`, `attributions[]`
  - [x] Attribution: `{ source_wallet_id, amount }` trong request, thêm `id, transaction_id` trong response
  - [x] Analytics: 8 response schemas (Dashboard, Report, SpendingBias, Trend, SourceROI, Forecast, Comparison, HealthScore)
  - [x] Budget: `SetBudgetRequest` + `BudgetStatusItem`
- [x] Cập nhật `apiClient.ts` xử lý response `204 No Content` ⚠️
- [x] Cài thư viện `big.js` cho xử lý tiền chính xác ⚠️
- [x] Định nghĩa Enums/Constants cho `WalletType` và `CategoryType` ⚠️



## Phase 2: API Hooks (features/finance/api/)

### Wallets
- [x] `useWallets()` — GET /finance/wallets
- [x] `useCreateWallet()` — POST /finance/wallets
- [x] `useUpdateWallet()` — PUT /finance/wallets/:id
- [x] `useDeleteWallet()` — DELETE /finance/wallets/:id
- [x] `useTransferMoney()` — POST /finance/wallets/transfer

### Categories
- [x] `useCategories()` — GET /finance/categories
- [x] `useCreateCategory()` — POST /finance/categories
- [x] `useUpdateCategory()` — PUT /finance/categories/:id
- [x] `useDeleteCategory()` — DELETE /finance/categories/:id

### Transactions
- [x] `useTransactions()` — GET /finance/transactions
- [x] `useCreateTransaction()` — POST /finance/transactions ⚠️ (có attributions)
- [x] `useUpdateTransaction()` — PUT /finance/transactions/:id
- [x] `useDeleteTransaction()` — DELETE /finance/transactions/:id

### Analytics
- [x] `useFinanceDashboard()` — GET /finance/analytics/dashboard
- [x] `useFinanceReport(months)` — GET /finance/analytics/report?months=
- [x] `useSpendingBias(months)` — GET /finance/analytics/spending-bias?months=
- [x] `useCashFlowTrend(months)` — GET /finance/analytics/trend?months=
- [x] `useSourceROI()` — GET /finance/analytics/source-roi
- [x] `useForecast()` — GET /finance/analytics/forecast
- [x] `useComparison()` — GET /finance/analytics/comparison
- [x] `useHealthScore()` — GET /finance/analytics/health-score

### Budgets
- [x] `useSetBudget()` — POST /finance/budgets
- [x] `useBudgetStatus(month, year)` — GET /finance/budgets/status?month=&year=


## Phase 3: UI Pages

- [x] `/finance` — Trang tổng quan Finance (Dashboard cards: Net Worth, Income, Expense, Cash Flow)

- [x] `/finance/wallets` — Danh sách ví + Tạo/Sửa/Xóa ví + Chuyển tiền

- [x] `/finance/categories` — Quản lý danh mục thu/chi

- [x] `/finance/transactions` — Danh sách giao dịch + Bộ lọc (Ngày, Ví) + Form tạo/sửa (có phân bổ nguồn) ⚠️


- [x] `/finance/budgets` — Thiết lập ngân sách + Xem trạng thái
- [x] `/finance/analytics` — Biểu đồ phân tích (Pie, Line/Bar, ROI, Health Score)


## Phase 4: Testing

### Unit Tests (Vitest)
- [x] Test tất cả API hooks (mock apiClient)
- [x] Test form validation (Zod schemas)
- [x] Test xử lý tiền string (big.js utils)
- [x] Implement Zod `superRefine` validate logic: tổng attributions == amount cho CreateTransactionRequest ⚠️




### E2E Tests (Playwright) — theo Checklist bàn giao
- [ ] FE-1 → FE-10: Happy Path
- [ ] FE-11 → FE-17, FE-25 → FE-28: Negative Path
- [ ] FE-18 → FE-20: Security
- [ ] FE-21 → FE-24: Edge Cases

---

*Cập nhật: 29/04/2026*
