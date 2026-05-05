'use client';

import { useState } from 'react';
import { BudgetList, BudgetForm } from '@/features/finance';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { PieChart, Plus } from 'lucide-react';

export default function BudgetsPage() {
  const [open, setOpen] = useState(false);
  const now = new Date();
  const [month] = useState(now.getMonth() + 1);
  const [year] = useState(now.getFullYear());

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <PieChart className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Ngân sách chi tiêu</h1>
            <p className="text-text-secondary">Quản lý hạn mức chi tiêu theo tháng để tối ưu tài chính.</p>
          </div>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Thiết lập ngân sách
              </Button>
            }
          />
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Thiết lập ngân sách mới</DialogTitle>
            </DialogHeader>
            <BudgetForm 
              onSuccess={() => setOpen(false)} 
              defaultMonth={month} 
              defaultYear={year} 
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-semibold">Trạng thái tháng {month}/{year}</h2>
        </div>
        
        <BudgetList month={month} year={year} />
      </div>
    </div>
  );
}
