import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TransactionFilters } from '@/features/finance/ui/TransactionFilters';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('TransactionFilters', () => {
  it('should render date and wallet filters', () => {
    render(<TransactionFilters onFilterChange={vi.fn()} />, { wrapper: createWrapper() });
    
    expect(screen.getByTestId('finance-filter-wallet')).toBeInTheDocument();
    expect(screen.getByTestId('finance-filter-date-start')).toBeInTheDocument();
    expect(screen.getByTestId('finance-filter-date-end')).toBeInTheDocument();
  });
});
