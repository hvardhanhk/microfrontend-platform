# Turborepo (Monorepo Build Orchestration)

## Overview

**Turborepo** orchestrates builds, linting, and testing across the monorepo's 4 applications and 7 packages. It provides task dependency resolution, parallel execution, and caching.

## Configuration

**File:** `turbo.json`

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Task Graph

```
         ┌──────────┐
         │  build    │ ← depends on ^build (all dependencies first)
         └────┬─────┘
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
@platform/ @platform/ @platform/
   ui        types      utils     ... (packages build first)
    │         │          │
    └─────────┼──────────┘
              │
    ┌─────────┼──────────┐
    ▼         ▼          ▼
host-shell mfe-products mfe-cart  ... (apps build after packages)
```

### Key Settings Explained

| Setting            | Value            | Purpose                                           |
| ------------------ | ---------------- | ------------------------------------------------- |
| `^build`           | Dependency prefix | Build all package dependencies before the current |
| `outputs`          | `.next/**`, `dist/**` | Cache these build artifacts                  |
| `!.next/cache/**`  | Exclude          | Don't cache Next.js internal cache                |
| `globalDependencies` | `**/.env.*local` | Invalidate all caches when env files change     |
| `cache: false`     | On `dev`/`clean` | Don't cache development server or clean tasks     |
| `persistent: true` | On `dev`         | Keep the dev server running                       |

## Workspace Structure

**File:** `package.json` (root)

```json
{
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test",
    "clean": "turbo clean && rm -rf node_modules"
  }
}
```

### Packages (Build Order: First)

| Package             | Purpose                             | Consumed By            |
| ------------------- | ----------------------------------- | ---------------------- |
| `@platform/types`   | Shared TypeScript definitions       | All packages and apps  |
| `@platform/utils`   | Utility functions (cn, format, log) | All packages and apps  |
| `@platform/event-bus` | Cross-MFE pub/sub messaging       | All apps               |
| `@platform/shared-state` | Zustand stores                 | All apps               |
| `@platform/auth`    | JWT + AuthProvider                  | host-shell             |
| `@platform/api-client` | HTTP client + React Query hooks  | All apps               |
| `@platform/ui`      | 20 React components                | All apps               |
| `@platform/config`  | ESLint, Tailwind, TS, Jest configs  | All packages and apps  |

### Apps (Build Order: After Packages)

| App              | Port | Purpose              |
| ---------------- | ---- | -------------------- |
| `host-shell`     | 3000 | Main container       |
| `mfe-products`   | 3001 | Product catalog      |
| `mfe-cart`       | 3002 | Shopping cart         |
| `mfe-user`       | 3003 | User dashboard        |

## Commands

```bash
# Run all apps in development
npm run dev

# Build everything (respects dependency graph)
npm run build

# Build a specific app (and its dependencies)
npx turbo build --filter=@platform/host-shell

# Lint all packages
npm run lint

# Run all tests
npm run test

# Clean all build artifacts
npm run clean
```

## Communication with Other Technologies

| Technology      | How Turborepo Interacts                                             |
| --------------- | ------------------------------------------------------------------- |
| Next.js         | `turbo build` triggers `next build` for each app in dependency order |
| TypeScript      | Package builds produce `.d.ts` files consumed by dependent packages |
| GitHub Actions  | CI runs `npm run build` which invokes `turbo build`                 |
| Docker          | Dockerfile runs `npx turbo build --filter=@platform/${APP_NAME}`    |
| npm workspaces  | Turborepo uses npm workspaces for package resolution                |

## Key Files

| File                | Purpose                            |
| ------------------- | ---------------------------------- |
| `turbo.json`        | Task graph configuration           |
| `package.json`      | Workspace definition + scripts     |
