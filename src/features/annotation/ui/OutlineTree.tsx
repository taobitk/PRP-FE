'use client';

import { useOutline } from '../lib/useOutline';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '@/shared/api/contracts/annotation.contract';

interface SortableItemProps {
  section: Section;
  documentId: number;
  onAdd: (id: number) => void;
  onDelete: (id: number) => void;
  onSelect?: (section: Section) => void;
  isSelected?: boolean;
}

function SortableOutlineItem({ section, documentId, onAdd, onDelete, onSelect, isSelected }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: section.id,
    data: {
      section,
      documentId,
      parentId: section.parent_id,
      position: section.position,
      level: section.level
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${(section.level - 1) * 20}px`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect?.(section)}
      className={`group flex items-center gap-3 p-2 rounded-lg border transition-all mb-2 cursor-pointer ${
        isSelected 
          ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200' 
          : 'bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200 shadow-sm'
      }`}
      data-testid={`outline-item-${section.id}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-200 rounded transition-colors"
        data-testid={`outline-drag-handle-${section.id}`}
      >
        <GripVertical className="h-4 w-4 text-slate-400" />
      </div>
      
      <span className="flex-1 font-medium text-slate-700 truncate text-sm">{section.heading}</span>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
          onClick={() => onAdd(section.id)}
          data-testid={`outline-add-btn-${section.id}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
          onClick={() => onDelete(section.id)}
          data-testid={`outline-delete-btn-${section.id}`}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

interface OutlineTreeProps {
  documentId: number;
  onSelectSection?: (section: Section) => void;
  selectedId?: number;
  hideSaveButton?: boolean;
  isInsideWorkspace?: boolean;
}

export function OutlineTree({ 
  documentId, 
  onSelectSection, 
  selectedId,
  hideSaveButton = false,
  isInsideWorkspace = false
}: OutlineTreeProps) {
  const { sections, isLoading, moveSection, saveOrder, addSection, deleteSection } = useOutline(documentId);

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-doc-${documentId}`,
    data: {
      documentId,
      isColumn: true
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      moveSection(Number(active.id), Number(over.id));
    }
  };

  if (isLoading) {
    return (
      <div data-testid="outline-tree-loading" className="space-y-3 p-4">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-4/5 rounded-lg ml-8" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    );
  }

  const renderContent = () => (
    <div 
      ref={setDroppableRef}
      className="flex-1 overflow-y-auto p-4" 
      data-testid="outline-tree-container"
    >
      <SortableContext
        items={sections.map(s => s.id)}
        strategy={verticalListSortingStrategy}
      >
        {sections.map((section) => (
          <SortableOutlineItem 
            key={section.id} 
            section={section} 
            documentId={documentId}
            onAdd={addSection}
            onDelete={deleteSection}
            onSelect={onSelectSection}
            isSelected={section.id === selectedId}
          />
        ))}
      </SortableContext>
      
      <Button 
        variant="ghost" 
        className="w-full mt-2 border-2 border-dashed border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/50 hover:border-indigo-200 rounded-xl py-6 transition-all"
        onClick={() => addSection(null)}
      >
        <Plus className="h-4 w-4 mr-2" /> Thêm phần mới ở ngoài cùng
      </Button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b bg-white/80 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
        <div className="flex flex-col">
          <h3 className="font-bold text-slate-800 text-sm">Cấu trúc tài liệu</h3>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Kéo thả để sắp xếp</p>
        </div>
        {!hideSaveButton && (
          <Button 
            size="sm" 
            variant="default" 
            onClick={saveOrder}
            className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
            data-testid="outline-save-btn"
          >
            <Save className="h-4 w-4" /> Lưu cấu trúc
          </Button>
        )}
      </div>

      {isInsideWorkspace ? (
        renderContent()
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {renderContent()}
        </DndContext>
      )}
    </div>
  );
}
