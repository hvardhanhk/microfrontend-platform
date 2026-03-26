import type { RequestConfig, ApiError } from '@platform/types';
import { DEFAULT_API_CONFIG } from '@platform/types';
import { useAuthStore } from '@platform/shared-state';

/**
 * Thin HTTP client with automatic token injection, retry with
 * exponential backoff, and structured error handling.
 * Framework-agnostic — does NOT depend on React.
 */
class ApiClient {
  private config: RequestConfig;

  constructor(config: RequestConfig = DEFAULT_API_CONFIG) {
    this.config = config;
  }

  private getAuthHeaders(): Record<string, string> {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken) {
      return { Authorization: `Bearer ${tokens.accessToken}` };
    }
    return {};
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string>;
      signal?: AbortSignal;
    },
  ): Promise<T> {
    const url = new URL(`${this.config.baseUrl}${path}`);
    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url.toString(), {
          method,
          headers: {
            ...this.config.headers,
            ...this.getAuthHeaders(),
          },
          body: options?.body ? JSON.stringify(options.body) : undefined,
          signal: options?.signal ?? AbortSignal.timeout(this.config.timeout),
          credentials: 'include',
        });

        if (!response.ok) {
          const error = (await response.json().catch(() => ({
            code: 'UNKNOWN',
            message: response.statusText,
            timestamp: new Date().toISOString(),
            requestId: response.headers.get('x-request-id') || '',
          }))) as ApiError;

          // Don't retry client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw new ApiClientError(error, response.status);
          }

          throw new ApiClientError(error, response.status);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry client errors
        if (error instanceof ApiClientError && error.status < 500) throw error;

        // Exponential backoff before retry
        if (attempt < this.config.retries) {
          await new Promise((r) => setTimeout(r, this.config.retryDelay * 2 ** attempt));
        }
      }
    }

    throw lastError ?? new Error('Request failed');
  }

  get<T>(path: string, params?: Record<string, string>, signal?: AbortSignal) {
    return this.request<T>('GET', path, { params, signal });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

export class ApiClientError extends Error {
  constructor(
    public readonly apiError: ApiError,
    public readonly status: number,
  ) {
    super(apiError.message);
    this.name = 'ApiClientError';
  }
}

export const apiClient = new ApiClient();
