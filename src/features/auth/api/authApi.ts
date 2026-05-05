import { useMutation } from '@tanstack/react-query';
import { apiClient, ApiError } from '@/shared/lib/apiClient';
import { LoginRequest, LoginResponse, ChangePasswordRequest } from '@/shared/api/contracts/auth.contract';
import { useAuthStore } from '../model/authStore';
import { mapUser } from '@/shared/lib/mapUser';

export function useLogin() {
  const setCredentials = useAuthStore((state) => state.setCredentials);

  return useMutation<LoginResponse, ApiError, LoginRequest>({
    mutationFn: (credentials) =>
      apiClient<LoginResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (res) => {
      const { access_token, user } = res.data;
      setCredentials(access_token, mapUser(user));
    },
  });
}

export function useChangePassword() {
  return useMutation<{ message: string }, ApiError, ChangePasswordRequest>({
    mutationFn: (data) =>
      apiClient<{ message: string }>('/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}
