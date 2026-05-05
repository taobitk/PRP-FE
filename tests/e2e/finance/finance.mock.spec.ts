import { test, expect } from '@playwright/test';

test.describe('Finance Module E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock Auth
    await page.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { id: 1, username: 'admin', role: 'admin' } }),
      });
    });

    // 2. Set mock token in localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          token: 'fake-token',
          user: { id: 1, username: 'admin', role: 'admin' },
          isAuthenticated: true
        },
        version: 0
      }));
    });
  });

  test('FE-1 & FE-2: Create and List Wallets', async ({ page }) => {
    // Mock List API
    await page.route('**/api/finance/wallets', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 1, name: 'Ví Tiền Mặt', type: 'cash', balance: '500000' }
          ]),
        });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: 2, name: 'Ngân hàng VCB', type: 'bank', balance: '1000000' }),
        });
      }
    });

    await page.goto('/finance/wallets');

    // Verify existing wallet
    await expect(page.getByText('Ví Tiền Mặt')).toBeVisible();
    await expect(page.getByTestId('wallet-balance-1')).toContainText('500.000');

    // Create new wallet
    await page.click('text=Thêm ví mới');
    await page.fill('[data-testid="finance-wallet-name-input"]', 'Ngân hàng VCB');
    await page.selectOption('[data-testid="finance-wallet-type-select"]', 'bank');
    await page.fill('[data-testid="finance-wallet-balance-input"]', '1000000');
    
    // Mock the reload after creation
    await page.route('**/api/finance/wallets', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 1, name: 'Ví Tiền Mặt', type: 'cash', balance: '500000' },
          { id: 2, name: 'Ngân hàng VCB', type: 'bank', balance: '1000000' }
        ]),
      });
    });

    await page.click('[data-testid="finance-wallet-submit-btn"]');

    // Verify success toast and new wallet
    await expect(page.getByText('Đã tạo ví thành công!')).toBeVisible();
    await expect(page.getByText('Ngân hàng VCB')).toBeVisible();
  });

  test('FE-10 & FE-26: Transaction Creation and Attribution Validation', async ({ page }) => {
    // Mock dependencies
    await page.route('**/api/finance/wallets', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ id: 1, name: 'Ví Chính', type: 'cash', balance: '1000000' }]),
      });
    });
    await page.route('**/api/finance/categories', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify([{ id: 1, name: 'Ăn uống', type: 'expense' }]),
      });
    });
    await page.route('**/api/finance/transactions', async (route) => {
      await route.fulfill({ status: 200, body: JSON.stringify([]) });
    });

    await page.goto('/finance/transactions');

    await page.click('text=Ghi giao dịch');

    // Fill form
    await page.fill('[data-testid="finance-tx-amount"]', '500000');
    await page.selectOption('[data-testid="finance-tx-category"]', '1');
    await page.selectOption('[data-testid="finance-tx-wallet"]', '1');

    // Case FE-26: Sum mismatch
    // Default attribution is 1 row with 0 amount (based on my component code)
    await page.click('[data-testid="finance-tx-submit"]');
    await expect(page.getByText(/Tổng phân bổ/i)).toBeVisible();

    // Fix attribution
    await page.fill('input[name="attributions.0.amount"]', '500000');
    await page.selectOption('select[name="attributions.0.source_wallet_id"]', '1');

    // Case FE-10: Success
    await page.route('**/api/finance/transactions', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({ status: 201, body: JSON.stringify({ id: 1, amount: '500000' }) });
      }
    });

    await page.click('[data-testid="finance-tx-submit"]');
    await expect(page.getByText('Đã ghi nhận giao dịch thành công!')).toBeVisible();
  });
});
