import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/entities/user/model/user.model';
import { LoginResponse } from '@/shared/api/contracts/auth.contract';

interface AuthState {
  accessToken: string | null;
  user: LoginResponse['data']['user'] | null;
  isAuthenticated: boolean;
  setCredentials: (token: string, user: LoginResponse['data']['user']) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      setCredentials: (token, user) => {
        // Ghi vào Cookie để Middleware có thể đọc được
        if (typeof window !== 'undefined') {
          document.cookie = `auth_token=${token}; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `user_role=${user.role}; path=/; max-age=86400; SameSite=Lax`;
        }
        set({
          accessToken: token,
          user: user,
          isAuthenticated: true,
        });
      },
      logout: () => {
        // Xóa Cookie
        if (typeof window !== 'undefined') {
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          // Bắn thẳng về trang login và xóa sạch cache RAM
          window.location.href = '/login';
        }
        set({
          accessToken: null,
          user: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      // In SSR (Next.js), we need to handle hydration carefully if using persist
      // But for simple auth, client-side persistence is usually fine
    }
  )
);
