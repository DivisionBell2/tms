# TMS - Test Management System

Демонстрационный fullstack-проект для создания сервиса для хранения тестовой документации.

## Стек

- **Backend:** NestJS, TypeScript, NATS (брокер сообщений), PostgreSQL, Prisma
- **Frontend:** SvelteKit, TypeScript
- **Инфраструктура:** Docker, Docker Compose, pnpm workspaces

## Архитектура

```mermaid
flowchart LR
    user[Тестировщик] --> web[Web SvelteKit]
    web -->|HTTP| gateway[API Gateway NestJS]
    gateway -->|NATS RPC| auth[auth-service]
    gateway -->|NATS RPC| files[file-service]
    gateway -->|NATS RPC| tcs[test-case-service]
    gateway -->|NATS RPC| cls[checklist-service]
    gateway -->|NATS RPC| tps[test-plan-service]
    gateway -->|NATS RPC| gam[gamification-service]
    tcs -->|NATS Event| gam
    cls -->|NATS Event| gam
    tps -->|NATS Event| gam
    auth -->|Prisma| dbAuth[PostgreSQL: auth]
    files -->|Prisma| dbFiles[PostgreSQL: files]
    tcs -->|Prisma| dbTcs[PostgreSQL: test_cases]
    cls -->|Prisma| dbCls[PostgreSQL: checklists]
    tps -->|Prisma| dbTps[PostgreSQL: test_plans]
    gam -->|Prisma| dbGam[PostgreSQL: gamification]
```

## Структура репозитория

tms/
    - apps/ # запускаемые приложения (микросервисы, gateway, web)
    - packages/ # переиспользуемые библиотеки (DTO, контракты сообщений)
        - /contracts - контракты сообщений
    - tsconfig.base.json
    - exling.config.mjs
    - .prettierrc.json
    - .editorconfig
    - pnpm-workspace.yaml
    - package.json

См. также:

- [`apps/README.md`](./apps/README.md) - что находится в `apps/`
- [`packages/README.md`](./packages/README.md) - что находится в `packages/`

## Требования к окружению

- Node.js >= 20
- pnpm >= 10
- Git
- Docker

## Команды

### Инфраструктура (Docker Compose)

Все команды запускаются из корня репозитория

- `docker compose up -d` - Поднять PostgreSQL, pgAdmin и NATS в фоне
- `docker compose ps` - Показать статусы контейнеров
- `docker compose logs -f <service>` - Смотреть логи сервиса (`postgres`, `pgadmin`, `nats`) в реальном времени
- `docker compose down` - Остановить и удалить контейнеры (volumes остаются - данные сохраняются)
- `docker compose down -v` - То же + удалить volumes (стирает все данные БД и pgAdmin)

> Перед первым запуском скопируй `.env.example` в `.env` и при необходимости поменяй значения

### Код (pnpm)

- `pnpm install` - установить зависимости всех пакетов workspace
- `pnpm lint` - проверить весь код линтером (ESLint)
- `pnpm lint:fix` - линтер с автоисправлением
- `pnpm format` - переформатировать весь код (Prettier)
- `pnpm format:check` - только проверить форматирование для (CI)
- `pnpm typecheck` - проверка типов TypeScript без компиляции
- `pnpm build` - сборка workspace-пакетов
- `pnpm run build:contracts`: пересборка контрактов

## Лицензия

Пока лицензии нет.
