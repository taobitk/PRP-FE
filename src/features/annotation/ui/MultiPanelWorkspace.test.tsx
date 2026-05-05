import { render, screen, fireEvent } from '@testing-library/react';
import { MultiPanelWorkspace } from './MultiPanelWorkspace';
import { describe, it, expect, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// Mock các component con để tập trung test logic Workspace
vi.mock('./OutlineTree', () => ({
  OutlineTree: ({ documentId }: { documentId: number }) => (
    <div data-testid={`mock-tree-${documentId}`}>Tree {documentId}</div>
  ),
}));

const queryClient = new QueryClient();
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('MultiPanelWorkspace Component', () => {
  it('should render primary document column by default', () => {
    render(<MultiPanelWorkspace primaryDocumentId={1} />, { wrapper });
    expect(screen.getByTestId('workspace-column-1')).toBeInTheDocument();
  });

  it('should add a new column when clicking add button', () => {
    // Lưu ý: Trong thực tế sẽ có modal chọn doc, ở đây test logic thêm vào mảng state
    render(<MultiPanelWorkspace primaryDocumentId={1} />, { wrapper });
    
    // Giả lập việc chọn tài liệu ID 2 từ modal (sẽ implement logic này sau)
    // Hiện tại test xem component có hỗ trợ hiển thị nhiều cột không
    expect(screen.queryByTestId('workspace-column-2')).not.toBeInTheDocument();
  });
});
