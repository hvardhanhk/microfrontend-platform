# TypeScript (Strict Mode)

## Overview

The entire platform is written in **TypeScript** with **strict mode** enabled. A centralized types package (`@platform/types`) provides shared type definitions consumed by all apps and packages, ensuring compile-time safety across MFE boundaries.

## Configuration

**File:** `tsconfig.base.json` (root — all packages extend this)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### Key Compiler Options Explained

| Option             | Value       | Why                                                                      |
| ------------------ | ----------- | ------------------------------------------------------------------------ |
| `strict`           | `true`      | Enables all strict type-checking (noImplicitAny, strictNullChecks, etc.) |
| `target`           | `ES2022`    | Modern JS features (top-level await, class fields)                       |
| `moduleResolution` | `bundler`   | Node.js 16+ resolution — supports package.json `exports`                 |
| `isolatedModules`  | `true`      | Each file transpilable independently (required for SWC/esbuild)          |
| `noEmit`           | `true`      | TypeScript only type-checks; bundler (Next.js/SWC) handles emit          |
| `declaration`      | `true`      | Generates `.d.ts` files for package consumers                            |
| `declarationMap`   | `true`      | Source maps for declarations — enables "Go to Definition" in IDE         |
| `jsx`              | `react-jsx` | Automatic JSX transform (no `import React` needed)                       |

## Centralized Type System

**Package:** `packages/types/src/`

### Type Files

| File         | Types Defined                                                     |
| ------------ | ----------------------------------------------------------------- |
| `events.ts`  | `EventMap`, `EventName`, `EventPayload<E>` — event bus registry   |
| `user.ts`    | `User`, `AuthTokens`, `LoginCredentials`, `AuthState`             |
| `cart.ts`    | `Cart`, `CartItem`, `AddToCartPayload`, `CartState`               |
| `product.ts` | `Product`, `ProductVariant`, `ProductCategory`, `ProductFilters`  |
| `api.ts`     | `RequestConfig`, `ApiError`, `ApiEndpoints`, `DEFAULT_API_CONFIG` |
| `common.ts`  | `PaginatedResponse<T>`, `Theme`, `FeatureFlag`, `GeoContext`      |

### EventMap — Type-Safe Cross-MFE Events

The `EventMap` interface is the backbone of type-safe cross-MFE communication:

```typescript
export interface EventMap {
  // Auth events
  'auth:login': { user: User };
  'auth:logout': undefined;
  'auth:token-refreshed': { expiresAt: number };

  // Cart events
  'cart:item-added': { item: CartItem };
  'cart:item-removed': { itemId: string };
  'cart:count-changed': { count: number };

  // Product events
  'product:add-to-cart': AddToCartPayload;
  'product:viewed': { productId: string };

  // Theme / Feature / Notification events
  'theme:changed': { theme: 'light' | 'dark' | 'system' };
  'feature:flag-updated': { name: string; enabled: boolean };
  'notification:show': { type: 'success' | 'error'; message: string };
}

export type EventName = keyof EventMap;
export type EventPayload<E extends EventName> = EventMap[E];
```

If any MFE publishes an event with the wrong payload shape, TypeScript catches it at **compile time**.

### Generics for API Responses

```typescript
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
```

## ESLint Type Rules

**File:** `packages/config/eslint/next.js`

```javascript
rules: {
  '@typescript-eslint/consistent-type-imports': 'error',  // Forces `import type {}`
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  '@typescript-eslint/no-explicit-any': 'warn',
}
```

`consistent-type-imports` ensures type imports use `import type {}` syntax, allowing bundlers to tree-shake types from the output.

## Communication with Other Technologies

| Technology     | How TypeScript Interacts                                                |
| -------------- | ----------------------------------------------------------------------- |
| Event Bus      | `EventMap` enforces payload types at compile time for publish/subscribe |
| Zustand        | Store types are inferred from the `create<State & Actions>()` signature |
| Next.js        | Compiled by SWC (not tsc) — `noEmit: true` means tsc only type-checks   |
| Jest           | `@swc/jest` handles TypeScript compilation during test runs             |
| TanStack Query | Generic hooks: `useQuery<Product[]>` ensures response type safety       |
| API Client     | `ApiClient.get<T>()` returns typed responses                            |

## Key Files

| File                             | Purpose                              |
| -------------------------------- | ------------------------------------ |
| `tsconfig.base.json`             | Root config extended by all packages |
| `packages/types/src/events.ts`   | EventMap type registry               |
| `packages/types/src/cart.ts`     | Cart domain types                    |
| `packages/types/src/product.ts`  | Product domain types                 |
| `packages/types/src/user.ts`     | User/auth domain types               |
| `packages/types/src/api.ts`      | API client types                     |
| `packages/config/eslint/next.js` | TypeScript lint rules                |
