# Platform Documentation

Detailed technical documentation for every technology, library, and skill implemented in this microfrontend platform.

Each document explains **how** the technology is implemented, **why** specific decisions were made, and **how it communicates** with other parts of the stack.

## Architecture & Patterns

| #  | Document                                                    | Technology           |
| -- | ----------------------------------------------------------- | -------------------- |
| 01 | [Microfrontend Architecture](01-microfrontend-architecture.md) | MFE Composition   |
| 02 | [Next.js 15 (App Router)](02-nextjs-app-router.md)          | Framework            |
| 03 | [TypeScript (Strict)](03-typescript.md)                      | Type System          |
| 04 | [Turborepo](04-turborepo.md)                                | Monorepo Build       |
| 19 | [React 19](19-react.md)                                     | UI Library           |

## State & Communication

| #  | Document                                                    | Technology           |
| -- | ----------------------------------------------------------- | -------------------- |
| 05 | [Event Bus](05-event-bus.md)                                | Cross-MFE Pub/Sub    |
| 06 | [Zustand](06-zustand-state-management.md)                   | State Management     |
| 07 | [TanStack React Query](07-tanstack-react-query.md)          | Data Fetching        |

## UI & Styling

| #  | Document                                                    | Technology           |
| -- | ----------------------------------------------------------- | -------------------- |
| 08 | [Tailwind CSS](08-tailwind-css.md)                          | Styling & Theming    |
| 10 | [UI Component Library](10-ui-component-library.md)          | Design System        |
| 20 | [Utilities Package](20-utilities.md)                        | Shared Helpers       |

## Auth & Security

| #  | Document                                                    | Technology           |
| -- | ----------------------------------------------------------- | -------------------- |
| 09 | [JWT Authentication](09-jwt-authentication.md)              | Auth + Security      |

## Testing & Quality

| #  | Document                                                    | Technology           |
| -- | ----------------------------------------------------------- | -------------------- |
| 11 | [Testing Strategy](11-testing.md)                           | Jest + Playwright + Chromatic |
| 18 | [ESLint & Prettier](18-eslint-prettier.md)                  | Code Quality         |

## DevOps & Infrastructure

| #  | Document                                                    | Technology           |
| -- | ----------------------------------------------------------- | -------------------- |
| 12 | [Docker](12-docker.md)                                      | Containerization     |
| 13 | [Kubernetes](13-kubernetes.md)                               | Orchestration        |
| 14 | [Terraform](14-terraform.md)                                | Infrastructure as Code |
| 15 | [GitHub Actions](15-github-actions-ci-cd.md)                | CI/CD Pipeline       |

## Features

| #  | Document                                                    | Technology           |
| -- | ----------------------------------------------------------- | -------------------- |
| 16 | [Feature Flags & A/B Testing](16-feature-flags.md)          | Experiments          |
| 17 | [Observability](17-observability.md)                        | Monitoring & Logging |

## Cross-Technology Communication Map

```
┌──────────────┐     imports        ┌──────────────┐
│  TypeScript   │ ◀────────────── │  All Packages  │
│  (@platform/  │   type safety     │  & Apps        │
│   types)      │                   └───────┬────────┘
└──────────────┘                            │
                                            │ uses
┌──────────────┐     pub/sub        ┌───────▼────────┐
│  Event Bus    │ ◀──────────────  │  Zustand Stores │
│  (globalThis) │   domain events   │  (shared-state) │
└──────┬───────┘                   └───────┬────────┘
       │ listened by                       │ read by
       ▼                                   ▼
┌──────────────┐     renders        ┌──────────────┐
│  React        │ ◀──────────────  │  Next.js       │
│  Components   │   App Router      │  (host-shell)  │
└──────┬───────┘                   └───────┬────────┘
       │ styled by                         │ middleware
       ▼                                   ▼
┌──────────────┐                   ┌──────────────┐
│  Tailwind CSS │                   │  JWT Auth     │
│  (class-based │                   │  (jose +      │
│   dark mode)  │                   │   cookies)    │
└──────────────┘                   └──────────────┘

Build & Deploy:
Turborepo → GitHub Actions → Docker → ECR → Kubernetes
                                      ↑
                               Terraform (IaC)
```
