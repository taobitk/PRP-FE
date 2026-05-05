import { test, expect } from '@playwright/test';

test.describe('Annotation Module Journey', () => {
  const mockDocumentId = 101;

  test.beforeEach(async ({ page }) => {
    // Bắt log từ Browser và Network
    page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));
    page.on('request', request => console.log(`>> REQUEST: ${request.method()} ${request.url()}`));
    page.on('response', response => {
      if (response.url().includes('annotations')) {
        console.log(`<< RESPONSE: ${response.status()} ${response.url()}`);
      }
    });

    // 1. Mock Authentication
    await page.route('**/api/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { id: 1, username: 'tester', full_name: 'Tester User', role: 'admin' }
        }),
      });
    });

    await page.addInitScript(() => {
      window.localStorage.setItem('auth-storage', JSON.stringify({
        state: {
          accessToken: 'fake-token',
          user: { id: 1, username: 'tester', role: 'admin' },
          isAuthenticated: true,
        }
      }));
    });

    // 2. Mock Tree View API
    await page.route(/\/api\/annotations\/sections\/.*\/tree/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            root: { id: 1, document_id: mockDocumentId, heading: 'Root Section', content: 'Root Content', level: 1, position: 1, tags: [] },
            descendants: [
              { id: 2, document_id: mockDocumentId, parent_id: 1, heading: 'Child Section 1', content: 'Content of child 1', level: 2, position: 1, tags: ['initial'] }
            ]
          }
        }),
      });
    });

    // 3. Mock Tag Management API
    await page.route(/\/api\/annotations\/sections\/.*\/tags/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { message: 'Success' } }),
      });
    });
    
    // 4. Mock Documents API (List and Shatter)
    await page.route(/\/api\/annotations\/documents/, async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      
      // Request đến từng tài liệu cụ thể (ví dụ /documents/1)
      if (url.match(/\/documents\/\d+$/)) {
        if (method === 'PATCH' || method === 'DELETE') {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ data: { message: 'Success' } }),
          });
        }
      }

      // Request đến danh sách hoặc tạo mới
      if (method === 'GET') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              { id: 101, title: 'Document 101' },
              { id: 102, title: 'Document 102' }
            ],
            meta: { page: 1, per_page: 100, total: 2, total_pages: 1 }
          }),
        });
      } else if (method === 'POST') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { 
              document_id: mockDocumentId,
              root_section_id: mockDocumentId
            }
          }),
        });
      }

      return route.continue();
    });
  });

  test('should complete a full annotation journey from shatter to tagging', async ({ page }) => {
    await page.goto('/annotations/new');
    await expect(page.getByText('Shatter Document')).toBeVisible();

    await page.fill('[data-testid="shatter-title-input"]', 'E2E Test Report');
    await page.fill('[data-testid="shatter-content-input"]', 'This is a long content for E2E testing purposes.');
    await page.click('[data-testid="shatter-submit-button"]');

    // Đợi redirect
    await expect(page).toHaveURL(new RegExp(`/annotations/sections/${mockDocumentId}/tree`), { timeout: 15000 });
    
    // Đợi nội dung hiển thị
    await expect(page.getByText('Root Section').first()).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Child Section 1')).toBeVisible();

    await page.click('text=Child Section 1');
    await expect(page.getByText('Content of child 1')).toBeVisible();

    const tagInput = page.getByTestId('tag-input');
    await expect(tagInput).toBeVisible();
    await tagInput.fill('e2e-win');
    await page.click('[data-testid="add-tag-button"]');
    await expect(page.getByText('Đã thêm tag: e2e-win')).toBeVisible();
  });

  test('should allow managing documents (list, rename, delete)', async ({ page }) => {
    // Navigate to management page
    await page.goto('/annotations');
    await expect(page.getByText('Your Documents')).toBeVisible();

    // Verify list rendering
    await expect(page.getByText('Document 101')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Document 102')).toBeVisible();

    // Rename process
    await page.click('[data-testid="annotation-document-rename-btn-101"]');
    const input = page.getByTestId('annotation-document-rename-input-101');
    await expect(input).toBeVisible();
    await input.fill('Renamed Document');
    await page.click('[data-testid="annotation-document-save-btn-101"]');
    await expect(page.getByText('Document renamed')).toBeVisible();

    // Delete process
    page.on('dialog', dialog => dialog.accept());
    await page.click('[data-testid="annotation-document-delete-btn-102"]');
    await expect(page.getByText('Document deleted')).toBeVisible();
  });
});
