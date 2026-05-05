'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, Hash, X, Loader2, ArrowRight, EyeOff, Eye, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useSearchAnnotations, useListTags } from '../api/annotationApi';
import Link from 'next/link';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Section } from '@/shared/api/contracts/annotation.contract';

function SortableNavItem({ id, section, onHide, onClick }: { id: number, section: Section, onHide: (id: number) => void, onClick: (id: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer group/item ${isDragging ? 'shadow-xl ring-2 ring-indigo-500 scale-105 opacity-90' : 'hover:border-indigo-400 hover:shadow-md transition-all'}`}
    >
      <div 
        {...attributes} 
        {...listeners} 
        onClick={(e) => e.stopPropagation()} 
        className="text-slate-300 hover:text-indigo-600 cursor-grab active:cursor-grabbing p-1"
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <span className="truncate flex-1 text-sm font-semibold text-slate-700 group-hover/item:text-indigo-700">{section.heading}</span>
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={(e) => {
          e.stopPropagation();
          onHide(id);
        }} 
        className="h-6 w-6 text-slate-300 hover:text-red-500 hover:bg-red-50" 
        title="Ẩn mục này"
      >
        <EyeOff className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function AnnotationSearch() {
  const [tagInput, setTagInput] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAndMode, setIsAndMode] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<number[]>([]);
  const [orderedSections, setOrderedSections] = useState<Section[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);
  
  const [isFilterExpanded, setIsFilterExpanded] = useState(true);
  const [isOutlineExpanded, setIsOutlineExpanded] = useState(true);
  const [isHiddenExpanded, setIsHiddenExpanded] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: results, isLoading } = useSearchAnnotations(
    selectedTags, 
    isAndMode ? 'AND' : 'OR'
  );

  const { data: allTags } = useListTags();

  const suggestions = allTags?.filter(tag => 
    tag.toLowerCase().includes(tagInput.toLowerCase()) && 
    !selectedTags.includes(tag)
  ) || [];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (results) {
       setOrderedSections(prev => {
          const newOrdered = [...prev];
          const prevIds = new Set(prev.map(p => p.id));
          for (const r of results) {
             if (!prevIds.has(r.id)) newOrdered.push(r);
          }
          const resultIds = new Set(results.map(r => r.id));
          return newOrdered.filter(o => resultIds.has(o.id));
       });
    }
  }, [results]);

  const addTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    const tag = tagInput.trim().toLowerCase();
    if (tag && !selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
      setTagInput('');
      setShowSuggestions(false);
    }
  };

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };

  const hideSection = (id: number) => setHiddenIds(prev => [...prev, id]);
  const restoreSection = (id: number) => setHiddenIds(prev => prev.filter(hid => hid !== id));

  const scrollToSection = (id: number) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setOrderedSections((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const visibleResults = orderedSections.filter(s => !hiddenIds.includes(s.id));
  const hiddenResults = orderedSections.filter(s => hiddenIds.includes(s.id));

  // Hàm tính toán vị trí cho Portal
  const getPortalStyles = () => {
    if (!inputRef.current) return {};
    const rect = inputRef.current.getBoundingClientRect();
    return {
      position: 'fixed' as const,
      top: `${rect.bottom + 8}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      zIndex: 9999,
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ---------------- CỘT TRÁI (SIDEBAR) ---------------- */}
      <div className="lg:col-span-4 space-y-5 sticky top-20 z-30 max-h-[calc(100vh-100px)] overflow-y-auto px-4 pb-10 custom-scrollbar">
        <Card className="shadow-lg border-t-4 border-t-indigo-600 rounded-2xl border-slate-200 !overflow-visible">
          <CardHeader 
            className="pb-3 bg-slate-50/50 rounded-t-2xl cursor-pointer hover:bg-slate-100 transition-colors"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
          >
            <CardTitle className="flex items-center justify-between text-lg">
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-indigo-600" />
                Lọc Dữ Liệu
              </div>
              {isFilterExpanded ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
            </CardTitle>
          </CardHeader>
          {isFilterExpanded && (
            <CardContent className="space-y-4 pt-4 animate-in fade-in duration-200">
              <div className="flex flex-wrap gap-2 min-h-[40px] p-2.5 border border-slate-200 rounded-xl bg-slate-50">
                {selectedTags.map(tag => (
                  <Badge key={tag} className="gap-1 pl-2.5 pr-1 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-none shadow-sm">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="hover:bg-indigo-300 rounded-full p-0.5 transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {selectedTags.length === 0 && <span className="text-sm text-slate-400 p-1 font-medium">Nhập các tag để phân tích...</span>}
              </div>

              <form onSubmit={addTag} className="flex gap-2 relative">
                <div className="relative flex-1" ref={inputRef}>
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Ví dụ: important..." 
                    className="pl-9 h-11 bg-white border-slate-200 shadow-sm rounded-xl focus-visible:ring-indigo-500"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  />
                  
                  {mounted && showSuggestions && suggestions.length > 0 && createPortal(
                    <div 
                      style={getPortalStyles()}
                      className="bg-white border-2 border-slate-200 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300 ring-4 ring-indigo-500/5"
                    >
                      <div className="p-1.5 flex flex-col gap-0.5 max-h-[240px] overflow-y-auto custom-scrollbar">
                        {suggestions.map(suggestion => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() => {
                              setSelectedTags([...selectedTags, suggestion]);
                              setTagInput('');
                              setShowSuggestions(false);
                            }}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl transition-all text-left group/suggestion"
                          >
                            <div className="bg-slate-100 group-hover/suggestion:bg-indigo-100 p-1.5 rounded-lg transition-colors">
                              <Hash className="h-4 w-4 text-slate-400 group-hover/suggestion:text-indigo-500" />
                            </div>
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>,
                    document.body
                  )}
                </div>
                <Button type="submit" className="h-11 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 shadow-md transition-all active:scale-95">Thêm</Button>
              </form>

              <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="search-mode" 
                      checked={isAndMode} 
                      onCheckedChange={setIsAndMode} 
                    />
                    <Label htmlFor="search-mode" className="text-sm cursor-pointer text-slate-600">
                      Chế độ: <span className="font-bold text-indigo-600">{isAndMode ? 'AND' : 'OR'}</span>
                    </Label>
                  </div>
                  <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">
                    {results ? `${visibleResults.length}/${results.length} mục` : 'Trống'}
                  </span>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Card Dàn ý phân tích */}
        {visibleResults.length > 0 && (
          <Card className="shadow-lg border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
            <CardHeader 
              className="py-3.5 bg-white border-b border-slate-100 shadow-sm z-10 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setIsOutlineExpanded(!isOutlineExpanded)}
            >
              <CardTitle className="text-sm font-bold text-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  Dàn ý phân tích
                  <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">Kéo thả để sắp xếp</span>
                </div>
                {isOutlineExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
              </CardTitle>
            </CardHeader>
            {isOutlineExpanded && (
              <CardContent className="p-3 max-h-[calc(100vh-500px)] overflow-y-auto custom-scrollbar animate-in fade-in duration-200">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={visibleResults.map(s => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {visibleResults.map(s => (
                        <SortableNavItem 
                          key={s.id} 
                          id={s.id} 
                          section={s} 
                          onHide={hideSection} 
                          onClick={scrollToSection}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </CardContent>
            )}
          </Card>
        )}

        {/* Mục Đã ẩn */}
        {hiddenResults.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div 
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors border-b border-transparent data-[expanded=true]:border-slate-200"
              onClick={() => setIsHiddenExpanded(!isHiddenExpanded)}
              data-expanded={isHiddenExpanded}
            >
              <div className="text-sm font-bold flex items-center gap-2 text-slate-500">
                <EyeOff className="h-4 w-4" /> Đã ẩn ({hiddenResults.length})
              </div>
              {isHiddenExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </div>
            {isHiddenExpanded && (
              <div className="p-4 pt-2 animate-in fade-in duration-200">
                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                  {hiddenResults.map(section => (
                    <div key={section.id} className="flex justify-between items-center text-sm bg-white p-2.5 rounded-lg border border-slate-100 shadow-sm">
                      <span className="truncate flex-1 font-medium text-slate-600 pr-2">{section.heading}</span>
                      <Button size="sm" variant="ghost" onClick={() => restoreSection(section.id)} className="h-7 px-2 text-indigo-600 hover:bg-indigo-50">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------------- CỘT PHẢI (MAIN CONTENT) ---------------- */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {selectedTags.length === 0 && (
          <div className="flex flex-col items-center justify-center py-40 px-6 text-center bg-white border border-slate-200 shadow-sm rounded-3xl space-y-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-50 rounded-full animate-pulse" />
              <Search className="h-16 w-16 text-indigo-500 relative" />
            </div>
            <div className="space-y-2 max-w-sm">
              <h3 className="text-xl font-bold text-slate-800">Sẵn sàng khám phá?</h3>
              <p className="text-slate-500 font-medium">
                Hãy chọn hoặc nhập các nhãn (tags) ở thanh bên trái để bắt đầu tìm kiếm và phân tích tri thức nhé.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-normal">#tư_duy</Badge>
              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-normal">#đầu_tư</Badge>
              <Badge variant="outline" className="bg-slate-50 text-slate-400 border-slate-200 font-normal">#tâm_lý</Badge>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            <p className="text-slate-400 font-medium animate-pulse">Đang nạp dữ liệu phân tích...</p>
          </div>
        )}

        {results && results.length === 0 && !isLoading && (
          <div className="text-center py-32 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
            <p className="text-slate-400 font-medium text-lg">Không có mảnh dữ liệu nào khớp với tag này.</p>
          </div>
        )}

        {visibleResults.length > 0 && (
          <div className="bg-white border border-slate-200 shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden divide-y divide-slate-100">
            {visibleResults.map((section, index) => (
              <div 
                key={section.id} 
                id={`section-${section.id}`}
                className="p-8 group relative transition-colors hover:bg-slate-50/40 scroll-mt-20"
              >
                <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button size="icon" variant="ghost" onClick={() => hideSection(section.id)} className="h-8 w-8 text-slate-300 hover:text-red-500 hover:bg-red-50 bg-white shadow-sm border border-slate-100 rounded-full" title="Ẩn khỏi báo cáo">
                    <EyeOff className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="font-mono text-[10px] bg-slate-100 text-slate-500 rounded-full px-2.5">
                      {index + 1}. H{section.level}
                    </Badge>
                    <h3 className="font-bold text-2xl text-slate-800 leading-tight">
                      {section.heading}
                    </h3>
                  </div>

                  {section.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {section.tags.map(t => (
                        <Badge key={t} variant="outline" className="text-[11px] font-medium bg-indigo-50/50 text-indigo-600 border-indigo-100">
                          #{t}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="prose prose-sm md:prose-base prose-slate max-w-none text-slate-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {section.content}
                    </ReactMarkdown>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-50 mt-6">
                    <Link 
                      href={`/annotations/documents/${section.document_id}/tree?highlight=${section.id}`}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 hover:text-indigo-600 transition-colors"
                    >
                      Nguồn <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
