import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SectionEditor } from './SectionEditor';
import { Section } from '@/shared/api/contracts/annotation.contract';

const mockSection: Section = {
  id: 1,
  document_id: 1,
  parent_id: null,
  heading: 'Hợp đồng mẫu',
  content: '# Điều 1\nNội dung điều 1',
  level: 1,
  position: 1,
  tags: []
};

describe('SectionEditor Component', () => {
  it('should render placeholders when no section is selected', () => {
    render(<SectionEditor section={null} onSave={vi.fn()} isSaving={false} />);
    expect(screen.getByText(/Chọn một phần/i)).toBeInTheDocument();
  });

  it('should render section data when provided', async () => {
    render(<SectionEditor section={mockSection} onSave={vi.fn()} isSaving={false} />);
    
    // Switch to edit tab to find the content input
    fireEvent.click(screen.getByTestId('section-editor-edit-tab'));
    
    expect(screen.getByTestId('section-editor-heading-input')).toHaveValue('Hợp đồng mẫu');
    expect(await screen.findByTestId('section-editor-content-input')).toHaveValue('# Điều 1\nNội dung điều 1');
  });

  it('should call onSave with updated values', async () => {
    const handleSave = vi.fn();
    render(<SectionEditor section={mockSection} onSave={handleSave} isSaving={false} />);
    
    // Switch to edit tab
    fireEvent.click(screen.getByTestId('section-editor-edit-tab'));
    
    const headingInput = screen.getByTestId('section-editor-heading-input');
    const contentInput = await screen.findByTestId('section-editor-content-input');
    const saveBtn = screen.getByTestId('section-editor-save-btn');

    fireEvent.change(headingInput, { target: { value: 'Tiêu đề mới' } });
    fireEvent.change(contentInput, { target: { value: 'Nội dung mới' } });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledWith({
      heading: 'Tiêu đề mới',
      content: 'Nội dung mới',
      level: 1
    });
  });

  it('should show loading state on save button when isSaving is true', () => {
    render(<SectionEditor section={mockSection} onSave={vi.fn()} isSaving={true} />);
    const saveBtn = screen.getByTestId('section-editor-save-btn');
    expect(saveBtn).toBeDisabled();
    expect(screen.getByTestId('section-editor-saving-spinner')).toBeInTheDocument();
  });
});
