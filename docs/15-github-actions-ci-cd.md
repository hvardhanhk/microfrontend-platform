# GitHub Actions (CI/CD)

## Overview

A **GitHub Actions** pipeline automates linting, testing, building, visual regression testing, and Docker image publishing on every push and pull request.

## Pipeline Architecture

**File:** `.github/workflows/ci.yml`

```
Push to main / PR opened
         │
         ▼
┌─────────────────────┐
│ lint-test-build      │  ← Runs on every push/PR
│  1. npm ci           │
│  2. ESLint           │
│  3. Prettier check   │
│  4. Jest tests       │
│  5. Turbo build all  │
└────────┬────────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────────┐
│storybook│ │ docker     │  ← Conditional
│(PR only)│ │(main only) │
│         │ │            │
│Build SB │ │Matrix:     │
│Chromatic│ │ host-shell │
│         │ │ products   │
└────────┘ │ cart        │
           │ user        │
           │→ Push ECR   │
           └────────────┘
```

## Jobs

### 1. Lint, Test & Build (Every Push/PR)

```yaml
lint-test-build:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npm run lint # ESLint across all packages
    - run: npm run format:check # Prettier formatting check
    - run: npm run test # Jest unit tests
    - run: npm run build # Turbo build all apps
```

### 2. Storybook & Chromatic (PR Only)

```yaml
storybook:
  needs: lint-test-build
  if: github.event_name == 'pull_request'
  steps:
    - run: npx turbo build-storybook --filter=@platform/ui
    - run: npx chromatic --project-token=${{ secrets.CHROMATIC_PROJECT_TOKEN }}
```

Runs only on PRs — builds Storybook and pushes to Chromatic for visual regression testing.

### 3. Docker Build & Push (Main Only)

```yaml
docker:
  needs: lint-test-build
  if: github.ref == 'refs/heads/main'
  strategy:
    matrix:
      app: [host-shell, mfe-products, mfe-cart, mfe-user]
  steps:
    - uses: aws-actions/configure-aws-credentials@v4
    - uses: aws-actions/amazon-ecr-login@v2
    - run: |
        docker build \
          --build-arg APP_NAME=${{ matrix.app }} \
          -f infra/docker/Dockerfile.app \
          -t ${{ steps.ecr.outputs.registry }}/platform/${{ matrix.app }}:${{ github.sha }} \
          -t ${{ steps.ecr.outputs.registry }}/platform/${{ matrix.app }}:latest \
          .
        docker push --all-tags
```

**Matrix strategy** builds all 4 apps in parallel. Each image gets two tags: `git-sha` (immutable) and `latest` (rolling).

## Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

If a new commit is pushed while a pipeline is running for the same branch, the **old run is cancelled** to save CI minutes.

## Pre-commit Hooks (Local)

**File:** `.husky/` + `package.json`

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{js,jsx,json,md,css}": ["prettier --write"]
  }
}
```

Husky runs lint-staged before every commit locally, catching issues before they hit CI.

### Commit Linting

**File:** `commitlint.config.js`

Uses `@commitlint/config-conventional` to enforce conventional commit messages (e.g., `feat:`, `fix:`, `chore:`).

## Communication with Other Technologies

| Technology | How CI/CD Interacts                                         |
| ---------- | ----------------------------------------------------------- |
| Turborepo  | `npm run build` invokes `turbo build` with dependency graph |
| ESLint     | `npm run lint` runs ESLint across all packages              |
| Prettier   | `npm run format:check` verifies formatting                  |
| Jest       | `npm run test` runs unit tests with coverage                |
| Storybook  | Built and pushed to Chromatic on PRs                        |
| Docker     | Matrix builds 4 images using the shared Dockerfile          |
| AWS ECR    | Docker images pushed with SHA + latest tags                 |
| Husky      | Pre-commit hooks run lint-staged locally                    |
| Commitlint | Enforces conventional commit message format                 |

## Key Files

| File                         | Purpose                        |
| ---------------------------- | ------------------------------ |
| `.github/workflows/ci.yml`   | Full CI/CD pipeline definition |
| `commitlint.config.js`       | Commit message rules           |
| `package.json` (lint-staged) | Pre-commit hook configuration  |
