import { test, expect } from '@playwright/test';

test.describe('Outline Editor (Real API Integration)', () => {
  let testDocumentId = 0;
  let accessToken = '';

  test.beforeAll(async ({ request }) => {
    // 1. Login
    const loginRes = await request.post('http://localhost:8080/api/login', {
      data: { username: 'admin', password: 'password123' }
    });
    const loginData = await loginRes.json();
    accessToken = loginData.data.access_token;

    // 2. Create document
    const shatterRes = await request.post('http://localhost:8080/api/annotations/documents', {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      data: {
        owner_id: 1,
        title: 'E2E Final Test - ' + new Date().getTime(),
        raw_content: '# Chương 1\nNội dung 1\n## Mục 1.1\nNội dung 1.1\n# Chương 2\nNội dung 2'
      }
    });
    const shatterData = await shatterRes.json();
    testDocumentId = shatterData.data.document_id;
    console.log(`[E2E] Created document ${testDocumentId}`);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: { accessToken: token, user: { username: 'admin' }, isAuthenticated: true },
        version: 0
      }));
    }, accessToken);

    await page.goto(`/annotations/sections/${testDocumentId}/tree`);
    await expect(page.getByTestId('outline-tree-loading')).not.toBeVisible();
  });

  test('Integration: End-to-End Outline Management', async ({ page }) => {
    await expect(page.getByTestId('outline-tree-container')).toBeVisible();
    
    // Lấy số lượng ban đầu (Dynamic)
    const items = page.getByTestId(/outline-item-/);
    const initialCount = await items.count();
    console.log(`[E2E] Initial sections count: ${initialCount}`);

    // Thêm section mới
    await page.getByText('Thêm phần mới ở ngoài cùng').click();
    await expect(items).toHaveCount(initialCount + 1);
    console.log('[E2E] Add section: Success');

    // Lưu cấu trúc
    const saveBtn = page.getByTestId('outline-save-btn');
    await saveBtn.click();
    await expect(saveBtn).toBeEnabled();
    console.log('[E2E] Save structure: Success');
  });

  test('Integration: Edit content and verify persistence on Real DB', async ({ page }) => {
    const newHeading = 'Tiêu đề đã sửa ' + new Date().getTime();
    const newContent = 'Nội dung đã sửa từ E2E test';

    await test.step('When I edit the heading and content', async () => {
      // Đợi Editor load xong (đã auto load Section Root)
      await expect(page.getByTestId('section-editor-heading-input')).toBeVisible();
      
      await page.getByTestId('section-editor-heading-input').fill(newHeading);
      await page.getByTestId('section-editor-content-input').fill(newContent);
      await page.getByTestId('section-editor-save-btn').click();
    });

    await test.step('Then it should show success and persist after reload', async () => {
      // Chờ cho đến khi nút save hết loading (isSaving = false)
      await expect(page.getByTestId('section-editor-save-btn')).toBeEnabled();
      
      // Reload trang để kiểm tra DB
      await page.reload();
      await expect(page.getByTestId('outline-tree-loading')).not.toBeVisible();
      
      // Kiểm tra giá trị mới
      await expect(page.getByTestId('section-editor-heading-input')).toHaveValue(newHeading);
      await expect(page.getByTestId('section-editor-content-input')).toHaveValue(newContent);
    });
  });

  test.afterAll(async ({ request }) => {
    if (testDocumentId && accessToken) {
      await request.delete(`http://localhost:8080/api/annotations/documents/${testDocumentId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      console.log(`[E2E] Cleanup: Success`);
    }
  });
});
