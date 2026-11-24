#!/usr/bin/env bash
set -euo pipefail

cd /app

# ---- обязательные переменные ----
: "${AUTH_DATABASE_URL:?AUTH_DATABASE_URL is required}"
: "${FILES_DATABASE_URL:?FILES_DATABASE_URL is required}"
: "${TEST_CASES_DATABASE_URL:?TEST_CASES_DATABASE_URL is required}"
: "${JWT_ACCESS_SECRET:?JWT_ACCESS_SECRET is required}"
: "${JWT_REFRESH_SECRET:?JWT_REFRESH_SECRET is required}"
: "${ORIGIN:?ORIGIN is required (https://<ваш-домен>)}"

# ---- параметры по умолчанию ----
export NATS_URL="${NATS_URL:-nats://127.0.0.1:4222}"
export FILE_STORAGE_DIR="${FILE_STORAGE_DIR:-/data/storage}"
export GATEWAY_PORT="${GATEWAY_PORT:-3001}"
export GATEWAY_URL="${GATEWAY_URL:-http://127.0.0.1:${GATEWAY_PORT}}"
export BODY_SIZE_LIMIT="${BODY_SIZE_LIMIT:-10M}"

mkdir -p /data/nats "$FILE_STORAGE_DIR"

# ---- миграции БД (у каждого сервиса своя БД) ----
migrate() { # <пакет> <url>
  echo "==> prisma migrate deploy: $1"
  (cd "apps/$1" && DATABASE_URL="$2" pnpm exec prisma migrate deploy)
}
migrate auth-service "$AUTH_DATABASE_URL"
migrate file-service "$FILES_DATABASE_URL"
migrate test-case-service "$TEST_CASES_DATABASE_URL"

# ---- запуск процессов ----
pids=()
run() { # <имя> <команда...>
  local name="$1"; shift
  ( "$@" 2>&1 | sed -u "s/^/[$name] /" ) &
  pids+=($!)
}

run nats nats-server -c /app/deploy/amvera/nats.conf
sleep 2

run auth  bash -c 'cd apps/auth-service      && DATABASE_URL="$AUTH_DATABASE_URL"       exec node dist/main'
run files bash -c 'cd apps/file-service      && DATABASE_URL="$FILES_DATABASE_URL"      exec node dist/main'
run cases bash -c 'cd apps/test-case-service && DATABASE_URL="$TEST_CASES_DATABASE_URL" exec node dist/main'
run gateway bash -c 'cd apps/api-gateway && exec node dist/main'
run web   bash -c 'cd apps/web && PORT=3000 HOST=0.0.0.0 exec node build'

# Если упал любой процесс - останавливаем контейнер, Amvera перезапустит его
trap 'kill ${pids[@]} 2>/dev/null || true' TERM INT
wait -n
echo "!!! один из процессов завершился, останавливаю контейнер" >&2
kill "${pids[@]}" 2>/dev/null || true
exit 1