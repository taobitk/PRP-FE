import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoryList } from '@/features/finance/ui/CategoryList';
import { useCategories } from '@/features/finance/api/financeApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/finance/api/financeApi', () => ({
  useCategories: vi.fn(),
  useDeleteCategory: vi.fn(() => ({ mutate: vi.fn() })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CategoryList', () => {
  it('should render loading state', () => {
    (useCategories as any).mockReturnValue({ isLoading: true });
    render(<CategoryList />, { wrapper: createWrapper() });
    expect(screen.getByTestId('category-list-loading')).toBeInTheDocument();
  });

  it('should render income categories when filtered', () => {
    const mockCategories = [
      { id: 1, name: 'Lương', type: 'income' },
      { id: 2, name: 'Ăn uống', type: 'expense' },
    ];
    (useCategories as any).mockReturnValue({ isLoading: false, data: mockCategories });

    render(<CategoryList filterType="income" />, { wrapper: createWrapper() });

    expect(screen.getByText('Lương')).toBeInTheDocument();
    expect(screen.queryByText('Ăn uống')).not.toBeInTheDocument();
  });
});
