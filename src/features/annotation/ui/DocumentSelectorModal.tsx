'use client';

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useListDocuments } from '../api/annotationApi';
import { Search, FileText, Plus, Loader2, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Lưu ý: Vì dự án chưa có ScrollArea, tớ sẽ dùng div overflow thay thế hoặc tự tạo nếu cần
// Ở đây tớ dùng div thuần cho an toàn như đã làm với MultiPanelWorkspace

interface DocumentSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (docId: number) => void;
  excludeIds?: number[];
}

export function DocumentSelectorModal({ 
  open, 
  onOpenChange, 
  onSelect, 
  excludeIds = [] 
}: DocumentSelectorModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { data, isLoading } = useListDocuments(1, 50); // Lấy 50 cái gần nhất

  const documents = (Array.isArray(data?.data) ? data.data : []) as any[];

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.id.toString().includes(searchTerm);
    const notExcluded = !excludeIds.includes(doc.id);
    return matchesSearch && notExcluded;
  });

  console.log('DEBUG [DocumentSelectorModal] filteredDocs:', filteredDocs);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden rounded-3xl border-none shadow-2xl">
        <div className="bg-indigo-600 p-6 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5" /> Chọn tài liệu so sánh
            </DialogTitle>
            <DialogDescription className="text-indigo-100 text-xs mt-1">
              Tìm kiếm và chọn tài liệu cậu muốn mở song song trong Workspace
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-300" />
            <Input 
              placeholder="Tìm tên tài liệu..." 
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-indigo-200 rounded-xl focus-visible:ring-white/30 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 max-h-[400px] overflow-y-auto custom-scrollbar bg-slate-50">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
              <p className="text-sm font-medium">Đang tải danh sách...</p>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
              <FileText className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">Không tìm thấy tài liệu nào phù hợp</p>
            </div>
          ) : (
            <div className="grid gap-2">
              {filteredDocs.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelect(doc.id);
                    onOpenChange(false);
                  }}
                  data-testid={`select-doc-${doc.id}`}
                  className="flex items-center gap-4 p-3 rounded-2xl bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50 transition-all text-left group w-full"
                >
                  <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-700 truncate group-hover:text-indigo-600 transition-colors">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-slate-200 text-slate-400">
                        ID: {doc.id}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-medium">
                        Cập nhật: {new Date(doc.updated_at).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus className="h-4 w-4 text-indigo-500" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t flex justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="rounded-xl">
            Đóng
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
