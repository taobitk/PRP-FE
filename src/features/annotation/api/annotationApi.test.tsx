import { renderHook, waitFor } from '@testing-library/react';
import { useMoveSection } from './annotationApi';
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

describe('useMoveSection Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should call move section API with correct parameters', async () => {
    const mockRes = { data: { message: 'Section moved successfully' } };
    vi.mocked(apiClient).mockResolvedValueOnce(mockRes);

    const { result } = renderHook(() => useMoveSection(), { wrapper });

    result.current.mutate({
      sectionId: 1,
      target_document_id: 2,
      parent_id: null,
      position: 1,
      level: 1,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(apiClient).toHaveBeenCalledWith('/annotations/sections/1/move', {
      method: 'PATCH',
      body: JSON.stringify({
        target_document_id: 2,
        parent_id: null,
        position: 1,
        level: 1,
      }),
    });
  });
});
