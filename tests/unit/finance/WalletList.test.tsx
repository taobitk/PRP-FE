import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WalletList } from '@/features/finance/ui/WalletList';
import { useWallets } from '@/features/finance/api/financeApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/finance/api/financeApi', () => ({
  useWallets: vi.fn(),
  useDeleteWallet: vi.fn(() => ({ mutate: vi.fn() })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('WalletList Component', () => {
  it('should render loading state', () => {
    (useWallets as any).mockReturnValue({ isLoading: true });
    render(<WalletList />, { wrapper: createWrapper() });
    expect(screen.getByTestId('wallet-list-loading')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    (useWallets as any).mockReturnValue({ isLoading: false, data: [] });
    render(<WalletList />, { wrapper: createWrapper() });
    expect(screen.getByText(/Chưa có ví nào/i)).toBeInTheDocument();
  });

  it('should render list of wallets', () => {
    const mockWallets = [
      { id: 1, name: 'Ví Tiền Mặt', type: 'cash', balance: '500000' },
      { id: 2, name: 'Thẻ Credit', type: 'credit', balance: '-1000000' },
    ];
    (useWallets as any).mockReturnValue({ isLoading: false, data: mockWallets });

    render(<WalletList />, { wrapper: createWrapper() });

    expect(screen.getByText('Ví Tiền Mặt')).toBeInTheDocument();
    expect(screen.getByText('Thẻ Credit')).toBeInTheDocument();
    expect(screen.getByTestId('wallet-balance-1')).toHaveTextContent(/500.000/);
    expect(screen.getByTestId('wallet-balance-2')).toHaveTextContent(/-1.000.000/);
  });
});
