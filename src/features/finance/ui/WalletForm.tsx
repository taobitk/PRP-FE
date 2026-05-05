'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateWalletRequestSchema, CreateWalletRequest, Wallet } from '@/shared/api/contracts/finance.contract';
import { useCreateWallet, useUpdateWallet } from '../api/financeApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

interface Props {
  initialData?: Wallet;
  onSuccess: () => void;
}

export function WalletForm({ initialData, onSuccess }: Props) {
  const isEdit = !!initialData;
  const { mutate: createWallet, isPending: isCreating } = useCreateWallet();
  const { mutate: updateWallet, isPending: isUpdating } = useUpdateWallet();
  
  const isPending = isCreating || isUpdating;

  const form = useForm<CreateWalletRequest>({
    resolver: zodResolver(CreateWalletRequestSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || 'cash',
      initial_balance: initialData?.balance?.toString() || '0',
    },
  });

  const onSubmit = (data: CreateWalletRequest) => {
    if (isEdit && initialData) {
      updateWallet({ id: initialData.id, data }, {
        onSuccess: () => {
          toast.success('Đã cập nhật ví thành công!');
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật ví.');
        },
      });
    } else {
      createWallet(data, {
        onSuccess: () => {
          toast.success('Đã tạo ví thành công!');
          form.reset();
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.data?.message || 'Có lỗi xảy ra khi tạo ví.');
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên ví</FormLabel>
              <FormControl>
                <Input 
                  aria-label="Tên ví"
                  placeholder="Ví dụ: Tiền mặt, ATM VCB..." 
                  {...field} 
                  data-testid="finance-wallet-name-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Loại ví</FormLabel>
              <FormControl>
                <select
                  aria-label="Loại ví"
                  {...field}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  data-testid="finance-wallet-type-select"
                >
                  <option value="cash">Tiền mặt (Cash)</option>
                  <option value="bank">Ngân hàng (Bank)</option>
                  <option value="credit">Thẻ tín dụng (Credit)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initial_balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số dư {isEdit ? 'hiện tại' : 'ban đầu'}</FormLabel>
              <FormControl>
                <Input 
                  aria-label={isEdit ? "Số dư hiện tại" : "Số dư ban đầu"}
                  type="number" 
                  {...field} 
                  data-testid="finance-wallet-balance-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full" 
          disabled={isPending}
          aria-label={isEdit ? "Xác nhận cập nhật ví" : "Xác nhận tạo ví"}
          data-testid="finance-wallet-submit-btn"
        >
          {isPending ? 'Đang xử lý...' : (isEdit ? 'Cập nhật ví' : 'Tạo ví mới')}
        </Button>
      </form>
    </Form>
  );
}
