import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BudgetList } from '@/features/finance/ui/BudgetList';
import { useBudgetStatus } from '@/features/finance/api/financeApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/finance/api/financeApi');

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('BudgetList', () => {
  it('should render loading state', () => {
    (useBudgetStatus as any).mockReturnValue({ isLoading: true });
    render(<BudgetList month={4} year={2026} />, { wrapper: createWrapper() });
    expect(screen.getByTestId('budget-list-loading')).toBeInTheDocument();
  });

  it('should render budget items with progress bars', () => {
    const mockBudgets = [
      { category_id: 1, category_name: 'Ăn uống', limit_amount: '1000000', spent_amount: '400000', remaining: '600000', is_over_budget: false }
    ];
    (useBudgetStatus as any).mockReturnValue({ isLoading: false, data: mockBudgets });

    render(<BudgetList month={4} year={2026} />, { wrapper: createWrapper() });

    expect(screen.getByText('Ăn uống')).toBeInTheDocument();
    expect(screen.getByText(/40%/)).toBeInTheDocument();
    expect(screen.getByTestId('budget-progress-1')).toBeInTheDocument();
  });
});
