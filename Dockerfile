# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim

# openssl нужен Prisma (schema engine для migrate deploy), ca-certificates - для HTTPS
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# nats-server - статический Go-бинарник, берём его из официального образа
COPY --from=nats:2.10-alpine /usr/local/bin/nats-server /usr/local/bin/nats-server

# pnpm ставим через corepack (версия берётся из packageManager в package.json)
RUN corepack enable

WORKDIR /app

# 1) зависимости (слой кэшируется, пока не меняются package.json/lock)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api-gateway/package.json apps/api-gateway/
COPY apps/auth-service/package.json apps/auth-service/
COPY apps/file-service/package.json apps/file-service/
COPY apps/test-case-service/package.json apps/test-case-service/
COPY apps/web/package.json apps/web/
COPY packages/contracts/package.json packages/contracts/
COPY packages/nest-common/package.json packages/nest-common/
RUN pnpm install --frozen-lockfile

# 2) исходники и сборка
COPY . .

# Для prisma generate нужна любая валидная строка подключения (к БД на этапе сборки не ходим)
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build
RUN pnpm prisma:generate \
    && pnpm --filter @tms/contracts build \
    && pnpm --filter @tms/nest-common build \
    && pnpm -r --filter './apps/*' run build

ENV NODE_ENV=production

COPY deploy/amvera/start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"]