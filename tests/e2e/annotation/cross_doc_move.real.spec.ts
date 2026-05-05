import { test, expect } from '@playwright/test';

/**
 * BDD Test Suite: Cross-Document Section Movement
 * Feature: ANNO-14
 */
test.describe('Cross-Document Section Move (Real API Integration)', () => {
  let accessToken: string;
  let docAId: number;
  let docBId: number;

  test.beforeEach(async ({ page, request }) => {
    // Đăng nhập qua UI
    await page.goto('http://localhost:3000/login');
    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    await page.getByTestId('auth-login-submit').click();
    await expect(page).toHaveURL('http://localhost:3000/dashboard', { timeout: 15000 });

    // Lấy token từ localStorage
    const authStorageStr = await page.evaluate(() => localStorage.getItem('auth-storage'));
    if (authStorageStr) {
      const authData = JSON.parse(authStorageStr);
      accessToken = authData?.state?.accessToken;
    }

    if (!accessToken) {
      throw new Error('Failed to extract access token from localStorage');
    }

    if (!docAId) {
      // 3. Tạo Doc A & B (chỉ tạo 1 lần)
      const resA = await request.post('http://localhost:8080/api/annotations/documents', {
        data: { title: 'Doc A - Source', content: '# Section 1\nContent A' },
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const dataA = await resA.json();
      docAId = dataA.data?.id;

      const resB = await request.post('http://localhost:8080/api/annotations/documents', {
        data: { title: 'Doc B - Target', content: '# Section 2\nContent B' },
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const dataB = await resB.json();
      docBId = dataB.data?.id;
    }

    // 4. Đi đến trang Tree của Doc A
    await page.goto(`http://localhost:3000/annotations/sections/${docAId}/tree`);
    await expect(page.getByText('Cấu trúc tài liệu')).toBeVisible({ timeout: 10000 });
  });

  test('Scenario: Drag and Drop section from Doc A to Doc B', async ({ page }) => {
    // 1. Mở Workspace so sánh trước (Vì mặc định nó đang đóng)
    await page.getByRole('button', { name: /Mở Workspace so sánh/ }).click();
    
    // Đợi transition hoàn tất
    const workspace = page.getByTestId('workspace-container');
    await expect(workspace).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('Chế độ so sánh')).toBeVisible();

    // 2. Mở thêm Doc B vào Workspace thông qua Modal xịn
    await page.getByTestId('workspace-add-column-btn').click();
    
    // Đợi Modal hiện lên và tìm kiếm theo ID
    await expect(page.getByText('Chọn tài liệu so sánh')).toBeVisible();
    await page.getByPlaceholder('Tìm tên tài liệu...').fill(docBId.toString());
    
    // Đợi danh sách render xong
    const docBtn = page.getByTestId(`select-doc-${docBId}`);
    await docBtn.waitFor({ state: 'visible' });
    await docBtn.click();
    
    await expect(page.getByTestId(`workspace-column-${docBId}`)).toBeVisible();
    console.log('[E2E] Doc B opened via Modal (Search by ID)');

    // 3. Thực hiện kéo thả từ Doc A sang Doc B
    const sourceHandle = page.getByTestId(/outline-drag-handle-/).first(); 
    const targetColumn = page.getByTestId(`workspace-column-${docBId}`);
    await sourceHandle.dragTo(targetColumn);

    // 4. Kiểm tra Toast báo thành công
    await expect(page.getByText(/Đã di chuyển thẻ sang tài liệu mới thành công/)).toBeVisible();
  });

  test('Scenario: Handle error when move fails (404/Domain Error)', async ({ page }) => {
    // Mở Workspace
    await page.getByRole('button', { name: /Mở Workspace so sánh/ }).click();
    await expect(page.getByTestId('workspace-container')).toBeVisible({ timeout: 10000 });

    // Mock 404 response cho move API
    await page.route('**/annotations/sections/**/move', route => {
       return route.fulfill({
         status: 404,
         contentType: 'application/json',
         body: JSON.stringify({ message: 'Target document not found' })
       });
    });

    // 1. Mở Doc B thông qua Modal
    await page.getByTestId('workspace-add-column-btn').click();
    await page.getByTestId(`select-doc-${docBId}`).click();

    // 2. Thực hiện kéo thả
    const sourceHandle = page.getByTestId(/outline-drag-handle-/).first(); 
    await sourceHandle.dragTo(page.getByTestId(`workspace-column-${docBId}`));

    // 3. Kiểm tra Toast báo lỗi
    await expect(page.getByText(/Lỗi di chuyển/)).toBeVisible();
    await expect(page.getByText(/Target document not found/)).toBeVisible();
  });

  test.afterAll(async ({ request }) => {
    // Cleanup
    for (const id of [docAId, docBId]) {
      if (id) {
        await request.delete(`http://localhost:8080/api/annotations/documents/${id}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
      }
    }
  });
});
