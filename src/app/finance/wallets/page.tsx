'use client';

import { useState } from 'react';
import { WalletList } from '@/features/finance';
import { WalletForm } from '@/features/finance/ui/WalletForm';
import { Button } from '@/components/ui/button';
import { Plus, ArrowLeftRight } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';

export default function WalletsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý ví</h1>
          <p className="text-text-secondary mt-1">Quản lý các tài khoản, thẻ và ví tiền mặt của bạn.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none gap-2">
            <ArrowLeftRight className="h-4 w-4" />
            Chuyển tiền
          </Button>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger 
            render={
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="mr-2 h-4 w-4" /> Thêm ví mới
              </Button>
            }
          />
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tạo ví tài chính mới</DialogTitle>
              </DialogHeader>
              <WalletForm onSuccess={() => setIsCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <WalletList />
    </div>
  );
}
