'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChangePasswordRequestSchema, ChangePasswordRequest } from '@/shared/api/contracts/auth.contract';
import { useChangePassword } from '../api/authApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

export function ChangePasswordForm() {
  const { mutate, isPending } = useChangePassword();

  const form = useForm<ChangePasswordRequest>({
    resolver: zodResolver(ChangePasswordRequestSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
    },
  });

  const onSubmit = (data: ChangePasswordRequest) => {
    mutate(data, {
      onSuccess: () => {
        toast.success('Mật khẩu đã được thay đổi thành công!');
        form.reset();
      },
      onError: (error: any) => {
        toast.error(error.data?.error || 'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ.');
      },
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex items-center gap-2 mb-4 text-primary">
          <KeyRound className="h-5 w-5" />
          <h3 className="font-semibold">Đổi mật khẩu</h3>
        </div>

        <FormField
          control={form.control}
          name="old_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu cũ</FormLabel>
              <FormControl>
                <Input 
                  aria-label="Mật khẩu cũ"
                  type="password" 
                  placeholder="••••••••" 
                  {...field} 
                  data-testid="change-pass-old"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu mới</FormLabel>
              <FormControl>
                <Input 
                  aria-label="Mật khẩu mới"
                  type="password" 
                  placeholder="Tối thiểu 6 ký tự" 
                  {...field} 
                  data-testid="change-pass-new"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          aria-label="Xác nhận đổi mật khẩu"
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90" 
          disabled={isPending}
          data-testid="change-pass-submit"
        >
          {isPending ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
        </Button>
      </form>
    </Form>
  );
}
