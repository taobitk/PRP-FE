import { Section } from '@/shared/api/contracts/annotation.contract';

export interface TreeNode extends Section {
  children: TreeNode[];
}

/**
 * Biến mảng phẳng các Section thành cấu trúc cây lồng nhau
 */
export function buildSectionTree(root: Section, descendants: Section[]): TreeNode {
  // Tạo một bản đồ để truy xuất nhanh theo ID
  const map: Record<number, TreeNode> = {};
  
  // Khởi tạo node gốc
  const rootNode: TreeNode = { ...root, children: [] };
  map[root.id] = rootNode;

  // Khởi tạo các node con
  descendants.forEach(d => {
    map[d.id] = { ...d, children: [] };
  });

  // Lắp ghép cha-con
  descendants.forEach(d => {
    const node = map[d.id];
    if (d.parent_id && map[d.parent_id]) {
      map[d.parent_id].children.push(node);
    }
  });

  // Sắp xếp các con theo vị trí (position) để hiển thị đúng thứ tự tài liệu
  const sortChildren = (node: TreeNode) => {
    node.children.sort((a, b) => a.position - b.position);
    node.children.forEach(sortChildren);
  };

  sortChildren(rootNode);

  return rootNode;
}
