import { useMutation, useQueryClient } from '@tanstack/react-query';

import type {
  LoginCredentials,
  RegisterData,
  User,
  AuthTokens,
  ApiResponse,
} from '@platform/types';
import { useAuthStore } from '@platform/shared-state';

import { apiClient } from '../client';

export function useLogin() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (credentials: LoginCredentials) =>
      apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
        '/auth/login',
        credentials,
      ),
    onSuccess: (response) => {
      login(response.data.user, response.data.tokens);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);

  return useMutation({
    mutationFn: (data: RegisterData) =>
      apiClient.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
        '/auth/register',
        data,
      ),
    onSuccess: (response) => {
      login(response.data.user, response.data.tokens);
    },
  });
}
