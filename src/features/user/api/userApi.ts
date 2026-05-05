import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/lib/apiClient';
import { mapFullUser } from '@/shared/lib/mapUser';
import { User } from '@/entities/user/model/user.model';
import {
  GetMeResponse,
  UserListResponse,
  UpdateUserRequest,
  UpdateStatusRequest
} from '@/shared/api/contracts/user.contract';

export function useMe() {
  return useQuery<User>({
    queryKey: ['me'],
    queryFn: () => apiClient<GetMeResponse>('/me').then(res => mapFullUser(res.data)),
  });
}

export function useUserDetail(id: number) {
  return useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => apiClient<any>(`/users/${id}`).then(res => mapFullUser(res.data)),
    enabled: !!id,
  });
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ['users'],
    queryFn: () => apiClient<UserListResponse>('/users').then(res => res.data.map(mapFullUser)),
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; data: UpdateUserRequest }>({
    mutationFn: ({ id, data }) =>
      apiClient<void>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id) =>
      apiClient<void>(`/users/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id: number; status: string }>({
    mutationFn: ({ id, status }) =>
      apiClient<void>(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['users', id] });
    },
  });
}
