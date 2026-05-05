import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/shared/lib/apiClient';
import {
  ShatterRequest, ShatterResponse,
  TreeResponse, ManageTagRequest,
  SearchResponse, Section,
  UpdateSectionRequest, ActionResponse,
  ListDocumentsResponse, UpdateDocumentRequest,
  ReorderSectionsRequest, CreateSectionRequest, MoveSectionRequest,
  ListTagsResponse
} from '@/shared/api/contracts/annotation.contract';

// 1. Tải lên và băm nhỏ tài liệu
export function useShatter() {
  return useMutation<ShatterResponse, ApiError, ShatterRequest>({
    mutationFn: (data) =>
      apiClient<ShatterResponse>('/annotations/documents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}

// 2. Lấy cây nội dung của một Section
export function useSectionTree(sectionId: number | null) {
  return useQuery<TreeResponse['data'], ApiError>({
    queryKey: ['annotations', 'tree', sectionId],
    queryFn: () =>
      apiClient<TreeResponse>(`/annotations/sections/${sectionId}/tree`)
        .then(res => res.data),
    enabled: !!sectionId,
  });
}

// 3. Quản lý Tag (Thêm/Xóa)
export function useManageTags(sectionId: number) {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, ApiError, ManageTagRequest>({
    mutationFn: (data) =>
      apiClient<{ data: { message: string } }>(`/annotations/sections/${sectionId}/tags`, {
        method: 'POST',
        body: JSON.stringify(data),
      }).then(res => res.data),
    onSuccess: () => {
      // Refresh lại cây để cập nhật tag mới
      queryClient.invalidateQueries({ queryKey: ['annotations'] });
    },
  });
}

// 4. Tìm kiếm theo Tag (Hỗ trợ mode AND/OR)
export function useSearchAnnotations(tags: string[], mode: 'AND' | 'OR' = 'OR') {
  const queryParams = new URLSearchParams();
  tags.forEach(tag => queryParams.append('tags', tag));
  queryParams.append('mode', mode);

  return useQuery<Section[], ApiError>({
    queryKey: ['annotations', 'search', tags, mode],
    queryFn: () =>
      apiClient<SearchResponse>(`/annotations/search?${queryParams.toString()}`)
        .then(res => res.data),
    enabled: tags.length > 0,
  });
}

// 5. Cập nhật nội dung Section (Heading/Content)
export function useUpdateSection(sectionId: number) {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiError, UpdateSectionRequest>({
    mutationFn: (data) =>
      apiClient<ActionResponse>(`/annotations/sections/${sectionId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', 'tree'] });
      queryClient.invalidateQueries({ queryKey: ['annotations', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['annotations', 'document-sections'] });
    },
  });
}

// 6. Lấy danh sách tài liệu
export function useListDocuments(page = 1, perPage = 100) {
  return useQuery<ListDocumentsResponse, ApiError>({
    queryKey: ['annotations', 'documents', page, perPage],
    queryFn: () =>
      apiClient<ListDocumentsResponse>(`/annotations/documents?page=${page}&per_page=${perPage}`),
  });
}

// 7. Cập nhật thông tin tài liệu (Title)
export function useUpdateDocument(documentId: number) {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiError, UpdateDocumentRequest>({
    mutationFn: (data) =>
      apiClient<ActionResponse>(`/annotations/documents/${documentId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', 'documents'] });
    },
  });
}

// 8. Xóa tài liệu
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiError, number>({
    mutationFn: (documentId) =>
      apiClient<ActionResponse>(`/annotations/documents/${documentId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', 'documents'] });
    },
  });
}

// 9. Lấy toàn bộ danh sách Section của một Document (dùng cho Outline Editor)
export function useListDocumentSections(documentId: number) {
  return useQuery<Section[], ApiError>({
    queryKey: ['annotations', 'document-sections', documentId],
    queryFn: () =>
      apiClient<{ data: Section[] }>(`/annotations/documents/${documentId}/sections`)
        .then(res => res.data),
    enabled: !!documentId,
  });
}

// 10. Sắp xếp lại cây (Bulk Update)
export function useReorderSections(documentId: number) {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiError, ReorderSectionsRequest>({
    mutationFn: (data) =>
      apiClient<ActionResponse>(`/annotations/documents/${documentId}/sections/reorder`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', 'document-sections', documentId] });
      queryClient.invalidateQueries({ queryKey: ['annotations', 'tree'] });
    },
  });
}

// 11. Tạo thẻ mới đơn lẻ
export function useCreateSection() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse & { data: { id: number } }, ApiError, CreateSectionRequest>({
    mutationFn: (data) =>
      apiClient<ActionResponse & { data: { id: number } }>('/annotations/sections', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      // Vì CreateSection chỉ trả về ID, ta lấy document_id từ variables gửi lên
      queryClient.invalidateQueries({ queryKey: ['annotations', 'document-sections', variables.document_id] });
      queryClient.invalidateQueries({ queryKey: ['annotations', 'tree'] });
    },
  });
}

// 12. Xóa thẻ (Cascade)
export function useDeleteSection() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiError, { id: number; documentId: number }>({
    mutationFn: ({ id }) =>
      apiClient<ActionResponse>(`/annotations/sections/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, { documentId }) => {
      queryClient.invalidateQueries({ queryKey: ['annotations', 'document-sections', documentId] });
      queryClient.invalidateQueries({ queryKey: ['annotations', 'tree'] });
    },
  });
}

// 13. Di chuyển Section chéo tài liệu
export function useMoveSection() {
  const queryClient = useQueryClient();

  return useMutation<ActionResponse, ApiError, MoveSectionRequest & { sectionId: number }>({
    mutationFn: ({ sectionId, ...data }) =>
      apiClient<ActionResponse>(`/annotations/sections/${sectionId}/move`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      // Invalidate toàn bộ document-sections để đảm bảo tất cả các cột trong workspace đều refetch
      queryClient.invalidateQueries({ queryKey: ['annotations', 'document-sections'] });
      queryClient.invalidateQueries({ queryKey: ['annotations', 'tree'] });
    },
  });
}

// 14. Lấy danh sách toàn bộ tag của người dùng
export function useListTags() {
  return useQuery<string[], ApiError>({
    queryKey: ['annotations', 'tags'],
    queryFn: () =>
      apiClient<ListTagsResponse>('/annotations/tags').then(res => res.data),
  });
}
