import { test, expect } from '@playwright/test';

test.describe('Live E2E: Authentication', () => {
  
  test('Successful login, persistence and logout', async ({ page }) => {
    // Ép viewport rộng để tránh bị ẩn menu
    await page.setViewportSize({ width: 1280, height: 720 });

    // 1. Đăng nhập thành công
    await page.goto('/login');
    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    
    page.on('console', msg => console.log('BROWSER:', msg.text()));
    page.on('request', request => console.log('>> REQUEST:', request.method(), request.url()));
    page.on('response', response => console.log('<< RESPONSE:', response.status(), response.url()));

    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    
    await page.getByTestId('auth-login-submit').click();

    // Kiểm tra đã vào Dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText('Chào mừng quay trở lại, admin!')).toBeVisible();

    // 2. Kiểm tra tính bền vững (Persistence) - F5 trang
    await page.reload();
    await expect(page).toHaveURL('/dashboard');
    await expect(page.getByText(/Chào mừng quay trở lại, (admin|Admin User)!/i)).toBeVisible();

    // 3. Đăng xuất
    await page.getByRole('button', { name: /Đăng xuất/i }).click();
    
    // Đợi quay về trang login
    await expect(page).toHaveURL('/login');
    
    // Thử truy cập lại dashboard bằng URL trực tiếp 
    await page.goto('/dashboard');
    await expect(page.getByText('Truy cập bị từ chối')).toBeVisible();
  });

  test('Failed login with incorrect credentials', async ({ page }) => {
    await page.goto('/login');
    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('wrongpassword');
    
    const [response] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/login') && res.request().method() === 'POST'),
      page.getByTestId('auth-login-submit').click()
    ]);

    // Backend trả về 401
    expect(response.status()).toBe(401);
    
    const body = await response.json().catch(() => ({}));
    console.log('Failed Login Response Body:', body);
    
    // Backend trả về { error: "unauthorized" } và UI hiển thị qua toast
    await expect(page.getByText(/unauthorized|Invalid username or password|Đăng nhập thất bại/i).first()).toBeVisible();
    await expect(page).toHaveURL('/login');
  });
});
