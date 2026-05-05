import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AnnotationSearch } from '@/features/annotation/ui/AnnotationSearch';
import { useSearchAnnotations } from '@/features/annotation/api/annotationApi';

// Mock dependencies
vi.mock('@/features/annotation/api/annotationApi', () => ({
  useSearchAnnotations: vi.fn(),
}));

describe('AnnotationSearch Component', () => {
  const mockSections = [
    {
      id: 1,
      document_id: 10,
      heading: 'Search Result 1',
      content: 'This is a matching section content.',
      level: 2,
      tags: ['tag1', 'tag2'],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useSearchAnnotations as any).mockReturnValue({
      data: null,
      isLoading: false,
    });
  });

  it('renders search input and initial state', () => {
    render(<AnnotationSearch />);
    
    expect(screen.getByPlaceholderText(/Ví dụ: important, review.../i)).toBeInTheDocument();
    expect(screen.getByText(/Nhập các tag để bắt đầu tìm kiếm.../i)).toBeInTheDocument();
  });

  it('adds tags to the search criteria', () => {
    render(<AnnotationSearch />);
    
    const input = screen.getByPlaceholderText(/Ví dụ: important, review.../i);
    const addButton = screen.getByRole('button', { name: /Thêm Tag/i });

    fireEvent.change(input, { target: { value: 'legal' } });
    fireEvent.click(addButton);

    expect(screen.getByText('legal')).toBeInTheDocument();
    expect(screen.queryByText(/Nhập các tag để bắt đầu tìm kiếm.../i)).not.toBeInTheDocument();
  });

  it('removes tags from the search criteria', () => {
    render(<AnnotationSearch />);
    
    const input = screen.getByPlaceholderText(/Ví dụ: important, review.../i);
    const addButton = screen.getByRole('button', { name: /Thêm Tag/i });

    fireEvent.change(input, { target: { value: 'legal' } });
    fireEvent.click(addButton);
    
    const removeButton = screen.getByRole('button', { name: '' }); // The X button in Badge
    fireEvent.click(removeButton);

    expect(screen.queryByText('legal')).not.toBeInTheDocument();
    expect(screen.getByText(/Nhập các tag để bắt đầu tìm kiếm.../i)).toBeInTheDocument();
  });

  it('toggles search mode between AND and OR', () => {
    render(<AnnotationSearch />);
    
    const switch_ = screen.getByRole('switch');
    expect(screen.getByText(/OR \(Một trong các tag\)/i)).toBeInTheDocument();

    fireEvent.click(switch_);
    expect(screen.getByText(/AND \(Tất cả tag\)/i)).toBeInTheDocument();
  });

  it('renders search results when data is available', () => {
    (useSearchAnnotations as any).mockReturnValue({
      data: mockSections,
      isLoading: false,
    });

    render(<AnnotationSearch />);
    
    expect(screen.getByText('Search Result 1')).toBeInTheDocument();
    expect(screen.getByText(/"This is a matching section content."/i)).toBeInTheDocument();
    expect(screen.getByText(/Tìm thấy 1 kết quả/i)).toBeInTheDocument();
  });

  it('shows loading state when fetching results', () => {
    (useSearchAnnotations as any).mockReturnValue({
      data: null,
      isLoading: true,
    });

    render(<AnnotationSearch />);
    
    expect(screen.getByText(/Đang lục tìm trong kho lưu trữ.../i)).toBeInTheDocument();
  });

  it('shows empty state when no results found', () => {
    (useSearchAnnotations as any).mockReturnValue({
      data: [],
      isLoading: false,
    });

    render(<AnnotationSearch />);
    
    expect(screen.getByText(/Không tìm thấy đoạn nội dung nào khớp với các tag này./i)).toBeInTheDocument();
  });
});
