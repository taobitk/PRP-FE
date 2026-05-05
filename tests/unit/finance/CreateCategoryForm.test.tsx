import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CategoryForm as CreateCategoryForm } from '@/features/finance/ui/CategoryForm';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('CreateCategoryForm', () => {
  it('should render fields', () => {
    render(<CreateCategoryForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });
    expect(screen.getByTestId('finance-cat-name')).toBeInTheDocument();
    expect(screen.getByTestId('finance-cat-type')).toBeInTheDocument();
  });

  it('should validate empty name', async () => {
    render(<CreateCategoryForm onSuccess={vi.fn()} />, { wrapper: createWrapper() });
    await userEvent.click(screen.getByTestId('finance-cat-submit'));
    expect(await screen.findByText(/Tên danh mục là bắt buộc/i)).toBeInTheDocument();
  });
});
