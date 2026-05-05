# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: annotation\cross_doc_move.real.spec.ts >> Cross-Document Section Move (Real API Integration) >> Scenario: Handle error when move fails (404/Domain Error)
- Location: tests\e2e\annotation\cross_doc_move.real.spec.ts:86:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Cấu trúc tài liệu')
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByText('Cấu trúc tài liệu')

```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | /**
  4   |  * BDD Test Suite: Cross-Document Section Movement
  5   |  * Feature: ANNO-14
  6   |  */
  7   | test.describe('Cross-Document Section Move (Real API Integration)', () => {
  8   |   let accessToken: string;
  9   |   let docAId: number;
  10  |   let docBId: number;
  11  | 
  12  |   test.beforeEach(async ({ page, request }) => {
  13  |     // Đăng nhập qua UI
  14  |     await page.goto('http://localhost:3000/login');
  15  |     await page.getByTestId('auth-username-input').fill('admin');
  16  |     await page.getByTestId('auth-password-input').fill('password123');
  17  |     await page.getByTestId('auth-login-submit').click();
  18  |     await expect(page).toHaveURL('http://localhost:3000/dashboard', { timeout: 15000 });
  19  | 
  20  |     // Lấy token từ localStorage
  21  |     const authStorageStr = await page.evaluate(() => localStorage.getItem('auth-storage'));
  22  |     if (authStorageStr) {
  23  |       const authData = JSON.parse(authStorageStr);
  24  |       accessToken = authData?.state?.accessToken;
  25  |     }
  26  | 
  27  |     if (!accessToken) {
  28  |       throw new Error('Failed to extract access token from localStorage');
  29  |     }
  30  | 
  31  |     if (!docAId) {
  32  |       // 3. Tạo Doc A & B (chỉ tạo 1 lần)
  33  |       const resA = await request.post('http://localhost:8080/api/annotations/documents', {
  34  |         data: { title: 'Doc A - Source', content: '# Section 1\nContent A' },
  35  |         headers: { 'Authorization': `Bearer ${accessToken}` }
  36  |       });
  37  |       const dataA = await resA.json();
  38  |       docAId = dataA.data?.id;
  39  | 
  40  |       const resB = await request.post('http://localhost:8080/api/annotations/documents', {
  41  |         data: { title: 'Doc B - Target', content: '# Section 2\nContent B' },
  42  |         headers: { 'Authorization': `Bearer ${accessToken}` }
  43  |       });
  44  |       const dataB = await resB.json();
  45  |       docBId = dataB.data?.id;
  46  |     }
  47  | 
  48  |     // 4. Đi đến trang Tree của Doc A
  49  |     await page.goto(`http://localhost:3000/annotations/sections/${docAId}/tree`);
> 50  |     await expect(page.getByText('Cấu trúc tài liệu')).toBeVisible({ timeout: 10000 });
      |                                                       ^ Error: expect(locator).toBeVisible() failed
  51  |   });
  52  | 
  53  |   test('Scenario: Drag and Drop section from Doc A to Doc B', async ({ page }) => {
  54  |     // 1. Mở Workspace so sánh trước (Vì mặc định nó đang đóng)
  55  |     await page.getByRole('button', { name: /Mở Workspace so sánh/ }).click();
  56  |     
  57  |     // Đợi transition hoàn tất
  58  |     const workspace = page.getByTestId('workspace-container');
  59  |     await expect(workspace).toBeVisible({ timeout: 10000 });
  60  |     await expect(page.getByText('Chế độ so sánh')).toBeVisible();
  61  | 
  62  |     // 2. Mở thêm Doc B vào Workspace thông qua Modal xịn
  63  |     await page.getByTestId('workspace-add-column-btn').click();
  64  |     
  65  |     // Đợi Modal hiện lên và tìm kiếm theo ID
  66  |     await expect(page.getByText('Chọn tài liệu so sánh')).toBeVisible();
  67  |     await page.getByPlaceholder('Tìm tên tài liệu...').fill(docBId.toString());
  68  |     
  69  |     // Đợi danh sách render xong
  70  |     const docBtn = page.getByTestId(`select-doc-${docBId}`);
  71  |     await docBtn.waitFor({ state: 'visible' });
  72  |     await docBtn.click();
  73  |     
  74  |     await expect(page.getByTestId(`workspace-column-${docBId}`)).toBeVisible();
  75  |     console.log('[E2E] Doc B opened via Modal (Search by ID)');
  76  | 
  77  |     // 3. Thực hiện kéo thả từ Doc A sang Doc B
  78  |     const sourceHandle = page.getByTestId(/outline-drag-handle-/).first(); 
  79  |     const targetColumn = page.getByTestId(`workspace-column-${docBId}`);
  80  |     await sourceHandle.dragTo(targetColumn);
  81  | 
  82  |     // 4. Kiểm tra Toast báo thành công
  83  |     await expect(page.getByText(/Đã di chuyển thẻ sang tài liệu mới thành công/)).toBeVisible();
  84  |   });
  85  | 
  86  |   test('Scenario: Handle error when move fails (404/Domain Error)', async ({ page }) => {
  87  |     // Mở Workspace
  88  |     await page.getByRole('button', { name: /Mở Workspace so sánh/ }).click();
  89  |     await expect(page.getByTestId('workspace-container')).toBeVisible({ timeout: 10000 });
  90  | 
  91  |     // Mock 404 response cho move API
  92  |     await page.route('**/annotations/sections/**/move', route => {
  93  |        return route.fulfill({
  94  |          status: 404,
  95  |          contentType: 'application/json',
  96  |          body: JSON.stringify({ message: 'Target document not found' })
  97  |        });
  98  |     });
  99  | 
  100 |     // 1. Mở Doc B thông qua Modal
  101 |     await page.getByTestId('workspace-add-column-btn').click();
  102 |     await page.getByTestId(`select-doc-${docBId}`).click();
  103 | 
  104 |     // 2. Thực hiện kéo thả
  105 |     const sourceHandle = page.getByTestId(/outline-drag-handle-/).first(); 
  106 |     await sourceHandle.dragTo(page.getByTestId(`workspace-column-${docBId}`));
  107 | 
  108 |     // 3. Kiểm tra Toast báo lỗi
  109 |     await expect(page.getByText(/Lỗi di chuyển/)).toBeVisible();
  110 |     await expect(page.getByText(/Target document not found/)).toBeVisible();
  111 |   });
  112 | 
  113 |   test.afterAll(async ({ request }) => {
  114 |     // Cleanup
  115 |     for (const id of [docAId, docBId]) {
  116 |       if (id) {
  117 |         await request.delete(`http://localhost:8080/api/annotations/documents/${id}`, {
  118 |           headers: { 'Authorization': `Bearer ${accessToken}` }
  119 |         });
  120 |       }
  121 |     }
  122 |   });
  123 | });
  124 | 
```