'use client';

import { useTransactions, useCategories, useWallets, useDeleteTransaction } from '../api/financeApi';
import { Card } from '@/components/ui/card';
import { money } from '@/shared/lib/money';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
} from '@/components/ui/dialog';
import { TransactionForm } from './TransactionForm';
import { Transaction } from '@/shared/api/contracts/finance.contract';
import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

export function TransactionList() {
  const { data: transactions, isLoading } = useTransactions();
  const { data: categories } = useCategories();
  const { data: wallets } = useWallets();
  const { mutate: deleteTx } = useDeleteTransaction();
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingTxId, setDeletingTxId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-4" data-testid="transaction-list-loading">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const handleDelete = () => {
    if (deletingTxId) {
      deleteTx(deletingTxId, {
        onSuccess: () => {
          toast.success('Đã xóa giao dịch thành công!');
          setDeletingTxId(null);
        },
        onError: (err: any) => toast.error(err.data?.message || 'Lỗi khi xóa.'),
      });
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center p-12 text-text-secondary border rounded-lg border-dashed">
        Chưa có giao dịch nào được ghi nhận.
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden bg-surface">
      <table className="w-full text-sm text-left">
        <thead className="bg-primary-subtle text-text-primary uppercase text-xs font-semibold">
          <tr>
            <th className="px-6 py-4">Ngày</th>
            <th className="px-6 py-4">Danh mục / Ghi chú</th>
            <th className="px-6 py-4">Ví đích</th>
            <th className="px-6 py-4 text-right">Số tiền</th>
            <th className="px-6 py-4 text-center">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {transactions.map((tx) => {
            const category = categories?.find(c => c.id === tx.category_id);
            const wallet = wallets?.find(w => w.id === tx.destination_wallet_id);
            const isExpense = category?.type === 'expense';

            return (
              <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-text-secondary">
                  {format(new Date(tx.transaction_date), 'dd/MM/yyyy', { locale: vi })}
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-text-primary">
                    {category?.name || 'Không xác định'}
                  </div>
                  {tx.note && <div className="text-xs text-text-muted">{tx.note}</div>}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{wallet?.name || 'N/A'}</Badge>
                </td>
                <td className={`px-6 py-4 text-right font-bold ${isExpense ? 'text-red-600' : 'text-green-600'}`}>
                  <span data-testid={`transaction-amount-${tx.id}`}>
                    {isExpense ? '-' : '+'}{money.formatVND(tx.amount)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-primary"
                      aria-label="Sửa giao dịch"
                      onClick={() => setEditingTransaction(tx)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-500"
                      aria-label="Xóa giao dịch"
                      onClick={() => setDeletingTxId(tx.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Dialog open={!!editingTransaction} onOpenChange={(open) => !open && setEditingTransaction(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Cập nhật giao dịch</DialogTitle>
          </DialogHeader>
          {editingTransaction && (
            <TransactionForm 
              initialData={editingTransaction} 
              onSuccess={() => setEditingTransaction(null)} 
            />
          )}
        </DialogContent>
      </Dialog>
      <ConfirmDialog 
        open={!!deletingTxId}
        onOpenChange={(open) => !open && setDeletingTxId(null)}
        onConfirm={handleDelete}
        title="Xóa giao dịch"
        description="Bạn có chắc chắn muốn xóa giao dịch này? Số dư các ví liên quan sẽ được tự động điều chỉnh lại."
        confirmText="Xóa giao dịch"
      />
    </div>
  );
}
