import { useQuery } from '@tanstack/react-query';

import type { Product, ProductListResponse, ProductFilters, ApiResponse } from '@platform/types';

import { apiClient } from '../client';

export function useProducts(filters?: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: ({ signal }) => {
      const params: Record<string, string> = {};
      if (filters?.category) params.category = filters.category;
      if (filters?.minPrice !== undefined) params.minPrice = String(filters.minPrice);
      if (filters?.maxPrice !== undefined) params.maxPrice = String(filters.maxPrice);
      if (filters?.search) params.search = filters.search;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.inStock !== undefined) params.inStock = String(filters.inStock);

      return apiClient.get<ApiResponse<ProductListResponse>>('/products', params, signal);
    },
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: ({ signal }) =>
      apiClient.get<ApiResponse<Product>>(`/products/${slug}`, undefined, signal),
    enabled: !!slug,
  });
}
