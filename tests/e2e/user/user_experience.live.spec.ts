import { test, expect } from '@playwright/test';

test.describe('Live E2E: User Experience & Role-Based Access Control', () => {
  const uniqueMember = `member_${Date.now()}`;
  const memberEmail = `test_${Date.now()}@member.com`;

  test('Full Member Lifecycle and RBAC Guard', async ({ page }) => {
    test.setTimeout(60000); // Tăng timeout cho lifecycle dài
    // Ép viewport rộng để tránh bị ẩn menu
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // --- BƯỚC 1: ADMIN TẠO USER MỚI ---
    await page.goto('/login');
    await page.getByTestId('auth-username-input').fill('admin');
    await page.getByTestId('auth-password-input').fill('password123');
    await page.getByTestId('auth-login-submit').click();
    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });
    await expect(page.getByRole('navigation')).toHaveAttribute('data-role', /admin/i, { timeout: 20000 });

    await expect(page).toHaveURL('/dashboard');
    
    // 1. Chuyển sang trang Quản lý User
    const navbar = page.getByRole('navigation');
    await expect(navbar).toHaveAttribute('data-role', /admin/i, { timeout: 15000 });
    
    const adminLink = navbar.getByRole('link', { name: /Quản lý User/i });
    await expect(adminLink).toBeVisible({ timeout: 15000 });
    await adminLink.click();
    
    // Đợi trang Admin load xong và click Thêm người dùng
    const addUserBtn = page.getByRole('button', { name: /Thêm người dùng/i });
    await expect(addUserBtn).toBeVisible({ timeout: 10000 });
    await addUserBtn.click();

    await page.getByLabel('Tên đăng nhập mới').fill(uniqueMember);
    await page.getByLabel('Họ và tên').fill('Member Live Test');
    await page.getByLabel('Email').fill(memberEmail);
    const uniquePhone = `09${Math.floor(10000000 + Math.random() * 90000000)}`;
    await page.getByLabel('Số điện thoại').fill(uniquePhone);
    
    // Mặc định vai trò là 'member'
    const [createResponse] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/register') && res.request().method() === 'POST'),
      page.getByRole('button', { name: /Tạo người dùng/i }).click()
    ]);

    if (createResponse.status() !== 201) {
      console.log('Create User Failed:', await createResponse.json());
    }
    expect(createResponse.status()).toBe(201);

    await expect(page.getByText(/Đã tạo người dùng mới/i)).toBeVisible();
    
    // Đợi Modal đóng hoàn toàn
    await expect(page.getByText(/Thêm người dùng mới/i)).not.toBeVisible();
    
    // Admin đang ở trang Quản lý người dùng, không phải Dashboard
    await expect(page.getByRole('heading', { name: /Quản lý người dùng/i })).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: /Đăng xuất/i }).click();
    await expect(page).toHaveURL('/login');
    
    // Xóa sạch dấu vết để Member đăng nhập mới hoàn toàn
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // --- BƯỚC 2: MEMBER ĐĂNG NHẬP LẦN ĐẦU ---
    await page.getByTestId('auth-username-input').fill(uniqueMember);
    await page.getByTestId('auth-password-input').fill('123456');
    
    await page.getByTestId('auth-login-submit').click();
    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });
    await expect(page.getByText('Chào mừng quay trở lại, Member Live Test!')).toBeVisible({ timeout: 20000 });

    // --- BƯỚC 3: KIỂM TRA GIAO DIỆN MEMBER ---
    await expect(page.getByText('Tổng quan tài chính cá nhân')).toBeVisible();
    
    const navAdminLink = page.locator('nav').locator('text=Quản lý User');
    await expect(navAdminLink).not.toBeVisible();

    // --- BƯỚC 4: THỬ TRUY CẬP TRÁI PHÉP ---
    await page.goto('/admin/users');
    await expect(page.getByText('Truy cập bị từ chối')).toBeVisible();

    // --- BƯỚC 5: MEMBER ĐỔI MẬT KHẨU ---
    // Đăng nhập lại để thực hiện đổi pass
    await page.getByLabel('Tên đăng nhập').fill(uniqueMember);
    await page.getByLabel('Mật khẩu').fill('123456');
    await page.getByLabel('Nút đăng nhập').click();
    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });

    await page.getByRole('link', { name: /Hồ sơ/i }).click();
    await expect(page).toHaveURL('/dashboard/profile');

    await page.getByLabel('Mật khẩu cũ').fill('123456');
    await page.getByLabel('Mật khẩu mới').fill('newpassword123');
    
    const [changeRes] = await Promise.all([
      page.waitForResponse(res => res.url().includes('/change-password') && res.request().method() === 'POST'),
      page.getByLabel('Xác nhận đổi mật khẩu').click()
    ]);
    expect(changeRes.status()).toBe(200);
    await expect(page.getByText(/Mật khẩu đã được thay đổi thành công/i)).toBeVisible();

    // Kiểm tra đăng nhập lại bằng mật khẩu mới
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    await page.getByLabel('Tên đăng nhập').fill(uniqueMember);
    await page.getByLabel('Mật khẩu').fill('newpassword123');
    await page.getByLabel('Nút đăng nhập').click();
    await expect(page).toHaveURL('/dashboard', { timeout: 20000 });
    await expect(page).toHaveURL('/dashboard');

    // Dọn dẹp cuối cùng
    await page.getByRole('button', { name: 'Đăng xuất' }).click();
    await expect(page).toHaveURL('/login');
  });
});
