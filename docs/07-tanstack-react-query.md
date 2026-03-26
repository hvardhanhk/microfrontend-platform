# TanStack React Query (Data Fetching)

## Overview

**TanStack React Query** manages server state — API data fetching, caching, synchronization, and background updates. It wraps the custom `ApiClient` class to provide React hooks with stale-while-revalidate caching semantics.

## Configuration

**File:** `packages/api-client/src/query-provider.tsx`

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,        // Data fresh for 60 seconds
      gcTime: 5 * 60 * 1000,       // Garbage collect after 5 minutes
      retry: 1,                     // Retry once on failure
      refetchOnWindowFocus: false,  // No surprise refetches
    },
    mutations: {
      retry: 0,                     // Don't retry mutations
    },
  },
});
```

### Caching Strategy

```
Request ──▶ Cache Hit? ──Yes──▶ Return cached (if not stale)
                │                         │
                No                   Is it stale?
                │                    (> 60 seconds)
                ▼                         │
          Fetch from API            Yes: Refetch in background
                │                    No: Return as-is
                ▼
          Cache response
          (keep for 5 min)
```

## API Client

**File:** `packages/api-client/src/client.ts`

The `ApiClient` class is **framework-agnostic** — it doesn't depend on React:

```typescript
class ApiClient {
  // Auto-injects auth token from Zustand store
  private getAuthHeaders(): Record<string, string> {
    const tokens = useAuthStore.getState().tokens;
    if (tokens?.accessToken) {
      return { Authorization: `Bearer ${tokens.accessToken}` };
    }
    return {};
  }

  // Retry with exponential backoff
  private async request<T>(method, path, options): Promise<T> {
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: { ...this.config.headers, ...this.getAuthHeaders() },
          signal: AbortSignal.timeout(this.config.timeout),
          credentials: "include",
        });
        // ...
      } catch (error) {
        // Don't retry 4xx (client errors)
        if (error instanceof ApiClientError && error.status < 500) throw error;
        // Exponential backoff: 1s → 2s → 4s
        await new Promise((r) =>
          setTimeout(r, this.config.retryDelay * 2 ** attempt)
        );
      }
    }
  }
}
```

### Resilience Patterns

| Pattern              | Implementation                                    |
| -------------------- | ------------------------------------------------- |
| Auto token injection | Reads from `useAuthStore.getState()` per request  |
| Exponential backoff  | `retryDelay * 2^attempt` (1s, 2s, 4s)            |
| Client error bypass  | 4xx errors skip retry (only 5xx retries)          |
| Timeout              | `AbortSignal.timeout(config.timeout)` (10s)       |
| Credentials          | `'include'` for cross-origin cookie sharing       |
| Structured errors    | `ApiClientError` wraps `ApiError` + status code   |

## React Query Hooks

**File:** `packages/api-client/src/hooks/`

| Hook                | Type     | Endpoint          | Notes                                |
| ------------------- | -------- | ----------------- | ------------------------------------ |
| `useProducts`       | Query    | `/products`       | Filters passed as query params       |
| `useProduct`        | Query    | `/products/:slug` | Single product by slug               |
| `useCart`           | Query    | `/cart`           | Syncs response to useCartStore       |
| `useAddToCart`      | Mutation | `/cart/items`     | Optimistic update                    |
| `useRemoveFromCart` | Mutation | `/cart/items/:id` | Invalidates cart query on success    |
| `useUpdateCartItem` | Mutation | `/cart/items/:id` | Updates quantity                     |
| `useLogin`          | Mutation | `/auth/login`     | Updates useAuthStore on success      |
| `useLogout`         | Mutation | `/auth/logout`    | Clears query cache on success        |
| `useRegister`       | Mutation | `/auth/register`  | Returns user data                    |

## Provider Integration

The `QueryClientProvider` is mounted in the host shell's provider tree:

```typescript
// apps/host-shell/src/components/providers.tsx
export function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({ /* ... */ }));

  return (
    <ThemeProvider defaultTheme="light">
      <QueryClientProvider client={queryClient}>
        <ToastProvider>{children}</ToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

## Communication with Other Technologies

| Technology   | How React Query Interacts                                         |
| ------------ | ----------------------------------------------------------------- |
| Zustand      | Auth store provides tokens; cart hooks sync to cart store          |
| API Client   | React Query hooks wrap `apiClient.get/post/put/delete`            |
| TypeScript   | Hooks use generics: `useQuery<Product[]>` for typed responses     |
| Next.js      | QueryClientProvider mounted in client-side provider tree          |

## Key Files

| File                                        | Purpose                       |
| ------------------------------------------- | ----------------------------- |
| `packages/api-client/src/client.ts`         | Framework-agnostic HTTP client |
| `packages/api-client/src/query-provider.tsx` | React Query provider config  |
| `packages/api-client/src/hooks/`            | React Query hooks             |
