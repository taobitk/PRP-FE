'use client';

import { useCategories, useDeleteCategory } from '../api/financeApi';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { CategoryForm } from './CategoryForm';
import { Category } from '@/shared/api/contracts/finance.contract';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

interface Props {
  filterType?: 'income' | 'expense';
}

export function CategoryList({ filterType }: Props) {
  const { data: categories, isLoading } = useCategories();
  const { mutate: deleteCat } = useDeleteCategory();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<{id: number, name: string} | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="category-list-loading">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const handleDelete = () => {
    if (deletingCategory) {
      deleteCat(deletingCategory.id, {
        onSuccess: () => {
          toast.success('Đã xóa danh mục thành công!');
          setDeletingCategory(null);
        },
        onError: (err: any) => toast.error(err.data?.message || 'Lỗi khi xóa.'),
      });
    }
  };

  const filtered = categories?.filter(c => !filterType || c.type === filterType);

  if (!filtered || filtered.length === 0) {
    return (
      <div className="text-center p-8 text-text-secondary border rounded-lg border-dashed">
        Chưa có danh mục nào.
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
      {filtered.map((cat) => (
        <Card key={cat.id} className="group hover:border-primary transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-subtle rounded-md">
                <Tag className="h-4 w-4 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-text-primary">{cat.name}</div>
                <Badge variant={cat.type === 'income' ? 'success' : 'destructive'} className="text-[10px] h-4">
                  {cat.type.toUpperCase()}
                </Badge>
              </div>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                aria-label={`Sửa danh mục ${cat.name}`}
                onClick={() => setEditingCategory(cat)}
              >
                <Edit2 className="h-3 w-3" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-red-500"
                aria-label={`Xóa danh mục ${cat.name}`}
                onClick={() => setDeletingCategory({ id: cat.id, name: cat.name })}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cập nhật danh mục: {editingCategory?.name}</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm 
              initialData={editingCategory} 
              onSuccess={() => setEditingCategory(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog 
        open={!!deletingCategory}
        onOpenChange={(open) => !open && setDeletingCategory(null)}
        onConfirm={handleDelete}
        title="Xóa danh mục"
        description={`Bạn có chắc muốn xóa danh mục "${deletingCategory?.name}"? Các giao dịch thuộc danh mục này sẽ bị mất liên kết.`}
        confirmText="Xóa ngay"
      />
    </div>
  );
}
