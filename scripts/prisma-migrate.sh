#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

SERVICES=(auth-service file-service test-case-service)

usage() {
  cat <<EOF
Usage:
  pnpm prisma:migrate <service> [migration_name]
  pnpm prisma:migrate --all [migration_name]

Services:
  auth-service
  file-service
  test-case-service
  --all                 run for every service with a prisma schema

Examples:
  pnpm prisma:migrate test-case-service add_tags
  pnpm prisma:migrate auth-service
  pnpm prisma:migrate --all
EOF
}

is_known_service() {
  local name="$1"
  for s in "${SERVICES[@]}"; do
    [[ "$s" == "$name" ]] && return 0
  done
  return 1
}

migrate_service() {
  local service="$1"
  local name="${2:-}"
  local app_dir="$ROOT_DIR/apps/$service"

  if [[ ! -d "$app_dir" ]]; then
    echo "Error: service directory not found: $app_dir" >&2
    exit 1
  fi

  if [[ ! -f "$app_dir/prisma/schema.prisma" ]]; then
    echo "Error: prisma schema not found in $service" >&2
    exit 1
  fi

  echo "==> Migrating $service"

  local args=(migrate dev)
  if [[ -n "$name" ]]; then
    args+=(--name "$name")
  fi

  (
    cd "$app_dir"
    pnpm exec prisma "${args[@]}"
    pnpm exec prisma generate
  )

  echo "==> Done: $service"
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

TARGET="$1"
NAME="${2:-}"

case "$TARGET" in
  -h|--help)
    usage
    exit 0
    ;;
  --all)
    for service in "${SERVICES[@]}"; do
      migrate_service "$service" "$NAME"
    done
    ;;
  *)
    if ! is_known_service "$TARGET"; then
      echo "Error: unknown service '$TARGET'" >&2
      echo >&2
      usage
      exit 1
    fi
    migrate_service "$TARGET" "$NAME"
    ;;
esac
