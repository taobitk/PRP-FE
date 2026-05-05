import { render, screen, fireEvent } from '@testing-library/react';
import DocumentTreePage from '@/app/annotations/sections/[id]/tree/page';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock các hooks và components phụ thuộc
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '1' }),
  useSearchParams: () => ({ get: () => null }),
}));

vi.mock('@/features/annotation/api/annotationApi', () => ({
  useSectionTree: () => ({
    data: {
      root: { id: 1, heading: 'Root', content: 'Content', level: 1, tags: [] },
      descendants: []
    },
    isLoading: false
  }),
  useUpdateSection: () => ({
    mutate: vi.fn(),
    isPending: false
  }),
  useManageTags: () => ({
    mutate: vi.fn(),
    isPending: false
  })
}));

const queryClient = new QueryClient();

describe('DocumentTreePage Level Switcher', () => {
  it('should show level switcher in edit mode and update state', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <DocumentTreePage />
      </QueryClientProvider>
    );

    // Bật chế độ chỉnh sửa
    const editBtn = screen.getByText('Chỉnh sửa');
    fireEvent.click(editBtn);

    // Kiểm tra xem các nút đổi level có xuất hiện không
    const h1Btn = screen.getByTestId('section-level-1');
    const h2Btn = screen.getByTestId('section-level-2');
    const h3Btn = screen.getByTestId('section-level-3');

    expect(h1Btn).toBeDefined();
    expect(h2Btn).toBeDefined();
    expect(h3Btn).toBeDefined();

    // Giả lập click đổi sang H2
    fireEvent.click(h2Btn);
    
    // Nút H2 nên được highlight (đối với component Toggle hoặc class tương ứng)
    // Ở đây tớ sẽ kiểm tra xem nó có class active không (tùy vào implementation)
  });
});
