'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResetPasswordRequestSchema, ResetPasswordRequest } from '@/shared/api/contracts/admin.contract';
import { useResetPassword } from '../api/adminApi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User } from '@/entities/user/model/user.model';
import { AlertCircle } from 'lucide-react';

interface ResetPasswordModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResetPasswordModal({ user, open, onOpenChange }: ResetPasswordModalProps) {
  const { mutate, isPending } = useResetPassword();

  const form = useForm<ResetPasswordRequest>({
    resolver: zodResolver(ResetPasswordRequestSchema),
    defaultValues: {
      user_id: user?.id || 0,
      new_password: '',
    },
  });

  // Cập nhật user_id khi modal mở
  if (user && form.getValues('user_id') !== user.id) {
    form.setValue('user_id', user.id);
  }

  const onSubmit = (data: ResetPasswordRequest) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(`Đã đặt lại mật khẩu cho ${user?.username} thành công!`);
        form.reset();
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(error.data?.error || "Lỗi khi reset mật khẩu.");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Mật khẩu</DialogTitle>
          <DialogDescription>
            Đặt lại mật khẩu cho người dùng <strong>{user?.username}</strong>.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mật khẩu mới (Tùy chọn)</FormLabel>
                  <FormControl>
                    <Input 
                      aria-label="Mật khẩu mới cho nhân viên"
                      type="password" 
                      placeholder="Để trống để reset về '123456'" 
                      {...field} 
                      data-testid="admin-reset-pass-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-yellow-50 p-3 rounded-md flex items-start gap-2 text-xs text-yellow-800">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <p>Lưu ý: Nếu Sếp không nhập mật khẩu mới, hệ thống sẽ mặc định đặt mật khẩu về <strong>123456</strong>.</p>
            </div>

            <Button 
              aria-label="Xác nhận reset mật khẩu"
              type="submit" 
              className="w-full" 
              disabled={isPending}
              data-testid="admin-reset-pass-submit"
            >
              {isPending ? 'Đang thực hiện...' : 'Xác nhận Reset'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
