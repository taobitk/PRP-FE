import { test, expect } from '@playwright/test';

test.describe('Real E2E: Annotation Module', () => {
  const timestamp = Date.now();
  const testTitle = `Real E2E Doc ${timestamp}`;
  const updatedTitle = `Real E2E Doc Updated ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    // Ép viewport rộng
    await page.setViewportSize({ width: 1280, height: 720 });

    // Login thực tế
    await page.goto('/login');
    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    await page.getByTestId('auth-login-submit').click();
    
    // Đợi vào Dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete full lifecycle with real backend', async ({ page }) => {
    // 1. Shatter Document
    await page.goto('/annotations/new');
    await expect(page.getByText('Shatter Document')).toBeVisible();

    await page.fill('[data-testid="shatter-title-input"]', testTitle);
    await page.fill('[data-testid="shatter-content-input"]', '# Real Header\nThis is real content from E2E test.');
    
    // Bấm submit và đợi chuyển hướng
    await page.click('[data-testid="shatter-submit-button"]');
    
    // Đợi chuyển hướng đến trang tree (regex khớp với /annotations/sections/\d+/tree)
    await expect(page).toHaveURL(/\/annotations\/sections\/\d+\/tree/, { timeout: 20000 });
    
    // Kiểm tra nội dung real đã băm
    await expect(page.getByText('Real Header').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('This is real content').first()).toBeVisible({ timeout: 15000 });

    // 2. Manage Documents List
    await page.goto('/annotations');
    await expect(page.getByText('Your Documents')).toBeVisible();
    
    // Kiểm tra tài liệu vừa tạo có trong danh sách
    const docRow = page.getByText(testTitle);
    await expect(docRow).toBeVisible({ timeout: 10000 });

    // Lấy ID từ DOM nếu cần, nhưng ta có thể dùng text selector
    // Ở đây ta dùng data-testid chứa ID. Ta cần tìm row chứa testTitle.
    // Vì DocumentList render row với testid `annotation-document-row-${id}`
    // Ta có thể tìm element có text là testTitle rồi tìm cha của nó.
    
    // 3. Rename
    const row = page.getByRole('row').filter({ hasText: testTitle });
    await row.getByTestId(/annotation-document-rename-btn-/).click();
    
    const input = page.getByTestId(/annotation-document-rename-input-/);
    await input.fill(updatedTitle);
    await page.getByTestId(/annotation-document-save-btn-/).click();
    
    await expect(page.getByText('Document renamed')).toBeVisible();
    await expect(page.getByText(updatedTitle)).toBeVisible();

    // 4. Delete (Cleanup)
    page.on('dialog', dialog => dialog.accept());
    const updatedRow = page.getByRole('row').filter({ hasText: updatedTitle });
    await updatedRow.getByTestId(/annotation-document-delete-btn-/).click();
    
    await expect(page.getByText('Document deleted')).toBeVisible();
    await expect(page.getByText(updatedTitle)).not.toBeVisible();
  });
});
