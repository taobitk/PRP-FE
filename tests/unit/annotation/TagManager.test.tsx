import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TagManager } from '@/features/annotation/ui/TagManager';
import { useManageTags } from '@/features/annotation/api/annotationApi';
import { toast } from 'sonner';

// Mock dependencies
vi.mock('@/features/annotation/api/annotationApi', () => ({
  useManageTags: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('TagManager Component', () => {
  const mockMutate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    (useManageTags as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders initial tags correctly', () => {
    render(<TagManager sectionId={1} initialTags={['urgent', 'finance']} />);
    
    expect(screen.getByText('urgent')).toBeInTheDocument();
    expect(screen.getByText('finance')).toBeInTheDocument();
  });

  it('calls manageTags when adding a new tag', async () => {
    render(<TagManager sectionId={1} initialTags={['urgent']} />);
    
    const input = screen.getByTestId('tag-input');
    const addButton = screen.getByTestId('add-tag-button');

    fireEvent.change(input, { target: { value: 'legal' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        { action: 'add', tags: ['legal'] },
        expect.any(Object)
      );
    });
  });

  it('prevents adding duplicate tags', () => {
    render(<TagManager sectionId={1} initialTags={['urgent']} />);
    
    const input = screen.getByTestId('tag-input');
    const addButton = screen.getByTestId('add-tag-button');

    fireEvent.change(input, { target: { value: 'urgent' } });
    fireEvent.click(addButton);

    expect(toast.error).toHaveBeenCalledWith('Tag này đã tồn tại!');
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls manageTags when removing a tag', () => {
    render(<TagManager sectionId={1} initialTags={['urgent']} />);
    
    const removeButton = screen.getByTestId('remove-tag-button');
    fireEvent.click(removeButton);

    expect(mockMutate).toHaveBeenCalledWith(
      { action: 'remove', tags: ['urgent'] },
      expect.any(Object)
    );
  });

  it('disables inputs when pending', () => {
    (useManageTags as any).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<TagManager sectionId={1} initialTags={['urgent']} />);
    
    expect(screen.getByTestId('tag-input')).toBeDisabled();
    expect(screen.getByTestId('add-tag-button')).toBeDisabled();
    expect(screen.getByTestId('remove-tag-button')).toBeDisabled();
  });
});
