import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { WalletForm as CreateWalletForm } from '@/features/finance/ui/WalletForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CreateWalletForm', () => {
  it('should render all fields', () => {
    render(<CreateWalletForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('finance-wallet-name-input')).toBeInTheDocument();
    expect(screen.getByTestId('finance-wallet-type-select')).toBeInTheDocument();
    expect(screen.getByTestId('finance-wallet-balance-input')).toBeInTheDocument();
    expect(screen.getByTestId('finance-wallet-submit-btn')).toBeInTheDocument();
  });

  it('should show validation error for empty name', async () => {
    render(<CreateWalletForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });
    
    await userEvent.click(screen.getByTestId('finance-wallet-submit-btn'));
    
    expect(await screen.findByText(/Tên ví là bắt buộc/i)).toBeInTheDocument();
  });
});
