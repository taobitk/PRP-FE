'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SetBudgetRequestSchema, SetBudgetRequest } from '@/shared/api/contracts/finance.contract';
import { useSetBudget, useCategories } from '../api/financeApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

interface Props {
  onSuccess: () => void;
  defaultMonth?: number;
  defaultYear?: number;
}

export function BudgetForm({ onSuccess, defaultMonth, defaultYear }: Props) {
  const { mutate, isPending } = useSetBudget();
  const { data: categories } = useCategories();

  // Chỉ lấy danh mục chi tiêu (Expense) để lập ngân sách
  const expenseCategories = categories?.filter(c => c.type === 'expense') || [];

  const form = useForm<SetBudgetRequest>({
    resolver: zodResolver(SetBudgetRequestSchema),
    defaultValues: {
      category_id: undefined as any,
      amount: '0',
      month: defaultMonth || new Date().getMonth() + 1,
      year: defaultYear || new Date().getFullYear(),
    },
  });

  const onSubmit = (data: SetBudgetRequest) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Đã thiết lập ngân sách thành công!');
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(error.data?.message || 'Có lỗi xảy ra khi thiết lập ngân sách.');
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Danh mục chi tiêu</FormLabel>
              <FormControl>
                <select
                  aria-label="Chọn danh mục lập ngân sách"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  data-testid="budget-category-select"
                >
                  <option value="">Chọn danh mục</option>
                  {expenseCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hạn mức ngân sách</FormLabel>
              <FormControl>
                <Input 
                  aria-label="Hạn mức ngân sách"
                  type="number" 
                  placeholder="Ví dụ: 5000000" 
                  {...field} 
                  data-testid="budget-amount-input"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="month"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tháng</FormLabel>
                <FormControl>
                  <Input type="number" min={1} max={12} {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Năm</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90" 
          disabled={isPending}
          aria-label="Xác nhận thiết lập ngân sách"
          data-testid="budget-submit-btn"
        >
          {isPending ? 'Đang xử lý...' : 'Thiết lập ngân sách'}
        </Button>
      </form>
    </Form>
  );
}
