import { useState, useEffect } from 'react';
import { useListDocumentSections, useReorderSections, useCreateSection, useDeleteSection } from '../api/annotationApi';
import { Section } from '@/shared/api/contracts/annotation.contract';

function flattenTree(sections: Section[]): Section[] {
  const childrenMap = new Map<number | null, Section[]>();

  // Ép kiểu ID về Number để tránh lỗi "123" !== 123
  sections.forEach((s) => {
    const pid = s.parent_id ? Number(s.parent_id) : null;
    if (!childrenMap.has(pid)) {
      childrenMap.set(pid, []);
    }
    childrenMap.get(pid)!.push(s);
  });

  // Sắp xếp các phần tử cùng cấp theo position
  childrenMap.forEach(arr => {
    arr.sort((a, b) => Number(a.position) - Number(b.position));
  });

  const result: Section[] = [];

  // Duyệt đệ quy từ gốc (parent_id = null)
  function dfs(parentId: number | null) {
    const children = childrenMap.get(parentId) || [];
    for (const child of children) {
      result.push(child);
      dfs(Number(child.id));
    }
  }

  dfs(null);

  // Đề phòng mục bị "mồ côi"
  const resultSet = new Set(result.map(s => Number(s.id)));
  const missing = sections.filter(s => !resultSet.has(Number(s.id)));
  if (missing.length > 0) {
    missing.sort((a, b) => Number(a.position) - Number(b.position));
    missing.forEach(s => result.push(s));
  }

  return result;
}

export function useOutline(documentId: number) {
  const { data: remoteSections, isLoading } = useListDocumentSections(documentId);
  const [sections, setSections] = useState<Section[]>([]);

  // Sync remote data to local state
  useEffect(() => {
    if (remoteSections) {
      setSections(flattenTree(remoteSections));
    }
  }, [remoteSections]);
  const reorderMutation = useReorderSections(documentId);
  const createMutation = useCreateSection();
  const deleteMutation = useDeleteSection();

  return {
    sections,
    isLoading,
    moveSection: (activeId: number, overId: number) => {
      setSections((prev) => {
        const activeIndex = prev.findIndex((s) => s.id === activeId);
        const overIndex = prev.findIndex((s) => s.id === overId);

        if (activeIndex === -1 || overIndex === -1) return prev;

        const newSections = [...prev];
        const [movedItem] = newSections.splice(activeIndex, 1);
        newSections.splice(overIndex, 0, movedItem);

        // Cập nhật position tạm thời cho UI (nếu cần)
        return newSections.map((s, idx) => ({ ...s, position: idx + 1 }));
      });
    },
    saveOrder: () => {
      reorderMutation.mutate({
        updates: sections.map((s) => ({
          id: s.id,
          parent_id: s.parent_id,
          position: s.position,
          level: s.level,
        })),
      });
    },
    addSection: (parentId: number | null) => {
      createMutation.mutate({
        document_id: documentId,
        parent_id: parentId,
        heading: 'New Section',
        content: '',
        level: parentId ? 2 : 1, // Logic đơn giản: nếu có cha thì để H2, không thì H1
        position: sections.length + 1,
      });
    },
    deleteSection: (id: number) => {
      deleteMutation.mutate({ id, documentId });
    },
  };
}
