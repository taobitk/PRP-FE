import { test, expect } from '@playwright/test';

test.describe('Annotation: Shatter from Dashboard and Level Up', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto('/login');

    // Bắt lỗi Console để test fail nếu có lỗi UI/Hydration
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        const text = msg.text();
        if (text.includes('Base UI') || text.includes('React does not recognize') || text.includes('Hydration')) {
          console.log(`\n❌ CONSOLE ERROR DETECTED: ${text}\n`);
          throw new Error(`Browser Console ${msg.type().toUpperCase()}: ${text}`);
        }
      }
    });

    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    await page.getByTestId('auth-login-submit').click();
    await expect(page).toHaveURL('/dashboard');
    
    // Chờ 2 giây để đảm bảo Auth Store đã được hydrate và sync xong
    await page.waitForTimeout(2000);
  });

  test('Scenario: Shatter document via Dashboard and Level Up Header', async ({ page }) => {
    test.setTimeout(60000);

    // 2. Click the big Shatter button in the Dashboard
    await page.getByRole('button', { name: /băm tài liệu mới/i }).click();

    // 3. Verify Modal is open
    await expect(page.getByTestId('annotation-create-modal')).toBeVisible();

    // 4. Fill and Submit
    await page.getByTestId('shatter-title-input').fill('Shatter Test Doc');
    await page.getByTestId('shatter-content-input').fill('## Target Header\nContent.');
    
    await Promise.all([
      page.waitForURL(/.*\/sections\/\d+\/tree/, { timeout: 60000 }),
      page.getByTestId('shatter-submit-button').click({ force: true })
    ]);

    // 5. Verify và Edit
    await expect(page.getByRole('button', { name: /chỉnh sửa/i })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Target Header').first()).toBeVisible();
    await page.getByRole('button', { name: /chỉnh sửa/i }).click();
    
    // Nâng cấp H2 -> H1
    await page.getByTestId('section-level-1').click();
    await page.getByRole('button', { name: /lưu thay đổi/i }).click();

    // 6. Kết quả cuối cùng
    await expect(page.getByText('H1', { exact: true }).first()).toBeVisible();
    await expect(page.getByText(/thành công/i)).toBeVisible();
  });
});
