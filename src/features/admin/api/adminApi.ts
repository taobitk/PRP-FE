import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { 
  RegisterRequest, 
  RegisterResponse, 
  ResetPasswordRequest, 
  ResetPasswordResponse 
} from '@/shared/api/contracts/admin.contract';

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation<RegisterResponse, Error, RegisterRequest>({
    mutationFn: (data) =>
      apiClient<RegisterResponse>('/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useResetPassword() {
  return useMutation<ResetPasswordResponse, Error, ResetPasswordRequest>({
    mutationFn: (data) =>
      apiClient<ResetPasswordResponse>('/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  });
}
