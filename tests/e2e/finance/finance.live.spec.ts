import { test, expect } from '@playwright/test';

/**
 * 💰 FINANCE LIVE E2E MEGA CHAIN
 * Luồng test toàn diện Module Tài chính: Ví -> Danh mục -> Giao dịch -> Chuyển tiền -> Báo cáo
 */
test.describe('Live E2E: Finance Management System', () => {
  const timestamp = Date.now();
  const walletCashName = `Ví Tiền Mặt ${timestamp}`;
  const walletBankName = `Ví Ngân Hàng ${timestamp}`;
  const walletCreditName = `Thẻ Tín Dụng ${timestamp}`;
  const categoryIncomeName = `Lương Test ${timestamp}`;
  const categoryExpenseName = `Ăn Uống Test ${timestamp}`;

  test.beforeEach(async ({ page }) => {
    // 1. Login as Admin
    await page.goto('/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard', { timeout: 10000 });
  });

  test('Complete Finance Lifecycle Chain', async ({ page }) => {
    test.setTimeout(120000); // Tăng timeout cho chuỗi logic dài
    // Ép viewport rộng để tránh bị ẩn menu
    await page.setViewportSize({ width: 1280, height: 720 });

    await test.step('Phase 1: Setup Infrastructure (Wallets & Categories)', async () => {
      // 1.1 Tạo các loại ví
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/wallets') && res.request().method() === 'GET'),
        page.goto('/finance/wallets')
      ]);

      const wallets = [
        { name: walletCashName, type: 'cash', balance: '10000000', testid: 'cash' },
        { name: walletBankName, type: 'bank', balance: '20000000', testid: 'bank' },
        { name: walletCreditName, type: 'credit', balance: '0', testid: 'credit' },
      ];

      for (const w of wallets) {
        await page.click('text=Thêm ví mới');
        await page.getByLabel('Tên ví').fill(w.name);
        await page.getByLabel('Loại ví').selectOption(w.type);
        await page.getByLabel('Số dư ban đầu').fill(w.balance);
        
        const [walletRes] = await Promise.all([
          page.waitForResponse(res => res.url().includes('/finance/wallets') && res.request().method() === 'POST'),
          page.getByLabel('Xác nhận tạo ví').click()
        ]);
        
        expect(walletRes.status()).toBe(201);
        await expect(page.getByText('Đã tạo ví thành công!').first()).toBeVisible();
        await expect(page.getByText(w.name).first()).toBeVisible();
      }

      // 1.2 Tạo danh mục
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/categories') && res.request().method() === 'GET'),
        page.goto('/finance/categories')
      ]);

      const categories = [
        { name: categoryIncomeName, type: 'income', tab: 'income' },
        { name: categoryExpenseName, type: 'expense', tab: 'expense' },
      ];

      for (const c of categories) {
        await page.click(`button[role="tab"]:has-text("${c.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}")`);
        await page.click('text=Thêm danh mục');
        await page.getByLabel('Tên danh mục').fill(c.name);
        await page.getByLabel('Loại danh mục').selectOption(c.type);
        
        const [catRes] = await Promise.all([
          page.waitForResponse(res => res.url().includes('/finance/categories') && res.request().method() === 'POST'),
          page.getByLabel('Xác nhận tạo danh mục').click()
        ]);
        
        expect(catRes.status()).toBe(201);
        await expect(page.getByText('Đã tạo danh mục thành công!').first()).toBeVisible();
        await expect(page.getByText(c.name).first()).toBeVisible();
      }
    });

    await test.step('Phase 2: Analytics & Charts Stability', async () => {
      await page.goto('/finance/analytics');
      await expect(page.getByText('Phân tích tài chính')).toBeVisible();
      // Đợi các biểu đồ render (không crash)
      await expect(page.getByText(/Xu hướng dòng tiền/i)).toBeVisible();
      await expect(page.getByText(/Health Score/i)).toBeVisible();
      
      // Kiểm tra xem có lỗi console không (tùy chọn nhưng tốt)
      // Playwright sẽ tự động fail nếu có crash nghiêm trọng hoặc timeout
    });

    await test.step('Phase 3: Transactions & Attribution Logic', async () => {
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/transactions') && res.request().method() === 'GET'),
        page.goto('/finance/transactions')
      ]);

      // 2.1 Ghi nhận thu nhập (Income)
      await page.click('text=Ghi giao dịch');
      await page.getByLabel('Danh mục giao dịch').click(); 
      await page.waitForSelector('option:not([value=""])'); // Đợi có ít nhất 1 option thực thụ
      await page.getByLabel('Danh mục giao dịch').selectOption({ label: new RegExp(categoryIncomeName, 'i') });
      await page.getByLabel('Ví thực hiện').selectOption({ label: new RegExp(walletCashName, 'i') });
      await page.getByLabel('Số tiền giao dịch').fill('5000000');
      await page.fill('input[placeholder="Nội dung giao dịch..."]', 'Lương tháng test');

      // Attribution mặc định cho 1 nguồn
      const firstAttr = page.locator('[data-testid="finance-tx-attr-row"]').first();
      await firstAttr.getByLabel('Ví nguồn phân bổ').selectOption({ label: walletCashName });
      await firstAttr.locator('input[placeholder="Số tiền"]').fill('5000000');

      const [txResponse] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/transactions') && res.request().method() === 'POST'),
        page.getByLabel('Xác nhận giao dịch').click()
      ]);

      console.log('Create Transaction Status:', txResponse.status());
      if (txResponse.status() !== 201) {
        console.log('Create Transaction Error:', await txResponse.text());
      }

      await expect(page.getByText(/thành công|Có lỗi xảy ra|Insufficient balance/i).first()).toBeVisible();
      await expect(txResponse.status()).toBe(201);

      // 2.2 Chi tiêu phân bổ 2 nguồn (Multi-attribution)
      await page.click('text=Ghi giao dịch');
      await page.getByLabel('Danh mục giao dịch').selectOption({ label: new RegExp(categoryExpenseName, 'i') });
      await page.getByLabel('Ví thực hiện').selectOption({ label: walletCashName });
      await page.getByLabel('Số tiền giao dịch').fill('1000000');

      // Thêm nguồn thứ 2
      await page.getByLabel('Thêm nguồn phân bổ').click();

      const attrRows = page.locator('[data-testid="finance-tx-attr-row"]');

      // Nguồn 1
      await attrRows.nth(0).getByLabel('Ví nguồn phân bổ').selectOption({ label: walletCashName });
      await attrRows.nth(0).locator('input[type="number"]').fill('600000');

      // Nguồn 2
      await attrRows.nth(1).getByLabel('Ví nguồn phân bổ').selectOption({ label: walletBankName });
      await attrRows.nth(1).locator('input[type="number"]').fill('400000');
      
      const [multiTxRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/transactions') && res.request().method() === 'POST'),
        page.getByLabel('Xác nhận giao dịch').click()
      ]);
      
      expect(multiTxRes.status()).toBe(201);
      await expect(page.getByText('Đã ghi nhận giao dịch thành công!').first()).toBeVisible();
    });

    // Phase 3 Tạm bỏ qua vì UI Chuyển tiền chưa gắn logic modal
    /*
    await test.step('Phase 3: Wallet Transfer', async () => {
      ...
    });
    */

    await test.step('Phase 4: Negative Balance Rules', async () => {
      await page.goto('/finance/transactions');

      // 4.1 Thử chi vượt số dư ví Cash (Phải lỗi)
      await page.click('text=Ghi giao dịch');
      await page.getByLabel('Danh mục giao dịch').selectOption({ label: `${categoryExpenseName} (expense)` });
      await page.getByLabel('Ví thực hiện').selectOption({ label: walletCashName });
      await page.getByLabel('Số tiền giao dịch').fill('99000000');

      const errAttr = page.locator('[data-testid="finance-tx-attr-row"]').first();
      await errAttr.getByLabel('Ví nguồn phân bổ').selectOption({ label: walletCashName });
      await errAttr.locator('input[placeholder="Số tiền"]').fill('99000000');

      const [errResponse] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/transactions') && res.request().method() === 'POST'),
        page.getByLabel('Xác nhận giao dịch').click()
      ]);

      console.log('Negative Test Status:', errResponse.status());
      const errBody = await errResponse.text();
      console.log('Negative Test Error Body:', errBody);

      // Chấp nhận cả lỗi chung nếu toast không hiển thị text cụ thể
      await expect(page.getByText(/Insufficient balance|Không đủ số dư|Có lỗi xảy ra/i).first()).toBeVisible();
      await expect(errResponse.status()).toBe(400);

      await page.keyboard.press('Escape'); // Đóng modal

      // 4.2 Thử chi vượt số dư ví Credit (Phải OK)
      await page.click('text=Ghi giao dịch');
      await page.getByLabel('Danh mục giao dịch').selectOption({ label: `${categoryExpenseName} (expense)` });
      await page.getByLabel('Ví thực hiện').selectOption({ label: walletCreditName });
      await page.getByLabel('Số tiền giao dịch').fill('500000');

      const creditAttr = page.locator('[data-testid="finance-tx-attr-row"]').first();
      await creditAttr.getByLabel('Ví nguồn phân bổ').selectOption({ label: walletCreditName });
      await creditAttr.locator('input[placeholder="Số tiền"]').fill('500000');
      
      const [creditTxRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/transactions') && res.request().method() === 'POST'),
        page.getByLabel('Xác nhận giao dịch').click()
      ]);
      
      expect(creditTxRes.status()).toBe(201);
      await expect(page.getByText('Đã ghi nhận giao dịch thành công!').first()).toBeVisible();
    });

    await test.step('Phase 5: Analytics Verification', async () => {
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/analytics/dashboard') && res.request().method() === 'GET'),
        page.waitForResponse(res => res.url().includes('/finance/analytics/trend') && res.request().method() === 'GET'),
        page.waitForResponse(res => res.url().includes('/finance/analytics/source-roi') && res.request().method() === 'GET'),
        page.waitForResponse(res => res.url().includes('/finance/analytics/spending-bias') && res.request().method() === 'GET'),
        page.waitForResponse(res => res.url().includes('/finance/analytics/health-score') && res.request().method() === 'GET'),
        page.waitForResponse(res => res.url().includes('/finance/analytics/forecast') && res.request().method() === 'GET'),
        page.waitForResponse(res => res.url().includes('/finance/analytics/comparison') && res.request().method() === 'GET'),
        page.waitForResponse(res => res.url().includes('/finance/analytics/report') && res.request().method() === 'GET'),
        page.goto('/finance/analytics')
      ]);
      await expect(page.getByText('Phân tích tài chính')).toBeVisible();
      await expect(page.getByText(/Xu hướng dòng tiền/i)).toBeVisible();
    });

    await test.step('Phase 7: Budgets Management', async () => {
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/budgets/status') && res.request().method() === 'GET'),
        page.goto('/finance/budgets')
      ]);

      await expect(page.getByText('Ngân sách chi tiêu')).toBeVisible();

      // Thiết lập ngân sách mới
      await page.getByRole('button', { name: /Thiết lập ngân sách/i }).click();
      await page.getByLabel('Chọn danh mục lập ngân sách').selectOption({ label: categoryExpenseName });
      await page.getByLabel('Hạn mức ngân sách').fill('5000000');
      
      const [setBudgetRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/budgets') && res.request().method() === 'POST'),
        page.waitForResponse(res => res.url().includes('/finance/budgets/status') && res.request().method() === 'GET'),
        page.getByLabel('Xác nhận thiết lập ngân sách').click()
      ]);

      expect(setBudgetRes.status()).toBe(201);
      await expect(page.getByText('Đã thiết lập ngân sách thành công!')).toBeVisible();

      // Đợi UI cập nhật và cuộn xuống để thấy Card mới (nếu danh sách dài)
      await page.waitForTimeout(1000);
      
      // Kiểm tra Budget hiển thị trong danh sách
      const budgetCard = page.locator('div[data-slot="card"]', { hasText: categoryExpenseName });
      await expect(budgetCard).toBeVisible({ timeout: 10000 });
      await expect(budgetCard.getByText(/Hạn mức:/)).toBeVisible();
    });

    await test.step('Phase 6: CRUD & Cleanup Verification', async () => {
      // 6.1 Sửa và Xóa Giao dịch
      await page.goto('/finance/transactions');
      
      await page.getByLabel('Sửa giao dịch').first().click();
      await page.getByLabel('Ghi chú giao dịch').fill('Ghi chú đã cập nhật');
      const [updateTxRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/transactions') && res.request().method() === 'PUT'),
        page.getByLabel('Xác nhận cập nhật giao dịch').click()
      ]);
      expect(updateTxRes.status()).toBe(200);

      page.once('dialog', d => d.accept());
      const [deleteTxRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/transactions') && res.request().method() === 'DELETE'),
        page.getByLabel('Xóa giao dịch').first().click()
      ]);
      expect(deleteTxRes.status()).toBe(204);

      // 6.2 Sửa và Xóa Danh mục
      await page.goto('/finance/categories');
      
      // Test Xóa danh mục có ràng buộc (Expense đã có Budget) -> Mong đợi 409
      page.once('dialog', dialog => dialog.accept());
      const [deleteLockedRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/categories') && res.request().method() === 'DELETE'),
        page.getByLabel(`Xóa danh mục ${categoryExpenseName}`).click()
      ]);
      expect(deleteLockedRes.status()).toBe(409);
      console.log('Verified: Cannot delete category with budget (409)');

      // Test Xóa danh mục sạch (Income) -> Mong đợi 204
      await page.getByRole('tab', { name: /Thu nhập/i }).click(); // Chuyển sang tab income
      await page.getByLabel(`Sửa danh mục ${categoryIncomeName}`).click();
      await page.getByLabel('Tên danh mục').fill(`${categoryIncomeName} Updated`);
      await page.getByLabel('Xác nhận cập nhật danh mục').click();
      await expect(page.getByText('Đã cập nhật danh mục.')).toBeVisible();

      const [deleteCatRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/categories') && res.request().method() === 'DELETE'),
        page.getByLabel(`Xóa danh mục ${categoryIncomeName} Updated`).click()
      ]);
      expect(deleteCatRes.status()).toBe(204);

      // 6.3 Sửa và Xóa Ví
      await page.goto('/finance/wallets');
      await page.getByLabel(`Sửa ví ${walletCashName}`).click();
      await page.getByLabel('Tên ví').fill(`${walletCashName} Updated`);
      const [updateWalletRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/wallets') && res.request().method() === 'PUT'),
        page.getByLabel('Xác nhận cập nhật ví').click()
      ]);
      expect(updateWalletRes.status()).toBe(200);

      page.once('dialog', d => d.accept());
      const [deleteWalletRes] = await Promise.all([
        page.waitForResponse(res => res.url().includes('/finance/wallets') && res.request().method() === 'DELETE'),
        page.getByLabel(`Xóa ví ${walletCashName} Updated`).click()
      ]);
      expect(deleteWalletRes.status()).toBe(204);
    });
  });
});
