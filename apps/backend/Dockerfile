# Multi-stage Dockerfile for Railway deployment
# NOTE: Production stage MUST be the final stage (Docker builds last stage by default)

# ─────────────────────────────────────────
# Stage 1: Build
# ─────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install system dependencies for Prisma
RUN apk add --no-cache openssl

# Copy prisma schema first (needed for postinstall)
COPY prisma ./prisma

# Install dependencies (npm install because package-lock.json may not be in git)
COPY package*.json ./
RUN npm install && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript (emits JS even if there are type errors)
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Development (optional, for local dev)
# ─────────────────────────────────────────
FROM node:20-alpine AS development

WORKDIR /app

RUN apk add --no-cache openssl

COPY prisma ./prisma
COPY package*.json ./
RUN npm install
RUN npx prisma generate
COPY . .

EXPOSE 3000
CMD ["npm", "run", "dev"]

# ─────────────────────────────────────────
# Stage 3: Production (MUST be final stage for Railway)
# ─────────────────────────────────────────
FROM node:20-alpine AS production

# Install system dependencies for Prisma
RUN apk add --no-cache openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

# Set permissions
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3000

# Health check (uses the container's own port)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('https://frames41-production.up.railway.app/api/v1/health', (r) => r.statusCode === 200 ? process.exit(0) : process.exit(1))"

# Start application
CMD ["node", "dist/src/server.js"]
