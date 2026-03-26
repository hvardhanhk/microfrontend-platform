import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { Cart, AddToCartPayload, ApiResponse } from '@platform/types';
import { useCartStore } from '@platform/shared-state';

import { apiClient } from '../client';

export function useCart() {
  const setCart = useCartStore((s) => s.setCart);

  return useQuery({
    queryKey: ['cart'],
    queryFn: async ({ signal }) => {
      const response = await apiClient.get<ApiResponse<Cart>>('/cart', undefined, signal);
      setCart(response.data);
      return response;
    },
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddToCartPayload) =>
      apiClient.post<ApiResponse<Cart>>('/cart/items', payload),
    onSuccess: (response) => {
      queryClient.setQueryData(['cart'], response);
    },
  });
}

export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) =>
      apiClient.delete<ApiResponse<Cart>>(`/cart/items/${itemId}`),
    onSuccess: (response) => {
      queryClient.setQueryData(['cart'], response);
    },
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      apiClient.put<ApiResponse<Cart>>(`/cart/items/${itemId}`, { quantity }),
    onSuccess: (response) => {
      queryClient.setQueryData(['cart'], response);
    },
  });
}
