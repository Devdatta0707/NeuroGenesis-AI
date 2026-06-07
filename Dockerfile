# ================================
# NeuroGenesis AI — Docker Build
# ================================

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies only
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile --ignore-scripts

# Build frontend
FROM deps AS builder
COPY . .
# Remove any local .env to prevent baking secrets into the image
RUN rm -f .env
RUN npm run build

# Production runtime — minimal, non-root
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy only what's needed — never copy .env files
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/server ./server
COPY --from=deps --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --chown=appuser:nodejs package.json ./
COPY --chown=appuser:nodejs .env.example ./

# Drop to non-root user
USER appuser

EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "--import", "tsx/esm", "server/index.ts"]
