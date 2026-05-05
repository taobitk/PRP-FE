'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useManageTags } from '../api/annotationApi';

interface TagManagerProps {
  sectionId: number;
  initialTags: string[];
}

export function TagManager({ sectionId, initialTags }: TagManagerProps) {
  const [newTag, setNewTag] = useState('');
  const [localTags, setLocalTags] = useState<string[]>(initialTags);
  const { mutate: manageTags, isPending } = useManageTags(sectionId);

  // Sync localTags with initialTags when initialTags changes from API
  useEffect(() => {
    setLocalTags(initialTags);
  }, [initialTags]);

  const handleAddTag = (e?: React.FormEvent) => {
    e?.preventDefault();
    const tag = newTag.trim().toLowerCase();

    if (!tag) return;
    if (localTags.includes(tag)) {
      toast.error('Tag này đã tồn tại!');
      return;
    }

    // Optimistic update
    setLocalTags(prev => [...prev, tag]);
    setNewTag('');

    manageTags({ action: 'add', tags: [tag] }, {
      onSuccess: () => {
        toast.success(`Đã thêm tag: ${tag}`);
      },
      onError: () => {
        // Rollback on error
        setLocalTags(prev => prev.filter(t => t !== tag));
        toast.error('Lỗi khi thêm tag!');
      }
    });
  };

  const handleRemoveTag = (tag: string) => {
    // Optimistic update
    setLocalTags(prev => prev.filter(t => t !== tag));

    manageTags({ action: 'remove', tags: [tag] }, {
      onSuccess: () => {
        toast.success(`Đã xóa tag: ${tag}`);
      },
      onError: () => {
        // Rollback on error
        setLocalTags(prev => [...prev, tag]);
        toast.error('Lỗi khi xóa tag!');
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 p-3 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 min-h-[50px] items-center">
        {localTags.length === 0 && (
          <span className="text-xs text-slate-400 italic flex items-center gap-2">
            <Plus className="h-3 w-3" /> Chưa có nhãn nào được gắn...
          </span>
        )}
        {localTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="pl-3 pr-1 py-1 gap-1.5 bg-white border-slate-200 shadow-sm hover:border-red-200 hover:text-red-600 transition-all group animate-in fade-in zoom-in duration-300"
          >
            <span className="font-medium">{tag}</span>
            <button
              onClick={() => handleRemoveTag(tag)}
              disabled={isPending}
              data-testid="remove-tag-button"
              className="p-0.5 rounded-md hover:bg-red-50 transition-colors opacity-40 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      <form onSubmit={handleAddTag} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Thêm nhãn (vd: quan_trong)..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            disabled={isPending}
            data-testid="tag-input"
            className="h-10 pl-9 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all"
          />
          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
        <Button
          type="submit"
          disabled={isPending || !newTag.trim()}
          data-testid="add-tag-button"
          className="rounded-xl px-4 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Gắn thẻ"
          )}
        </Button>
      </form>
    </div>
  );
}
