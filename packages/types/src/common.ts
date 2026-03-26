export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
  timestamp: string;
  requestId: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export type Theme = 'light' | 'dark' | 'system';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  variant?: string;
  metadata?: Record<string, unknown>;
}

/** Region information resolved at the edge via Next.js middleware */
export interface GeoContext {
  country: string;
  region: string;
  city: string;
  currency: string;
  language: string;
}
