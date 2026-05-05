"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginRequest, LoginRequestSchema } from '@/shared/api/contracts/auth.contract';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface LoginFormProps {
  onSubmit: (values: LoginRequest) => void;
  isLoading?: boolean;
}

export function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const form = useForm<LoginRequest>({
    resolver: zodResolver(LoginRequestSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  return (
    <div className="w-full">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel htmlFor="username" className="text-lg font-semibold">Username</FormLabel>
                <FormControl>
                  <Input 
                    id="username" 
                    className="h-14 text-xl md:text-xl placeholder:text-xl md:placeholder:text-xl px-6 rounded-2xl"
                    aria-label="Tên đăng nhập"
                    data-testid="auth-username-input"
                    placeholder="admin" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormLabel htmlFor="password" className="text-lg font-semibold">Password</FormLabel>
                <FormControl>
                  <Input 
                    id="password" 
                    type="password" 
                    className="h-14 text-xl md:text-xl placeholder:text-xl md:placeholder:text-xl px-6 rounded-2xl"
                    aria-label="Mật khẩu"
                    data-testid="auth-password-input"
                    {...field} 
                  />
                </FormControl>
                <FormMessage className="text-base" />
              </FormItem>
            )}
          />
          <Button 
            type="submit" 
            className="w-full h-14 mt-4 text-lg font-bold rounded-xl shadow-md" 
            disabled={isLoading}
            aria-label="Nút đăng nhập"
            data-testid="auth-login-submit"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
