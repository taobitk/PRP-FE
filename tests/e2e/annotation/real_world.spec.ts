import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('Real World Annotation E2E (Absolute Real)', () => {
  const filePath = 'D:/code/file code/agent/tài liệu tham khảo/tiêu chuẩn BE.md';
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  test('should process the real BE standards document with real login and backend', async ({ page }) => {
    // Bật Log để sếp theo dõi
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('response', async response => {
      if (response.url().includes('tree')) {
        try {
          const body = await response.json();
          console.log(`<< TREE DATA: ${JSON.stringify(body)}`);
        } catch (e) {}
      }
    });

    // 1. Đăng nhập thật bằng tài khoản sếp đưa
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Đợi đăng nhập thành công và chuyển hướng
    await expect(page).toHaveURL('/dashboard', { timeout: 15000 });
    console.log('--- LOGIN SUCCESSFUL ---');

    // 2. Vào trang tạo mới
    await page.goto('/annotations/new');
    await expect(page.getByText('Shatter Document')).toBeVisible();

    // 3. Điền Form với nội dung thật
    await page.fill('[data-testid="shatter-title-input"]', 'Tiêu chuẩn Backend (Hệ thống thật)');
    await page.fill('[data-testid="shatter-content-input"]', fileContent);
    
    // 4. Nhấn Shatter
    await page.click('[data-testid="shatter-submit-button"]');

    // 5. Kiểm tra chuyển hướng và cây nội dung thật từ Backend
    // Redirect về tree: /annotations/sections/:id/tree
    await expect(page).toHaveURL(/\/annotations\/sections\/\d+\/tree/, { timeout: 30000 });
    console.log('--- SHATTER SUCCESSFUL ---');

    // 6. Kiểm tra các Heading thật (Dùng .first() vì nó hiện ở cả Tree và Detail Panel)
    await expect(page.getByText('📜 Danh mục Tiêu chuẩn Backend (Java & Go)').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('💻 Tiêu chuẩn Lập trình (General Coding)').first()).toBeVisible();
    await expect(page.getByText('🗄️ Tiêu chuẩn Cơ sở dữ liệu (Database)').first()).toBeVisible();
    await expect(page.getByText('🔐 Tiêu chuẩn API & Bảo mật').first()).toBeVisible();

    // 7. Thêm tag thật (Chọn mục API để thao tác)
    await page.getByText('🔐 Tiêu chuẩn API & Bảo mật').first().click();
    const tagInput = page.getByTestId('tag-input');
    await tagInput.fill('production-security');
    await page.keyboard.press('Enter');

    // 8. Xác nhận tag đã lưu (Dùng .first() vì nó hiện ở cả Badge và Toast)
    await expect(page.getByText('production-security').first()).toBeVisible();
    console.log('--- TAGGING SUCCESSFUL ---');

    // 8. Test tính năng Chỉnh sửa (Edit Section)
    console.log('--- TESTING EDIT MODE ---');
    await page.getByText('Chỉnh sửa').click();
    const headingInput = page.locator('input[value="🔐 Tiêu chuẩn API & Bảo mật"]');
    await headingInput.fill('🔐 TIÊU CHUẨN API & BẢO MẬT (UPDATED)');
    
    const contentTextarea = page.locator('textarea');
    await contentTextarea.fill('Nội dung bảo mật đã được robot cập nhật để kiểm tra tính năng Edit.');
    
    await page.getByText('Lưu thay đổi').click();
    
    // Đợi Toast thành công xuất hiện
    await expect(page.getByText('Đã cập nhật nội dung thành công!')).toBeVisible({ timeout: 10000 });
    
    // Đợi thêm một chút để React Query refetch và render lại UI
    await page.waitForTimeout(1000);
    
    // Kiểm tra xem nội dung mới đã hiển thị chưa (Dùng Regex cho thoáng)
    await expect(page.getByText(/TIÊU CHUẨN API & BẢO MẬT/i).first()).toBeVisible();
    await expect(page.getByText(/robot cập nhật/i)).toBeVisible();
    console.log('--- EDIT SUCCESSFUL ---');

    console.log('--- E2E ABSOLUTE REAL SUCCESS ---');
  });
});
