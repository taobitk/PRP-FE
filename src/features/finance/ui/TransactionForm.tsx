'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateTransactionRequestSchema, CreateTransactionRequest, Transaction } from '@/shared/api/contracts/finance.contract';
import { useCreateTransaction, useUpdateTransaction, useWallets, useCategories } from '../api/financeApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Plus, Trash2, Info } from 'lucide-react';
import Big from 'big.js';
import { money } from '@/shared/lib/money';

interface Props {
  initialData?: Transaction;
  onSuccess: () => void;
}

export function TransactionForm({ initialData, onSuccess }: Props) {
  const isEdit = !!initialData;
  const { mutate: createTx, isPending: isCreating } = useCreateTransaction();
  const { mutate: updateTx, isPending: isUpdating } = useUpdateTransaction();
  const { data: wallets } = useWallets();
  const { data: categories } = useCategories();

  const isPending = isCreating || isUpdating;

  const form = useForm<CreateTransactionRequest>({
    resolver: zodResolver(CreateTransactionRequestSchema),
    defaultValues: {
      amount: initialData?.amount?.toString() || '0',
      destination_wallet_id: initialData?.destination_wallet_id,
      category_id: initialData?.category_id,
      transaction_date: initialData?.transaction_date 
        ? new Date(initialData.transaction_date).toISOString().split('T')[0] 
        : new Date().toISOString().split('T')[0],
      note: initialData?.note || '',
      attributions: initialData?.attributions?.map(attr => ({
        source_wallet_id: attr.source_wallet_id,
        amount: attr.amount.toString()
      })) || [
        { source_wallet_id: undefined as any, amount: '0' }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'attributions',
  });

  const onSubmit = (data: CreateTransactionRequest) => {
    const formattedDate = data.transaction_date.includes('T') 
      ? data.transaction_date 
      : `${data.transaction_date}T00:00:00Z`;

    const finalData = { ...data, transaction_date: formattedDate };

    if (isEdit && initialData) {
      updateTx({ id: initialData.id, data: finalData }, {
        onSuccess: () => {
          toast.success('Đã cập nhật giao dịch thành công!');
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        },
      });
    } else {
      createTx(finalData, {
        onSuccess: () => {
          toast.success('Đã ghi nhận giao dịch thành công!');
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.data?.error || error.data?.message || 'Có lỗi xảy ra.');
        },
      });
    }
  };

  const totalAttributed = form.watch('attributions').reduce(
    (sum, attr) => {
      try {
        return sum.plus(new Big(attr.amount || '0'));
      } catch {
        return sum;
      }
    },
    new Big(0)
  );

  const targetAmount = form.watch('amount') || '0';
  const isMatch = totalAttributed.eq(new Big(targetAmount || '0'));

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số tiền</FormLabel>
                <FormControl>
                  <Input aria-label="Số tiền giao dịch" type="number" {...field} data-testid="finance-tx-amount" className="text-lg font-bold" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="transaction_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày</FormLabel>
                <FormControl>
                  <Input type="date" {...field} aria-label="Ngày giao dịch" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-label="Danh mục giao dịch"
                    data-testid="finance-tx-category"
                  >
                    <option value="">Chọn danh mục</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.type})</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="destination_wallet_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ví đích</FormLabel>
                <FormControl>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    aria-label="Ví thực hiện"
                    data-testid="finance-tx-wallet"
                  >
                    <option value="">Chọn ví</option>
                    {wallets?.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Input placeholder="Nội dung giao dịch..." {...field} aria-label="Ghi chú giao dịch" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 border-t pt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              Phân bổ nguồn tiền
              <Info className="h-3 w-3 text-text-muted" />
            </h3>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => append({ source_wallet_id: undefined as any, amount: '0' })}
              aria-label="Thêm nguồn phân bổ"
              data-testid="finance-tx-add-attribution"
            >
              <Plus className="h-3 w-3 mr-1" /> Thêm nguồn
            </Button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-2 items-start" data-testid="finance-tx-attr-row">
                <FormField
                  control={form.control}
                  name={`attributions.${index}.source_wallet_id`}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <select
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                          aria-label="Ví nguồn phân bổ"
                          {...field}
                          value={field.value || ''}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        >
                          <option value="">Chọn ví nguồn</option>
                          {wallets?.map((w) => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`attributions.${index}.amount`}
                  render={({ field }) => (
                    <FormItem className="w-32">
                      <FormControl>
                        <Input type="number" placeholder="Số tiền" {...field} className="h-9" aria-label="Số tiền phân bổ" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {fields.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-9 w-9 text-red-500"
                    onClick={() => remove(index)}
                    aria-label="Xóa nguồn phân bổ"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className={`p-3 rounded-lg text-xs flex justify-between items-center ${isMatch ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            <span>Tổng phân bổ: <strong>{money.formatVND(totalAttributed.toString())}</strong></span>
            <span>Mục tiêu: <strong>{money.formatVND(targetAmount)}</strong></span>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90" 
          disabled={isPending}
          aria-label={isEdit ? "Xác nhận cập nhật giao dịch" : "Xác nhận giao dịch"}
          data-testid="finance-tx-submit"
        >
          {isPending ? 'Đang xử lý...' : (isEdit ? 'Cập nhật giao dịch' : 'Xác nhận giao dịch')}
        </Button>
      </form>
    </Form>
  );
}
