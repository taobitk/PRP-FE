import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should login successfully and redirect to dashboard', async ({ page }) => {
    // Mock the login API
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake-token',
          expires_at: '2026-12-31T23:59:59Z',
          user: {
            id: 1,
            username: 'admin',
            role: 'admin',
          },
        }),
      });
    });

    // Mock the me API
    await page.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            id: 1,
            username: 'admin',
            full_name: 'System Administrator',
            role: 'admin',
            status: 'active',
          },
        }),
      });
    });

    await page.goto('/login');

    // Fill the login form
    await page.fill('input[id="username"]', 'admin');
    await page.fill('input[id="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should see success toast and redirect
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.locator('text=Chào mừng quay trở lại, admin!')).toBeVisible();

    // Logout
    await page.click('text=Đăng xuất');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should show error on invalid credentials', async ({ page }) => {
    // Mock the login API with error
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Sai tài khoản hoặc mật khẩu',
        }),
      });
    });

    await page.goto('/login');

    await page.fill('input[id="username"]', 'wronguser');
    await page.fill('input[id="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    // Should see error toast
    const errorToast = page.getByText('Sai tài khoản hoặc mật khẩu');
    await expect(errorToast).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });
});
