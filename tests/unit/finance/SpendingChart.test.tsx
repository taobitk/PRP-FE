import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SpendingChart } from '@/features/finance/ui/SpendingChart';
import { useSpendingBias } from '@/features/finance/api/financeApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

vi.mock('@/features/finance/api/financeApi');

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('SpendingChart', () => {
  it('should render loading state', () => {
    (useSpendingBias as any).mockReturnValue({ isLoading: true });
    render(<SpendingChart />, { wrapper: createWrapper() });
    expect(screen.getByTestId('spending-chart-loading')).toBeInTheDocument();
  });
});
