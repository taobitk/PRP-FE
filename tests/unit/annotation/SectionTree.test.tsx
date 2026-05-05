import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SectionTree } from '@/features/annotation/ui/SectionTree';
import { Section } from '@/shared/api/contracts/annotation.contract';

describe('SectionTree Component', () => {
  const mockRoot: Section = {
    id: 1,
    document_id: 1,
    parent_id: null,
    heading: 'Root Heading',
    content: 'Root Content',
    level: 1,
    position: 1,
    tags: ['important'],
  };

  const mockDescendants: Section[] = [
    {
      id: 2,
      document_id: 1,
      parent_id: 1,
      heading: 'Child Heading 1',
      content: 'Child Content 1',
      level: 2,
      position: 1,
      tags: [],
    },
    {
      id: 3,
      document_id: 1,
      parent_id: 2,
      heading: 'Grandchild Heading',
      content: 'Grandchild Content',
      level: 3,
      position: 1,
      tags: ['test'],
    },
  ];

  const mockOnSelect = vi.fn();

  it('renders tree nodes correctly', () => {
    render(
      <SectionTree 
        root={mockRoot} 
        descendants={mockDescendants} 
        onSelectSection={mockOnSelect} 
      />
    );

    expect(screen.getByText('Root Heading')).toBeInTheDocument();
    expect(screen.getByText('Child Heading 1')).toBeInTheDocument();
    expect(screen.getByText('Grandchild Heading')).toBeInTheDocument();
    // Check level badges
    expect(screen.getByText('H1')).toBeInTheDocument();
    expect(screen.getByText('H2')).toBeInTheDocument();
    expect(screen.getByText('H3')).toBeInTheDocument();
  });

  it('toggles expansion when chevron is clicked', () => {
    render(
      <SectionTree 
        root={mockRoot} 
        descendants={mockDescendants} 
        onSelectSection={mockOnSelect} 
      />
    );

    // Initially all are open because of useState(true) in TreeItem
    expect(screen.getByText('Child Heading 1')).toBeInTheDocument();

    // Find the toggle button for the root (it has children)
    // The first button in the document is the root's toggle
    const toggleButtons = screen.getAllByRole('button');
    fireEvent.click(toggleButtons[0]);

    // Now children of root should be hidden
    expect(screen.queryByText('Child Heading 1')).not.toBeInTheDocument();

    // Click again to open
    fireEvent.click(toggleButtons[0]);
    expect(screen.getByText('Child Heading 1')).toBeInTheDocument();
  });

  it('calls onSelectSection when a node is clicked', () => {
    render(
      <SectionTree 
        root={mockRoot} 
        descendants={mockDescendants} 
        onSelectSection={mockOnSelect} 
      />
    );

    const rootNode = screen.getByText('Root Heading');
    fireEvent.click(rootNode);

    expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({
      id: 1,
      heading: 'Root Heading'
    }));
  });

  it('highlights the selected section', () => {
    const { rerender } = render(
      <SectionTree 
        root={mockRoot} 
        descendants={mockDescendants} 
        onSelectSection={mockOnSelect} 
        selectedId={1}
      />
    );

    // The root item div should have the highlight class (bg-primary/10)
    // We can check if it has a specific class from the 'cn' utility
    const rootItem = screen.getByText('Root Heading').closest('div');
    expect(rootItem).toHaveClass('bg-primary/10');

    // Rerender with different selectedId
    rerender(
      <SectionTree 
        root={mockRoot} 
        descendants={mockDescendants} 
        onSelectSection={mockOnSelect} 
        selectedId={2}
      />
    );

    expect(rootItem).not.toHaveClass('bg-primary/10');
    const childItem = screen.getByText('Child Heading 1').closest('div');
    expect(childItem).toHaveClass('bg-primary/10');
  });
});
