import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, ApiError } from '@/shared/lib/apiClient';

// Mock fetch globally
global.fetch = vi.fn();

describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should make a successful request', async () => {
    const mockData = { data: 'success' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const result = await apiClient('/test');

    expect(result).toEqual(mockData);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should throw ApiError for non-ok responses', async () => {
    const mockError = { error: 'Invalid data' };
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockError,
    });

    try {
      await apiClient('/test');
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      const apiError = error as ApiError;
      expect(apiError.status).toBe(400);
      expect(apiError.data).toEqual(mockError);
    }
  });

  it('should handle 401 Unauthorized', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ error: 'Unauthorized' }),
    });

    await expect(apiClient('/test')).rejects.toThrow('API Error: 401');
  });

  it('should handle 429 Rate Limited', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: new Headers({ 'Retry-After': '10' }),
      json: async () => ({ error: 'Too many requests' }),
    });

    try {
      await apiClient('/test');
    } catch (error) {
      const apiError = error as ApiError;
      expect(apiError.status).toBe(429);
      expect((apiError.data as any).message).toContain('Retry after 10s');
    }
  });
});
