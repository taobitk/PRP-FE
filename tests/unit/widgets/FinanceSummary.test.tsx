import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FinanceSummary } from '@/widgets/finance-summary/ui/FinanceSummary';
import { useFinanceDashboard } from '@/features/finance/api/financeApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/finance/api/financeApi');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('FinanceSummary Widget', () => {
  it('should render loading state', () => {
    (useFinanceDashboard as any).mockReturnValue({ isLoading: true });
    render(<FinanceSummary />, { wrapper: createWrapper() });
    expect(screen.getByTestId('finance-summary-loading')).toBeInTheDocument();
  });

  it('should render finance data correctly', () => {
    (useFinanceDashboard as any).mockReturnValue({
      isLoading: false,
      isSuccess: true,
      data: {
        net_worth: '15000000',
        monthly_income: '20000000',
        monthly_expense: '5000000',
        monthly_net_cash_flow: '15000000',
      },
    });

    render(<FinanceSummary />, { wrapper: createWrapper() });

    expect(screen.getByTestId('finance-card-net-worth')).toHaveTextContent(/15.000.000/);
    expect(screen.getByTestId('finance-card-income')).toHaveTextContent(/20.000.000/);
    expect(screen.getByTestId('finance-card-expense')).toHaveTextContent(/5.000.000/);
    expect(screen.getByTestId('finance-card-net-cash-flow')).toHaveTextContent(/15.000.000/);
  });
});
