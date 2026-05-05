import { test, expect } from '@playwright/test';

// ⚠️ LƯU Ý: Test này chạy trên Backend THẬT. Cần đảm bảo BE đang chạy tại localhost:8080
// và có sẵn tài khoản admin (username: admin, password: password123)
// Lưu ý: Pass mặc định cho user mới tạo là 123456.

test.describe('Live E2E: Admin & User Management', () => {
  // Tạo username ngẫu nhiên để không bị trùng (Conflict 409) mỗi lần chạy test
  const uniqueUsername = `testuser_${Date.now()}`;
  const uniqueEmail = `test_${Date.now()}@example.com`;

  test.beforeEach(async ({ page }) => {
    // Log toàn bộ request để debug live
    page.on('request', request => console.log('>>', request.method(), request.url()));
    page.on('response', response => console.log('<<', response.status(), response.url()));
    
    // Đăng nhập bằng tài khoản admin THẬT
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    
    const [loginResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/login') && res.request().method() === 'POST'),
      page.click('button[type="submit"]')
    ]);
    
    expect(loginResponse.status()).toBe(200);

    // Đợi profile load (/me) khi vào dashboard
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/me') && res.request().method() === 'GET'),
      expect(page).toHaveURL('/dashboard', { timeout: 10000 })
    ]);

    // Đảm bảo login thành công và lấy được profile
    await expect(page.getByText('Chào mừng quay trở lại, admin!')).toBeVisible();
  });

  test('Full Admin Lifecycle: Create -> Edit -> Toggle -> Delete User', async ({ page }) => {
    // Ép viewport rộng để tránh bị ẩn menu
    await page.setViewportSize({ width: 1280, height: 720 });

    // 1. Chuyển sang trang Quản lý User
    const navbar = page.getByRole('navigation');
    await expect(navbar).toHaveAttribute('data-role', /admin/i, { timeout: 15000 });
    
    const adminLink = navbar.getByRole('link', { name: /Quản lý User/i });
    await expect(adminLink).toBeVisible({ timeout: 15000 });
    await Promise.all([
      page.waitForResponse(res => res.url().includes('/users') && res.request().method() === 'GET'),
      adminLink.click()
    ]);
    
    await expect(page).toHaveURL('/admin/users');
    await expect(page.getByText('Danh sách nhân sự hệ thống')).toBeVisible();

    // 2. Tạo User mới
    const addUserBtn = page.getByRole('button', { name: /Thêm người dùng/i });
    await expect(addUserBtn).toBeVisible({ timeout: 10000 });
    await addUserBtn.click();
    await page.getByLabel('Tên đăng nhập mới').fill(uniqueUsername);
    await page.getByLabel('Họ và tên').fill('Live Test User');
    await page.getByLabel('Email').fill(uniqueEmail);
    const uniquePhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.getByLabel('Số điện thoại').fill(uniquePhone);
    // Mặc định là member, ta cứ giữ nguyên
    
    const [createResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/register') && res.request().method() === 'POST'),
      page.getByLabel('Tạo người dùng').click()
    ]);

    expect(createResponse.status()).toBe(201);

    console.log('Create Response Status:', createResponse.status());
    console.log('Create Response Body:', await createResponse.json().catch(() => 'No JSON body'));

    // Đợi thông báo thành công và modal đóng
    await expect(page.getByText('Đã tạo người dùng mới')).toBeVisible();
    await expect(page.getByText('Thêm người dùng mới')).not.toBeVisible();

    // Kiểm tra user mới xuất hiện trong bảng (có thể phải đợi refetch)
    await expect(page.getByText(uniqueUsername).first()).toBeVisible();

    // 3. Sửa User (Edit)
    await page.getByLabel(`Sửa người dùng ${uniqueUsername}`).click();
    await page.getByLabel('Họ và tên').fill('Live Test Updated');
    
    const [editResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/users') && res.request().method() === 'PUT'),
      page.getByLabel('Lưu thay đổi').click()
    ]);
    
    expect(editResponse.status()).toBeGreaterThanOrEqual(200);
    expect(editResponse.status()).toBeLessThan(300);
    
    await expect(page.getByText('Đã cập nhật thông tin người dùng.')).toBeVisible();
    await expect(page.getByText('Live Test Updated').first()).toBeVisible();

    // 4. Toggle Status (Active -> Inactive)
    // Đợi UI ổn định
    await page.waitForTimeout(1000);
    
    const [statusResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/status') && res.request().method() === 'PATCH'),
      page.getByLabel(`Trạng thái của ${uniqueUsername}`).click({ force: true })
    ]);

    expect(statusResponse.status()).toBeGreaterThanOrEqual(200);
    expect(statusResponse.status()).toBeLessThan(300);

    // Đợi thông báo thành công
    await page.waitForSelector('text=Đã cập nhật trạng thái.', { timeout: 10000 });
    
    // Đợi một chút để UI cập nhật chữ (có thể là active -> inactive)
    await expect(page.locator('tr', { hasText: uniqueUsername }).getByText('inactive')).toBeVisible();

    // 5. Reset Password (Mật khẩu tùy chỉnh)
    await page.getByLabel(`Reset mật khẩu của ${uniqueUsername}`).click();
    await page.getByLabel('Mật khẩu mới cho nhân viên').fill('resetpassword123');
    
    const [resetRes] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/reset-password') && res.request().method() === 'POST'),
      page.getByLabel('Xác nhận reset mật khẩu').click()
    ]);
    expect(resetRes.status()).toBe(200);
    await expect(page.getByText(/Đã đặt lại mật khẩu cho/i)).toBeVisible();

    // 6. Xóa User (Clean up)
    // Cần handle dialog confirm của browser (window.confirm)
    page.once('dialog', dialog => dialog.accept());
    
    const [deleteResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/users') && res.request().method() === 'DELETE'),
      await page.getByLabel(`Xóa người dùng ${uniqueUsername}`).click()
    ]);
    
    expect(deleteResponse.status()).toBe(204);
    
    await expect(page.getByText('Đã xóa người dùng.')).toBeVisible();
    
    // Đảm bảo user đã biến mất khỏi bảng
    await expect(page.getByText(uniqueUsername).first()).not.toBeVisible();
  });
});
