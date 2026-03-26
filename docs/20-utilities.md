# Utilities Package (@platform/utils)

## Overview

The `@platform/utils` package provides shared utility functions used across all applications and packages: class merging, formatting, timing helpers, string utilities, environment detection, structured logging, and Core Web Vitals reporting.

## Utilities

### cn() — Class Merging

**File:** `packages/utils/src/cn.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

Combines `clsx` (conditional class joining) with `tailwind-merge` (Tailwind conflict resolution). Used by all 20 UI components.

```typescript
cn("px-4 py-2", isActive && "bg-blue-500", className);
// If className = "px-6", result: "py-2 bg-blue-500 px-6" (px-4 resolved to px-6)
```

### Formatting

**File:** `packages/utils/src/format.ts`

| Function           | Input           | Output         | Usage                      |
| ------------------ | --------------- | -------------- | -------------------------- |
| `formatCurrency()` | `79.99`         | `$79.99`       | Product prices, cart totals |
| `formatDate()`     | `'2025-03-20'`  | `Mar 20, 2025` | Order dates                |
| `formatNumber()`   | `1234567`       | `1,234,567`    | Statistics                 |

### Timing

**File:** `packages/utils/src/timing.ts`

| Function      | Purpose                                     |
| ------------- | ------------------------------------------- |
| `debounce()`  | Delay execution until input stops (search)  |
| `throttle()`  | Limit execution rate (scroll, resize)       |

### String Utilities

**File:** `packages/utils/src/string.ts`

| Function       | Purpose                                  |
| -------------- | ---------------------------------------- |
| `generateId()` | Generate unique IDs                      |
| `slugify()`    | Convert "Hello World" → "hello-world"    |
| `truncate()`   | Truncate text with ellipsis              |

### Environment Detection

**File:** `packages/utils/src/env.ts`

```typescript
export const isServer = typeof window === "undefined";
export const isBrowser = !isServer;
```

Used for SSR guards in Zustand stores and other browser-only code.

### Structured Logger

**File:** `packages/utils/src/logger.ts`

See [Observability docs](17-observability.md) for full details.

### Web Vitals

**File:** `packages/utils/src/web-vitals.ts`

See [Observability docs](17-observability.md) for full details.

## Communication with Other Technologies

| Technology    | How Utils Interacts                                         |
| ------------- | ----------------------------------------------------------- |
| UI Components | `cn()` used in every component for class composition        |
| Tailwind CSS  | `tailwind-merge` resolves Tailwind class conflicts          |
| Cart/Products | `formatCurrency()` displays prices; `formatDate()` for orders |
| Zustand       | `isServer` guard prevents localStorage access during SSR    |
| Observability | Logger + Web Vitals provide monitoring utilities            |

## Key Files

| File                                | Purpose                       |
| ----------------------------------- | ----------------------------- |
| `packages/utils/src/cn.ts`         | Class merging (clsx + twMerge) |
| `packages/utils/src/format.ts`     | Currency, date, number formatting |
| `packages/utils/src/timing.ts`     | Debounce, throttle            |
| `packages/utils/src/string.ts`     | generateId, slugify, truncate |
| `packages/utils/src/env.ts`        | isServer, isBrowser           |
| `packages/utils/src/logger.ts`     | Structured JSON logger        |
| `packages/utils/src/web-vitals.ts` | Core Web Vitals reporting     |
