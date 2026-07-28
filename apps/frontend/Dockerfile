FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/

RUN npm ci

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend
RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/frontend/package*.json ./apps/frontend/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/dist ./apps/frontend/dist

WORKDIR /app/apps/frontend

EXPOSE 3000

CMD ["npm", "run", "start"]
