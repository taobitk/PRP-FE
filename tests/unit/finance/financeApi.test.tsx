import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  useWallets, 
  useCreateWallet, 
  useUpdateWallet, 
  useDeleteWallet, 
  useCategories, 
  useCreateTransaction 
} from '@/features/finance/api/financeApi';
import { apiClient } from '@/shared/lib/apiClient';

vi.mock('@/shared/lib/apiClient');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('financeApi - Wallets', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useWallets should fetch all wallets', async () => {
    const mockWallets = [
      { id: 1, user_id: 1, name: 'Ví Tiền Mặt', type: 'cash', balance: '5000000' },
      { id: 2, user_id: 1, name: 'Ví Ngân Hàng', type: 'bank', balance: '10000000' },
    ];
    (apiClient as any).mockResolvedValueOnce({ data: mockWallets });

    const { result } = renderHook(() => useWallets(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockWallets);
    expect(apiClient).toHaveBeenCalledWith('/finance/wallets');
  });

  it('useCreateWallet should call POST /finance/wallets', async () => {
    const mockPayload = { name: 'Ví Mới', type: 'cash' as const, initial_balance: '1000000' };
    const mockResponse = { id: 3, user_id: 1, ...mockPayload, balance: '1000000' };
    (apiClient as any).mockResolvedValueOnce({ data: mockResponse });

    const { result } = renderHook(() => useCreateWallet(), { wrapper: createWrapper() });

    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/finance/wallets', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(mockPayload),
    }));
  });

  it('useUpdateWallet should call PUT /finance/wallets/:id', async () => {
    const { result } = renderHook(() => useUpdateWallet(), { wrapper: createWrapper() });
    result.current.mutate({ id: 1, data: { name: 'Ví Updated' } });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/finance/wallets/1', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify({ name: 'Ví Updated' }),
    }));
  });

  it('useDeleteWallet should call DELETE /finance/wallets/:id', async () => {
    const { result } = renderHook(() => useDeleteWallet(), { wrapper: createWrapper() });
    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/finance/wallets/1', expect.objectContaining({
      method: 'DELETE',
    }));
  });
});

describe('financeApi - Categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useCategories should fetch all categories', async () => {
    const mockCategories = [{ id: 1, user_id: 1, name: 'Lương', type: 'income' }];
    (apiClient as any).mockResolvedValueOnce({ data: mockCategories });

    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockCategories);
  });
});

describe('financeApi - Transactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useCreateTransaction should call POST /finance/transactions', async () => {
    const mockPayload = {
      destination_wallet_id: 1,
      category_id: 2,
      amount: '500000',
      note: 'Test',
      attributions: [{ source_wallet_id: 1, amount: '500000' }]
    };
    (apiClient as any).mockResolvedValueOnce({ data: { id: 99, ...mockPayload } });

    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });
    result.current.mutate(mockPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/finance/transactions', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(mockPayload),
    }));
  });
});
