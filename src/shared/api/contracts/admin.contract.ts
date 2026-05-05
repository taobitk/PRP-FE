import { z } from 'zod';
import { UserSchema, UserRoleSchema } from '@/entities/user/model/user.model';

export const RegisterRequestSchema = z.object({
  username: z.string().min(1, 'Username là bắt buộc'),
  full_name: z.string().min(1, 'Họ tên là bắt buộc'),
  password: z.string().min(6, 'Password ít nhất 6 ký tự'),
  role: UserRoleSchema,
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

export const RegisterResponseSchema = UserSchema.pick({
  id: true,
  username: true,
  full_name: true,
  role: true,
});

export const ResetPasswordRequestSchema = z.object({
  user_id: z.number(),
  new_password: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự').optional(),
});

export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
});

export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;
export type RegisterResponse = z.infer<typeof RegisterResponseSchema>;
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
