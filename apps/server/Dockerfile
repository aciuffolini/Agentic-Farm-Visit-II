# Build stage
FROM node:18-slim AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/package.json
COPY apps/server/package.json ./apps/server/package.json

RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm run build --workspace=apps/server

# Production stage
FROM node:18-slim
WORKDIR /app

COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules

CMD ["node", "dist/index.js"]
