# Multi-stage build optimized for Next.js standalone output.
# Usage: docker build --build-arg APP_NAME=host-shell -f infra/docker/Dockerfile.app .

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/ ./apps/
COPY packages/ ./packages/
RUN npm ci

FROM base AS builder
ARG APP_NAME=host-shell
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx turbo build --filter=@platform/${APP_NAME}

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
