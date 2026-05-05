import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransactionForm as CreateTransactionForm } from '@/features/finance/ui/TransactionForm';
import { useWallets, useCategories, useCreateTransaction, useUpdateTransaction } from '@/features/finance/api/financeApi';
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

describe('CreateTransactionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useWallets as any).mockReturnValue({ data: [{ id: 1, name: 'Ví VCB' }] });
    (useCategories as any).mockReturnValue({ data: [{ id: 1, name: 'Ăn uống', type: 'expense' }] });
    (useCreateTransaction as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
    (useUpdateTransaction as any).mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('should render basic fields', () => {
    render(<CreateTransactionForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('finance-tx-amount')).toBeInTheDocument();
    expect(screen.getByTestId('finance-tx-category')).toBeInTheDocument();
    expect(screen.getByTestId('finance-tx-wallet')).toBeInTheDocument();
  });

  it('should allow adding an attribution row', async () => {
    render(<CreateTransactionForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });
    
    const addBtn = screen.getByTestId('finance-tx-add-attribution');
    await userEvent.click(addBtn);
    
    const attributionRows = screen.getAllByTestId(/finance-tx-attr-row/);
    expect(attributionRows.length).toBe(2); // Default 1 + Added 1
  });

  it('should show validation error if total attributions sum mismatch', async () => {
    render(<CreateTransactionForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });
    
    await userEvent.type(screen.getByTestId('finance-tx-amount'), '1000');
    // Default attribution row will have '0' amount if not filled
    
    await userEvent.click(screen.getByTestId('finance-tx-submit'));
    
    expect(await screen.findByText(/Tổng phân bổ/i)).toBeInTheDocument();
  });
});
