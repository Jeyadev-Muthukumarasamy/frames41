FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy root package files
COPY package*.json ./

# Copy all app packages
COPY apps/backend/package*.json ./apps/backend/
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/admin/package*.json ./apps/admin/

# Copy source code
COPY apps/backend ./apps/backend
COPY apps/frontend ./apps/frontend
COPY apps/admin ./apps/admin

# Install dependencies
RUN npm ci

# Build frontend first so public/ has the built assets
WORKDIR /app/apps/frontend
RUN npm run build

# Generate prisma client and build backend
WORKDIR /app/apps/backend
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build:backend

# Copy frontend build to backend public directory
RUN cp -r /app/apps/frontend/dist/* ./public/

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

# Copy backend files from builder
COPY --from=builder /app/apps/backend/package*.json ./
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/public ./public
COPY --from=builder /app/apps/backend/prisma ./prisma

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/server.js"]
