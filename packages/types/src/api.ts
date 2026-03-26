export interface RequestConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
  retries: number;
  retryDelay: number;
}

export interface ApiEndpoints {
  products: string;
  cart: string;
  auth: string;
  users: string;
}

export const DEFAULT_API_CONFIG: RequestConfig = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
  retries: 3,
  retryDelay: 1_000,
};

export const API_ENDPOINTS: ApiEndpoints = {
  products: '/products',
  cart: '/cart',
  auth: '/auth',
  users: '/users',
};
