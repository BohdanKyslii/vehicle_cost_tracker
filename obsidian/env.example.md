# vehicle_cost_tracker — структура `.env`

Тільки імена змінних і призначення. Без значень і секретів. Файли `.env` /
`.env.production` у `.gitignore`, локально в репозиторії відсутні.

## `.env` (dev)

| Змінна          | Призначення |
|-----------------|-------------|
| `VITE_USE_MOCK` | `true`/`false` — використовувати mock JSON-дані замість реального API (поки Django-бекенд не готовий/не запущений локально) |
| `VITE_API_BASE` | Базовий URL API, напр. `http://localhost:8000/api` — адреса Django-бекенда (`vehicle_tracker_api`) для dev-режиму |

## `.env.production`

| Змінна          | Призначення |
|-----------------|-------------|
| `VITE_USE_MOCK` | `false` — у продакшні завжди реальний API |
| `VITE_API_BASE` | Продакшн URL API (домен `warehouse.mom`) |

## GitHub Actions secrets (не `.env`, а `Settings → Secrets and variables → Actions`)

| Секрет        | Призначення |
|---------------|-------------|
| `PI_SSH_KEY`  | Приватний SSH-ключ для деплою на Raspberry Pi через `ssh.warehouse.mom` (Cloudflare Tunnel) |

Примітка з гайду (Крок 4.4): секрети деплою — це окрема сутність від
`.env` застосунку. `.env` читає сам React-застосунок у браузері/збірці;
GitHub Actions secrets використовує тільки workflow під час деплою.
