# Platform — Enterprise Microfrontend Architecture

Production-grade microfrontend platform built with Next.js App Router, Turborepo, and TypeScript.

## Architecture

```
                    CloudFront CDN
           (Edge caching + SSL termination)
                        |
              Next.js Edge Middleware
         (Auth check, geo personalization)
                        |
    +----------+  +-----------+  +--------+  +--------+
    |host-shell|  |mfe-products|  |mfe-cart|  |mfe-user|
    |  :3000   |  |   :3001   |  | :3002  |  | :3003  |
    +----+-----+  +-----+-----+  +---+----+  +---+----+
         |              |             |           |
    +----+--------------+-------------+-----------+----+
    |              Shared Packages Layer                |
    |  @platform/ui | event-bus | utils | types        |
    +--------------------------------------------------+
```

### Why App Router Composition over Module Federation

| Aspect | Module Federation | App Router Composition |
|--------|------------------|----------------------|
| SSR/SSG | Complex, limited | Native Next.js support |
| Bundle optimization | Manual shared deps | Automatic tree-shaking |
| Type safety | Runtime-only | Compile-time via monorepo |
| DX | Webpack config heavy | Standard Next.js |

We chose App Router composition because it provides SSR-first rendering, compile-time type safety, and simpler DX. The tradeoff is that MFEs share a deployment artifact in the host shell. For teams needing runtime independence, Module Federation can be added via `@module-federation/nextjs-mf`.

### Cross-MFE Communication

1. **Event Bus** (`@platform/event-bus`) — Type-safe pub/sub for cart updates, auth changes, notifications
2. **Shared State** (Zustand stores) — For state multiple MFEs read: auth, cart, theme, feature flags
3. **URL/Props** — Standard Next.js routing + React props through the host layout

## Project Structure

```
microfrontend-platform/
├── apps/
│   ├── host-shell/          # Main container (port 3000)
│   ├── mfe-products/        # Product catalog (port 3001)
│   ├── mfe-cart/            # Shopping cart (port 3002)
│   └── mfe-user/            # User dashboard (port 3003)
├── packages/
│   ├── ui/                  # 20 shared components + Storybook
│   ├── event-bus/           # Type-safe pub/sub
│   ├── utils/               # Formatting, logging, cn()
│   ├── types/               # Shared TypeScript types
│   └── config/              # ESLint, Tailwind, TSConfig
├── infra/
│   ├── docker/              # Multi-stage Dockerfiles
│   ├── k8s/                 # Kubernetes manifests
│   └── terraform/           # AWS infra (ECR, EKS, CloudFront, S3)
└── .github/workflows/       # CI/CD pipelines
```

## Quick Start

```bash
# Prerequisites: Node.js 20+
npm install
npm run dev        # Start all apps
npm run storybook  # Launch Storybook
```

| App | URL |
|-----|-----|
| Host Shell | http://localhost:3000 |
| Products MFE | http://localhost:3001 |
| Cart MFE | http://localhost:3002 |
| User MFE | http://localhost:3003 |
| Storybook | http://localhost:6006 |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + CSS variables for theming
- **State**: Zustand (cross-MFE shared stores)
- **Data Fetching**: TanStack Query
- **Monorepo**: Turborepo
- **UI Library**: 20 components with Storybook + Chromatic
- **Auth**: JWT + secure cookies + edge middleware
- **CI/CD**: GitHub Actions -> Docker -> AWS ECR -> EKS
- **CDN**: CloudFront
- **IaC**: Terraform

## Design System (20 Components)

Button, Input, Modal, Card, Table, Tabs, Dropdown, Toast, Tooltip, Avatar, Badge, Spinner, Skeleton, Pagination, Form, Navbar, Sidebar, Accordion, Switch, Dialog

All components support dark/light theming, ARIA accessibility, and are tree-shakeable.

## Scaling Strategy (10M+ Users)

- **Edge**: CloudFront CDN + Next.js Edge Middleware for auth/geo at the edge
- **App**: Kubernetes HPA, ISR for product pages, dynamic imports for code splitting
- **Data**: TanStack Query with stale-while-revalidate, bounded event bus history
- **Observability**: Structured JSON logging, Core Web Vitals reporting (LCP, CLS, INP)

## Commands

```bash
npm run dev          # Start all apps
npm run build        # Build all apps
npm run lint         # Lint all packages
npm run test         # Run all tests
npm run format       # Format all files
npm run storybook    # Launch Storybook
npm run clean        # Clean all build artifacts
```
