import { test, expect } from '@playwright/test';

test.describe('Outline Editor (Annotation Module)', () => {
  let mockSections = [
    { id: 1, document_id: 1, parent_id: null, heading: 'Giới thiệu', content: 'Nội dung 1', level: 1, position: 1, tags: [] },
    { id: 2, document_id: 1, parent_id: null, heading: 'Cài đặt', content: 'Nội dung 2', level: 1, position: 2, tags: [] },
    { id: 3, document_id: 1, parent_id: 1, heading: 'Tổng quan', content: 'Nội dung 1.1', level: 2, position: 1, tags: [] },
  ];

  test.beforeEach(async ({ page }) => {
    // Reset mock data for each test
    mockSections = [
      { id: 1, document_id: 1, parent_id: null, heading: 'Giới thiệu', content: 'Nội dung 1', level: 1, position: 1, tags: [] },
      { id: 2, document_id: 1, parent_id: null, heading: 'Cài đặt', content: 'Nội dung 2', level: 1, position: 2, tags: [] },
      { id: 3, document_id: 1, parent_id: 1, heading: 'Tổng quan', content: 'Nội dung 1.1', level: 2, position: 1, tags: [] },
    ];

    // Mock API lấy danh sách sections (Dynamic response)
    await page.route('**/api/annotations/documents/1/sections', async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify(mockSections) 
      });
    });

    // Mock API lấy chi tiết section
    await page.route('**/api/annotations/sections/1/tree', async (route) => {
      await route.fulfill({ 
        status: 200, 
        contentType: 'application/json', 
        body: JSON.stringify({ 
          data: { 
            root: mockSections[0], 
            descendants: [mockSections[2]] 
          } 
        }) 
      });
    });

    // Mock API lưu thứ tự
    await page.route('**/api/annotations/documents/1/sections/reorder', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { message: 'Success' } }) });
    });

    // Mock API tạo mới (Cập nhật mockSections khi gọi)
    await page.route('**/api/annotations/sections', async (route) => {
      if (route.request().method() === 'POST') {
        const newSection = { 
          id: 99, 
          document_id: 1, 
          parent_id: null, 
          heading: 'New Section', 
          content: '', 
          level: 1, 
          position: 4, 
          tags: [] 
        };
        mockSections.push(newSection); // Cập nhật state nội bộ của mock
        await route.fulfill({ 
          status: 201, 
          contentType: 'application/json', 
          body: JSON.stringify({ data: newSection }) 
        });
      } else {
        await route.continue();
      }
    });

    // Mock API xóa (Cập nhật mockSections khi gọi)
    await page.route('**/api/annotations/sections/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        const url = route.request().url();
        const id = Number(url.split('/').pop());
        mockSections = mockSections.filter(s => s.id !== id); // Xóa khỏi mock state
        await route.fulfill({ 
          status: 200, 
          contentType: 'application/json', 
          body: JSON.stringify({ data: { message: 'Deleted' } }) 
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/annotations/sections/1/tree');
  });

  test('Scenario: Should render the outline correctly', async ({ page }) => {
    await test.step('Then the outline container should be visible', async () => {
      await expect(page.getByTestId('outline-tree-container')).toBeVisible();
    });

    await test.step('And all 3 sections should be listed', async () => {
      await expect(page.getByTestId('outline-item-1')).toBeVisible();
      await expect(page.getByTestId('outline-item-2')).toBeVisible();
      await expect(page.getByTestId('outline-item-3')).toBeVisible();
    });
  });

  test('Scenario: Adding a new section', async ({ page }) => {
    await test.step('When I click on "Thêm phần mới"', async () => {
      await page.getByText('Thêm phần mới ở ngoài cùng').click();
    });

    await test.step('Then a new section item should appear', async () => {
      // Playwright sẽ tự động wait cho đến khi item xuất hiện
      await expect(page.getByTestId('outline-item-99')).toBeVisible();
      await expect(page.getByText('New Section')).toBeVisible();
    });
  });

  test('Scenario: Deleting a section', async ({ page }) => {
    await test.step('When I click the delete button for Section 2', async () => {
      const item2 = page.getByTestId('outline-item-2');
      await item2.hover();
      await page.getByTestId('outline-delete-btn-2').click();
    });

    await test.step('Then Section 2 should disappear from the list', async () => {
      await expect(page.getByTestId('outline-item-2')).not.toBeVisible();
    });
  });

  test('Scenario: Saving the structure', async ({ page }) => {
    await test.step('When I click the "Lưu cấu trúc" button', async () => {
      await page.getByTestId('outline-save-btn').click();
    });

    await test.step('Then the button should remain enabled', async () => {
      await expect(page.getByTestId('outline-save-btn')).toBeEnabled();
    });
  });
});
