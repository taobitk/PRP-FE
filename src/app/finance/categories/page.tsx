'use client';

import { useState } from 'react';
import { CategoryList } from '@/features/finance/ui/CategoryList';
import { CategoryForm } from '@/features/finance/ui/CategoryForm';
import { Button } from '@/components/ui/button';
import { Plus, Tag } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CategoriesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'income' | 'expense'>('expense');

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh mục tài chính</h1>
          <p className="text-text-secondary mt-1">Phân loại các khoản thu chi để theo dõi dòng tiền hiệu quả.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Thêm danh mục
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tạo danh mục mới</DialogTitle>
            </DialogHeader>
            <CategoryForm 
              onSuccess={() => setIsCreateOpen(false)} 
              defaultType={activeTab} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="expense" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-6">
          <TabsTrigger value="expense">Chi tiêu (Expense)</TabsTrigger>
          <TabsTrigger value="income">Thu nhập (Income)</TabsTrigger>
        </TabsList>
        <TabsContent value="expense">
          <CategoryList filterType="expense" />
        </TabsContent>
        <TabsContent value="income">
          <CategoryList filterType="income" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
