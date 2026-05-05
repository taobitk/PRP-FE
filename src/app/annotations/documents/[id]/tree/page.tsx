'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { SectionEditor } from '@/features/annotation/ui/SectionEditor';
import { TagManager } from '@/features/annotation/ui/TagManager';
import { OutlineTree } from '@/features/annotation/ui/OutlineTree';
import { useOutline } from '@/features/annotation/lib/useOutline';
import { useUpdateSection } from '@/features/annotation/api/annotationApi';
import { Section } from '@/shared/api/contracts/annotation.contract';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Layout, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MultiPanelWorkspace } from '@/features/annotation/ui/MultiPanelWorkspace';
import Link from 'next/link';
import { toast } from 'sonner';

export default function DocumentTreePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const documentId = Number(params.id);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<number | undefined>(undefined);

  const { sections, isLoading } = useOutline(documentId);
  const root = sections.find(s => s.parent_id === null) || sections[0];
  const { mutate: updateSection, isPending: isUpdating } = useUpdateSection(selectedSectionId || 0);

  useEffect(() => {
    const highlightId = searchParams.get('highlight');
    if (sections.length > 0 && highlightId) {
      const section = sections.find(d => d.id === Number(highlightId));
      if (section) {
        setSelectedSection(section);
        setSelectedSectionId(section.id);
      }
    } else if (sections.length > 0 && !selectedSection) {
      if (root) {
        setSelectedSection(root);
        setSelectedSectionId(root.id);
      }
    }
  }, [sections, searchParams]);

  useEffect(() => {
    if (sections.length > 0 && selectedSection) {
      const updated = sections.find(d => d.id === selectedSection.id);
      if (updated) {
        setSelectedSection(updated);
      }
    }
  }, [sections]);

  const handleSelectSection = (section: Section) => {
    setSelectedSection(section);
    setSelectedSectionId(section.id);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex gap-6 h-[calc(100vh-120px)]">
        <Skeleton className="w-1/3 h-full rounded-xl" />
        <Skeleton className="w-2/3 h-full rounded-xl" />
      </div>
    );
  }

  if (!sections || sections.length === 0) return <div className="container py-20 text-center">Không tìm thấy tài liệu.</div>;

  return (
    <div className="container mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/annotations">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-800 flex items-center gap-2">
              Cấu trúc tài liệu
              <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-indigo-100 px-2 py-0.5 rounded-full text-xs font-bold">
                ID: {documentId}
              </Badge>
            </h1>
            <p className="text-slate-400 text-xs font-medium mt-0.5">Quản lý và sắp xếp các thẻ nội dung</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showWorkspace ? 'default' : 'outline'}
            onClick={() => setShowWorkspace(!showWorkspace)}
            className={`rounded-full gap-2 px-5 transition-all duration-300 ${
              showWorkspace ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-white hover:border-indigo-400'
            }`}
          >
            <Layout className="h-4 w-4" />
            {showWorkspace ? 'Đóng Workspace' : 'Mở Workspace so sánh'}
          </Button>
          <Link href="/annotations/search">
            <Button variant="outline" size="icon" className="rounded-full bg-white shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Workspace - Slide down */}
      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
        showWorkspace ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-xl">
          <div className="bg-white rounded-[1.4rem] p-4 min-h-[500px]">
            <MultiPanelWorkspace
              primaryDocumentId={documentId}
              onSelectSection={handleSelectSection}
            />
          </div>
        </div>
      </div>

      {/* Editor + Tags (khi không mở Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* OutlineTree - luôn hiển thị */}
        <div className="lg:col-span-3">
          <OutlineTree
            documentId={documentId}
            onSelectSection={handleSelectSection}
          />
        </div>
        <div className="lg:col-span-5">
          <SectionEditor
            section={selectedSection}
            isSaving={isUpdating}
            onSave={(values) => {
              updateSection(values, {
                onSuccess: () => toast.success('Đã lưu thành công!'),
                onError: (err) => toast.error(`Lỗi: ${err.message}`),
              });
            }}
          />
        </div>
        <div className="lg:col-span-4">
          <TagManager
            sectionId={selectedSection?.id || 0}
            initialTags={selectedSection?.tags || []}
          />
        </div>
      </div>
    </div>
  );
}
