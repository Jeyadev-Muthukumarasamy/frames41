FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/admin/package*.json ./apps/admin/

RUN npm ci

COPY apps/admin ./apps/admin

WORKDIR /app/apps/admin
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/admin/package*.json ./apps/admin/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/admin/dist ./apps/admin/dist

WORKDIR /app/apps/admin

EXPOSE 5174

CMD ["npm", "run", "start"]
