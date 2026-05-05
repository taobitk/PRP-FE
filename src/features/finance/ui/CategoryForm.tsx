'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCategoryRequestSchema, CreateCategoryRequest, Category } from '@/shared/api/contracts/finance.contract';
import { useCreateCategory, useUpdateCategory } from '../api/financeApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';

interface Props {
  initialData?: Category;
  onSuccess: () => void;
  defaultType?: 'income' | 'expense';
}

export function CategoryForm({ initialData, onSuccess, defaultType = 'expense' }: Props) {
  const isEdit = !!initialData;
  const { mutate: createCat, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCat, isPending: isUpdating } = useUpdateCategory();
  const isPending = isCreating || isUpdating;

  const form = useForm<CreateCategoryRequest>({
    resolver: zodResolver(CreateCategoryRequestSchema),
    defaultValues: {
      name: initialData?.name || '',
      type: initialData?.type || defaultType,
    },
  });

  const onSubmit = (data: CreateCategoryRequest) => {
    if (isEdit && initialData) {
      updateCat({ id: initialData.id, data }, {
        onSuccess: () => {
          toast.success('Đã cập nhật danh mục thành công!');
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.data?.message || 'Có lỗi xảy ra khi cập nhật.');
        },
      });
    } else {
      createCat(data, {
        onSuccess: () => {
          toast.success('Đã tạo danh mục thành công!');
          form.reset();
          onSuccess();
        },
        onError: (error: any) => {
          toast.error(error.data?.message || 'Có lỗi xảy ra khi tạo.');
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
              <FormLabel>Tên danh mục</FormLabel>
              <FormControl>
                <Input 
                  aria-label="Tên danh mục" 
                  placeholder="Ví dụ: Ăn uống, Lương tháng..." 
                  {...field} 
                  data-testid="finance-cat-name" 
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
              <FormLabel>Loại danh mục</FormLabel>
              <FormControl>
                <select
                  {...field}
                  aria-label="Loại danh mục"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  data-testid="finance-cat-type"
                >
                  <option value="expense">Chi tiêu (Expense)</option>
                  <option value="income">Thu nhập (Income)</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          aria-label={isEdit ? "Xác nhận cập nhật danh mục" : "Xác nhận tạo danh mục"} 
          type="submit" 
          className="w-full" 
          disabled={isPending} 
          data-testid="finance-cat-submit"
        >
          {isPending ? 'Đang xử lý...' : (isEdit ? 'Cập nhật danh mục' : 'Tạo danh mục')}
        </Button>
      </form>
    </Form>
  );
}
