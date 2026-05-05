import { User } from "@/entities/user/model/user.model";

/**
 * Mapper để xử lý sự không đồng nhất giữa Backend PascalCase và snake_case.
 * Đảm bảo dữ liệu User luôn ở định dạng snake_case chuẩn cho Frontend.
 */
export function mapUser(rawUser: any): Pick<User, 'id' | 'username' | 'role'> {
  if (!rawUser) return { id: 0, username: '', role: 'member' };
  
  return {
    id: Number(rawUser.id || rawUser.ID || 0),
    username: rawUser.username || rawUser.Username || '',
    role: (rawUser.role || rawUser.Role || 'member').toLowerCase() as any,
  };
}

/**
 * Mapper đầy đủ cho thông tin cá nhân
 */
export function mapFullUser(rawUser: any): User {
  if (!rawUser) {
    return {
      id: 0,
      username: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'member',
      status: 'active',
      created_at: '',
      updated_at: '',
    };
  }
  
  return {
    id: Number(rawUser.id || rawUser.ID || 0),
    username: rawUser.username || rawUser.Username || '',
    full_name: rawUser.full_name || rawUser.FullName || rawUser.fullname || '',
    email: rawUser.email || rawUser.Email || '',
    phone: rawUser.phone || rawUser.Phone || '',
    role: (rawUser.role || rawUser.Role || 'member').toLowerCase() as 'admin' | 'member',
    status: (rawUser.status || rawUser.Status || 'active').toLowerCase() as 'active' | 'inactive',
    created_at: rawUser.created_at || rawUser.CreatedAt || '',
    updated_at: rawUser.updated_at || rawUser.UpdatedAt || '',
  };
}
