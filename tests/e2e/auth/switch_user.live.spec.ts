import { test, expect } from '@playwright/test';

test.describe('Live E2E: User Switching Flow', () => {
  test('Switch from user2 to admin', async ({ page }) => {
    // 1. Đăng nhập user2
    await page.goto('/login');
    await page.getByTestId('auth-username-input').fill('user2');
    await page.getByTestId('auth-password-input').fill('123456');
    await page.getByTestId('auth-login-submit').click();

    // Chờ dashboard và kiểm tra đúng role user
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    const navbarUser = page.getByRole('navigation');
    await expect(navbarUser).toHaveAttribute('data-role', /user|member/i);
    console.log('✅ Đăng nhập user2 thành công!');

    // 2. Đăng xuất
    await page.getByRole('button', { name: /Đăng xuất/i }).click();
    await expect(page).toHaveURL('/login');
    console.log('✅ Đăng xuất user2 thành công!');

    // 3. Đăng nhập admin
    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    await page.getByTestId('auth-login-submit').click();

    // Chờ dashboard và kiểm tra đúng role admin
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    const navbarAdmin = page.getByRole('navigation');
    await expect(navbarAdmin).toHaveAttribute('data-role', /admin/i);
    console.log('✅ Đăng nhập admin thành công!');
    
    // Kiểm tra text chào mừng (vừa fix xong)
    await expect(page.getByText(/Chào mừng quay trở lại, (admin|Admin User)!/i)).toBeVisible();
  });
});
