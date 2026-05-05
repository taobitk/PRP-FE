import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRegister, useResetPassword } from '@/features/admin/api/adminApi';
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

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useRegister should call register endpoint', async () => {
    const mockResponse = { id: 10, username: 'staff_01', full_name: 'Nguyen Van A' };
    (apiClient as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useRegister(), { wrapper: createWrapper() });

    const payload = {
      username: 'staff_01',
      fullname: 'Nguyen Van A',
      role: 'member' as const,
      email: 'a@example.com',
    };

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/register', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify(payload),
    }));
  });

  it('useResetPassword should call reset-password endpoint', async () => {
    const mockResponse = { message: 'success' };
    (apiClient as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useResetPassword(), { wrapper: createWrapper() });

    result.current.mutate({ user_id: 10 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/reset-password', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ user_id: 10 }),
    }));
  });
});
