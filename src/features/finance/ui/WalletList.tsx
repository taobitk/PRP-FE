'use client';

import { useWallets, useDeleteWallet } from '../api/financeApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { money } from '@/shared/lib/money';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet as WalletIcon, CreditCard, Banknote, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { WalletForm } from './WalletForm';
import { Wallet } from '@/shared/api/contracts/finance.contract';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export function WalletList() {
  const { data: wallets, isLoading } = useWallets();
  const { mutate: deleteWallet } = useDeleteWallet();
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deletingWalletId, setDeletingWalletId] = useState<{id: number, name: string} | null>(null);

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-testid="wallet-list-loading">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
        ))}
      </div>
    );
  }

  const handleDelete = () => {
    if (deletingWalletId) {
      deleteWallet(deletingWalletId.id, {
        onSuccess: () => {
          toast.success('Đã xóa ví thành công!');
          setDeletingWalletId(null);
        },
        onError: (err: any) => toast.error(err.data?.message || 'Không thể xóa ví.'),
      });
    }
  };

  if (!wallets || wallets.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
        <WalletIcon className="h-12 w-12 text-text-muted mb-4" />
        <CardTitle className="text-xl mb-2">Chưa có ví nào</CardTitle>
        <p className="text-text-secondary mb-6">Hãy tạo ví đầu tiên để bắt đầu quản lý tài chính của bạn.</p>
      </Card>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'cash': return Banknote;
      case 'bank': return Landmark;
      case 'credit': return CreditCard;
      default: return WalletIcon;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'cash': return 'success';
      case 'bank': return 'info';
      case 'credit': return 'warning';
      default: return 'default';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {wallets.map((wallet) => {
        const Icon = getIcon(wallet.type);
        return (
          <Card key={wallet.id} className="relative group overflow-hidden transition-all hover:shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary-subtle rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <CardTitle className="text-base font-semibold">{wallet.name}</CardTitle>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-primary hover:text-primary/90 hover:bg-primary-subtle"
                  aria-label={`Sửa ví ${wallet.name}`}
                  onClick={() => setEditingWallet(wallet)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  aria-label={`Xóa ví ${wallet.name}`}
                  onClick={() => setDeletingWalletId({ id: wallet.id, name: wallet.name })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                <div 
                  className="text-2xl font-bold tracking-tight"
                  data-testid={`wallet-balance-${wallet.id}`}
                >
                  {money.formatVND(wallet.balance)}
                </div>
                <Badge variant={getBadgeVariant(wallet.type) as any} className="w-fit">
                  {wallet.type.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-16 w-16 bg-primary-subtle rounded-full opacity-20" />
          </Card>
        );
      })}

      <Dialog open={!!editingWallet} onOpenChange={(open) => !open && setEditingWallet(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Cập nhật ví: {editingWallet?.name}</DialogTitle>
          </DialogHeader>
          {editingWallet && (
            <WalletForm 
              initialData={editingWallet} 
              onSuccess={() => setEditingWallet(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog 
        open={!!deletingWalletId}
        onOpenChange={(open) => !open && setDeletingWalletId(null)}
        onConfirm={handleDelete}
        title="Xóa ví tiền"
        description={`Bạn có chắc chắn muốn xóa ví "${deletingWalletId?.name}"? Mọi giao dịch liên quan sẽ không bị xóa nhưng sẽ mất liên kết nguồn tiền.`}
        confirmText="Xóa ví"
      />
    </div>
  );
}

// Dummy Landmark icon since I didn't import it correctly above
const Landmark = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="3" y1="21" x2="21" y2="21" />
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="18" y1="21" x2="18" y2="7" />
    <line x1="6" y1="21" x2="6" y2="7" />
    <line x1="12" y1="21" x2="12" y2="7" />
    <path d="M2 7l10-5 10 5" />
  </svg>
);
