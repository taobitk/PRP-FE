import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DocumentList } from '@/features/annotation/ui/DocumentList';
import { useListDocuments, useUpdateDocument, useDeleteDocument } from '@/features/annotation/api/annotationApi';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/features/annotation/api/annotationApi', () => ({
  useListDocuments: vi.fn(),
  useUpdateDocument: vi.fn(),
  useDeleteDocument: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('DocumentList Component', () => {
  const mockPush = vi.fn();
  const mockUpdateMutate = vi.fn();
  const mockDeleteMutate = vi.fn();
  
  const mockDocuments = [
    { id: 1, title: 'Document 1' },
    { id: 2, title: 'Document 2' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    (useListDocuments as any).mockReturnValue({
      data: { data: mockDocuments },
      isLoading: false,
    });

    (useUpdateDocument as any).mockReturnValue({
      mutate: mockUpdateMutate,
      isPending: false,
    });

    (useDeleteDocument as any).mockReturnValue({
      mutate: mockDeleteMutate,
      isPending: false,
    });
  });

  it('renders the document list correctly', () => {
    render(<DocumentList />);
    
    expect(screen.getByTestId('annotation-document-list')).toBeInTheDocument();
    expect(screen.getByText('Document 1')).toBeInTheDocument();
    expect(screen.getByText('Document 2')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    (useListDocuments as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<DocumentList />);
    expect(screen.getByTestId('annotation-document-loading')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    (useListDocuments as any).mockReturnValue({
      data: { data: [] },
      isLoading: false,
    });

    render(<DocumentList />);
    expect(screen.getByTestId('annotation-document-empty')).toBeInTheDocument();
  });

  it('navigates to document tree when title is clicked', () => {
    render(<DocumentList />);
    const link = screen.getByTestId('annotation-document-title-1');
    expect(link).toHaveAttribute('href', '/annotations/sections/1/tree');
  });

  it('calls delete mutation when delete button is clicked', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
    
    render(<DocumentList />);
    const deleteBtn = screen.getByTestId('annotation-document-delete-btn-1');
    fireEvent.click(deleteBtn);
    
    expect(confirmSpy).toHaveBeenCalled();
    expect(mockDeleteMutate).toHaveBeenCalledWith(1, expect.any(Object));
    
    confirmSpy.mockRestore();
  });

  it('allows renaming a document', async () => {
    render(<DocumentList />);
    
    // Click rename button
    const renameBtn = screen.getByTestId('annotation-document-rename-btn-1');
    fireEvent.click(renameBtn);
    
    // Should show input
    const input = screen.getByTestId('annotation-document-rename-input-1');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('Document 1');
    
    // Change value and submit
    fireEvent.change(input, { target: { value: 'New Name' } });
    const saveBtn = screen.getByTestId('annotation-document-save-btn-1');
    fireEvent.click(saveBtn);
    
    expect(mockUpdateMutate).toHaveBeenCalledWith(
      { title: 'New Name' },
      expect.any(Object)
    );
  });
});
