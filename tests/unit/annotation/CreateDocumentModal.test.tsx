import { render, screen, fireEvent } from '@testing-library/react';
import { CreateDocumentModal } from '@/features/annotation/ui/CreateDocumentModal';
import { Button } from '@/components/ui/button';
import { vi, describe, it, expect } from 'vitest';

// Mock ShatterForm to avoid complex form logic in this unit test
vi.mock('@/features/annotation/ui/ShatterForm', () => ({
  ShatterForm: () => <div data-testid="mock-shatter-form">Mock Shatter Form</div>
}));

describe('CreateDocumentModal', () => {
  it('should render trigger and open modal on click', () => {
    render(
      <CreateDocumentModal 
        trigger={<Button data-testid="open-modal-btn">Add New</Button>} 
      />
    );

    const trigger = screen.getByTestId('open-modal-btn');
    expect(trigger).toBeDefined();

    // Modal should not be visible initially
    expect(screen.queryByTestId('annotation-create-modal')).toBeNull();

    // Click trigger
    fireEvent.click(trigger);

    // Modal should appear
    expect(screen.getByTestId('annotation-create-modal')).toBeDefined();
    expect(screen.getByText('Tải lên tài liệu mới')).toBeDefined();
    expect(screen.getByTestId('mock-shatter-form')).toBeDefined();
  });
});
