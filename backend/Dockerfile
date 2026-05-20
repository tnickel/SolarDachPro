# ================================
# Stage 1: Build
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci

# Copy prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and build
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ================================
# Stage 2: Production
# ================================
FROM node:20-alpine AS production

WORKDIR /app

# Security: run as non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 appuser

# Install production dependencies only
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy prisma schema and generated client
COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy compiled code
COPY --from=builder /app/dist ./dist

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start with migrations
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
