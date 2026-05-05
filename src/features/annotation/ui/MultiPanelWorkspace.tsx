'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay, 
  DragStartEvent, 
  defaultDropAnimationSideEffects, 
  closestCenter 
} from '@dnd-kit/core';
import { OutlineTree } from './OutlineTree';
import { Section } from '@/shared/api/contracts/annotation.contract';
import { Button } from '@/components/ui/button';
import { Plus, X, Layers, Layout } from 'lucide-react';
import { useMoveSection } from '../api/annotationApi';
import { toast } from 'sonner';
import { DocumentSelectorModal } from './DocumentSelectorModal';
import { Badge } from '@/components/ui/badge';

interface MultiPanelWorkspaceProps {
  primaryDocumentId: number;
  onSelectSection?: (section: Section) => void;
}

export function MultiPanelWorkspace({ primaryDocumentId, onSelectSection }: MultiPanelWorkspaceProps) {
  const [openDocumentIds, setOpenDocumentIds] = useState<number[]>([primaryDocumentId]);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor)
  );

  const { mutate: moveSection } = useMoveSection();

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveSection(active.data.current?.section as Section);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const sectionToMove = activeSection;
    setActiveSection(null);

    if (!over || !sectionToMove) return;

    const sourceDocId = active.data.current?.documentId;
    const targetDocId = over.data.current?.documentId;

    if (sourceDocId && targetDocId && sourceDocId !== targetDocId) {
      moveSection({
        sectionId: sectionToMove.id,
        target_document_id: targetDocId,
        parent_id: over.data.current?.parentId || null,
        position: over.data.current?.position || 1,
        level: over.data.current?.level || 1,
      }, {
        onSuccess: () => {
          toast.success('Đã di chuyển thẻ sang tài liệu mới thành công!');
        },
        onError: (err) => {
          toast.error(`Lỗi di chuyển: ${err.message}`);
        }
      });
    }
  };

  const addDocument = (docId: number) => {
    if (!openDocumentIds.includes(docId)) {
      setOpenDocumentIds([...openDocumentIds, docId]);
    }
  };

  const removeDocument = (docId: number) => {
    if (docId === primaryDocumentId) return;
    setOpenDocumentIds(openDocumentIds.filter(id => id !== docId));
  };

  return (
    <div className="flex flex-col h-full space-y-4" data-testid="workspace-container">
      {/* Action Bar */}
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/50 text-slate-500 border-slate-200">
            <Layout className="h-3 w-3 mr-1" /> Chế độ so sánh
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-xl gap-2 hover:bg-indigo-50 hover:text-indigo-600 transition-all font-bold"
          onClick={() => setIsSelectorOpen(true)}
          data-testid="workspace-add-column-btn"
        >
          <Plus className="h-4 w-4" /> Thêm tài liệu so sánh
        </Button>
      </div>

      {/* Workspace Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar pb-6">
          <div className="flex justify-center items-start gap-8 px-12 min-w-max">
            {openDocumentIds.map((docId) => (
              <div 
                key={docId} 
                className="w-[380px] flex-shrink-0 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-3xl shadow-lg flex flex-col overflow-hidden group hover:shadow-xl transition-all duration-300 min-h-[500px]"
                data-testid={`workspace-column-${docId}`}
              >
                <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="h-3 w-3" /> Document ID: {docId} {docId === primaryDocumentId && <span className="text-indigo-600">(Chính)</span>}
                  </span>
                  {docId !== primaryDocumentId && (
                    <button 
                      onClick={() => removeDocument(docId)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                      data-testid={`workspace-close-column-${docId}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <OutlineTree 
                    documentId={docId} 
                    onSelectSection={onSelectSection}
                    hideSaveButton={true}
                    isInsideWorkspace={true}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeSection ? (
            <div className="p-3 bg-white border-2 border-indigo-500 rounded-lg shadow-2xl opacity-90 cursor-grabbing pointer-events-none">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">
                  {activeSection.heading}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DocumentSelectorModal 
        open={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
        onSelect={addDocument}
        excludeIds={openDocumentIds}
      />
    </div>
  );
}
