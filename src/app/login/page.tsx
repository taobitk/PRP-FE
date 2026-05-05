"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/features/auth';
import { useLogin } from '@/features/auth';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const { mutate: login, isPending, isSuccess } = useLogin();

  useEffect(() => {
    if (isSuccess) {
      toast.success('Đăng nhập thành công!');
      router.push('/dashboard');
    }
  }, [isSuccess, router]);

  const handleLogin = (values: any) => {
    login(values, {
      onError: (error) => {
        const message = (error.data as any)?.error || 'Đăng nhập thất bại. Vui lòng kiểm tra lại!';
        toast.error(message);
      },
    });
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-card rounded-2xl shadow-lg border p-10 space-y-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-md">
            <span className="text-white text-3xl font-black">P</span>
          </div>
          <h1 className="text-3xl font-bold text-foreground mt-4">GoPRP</h1>
        </div>
        
        <LoginForm onSubmit={handleLogin} isLoading={isPending} />
      </div>
    </div>
  );
}
