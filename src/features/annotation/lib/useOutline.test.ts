import { renderHook, act } from '@testing-library/react';
import { useOutline } from './useOutline';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as api from '../api/annotationApi';

// Mocking the API hooks
vi.mock('../api/annotationApi', () => ({
  useListDocumentSections: vi.fn(),
  useReorderSections: vi.fn(),
  useCreateSection: vi.fn(),
  useDeleteSection: vi.fn(),
}));

describe('useOutline', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default returns
    vi.mocked(api.useListDocumentSections).mockReturnValue({ data: [], isLoading: false } as any);
    vi.mocked(api.useReorderSections).mockReturnValue({ mutate: vi.fn() } as any);
    vi.mocked(api.useCreateSection).mockReturnValue({ mutate: vi.fn() } as any);
    vi.mocked(api.useDeleteSection).mockReturnValue({ mutate: vi.fn() } as any);
  });

  it('should be defined', () => {
    const { result } = renderHook(() => useOutline(1));
    expect(result.current).toBeDefined();
    expect(result.current.sections).toEqual([]);
  });

  it('should move a section locally', () => {
    const mockSections = [
      { id: 1, parent_id: null, position: 1, heading: 'H1', content: '', level: 1, document_id: 1, tags: [] },
      { id: 2, parent_id: null, position: 2, heading: 'H2', content: '', level: 1, document_id: 1, tags: [] },
    ];
    
    vi.mocked(api.useListDocumentSections).mockReturnValue({
      data: mockSections,
      isLoading: false,
    } as any);

    const { result } = renderHook(() => useOutline(1));
    
    act(() => {
      // Giả sử kéo 2 lên trên 1
      result.current.moveSection(2, 1);
    });

    expect(result.current.sections[0].id).toBe(2);
    expect(result.current.sections[1].id).toBe(1);
    expect(result.current.sections[0].position).toBe(1);
    expect(result.current.sections[1].position).toBe(2);
  });

  it('should call reorder mutation when saveOrder is called', () => {
    const mockSections = [
      { id: 1, parent_id: null, position: 1, heading: 'H1', content: '', level: 1, document_id: 1, tags: [] },
      { id: 2, parent_id: null, position: 2, heading: 'H2', content: '', level: 1, document_id: 1, tags: [] },
    ];
    
    const mutateSpy = vi.fn();
    vi.mocked(api.useListDocumentSections).mockReturnValue({ data: mockSections, isLoading: false } as any);
    vi.mocked(api.useReorderSections).mockReturnValue({ mutate: mutateSpy } as any);

    const { result } = renderHook(() => useOutline(1));
    
    act(() => {
      result.current.moveSection(2, 1);
    });

    act(() => {
      result.current.saveOrder();
    });

    expect(mutateSpy).toHaveBeenCalledWith({
      updates: [
        { id: 2, parent_id: null, position: 1, level: 1 },
        { id: 1, parent_id: null, position: 2, level: 1 },
      ],
    });
  });

  it('should call create mutation when addSection is called', () => {
    const mutateSpy = vi.fn();
    vi.mocked(api.useCreateSection).mockReturnValue({ mutate: mutateSpy } as any);

    const { result } = renderHook(() => useOutline(1));
    
    act(() => {
      result.current.addSection(null); // Thêm thẻ root
    });

    expect(mutateSpy).toHaveBeenCalledWith(expect.objectContaining({
      document_id: 1,
      parent_id: null,
      heading: 'New Section',
    }));
  });

  it('should call delete mutation when deleteSection is called', () => {
    const mutateSpy = vi.fn();
    vi.mocked(api.useDeleteSection).mockReturnValue({ mutate: mutateSpy } as any);

    const { result } = renderHook(() => useOutline(1));
    
    act(() => {
      result.current.deleteSection(101);
    });

    expect(mutateSpy).toHaveBeenCalledWith({
      id: 101,
      documentId: 1,
    });
  });
});
