import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'member']);
export const UserStatusSchema = z.enum(['active', 'inactive']);

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  full_name: z.string().optional(),
  role: UserRoleSchema,
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: UserStatusSchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type User = z.infer<typeof UserSchema>;
export type UserRole = z.infer<typeof UserRoleSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
