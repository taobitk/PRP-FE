import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShatterForm } from '@/features/annotation/ui/ShatterForm';
import { useShatter } from '@/features/annotation/api/annotationApi';
import { useAuthStore } from '@/features/auth/model/authStore';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/features/annotation/api/annotationApi', () => ({
  useShatter: vi.fn(),
}));

vi.mock('@/features/auth/model/authStore', () => ({
  useAuthStore: vi.fn(),
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

describe('ShatterForm Component', () => {
  const mockPush = vi.fn();
  const mockMutate = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });

    (useAuthStore as any).mockImplementation((selector: any) => 
      selector({ user: { id: 1, email: 'test@example.com' } })
    );

    (useShatter as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    });
  });

  it('renders the shatter form correctly', () => {
    render(<ShatterForm />);
    
    expect(screen.getByTestId('shatter-title-input')).toBeInTheDocument();
    expect(screen.getByTestId('shatter-content-input')).toBeInTheDocument();
    expect(screen.getByTestId('shatter-submit-button')).toBeInTheDocument();
    expect(screen.getByText(/Shatter Document/i)).toBeInTheDocument();
  });

  it('shows validation error when fields are empty', async () => {
    render(<ShatterForm />);
    
    const submitButton = screen.getByTestId('shatter-submit-button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Tiêu đề không được để trống/i)).toBeInTheDocument();
      expect(screen.getByText(/Nội dung không được để trống/i)).toBeInTheDocument();
    });
    
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('calls shatter mutation with correct data when submitted', async () => {
    render(<ShatterForm />);
    
    const titleInput = screen.getByTestId('shatter-title-input');
    const contentInput = screen.getByTestId('shatter-content-input');
    const submitButton = screen.getByTestId('shatter-submit-button');

    const testTitle = 'Sample Report';
    const testContent = 'This is the raw content that should be processed.';
    
    fireEvent.change(titleInput, { target: { value: testTitle } });
    fireEvent.change(contentInput, { target: { value: testContent } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          owner_id: 1,
          title: testTitle,
          raw_content: testContent,
        }),
        expect.any(Object)
      );
    });
  });

  it('disables button and shows loading state when pending', () => {
    (useShatter as any).mockReturnValue({
      mutate: mockMutate,
      isPending: true,
    });

    render(<ShatterForm />);
    
    const submitButton = screen.getByTestId('shatter-submit-button');
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/Processing.../i)).toBeInTheDocument();
  });
});
