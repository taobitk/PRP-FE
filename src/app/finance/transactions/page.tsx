'use client';

import { useState } from 'react';
import { TransactionList } from '@/features/finance/ui/TransactionList';
import { TransactionFilters } from '@/features/finance/ui/TransactionFilters';
import { TransactionForm } from '@/features/finance/ui/TransactionForm';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function TransactionsPage() {
  const [filters, setFilters] = useState({});
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Giao dịch</h1>
          <p className="text-text-secondary mt-1">Theo dõi và quản lý mọi biến động số dư của bạn.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <Download className="h-4 w-4" />
            Xuất file
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger 
            render={
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Ghi giao dịch
              </Button>
            }
          />
          <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ghi nhận giao dịch tài chính</DialogTitle>
              </DialogHeader>
              <TransactionForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <TransactionFilters onFilterChange={(newFilters) => setFilters(f => ({ ...f, ...newFilters }))} />

      <TransactionList />
    </div>
  );
}
