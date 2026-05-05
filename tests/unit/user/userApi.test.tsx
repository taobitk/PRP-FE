import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMe, useUserDetail, useUsers, useUpdateUser, useDeleteUser, useUpdateUserStatus } from '@/features/user/api/userApi';
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

describe('userApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useMe should fetch current user', async () => {
    const mockUser = { data: { id: 1, username: 'admin', role: 'admin' } };
    (apiClient as any).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useMe(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expect.objectContaining(mockUser.data));
    expect(apiClient).toHaveBeenCalledWith('/me');
  });

  it('useUserDetail should fetch user by id', async () => {
    const mockUser = { data: { id: 10, username: 'staff_01', role: 'member' } };
    (apiClient as any).mockResolvedValueOnce(mockUser);

    const { result } = renderHook(() => useUserDetail(10), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(expect.objectContaining(mockUser.data));
    expect(apiClient).toHaveBeenCalledWith('/users/10');
  });

  it('useUsers should fetch all users', async () => {
    const mockUsers = { data: [{ id: 1, username: 'admin' }] };
    (apiClient as any).mockResolvedValueOnce(mockUsers);

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockUsers.data.map(u => expect.objectContaining(u)));
    expect(apiClient).toHaveBeenCalledWith('/users');
  });

  it('useUpdateUser should call PUT /users/:id', async () => {
    (apiClient as any).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useUpdateUser(), { wrapper: createWrapper() });

    const payload = { full_name: 'New Name', role: 'member' as const, email: 'a@b.com' };
    result.current.mutate({ id: 10, data: payload });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/users/10', expect.objectContaining({
      method: 'PUT',
      body: JSON.stringify(payload),
    }));
  });

  it('useDeleteUser should call DELETE /users/:id', async () => {
    (apiClient as any).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useDeleteUser(), { wrapper: createWrapper() });

    result.current.mutate(10);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/users/10', expect.objectContaining({
      method: 'DELETE',
    }));
  });

  it('useUpdateUserStatus should call PATCH /users/:id/status', async () => {
    (apiClient as any).mockResolvedValueOnce(undefined);
    const { result } = renderHook(() => useUpdateUserStatus(), { wrapper: createWrapper() });

    result.current.mutate({ id: 10, status: 'inactive' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(apiClient).toHaveBeenCalledWith('/users/10/status', expect.objectContaining({
      method: 'PATCH',
      body: JSON.stringify({ status: 'inactive' }),
    }));
  });
});
