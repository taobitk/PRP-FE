import { z } from 'zod';
import { UserSchema } from '@/entities/user/model/user.model';

export const LoginRequestSchema = z.object({
  username: z.string().min(1, 'Username là bắt buộc'),
  password: z.string().min(1, 'Password là bắt buộc'),
});

export const LoginResponseSchema = z.object({
  data: z.object({
    access_token: z.string(),
    expires_at: z.string(),
    user: UserSchema.pick({ 
      id: true, 
      username: true, 
      role: true,
      full_name: true,
      email: true,
      phone: true,
      status: true
    }),
  }),
});

export const ErrorResponseSchema = z.object({
  error: z.string(),
});

export const ChangePasswordRequestSchema = z.object({
  old_password: z.string().min(1, 'Mật khẩu cũ là bắt buộc'),
  new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
