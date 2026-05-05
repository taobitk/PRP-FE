import { renderHook, waitFor } from '@testing-library/react';
import { useSearchAnnotations } from './annotationApi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';

// Mock apiClient
vi.mock('@/shared/lib/apiClient', () => ({
  apiClient: vi.fn(),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useSearchAnnotations Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should fetch sections by tags and return data array', async () => {
    // Mock response matching the new contract with meta
    const mockRes = {
      data: [
        {
          id: 1,
          document_id: 1,
          parent_id: null,
          heading: 'Test Heading',
          content: 'Test Content',
          level: 1,
          position: 1,
          tags: ['tag1']
        }
      ],
      meta: {
        page: 1,
        per_page: 10,
        total: 1,
        total_pages: 1
      }
    };
    
    vi.mocked(apiClient).mockResolvedValueOnce(mockRes);

    const { result } = renderHook(() => useSearchAnnotations(['tag1']), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify it returns the data array as expected by the current UI
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0].heading).toBe('Test Heading');
    
    // Verify API call construction
    expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('/annotations/search?tags=tag1'));
  });

  it('should be disabled when no tags are provided', () => {
    const { result } = renderHook(() => useSearchAnnotations([]), { wrapper });
    expect(result.current.isFetched).toBe(false);
  });
});
