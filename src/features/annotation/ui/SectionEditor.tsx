'use client';

import { useState, useEffect } from 'react';
import { Section } from '@/shared/api/contracts/annotation.contract';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2, Save, Eye, Edit3, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SectionEditorProps {
  section: Section | null;
  onSave: (values: { heading: string; content: string; level: number }) => void;
  isSaving: boolean;
}

export function SectionEditor({ section, onSave, isSaving }: SectionEditorProps) {
  const [heading, setHeading] = useState('');
  const [content, setContent] = useState('');
  const [level, setLevel] = useState(1);

  useEffect(() => {
    if (section) {
      setHeading(section.heading);
      setContent(section.content);
      setLevel(section.level);
    }
  }, [section]);

  if (!section) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl bg-muted/5 p-12 text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <MessageSquare className="h-8 w-8 text-primary opacity-50" />
        </div>
        <h3 className="text-xl font-bold text-slate-700">Chưa chọn nội dung</h3>
        <p className="text-slate-500 max-w-xs mt-2">
          Chọn một phần từ mục lục bên trái để bắt đầu chỉnh sửa nội dung tài liệu.
        </p>
      </div>
    );
  }

  const handleSave = () => {
    onSave({ heading, content, level });
  };

  return (
    <Card className="flex-1 flex flex-col shadow-xl border-none bg-white overflow-hidden rounded-2xl">
      <CardHeader className="border-b bg-slate-50/50 py-4 px-6 sticky top-0 z-10 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex items-center gap-3">
            <Badge variant="outline" className="font-mono bg-white shadow-sm px-2">H{level}</Badge>
            <Input
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              placeholder="Tiêu đề đoạn..."
              className="border-none bg-transparent text-xl font-bold focus-visible:ring-0 px-0 h-auto shadow-none"
              data-testid="section-editor-heading-input"
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all gap-2 px-4 rounded-full"
            data-testid="section-editor-save-btn"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" data-testid="section-editor-saving-spinner" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Lưu thay đổi
          </Button>
        </div>
      </CardHeader>

      <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 border-b bg-white">
          <TabsList className="bg-transparent border-none gap-6 h-12 p-0">
            <TabsTrigger 
              value="edit" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full gap-2"
              data-testid="section-editor-edit-tab"
            >
              <Edit3 className="h-4 w-4" /> Soạn thảo
            </TabsTrigger>
            <TabsTrigger 
              value="preview" 
              className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-full gap-2"
              data-testid="section-editor-preview-tab"
            >
              <Eye className="h-4 w-4" /> Xem trước
            </TabsTrigger>
          </TabsList>
        </div>

        <CardContent className="flex-1 p-0 overflow-hidden relative">
          <TabsContent value="edit" className="m-0 h-full">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[400px] p-6 border-none focus-visible:ring-0 text-lg leading-relaxed font-mono resize-none bg-slate-50/20"
              placeholder="Nhập nội dung Markdown tại đây..."
              data-testid="section-editor-content-input"
            />
          </TabsContent>
          <TabsContent value="preview" className="m-0 h-full overflow-y-auto p-8 bg-white">
            <div className="prose prose-slate max-w-none dark:prose-invert" data-testid="section-editor-preview-area">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || '*Chưa có nội dung để hiển thị.*'}
              </ReactMarkdown>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <div className="p-3 border-t bg-slate-50/50 flex justify-between items-center px-6">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section ID: {section.id}</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setLevel(lvl)}
                className={`h-5 w-8 rounded text-[10px] font-bold transition-all ${
                  level === lvl 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'bg-white border text-slate-400 hover:border-slate-300'
                }`}
              >
                H{lvl}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
