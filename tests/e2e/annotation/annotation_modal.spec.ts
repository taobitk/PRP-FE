import { test, expect } from '@playwright/test';

test.describe('Annotation Modal & Level Switcher Flow', () => {
  const timestamp = Date.now();
  const testTitle = `Modal Test Doc ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Login
    await page.goto('/login');
    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    await page.getByTestId('auth-login-submit').click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('Scenario: Create via Modal and Switch Level', async ({ page }) => {
    // 1. Mở Modal từ Dashboard
    await page.goto('/annotations');
    const openModalBtn = page.getByTestId('annotation-create-trigger');
    await openModalBtn.click();

    // Kiểm tra Modal hiển thị
    const modal = page.getByTestId('annotation-create-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Tải lên tài liệu mới')).toBeVisible();

    // 2. Điền form trong Modal
    await page.fill('[data-testid="shatter-title-input"]', testTitle);
    await page.fill('[data-testid="shatter-content-input"]', '# Initial H1\nContent for testing level switch.');
    await page.click('[data-testid="shatter-submit-button"]');

    // 3. Đợi chuyển hướng đến trang tree
    await expect(page).toHaveURL(/\/annotations\/sections\/\d+\/tree/, { timeout: 20000 });
    await expect(page.getByText('Initial H1').first()).toBeVisible();

    // 4. Test Level Switcher
    // Bấm nút Chỉnh sửa
    await page.click('button:has-text("Chỉnh sửa")');

    // Kiểm tra các nút level xuất hiện
    const h1Btn = page.getByTestId('section-level-1');
    const h2Btn = page.getByTestId('section-level-2');
    const h3Btn = page.getByTestId('section-level-3');
    
    await expect(h1Btn).toBeVisible();
    await expect(h2Btn).toBeVisible();

    // Đổi sang H2
    await h2Btn.click();
    
    // Bấm Lưu
    await page.click('button:has-text("Lưu thay đổi")');

    // Kiểm tra Badge Level cập nhật thành H2
    await expect(page.getByText('H2').first()).toBeVisible();
    await expect(page.getByText('Đã cập nhật nội dung thành công!')).toBeVisible();
  });

  test('Scenario: Open Modal from Navbar', async ({ page }) => {
    await page.goto('/dashboard');
    
    // 1. Click mở menu Annotation trên Navbar
    await page.click('text=Annotation');
    
    // 2. Click vào Shatter Document trong menu
    const shatterMenuItem = page.getByText('Shatter Document');
    await expect(shatterMenuItem).toBeVisible();
    await shatterMenuItem.click();

    // 3. Kiểm tra Modal có hiện lên không
    const modal = page.getByTestId('annotation-create-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Tải lên tài liệu mới')).toBeVisible();
  });
});
