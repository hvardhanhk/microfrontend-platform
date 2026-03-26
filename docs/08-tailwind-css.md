# Tailwind CSS (Styling & Theming)

## Overview

**Tailwind CSS** provides utility-first styling across all applications and the shared UI component library. A centralized configuration ensures visual consistency, and the class-based dark mode strategy enables programmatic theme toggling.

## Configuration

**File:** `packages/config/tailwind/tailwind.config.ts`

```typescript
const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}", // Include shared UI components
  ],
  darkMode: "class", // Toggle via <html class="dark">
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          // ... full palette
          600: "#2563eb",
          950: "#172554",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
      },
    },
  },
};
```

### Key Design Decisions

| Decision                | Rationale                                                        |
| ----------------------- | ---------------------------------------------------------------- |
| `darkMode: 'class'`    | Programmatic toggle (not OS preference only) via `useThemeStore` |
| Brand palette (blue)    | Accessible contrast ratios at all 11 stops (50–950)             |
| CSS variable font       | `var(--font-inter)` works with Next.js font optimization        |
| Custom animations       | Used by UI library components (Modal, Toast, Dropdown)          |
| Content path includes UI | Ensures Tailwind generates classes used in shared components   |

## Dark Mode Implementation

### CSS Variables

**File:** `packages/ui/src/themes/globals.css`

```css
@layer base {
  :root {
    /* Light mode (default) */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
    --destructive: 0 84.2% 60.2%;
  }
  .dark {
    /* Dark mode */
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
    --destructive: 0 62.8% 30.6%;
  }
}
```

### Theme Toggle Flow

```
User clicks Dark Mode Switch
        │
        ▼
useTheme().setTheme('dark')
        │
        ▼
ThemeProvider updates state
        │
        ▼
document.documentElement.classList.add('dark')
        │
        ▼
Tailwind dark: variants activate globally
(e.g., dark:bg-gray-950, dark:text-white)
```

## Class Merging Utility

**File:** `packages/utils/src/cn.ts`

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

`cn()` is used by every UI component to:
1. **Conditionally apply classes** (via `clsx`)
2. **Resolve Tailwind conflicts** (via `tailwind-merge`) — e.g., `cn('px-4', 'px-2')` → `'px-2'`

### Usage in Components

```typescript
// Button component
className={cn(
  'rounded-lg font-medium transition-colors',
  variant === 'primary' && 'bg-brand-600 text-white hover:bg-brand-700',
  variant === 'outline' && 'border border-gray-300 dark:border-gray-600',
  size === 'sm' && 'h-8 px-3 text-sm',
  className  // Allow consumer overrides
)}
```

## App-Specific Configs

Each app extends the base Tailwind config:

```typescript
// apps/host-shell/tailwind.config.ts
import baseConfig from "@platform/config/tailwind";

export default {
  ...baseConfig,
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};
```

## Communication with Other Technologies

| Technology   | How Tailwind Interacts                                                |
| ------------ | --------------------------------------------------------------------- |
| Next.js      | PostCSS plugin compiles Tailwind during Next.js build                 |
| ThemeProvider | Adds/removes `dark` class on `<html>` → activates `dark:` variants   |
| Zustand      | `useThemeStore` persists theme preference, triggers DOM class toggle   |
| UI Components | All 20 components use `cn()` for class composition                   |
| CSS Variables | Theme colors defined as HSL variables, referenced in Tailwind config  |

## Key Files

| File                                          | Purpose                          |
| --------------------------------------------- | -------------------------------- |
| `packages/config/tailwind/tailwind.config.ts` | Shared Tailwind configuration    |
| `packages/ui/src/themes/globals.css`          | CSS variables (light/dark)       |
| `packages/utils/src/cn.ts`                    | Class merging utility            |
| `apps/host-shell/tailwind.config.ts`          | App-specific content paths       |
