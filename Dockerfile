# ================================
# NeuroGenesis AI — Docker Build
# ================================

FROM node:20-alpine AS base
WORKDIR /app

# Install dependencies (includes tsx which is now a runtime dependency)
FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --frozen-lockfile

# Build frontend — accepts Vite build-time env vars as build args
# VITE_ prefixed vars are safe to bake into the client bundle (public keys only)
FROM deps AS builder
ARG VITE_CLERK_PUBLISHABLE_KEY
ARG VITE_API_BASE_URL=https://neurogenesis-ai.onrender.com
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
# Remove local .env — secrets come from the platform (Render env vars), not the image
RUN rm -f .env
RUN npm run build

# Production runtime — minimal, non-root
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Copy only what's needed at runtime
COPY --from=builder --chown=appuser:nodejs /app/dist ./dist
COPY --from=builder --chown=appuser:nodejs /app/server ./server
COPY --from=deps   --chown=appuser:nodejs /app/node_modules ./node_modules
COPY --chown=appuser:nodejs package.json ./

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["npm", "start"]
