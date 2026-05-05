import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '@/features/auth/model/authStore';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { logout } = useAuthStore.getState();
    logout();
  });

  it('should have initial state', () => {
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set credentials', () => {
    const mockUser = { id: 1, username: 'admin', role: 'admin' as const };
    const mockToken = 'mock-token';

    useAuthStore.getState().setCredentials(mockToken, mockUser);

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe(mockToken);
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
  });

  it('should clear credentials on logout', () => {
    const mockUser = { id: 1, username: 'admin', role: 'admin' as const };
    const mockToken = 'mock-token';

    useAuthStore.getState().setCredentials(mockToken, mockUser);
    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
