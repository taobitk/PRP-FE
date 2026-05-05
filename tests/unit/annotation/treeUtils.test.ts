import { describe, it, expect } from 'vitest';
import { buildSectionTree } from '@/features/annotation/lib/treeUtils';
import { Section } from '@/shared/api/contracts/annotation.contract';

describe('treeUtils - buildSectionTree', () => {
  it('should build a simple tree with one level of children', () => {
    const root: Section = { id: 1, document_id: 1, parent_id: null, heading: 'Root', content: '', level: 1, position: 1, tags: [] };
    const descendants: Section[] = [
      { id: 2, document_id: 1, parent_id: 1, heading: 'Child 1', content: '', level: 2, position: 1, tags: [] },
      { id: 3, document_id: 1, parent_id: 1, heading: 'Child 2', content: '', level: 2, position: 2, tags: [] },
    ];

    const result = buildSectionTree(root, descendants);

    expect(result.id).toBe(1);
    expect(result.children).toHaveLength(2);
    expect(result.children[0].id).toBe(2);
    expect(result.children[1].id).toBe(3);
  });

  it('should build a multi-level nested tree', () => {
    const root: Section = { id: 1, document_id: 1, parent_id: null, heading: 'H1', content: '', level: 1, position: 1, tags: [] };
    const descendants: Section[] = [
      { id: 2, document_id: 1, parent_id: 1, heading: 'H2', content: '', level: 2, position: 2, tags: [] },
      { id: 3, document_id: 1, parent_id: 2, heading: 'H3', content: '', level: 3, position: 3, tags: [] },
    ];

    const result = buildSectionTree(root, descendants);

    expect(result.children[0].id).toBe(2);
    expect(result.children[0].children[0].id).toBe(3);
    expect(result.children[0].children[0].parent_id).toBe(2);
  });

  it('should sort children by position', () => {
    const root: Section = { id: 1, document_id: 1, parent_id: null, heading: 'Root', content: '', level: 1, position: 1, tags: [] };
    const descendants: Section[] = [
      { id: 2, document_id: 1, parent_id: 1, heading: 'Last', content: '', level: 2, position: 10, tags: [] },
      { id: 3, document_id: 1, parent_id: 1, heading: 'First', content: '', level: 2, position: 5, tags: [] },
    ];

    const result = buildSectionTree(root, descendants);

    expect(result.children[0].heading).toBe('First');
    expect(result.children[1].heading).toBe('Last');
  });

  it('should handle orphaned children gracefully (ignore them)', () => {
    const root: Section = { id: 1, document_id: 1, parent_id: null, heading: 'Root', content: '', level: 1, position: 1, tags: [] };
    const descendants: Section[] = [
      { id: 2, document_id: 1, parent_id: 99, heading: 'Orphan', content: '', level: 2, position: 1, tags: [] }, // parent 99 not in list
    ];

    const result = buildSectionTree(root, descendants);

    expect(result.children).toHaveLength(0);
  });
});
