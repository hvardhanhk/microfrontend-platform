# Docker (Containerization)

## Overview

Each application is containerized using a **multi-stage Docker build** optimized for Next.js standalone output. Docker Compose orchestrates all four services for local development and integration testing.

## Multi-Stage Dockerfile

**File:** `infra/docker/Dockerfile.app`

```dockerfile
# Stage 1: Base — Alpine with native dependencies
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

# Stage 2: Dependencies — install all npm packages
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/ ./apps/
COPY packages/ ./packages/
RUN npm ci

# Stage 3: Builder — compile the target app
FROM base AS builder
ARG APP_NAME=host-shell
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx turbo build --filter=@platform/${APP_NAME}

# Stage 4: Runner — minimal production image
FROM base AS runner
ARG APP_NAME=host-shell
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/${APP_NAME}/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/${APP_NAME}/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

### Stage Breakdown

| Stage    | Purpose                     | What Stays in Final Image |
| -------- | --------------------------- | ------------------------- |
| `base`   | Alpine + libc6-compat       | Base layer                |
| `deps`   | `npm ci` (all dependencies) | Nothing (discarded)       |
| `builder`| Turbo build                 | Nothing (discarded)       |
| `runner` | Production runtime          | Standalone output only    |

### Key Optimizations

| Optimization                | Benefit                                            |
| --------------------------- | -------------------------------------------------- |
| Multi-stage build           | Final image only contains standalone output (~150MB)|
| `npm ci` in deps stage      | Cached unless `package-lock.json` changes          |
| Non-root user (nextjs:1001) | Security: container runs without root privileges    |
| `NEXT_TELEMETRY_DISABLED`   | No telemetry in builds or runtime                  |
| Next.js standalone output   | Self-contained `server.js` — no `node_modules`     |
| Alpine base                 | Minimal OS layer (~5MB)                            |

### Build Command

```bash
# Build a specific app
docker build \
  --build-arg APP_NAME=host-shell \
  -f infra/docker/Dockerfile.app \
  -t platform/host-shell:latest \
  .
```

The `APP_NAME` build arg selects which app to build. The same Dockerfile serves all four apps.

## Docker Compose

**File:** `infra/docker/docker-compose.yml`

```yaml
version: "3.8"

services:
  host-shell:
    build:
      context: ../..
      dockerfile: infra/docker/Dockerfile.app
      args:
        APP_NAME: host-shell
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production

  mfe-products:
    build:
      args:
        APP_NAME: mfe-products
    ports:
      - "3001:3000"

  mfe-cart:
    build:
      args:
        APP_NAME: mfe-cart
    ports:
      - "3002:3000"

  mfe-user:
    build:
      args:
        APP_NAME: mfe-user
    ports:
      - "3003:3000"
```

### Port Mapping

| Service       | Container Port | Host Port |
| ------------- | -------------- | --------- |
| host-shell    | 3000           | 3000      |
| mfe-products  | 3000           | 3001      |
| mfe-cart      | 3000           | 3002      |
| mfe-user      | 3000           | 3003      |

### Commands

```bash
# Build and start all services
docker-compose -f infra/docker/docker-compose.yml up --build

# Build specific service
docker-compose -f infra/docker/docker-compose.yml build host-shell

# Stop all services
docker-compose -f infra/docker/docker-compose.yml down
```

## Communication with Other Technologies

| Technology    | How Docker Interacts                                             |
| ------------- | ---------------------------------------------------------------- |
| Turborepo     | Builder stage runs `npx turbo build --filter=@platform/${APP_NAME}` |
| Next.js       | Standalone output mode produces self-contained `server.js`       |
| GitHub Actions| CI builds Docker images in matrix and pushes to ECR              |
| Kubernetes    | K8s deployments pull images from ECR                             |
| AWS ECR       | Container registry stores tagged images                          |

## Key Files

| File                               | Purpose                        |
| ---------------------------------- | ------------------------------ |
| `infra/docker/Dockerfile.app`      | Multi-stage build for all apps |
| `infra/docker/docker-compose.yml`  | Local multi-service orchestration |
