# UI Component Library (@platform/ui)

## Overview

A shared design system of **20 React components** built with accessibility, theming, and tree-shakeability in mind. Documented via **Storybook** with **Chromatic** visual regression testing.

## Components

| Component    | Props Highlights                                  | Accessibility          |
| ------------ | ------------------------------------------------- | ---------------------- |
| **Button**   | variant, size, isLoading, disabled                | aria-busy, disabled    |
| **Input**    | label, error, hint, name                          | aria-invalid, htmlFor  |
| **Modal**    | isOpen, onClose, title                            | role="dialog", focus trap |
| **Card**     | CardHeader, CardBody, CardFooter                  | Semantic sections      |
| **Table**    | TableHead, TableBody, TableRow, TableCell         | Semantic table markup  |
| **Tabs**     | defaultIndex, onChange                             | role="tablist/tab/tabpanel" |
| **Dropdown** | trigger, items                                    | role="menu/menuitem"   |
| **Toast**    | ToastProvider, useToast hook                      | role="alert"           |
| **Tooltip**  | content, children                                 | aria-describedby       |
| **Avatar**   | name, size, src                                   | aria-label             |
| **Badge**    | variant (info/success/warning/error/default)      | -                      |
| **Spinner**  | size (sm/md/lg)                                   | aria-busy              |
| **Skeleton** | width, height, rounded                            | aria-hidden            |
| **Pagination** | currentPage, totalPages, onPageChange           | aria-label, aria-current |
| **Form**     | FormField, FormLabel, FormMessage                 | aria-describedby       |
| **Navbar**   | logo, actions, onMenuClick                        | nav role               |
| **Sidebar**  | isOpen, onClose, items                            | Overlay + focus management |
| **Accordion** | AccordionItem with title                         | aria-expanded          |
| **Switch**   | checked, onChange, label                          | role="switch", aria-checked |
| **Dialog**   | open, onClose, title                              | role="dialog"          |

## Design Patterns

### forwardRef

Every component uses `forwardRef` to expose the underlying DOM element:

```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    return <input ref={ref} {...props} />;
  }
);
Input.displayName = "Input";
```

### cn() Class Merging

All components use the `cn()` utility for composable class names:

```typescript
className={cn(
  'flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm',
  'focus:outline-none focus:ring-2 focus:ring-brand-500',
  'dark:bg-gray-900 dark:text-gray-100',
  error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600',
  className  // Consumer can override
)}
```

### Variant Pattern (Button Example)

```typescript
const variantStyles = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 dark:bg-brand-500 dark:hover:bg-brand-600",
  secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-800",
  outline: "border border-gray-300 hover:bg-gray-50 dark:border-gray-600",
  ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  link: "text-brand-600 underline-offset-4 hover:underline",
};
```

### Tree Shaking

```json
// packages/ui/package.json
{
  "sideEffects": false
}
```

Combined with `optimizePackageImports: ['@platform/ui']` in Next.js config, only imported components are included in the bundle.

## Storybook

**File:** `packages/ui/.storybook/main.ts`

```typescript
const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-essentials", // Docs, controls, actions, viewport
    "@storybook/addon-a11y", // Accessibility audit panel
    "@storybook/addon-interactions", // Play function testing
    "@storybook/addon-themes", // Theme switcher
  ],
  framework: { name: "@storybook/nextjs", options: {} },
};
```

### Chromatic Integration

On every PR, the CI pipeline:
1. Builds static Storybook
2. Pushes to Chromatic for pixel-level visual diff testing
3. Flags visual regressions before merge

## ThemeProvider

**File:** `packages/ui/src/themes/theme-provider.tsx`

```typescript
export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    if (theme === "system") {
      setResolvedTheme(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
      );
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);
}
```

## Communication with Other Technologies

| Technology    | How UI Library Interacts                                        |
| ------------- | --------------------------------------------------------------- |
| Tailwind CSS  | All components styled with Tailwind utilities + `cn()`          |
| ThemeProvider  | Toggles `dark` class on `<html>` for dark mode variants         |
| Storybook     | Documents and visually tests all components                     |
| Chromatic     | Visual regression testing on every PR                           |
| Next.js       | `optimizePackageImports` tree-shakes unused components          |
| TypeScript    | All props typed with interfaces, generics for complex components |
| Zustand       | `useToast` hook manages toast state internally                  |

## Key Files

| File                                          | Purpose                    |
| --------------------------------------------- | -------------------------- |
| `packages/ui/src/components/*/`               | Component implementations  |
| `packages/ui/src/themes/theme-provider.tsx`   | ThemeProvider + useTheme   |
| `packages/ui/src/themes/globals.css`          | CSS variables              |
| `packages/ui/.storybook/main.ts`             | Storybook configuration    |
