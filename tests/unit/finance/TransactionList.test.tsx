import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionList } from '@/features/finance/ui/TransactionList';
import { useTransactions, useCategories, useWallets } from '@/features/finance/api/financeApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/finance/api/financeApi', () => ({
  useTransactions: vi.fn(),
  useCategories: vi.fn(),
  useWallets: vi.fn(),
  useDeleteTransaction: vi.fn(() => ({ mutate: vi.fn() })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TransactionList', () => {
  it('should render loading state', () => {
    (useTransactions as any).mockReturnValue({ isLoading: true });
    (useCategories as any).mockReturnValue({ data: [] });
    (useWallets as any).mockReturnValue({ data: [] });
    render(<TransactionList />, { wrapper: createWrapper() });
    expect(screen.getByTestId('transaction-list-loading')).toBeInTheDocument();
  });

  it('should render list of transactions', () => {
    const mockTransactions = [
      { 
        id: 1, 
        transaction_date: '2026-04-29T10:00:00Z', 
        amount: '500000', 
        category_id: 1,
        destination_wallet_id: 1,
        note: 'Tiền lương',
        attributions: []
      }
    ];
    (useTransactions as any).mockReturnValue({ isLoading: false, data: mockTransactions });
    (useCategories as any).mockReturnValue({ data: [{ id: 1, name: 'Lương', type: 'income' }] });
    (useWallets as any).mockReturnValue({ data: [{ id: 1, name: 'Ví VCB' }] });

    render(<TransactionList />, { wrapper: createWrapper() });

    expect(screen.getByText(/Tiền lương/i)).toBeInTheDocument();
    expect(screen.getByTestId('transaction-amount-1')).toHaveTextContent(/500.000/);
  });
});
