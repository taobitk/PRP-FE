import { render, screen } from '@testing-library/react';
import { OutlineTree } from './OutlineTree';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useOutline } from '../lib/useOutline';

// Mock the hook
vi.mock('../lib/useOutline', () => ({
  useOutline: vi.fn(),
}));

describe('OutlineTree', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render loading state', () => {
    vi.mocked(useOutline).mockReturnValue({
      sections: [],
      isLoading: true,
      moveSection: vi.fn(),
      saveOrder: vi.fn(),
      addSection: vi.fn(),
      deleteSection: vi.fn(),
    });

    render(<OutlineTree documentId={1} />);
    expect(screen.getByTestId('outline-tree-loading')).toBeDefined();
  });

  it('should render list of sections', () => {
    const mockSections = [
      { id: 1, parent_id: null, position: 1, heading: 'Section 1', content: '', level: 1, document_id: 1, tags: [] },
      { id: 2, parent_id: null, position: 2, heading: 'Section 2', content: '', level: 1, document_id: 1, tags: [] },
    ];

    vi.mocked(useOutline).mockReturnValue({
      sections: mockSections,
      isLoading: false,
      moveSection: vi.fn(),
      saveOrder: vi.fn(),
      addSection: vi.fn(),
      deleteSection: vi.fn(),
    });

    render(<OutlineTree documentId={1} />);
    expect(screen.getByText('Section 1')).toBeDefined();
    expect(screen.getByText('Section 2')).toBeDefined();
  });
});
