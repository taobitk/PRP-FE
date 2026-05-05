import { test, expect } from '@playwright/test';

test.describe('Admin & User Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock Login as Admin
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake_admin_token',
          user: { id: 1, username: 'admin', role: 'admin' }
        })
      });
    });

    // 2. Mock Get Me
    await page.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { id: 1, username: 'admin', role: 'admin', full_name: 'Admin System' }
        })
      });
    });

    // 3. Mock Users List
    await page.route('**/api/users', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, username: 'admin', role: 'admin', status: 'active', full_name: 'Admin System' },
          { id: 2, username: 'staff_01', role: 'member', status: 'active', full_name: 'Staff One' }
        ])
      });
    });

    // Login process
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('Admin can see Admin Dashboard and navigate to User Management', async ({ page }) => {
    await expect(page.getByText('Chào mừng quay trở lại, admin!')).toBeVisible();
    await expect(page.getByText('Tổng số người dùng')).toBeVisible();
    
    // Click Quick Link
    await page.click('text=Quản lý User');
    await expect(page).toHaveURL('/admin/users');
    await expect(page.getByText('Danh sách nhân sự hệ thống')).toBeVisible();
    await expect(page.getByText('Staff One')).toBeVisible();
  });

  test('Admin can toggle user status', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Mock PATCH status
    await page.route('**/api/users/2/status', async (route) => {
      await route.fulfill({ status: 204 });
    });

    // Find the switch for Staff One (id 2) and click it
    // In our table, id 2 is the second row
    await page.locator('button[role="switch"]').nth(1).click(); // Toggle staff_01
    
    await expect(page.getByText('Đã cập nhật trạng thái.')).toBeVisible();
  });

  test('Member is denied access to Admin page', async ({ page }) => {
    // 1. Mock Login as Member
    await page.route('**/api/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          access_token: 'fake_member_token',
          user: { id: 2, username: 'staff_01', role: 'member' }
        })
      });
    });

    // 2. Mock Get Me as Member
    await page.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { id: 2, username: 'staff_01', role: 'member' }
        })
      });
    });

    // Login again as member
    await page.goto('/login');
    await page.fill('input[name="username"]', 'staff_01');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await page.goto('/admin/users');
    await expect(page.getByText('Truy cập bị từ chối')).toBeVisible();
    await expect(page.getByText('Bạn không có quyền quản trị')).toBeVisible();
  });
});
