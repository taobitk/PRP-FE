import { z } from 'zod';
import { UserSchema, UserRoleSchema, UserStatusSchema } from '@/entities/user/model/user.model';

// 1. Get Me Response
export const GetMeResponseSchema = z.object({
  data: UserSchema,
});

// 2. User List Response (Admin Only)
export const UserListResponseSchema = z.object({
  data: z.array(UserSchema),
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
  }),
});

// 3. Update User Request
export const UpdateUserRequestSchema = z.object({
  full_name: z.string().min(1, 'Họ tên là bắt buộc').optional(),
  role: UserRoleSchema.optional(),
  email: z.string().email('Email không hợp lệ').optional(),
  phone: z.string().optional(),
});

// 4. Update Status Request
export const UpdateStatusRequestSchema = z.object({
  status: UserStatusSchema,
});

export type GetMeResponse = z.infer<typeof GetMeResponseSchema>;
export type UserListResponse = z.infer<typeof UserListResponseSchema>;
export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;
export type UpdateStatusRequest = z.infer<typeof UpdateStatusRequestSchema>;
