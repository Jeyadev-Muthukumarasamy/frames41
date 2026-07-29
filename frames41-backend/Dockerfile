FROM node:20-alpine AS builder

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy root & monorepo package manifests
COPY package*.json ./
COPY frames41-frontend/package*.json ./frames41-frontend/
COPY frames41-backend/package*.json ./frames41-backend/

# Copy source files
COPY frames41-frontend ./frames41-frontend
COPY frames41-backend ./frames41-backend

# Build customer frontend into backend public folder & compile backend
WORKDIR /app/frames41-backend
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build

FROM node:20-alpine AS runner

RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/frames41-backend/package*.json ./
COPY --from=builder /app/frames41-backend/node_modules ./node_modules
COPY --from=builder /app/frames41-backend/dist ./dist
COPY --from=builder /app/frames41-backend/public ./public
COPY --from=builder /app/frames41-backend/prisma ./prisma

EXPOSE 5000

CMD ["npm", "run", "start:prod"]
