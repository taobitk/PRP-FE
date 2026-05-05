'use client';

import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Hash, FileText } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/api/contracts/annotation.contract';
import { buildSectionTree, TreeNode } from '../lib/treeUtils';
import { Badge } from '@/components/ui/badge';

interface SectionTreeProps {
  root: Section;
  descendants: Section[];
  onSelectSection: (section: Section) => void;
  selectedId?: number;
}

export function SectionTree({ root, descendants, onSelectSection, selectedId }: SectionTreeProps) {
  // Dựng cây từ mảng phẳng
  const tree = useMemo(() => buildSectionTree(root, descendants), [root, descendants]);

  return (
    <div className="space-y-1 select-none">
      <TreeItem 
        node={tree} 
        level={0} 
        onSelect={onSelectSection} 
        selectedId={selectedId} 
      />
    </div>
  );
}

interface TreeItemProps {
  node: TreeNode;
  level: number;
  onSelect: (section: Section) => void;
  selectedId?: number;
}

function TreeItem({ node, level, onSelect, selectedId }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  const toggleOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="space-y-1">
      <div 
        onClick={() => onSelect(node)}
        className={cn(
          "group flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer transition-all duration-200",
          "hover:bg-primary/5",
          isSelected ? "bg-primary/10 text-primary font-semibold shadow-sm ring-1 ring-primary/20" : "text-text-secondary"
        )}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        <div className="flex items-center gap-1 min-w-[24px]">
          {hasChildren ? (
            <button 
              onClick={toggleOpen}
              className="p-0.5 hover:bg-primary/20 rounded transition-colors"
            >
              {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          ) : (
            <div className="w-4" />
          )}
        </div>

        <Badge variant="outline" className="text-[10px] h-5 px-1 bg-muted/50 font-mono shrink-0">
          H{node.level}
        </Badge>

        <span className="truncate text-sm flex-1">{node.heading}</span>

        {node.tags.length > 0 && (
          <div className="flex gap-1 shrink-0">
            {node.tags.slice(0, 2).map(tag => (
              <div key={tag} className="w-2 h-2 rounded-full bg-primary/40" title={tag} />
            ))}
            {node.tags.length > 2 && <span className="text-[10px] text-text-muted">+{node.tags.length - 2}</span>}
          </div>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="relative">
          {/* Đường kẻ dọc nối các node con */}
          <div 
            className="absolute left-[20px] top-0 bottom-0 w-[1px] bg-border/40"
            style={{ left: `${level * 16 + 21}px` }}
          />
          <div className="space-y-1">
            {node.children.map(child => (
              <TreeItem 
                key={child.id} 
                node={child} 
                level={level + 1} 
                onSelect={onSelect}
                selectedId={selectedId}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
