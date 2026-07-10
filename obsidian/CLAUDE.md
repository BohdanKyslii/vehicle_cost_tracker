# vehicle_cost_tracker — швидкий довідник

Frontend-репозиторій застосунку обліку транспортних витрат. React PWA,
навчальний проєкт (JS/React/TS з нуля) — весь процес написання коду
задокументований крок за кроком у `CODING_GUIDE.md` у корені репо.

Пов'язаний репозиторій: **vehicle_tracker_api** (Django-бекенд,
`C:\Users\b.kysliy\PycharmProjects\vehicle_tracker_api\`) — один застосунок,
розділений на два репо. Vault-контекст бекенду: тека `vehicle_tracker_api`
поруч із цією в `projects/`.

## Стек

- React 19, TypeScript, Vite
- react-router-dom v7 (маршрутизація)
- TanStack Query v5 (data fetching/caching) — ще не підключено в коді
- Tailwind CSS + власні CSS-файли (landing.css — лендінг написаний на
  чистому CSS, не Tailwind, свідоме рішення для цієї частини)
- Recharts (аналітика, заплановано)
- html5-qrcode (QR-сканування накладних, заплановано)
- vite-plugin-pwa (PWA)

## Структура репо

```
src/
  App.tsx                     — маршрути (поки лендінг + заглушка)
  main.tsx
  index.css
  assets/logo.png
  components/
    auth/AuthModal.tsx        — форма логіну/реєстрації (поки без бекенда)
    layouts/TopNav.tsx        — верхня навігація лендінгу (з мобільним меню)
  hocks/useAuthModal.ts       — хук стану модалки (тека названа "hocks", не "hooks")
  pages/
    LandingPage.tsx
    UnderConstruction.tsx     — заглушка для ще не готових розділів
  styles/landing.css
  types/index.ts
  utils/calcProduct.ts

documents/                    — початкове ТЗ/специфікація проєкту
  01_PROJECT_OVERVIEW.md
  02_DATABASE_SCHEMA.md
  03_TYPESCRIPT_TYPES.md
  04_PAGES_AND_ROUTING.md
  05_COMPONENTS_HOOKS_UTILS.md
  06_IMPLEMENTATION_PLAN.md
  07_MOCK_DATA.md
  08_PROJECT_STRUCTURE.md

CODING_GUIDE.md                — покроковий навчальний гайд (Фази 1-11+)
Dockerfile, docker-compose.yml, nginx.conf — деплой на Raspberry Pi
.github/workflows/deploy.yml   — автодеплой при push у main
```

## Деплой

- Продакшн: **warehouse.mom** (Raspberry Pi вдома, за Cloudflare Tunnel).
- `main` = задеплоєний код. Кожна фаза — окрема гілка, мерж у `main` →
  GitHub Actions (`deploy.yml`) сам збирає Docker-образ і викочує на Pi
  через `ssh.warehouse.mom` (`cloudflared access ssh`).
- SSH-доступ на Pi: user `rasberry_kisliy`, ключ у секреті `PI_SSH_KEY`.

## Робочий процес

- Гілка на фазу з `CODING_GUIDE.md` → проміжні коміти → PR → merge у `main`
  → автодеплой. Пряма робота в `main` — тільки для ранніх фаз (1-4), поки
  коду було мало.

## Obsidian vault sync

Ця тека (`obsidian/` у корені репозиторію `vehicle_cost_tracker`) —
джерело правди для 4 файлів (CLAUDE.md, tasks.md, decisions.md,
env.example.md). У vault на неї вказує symlink:
`projects/vehicle_cost_tracker → .../WebstormProjects/vehicle_cost_tracker/obsidian`
(той самий підхід, що й для `vehicle_tracker_api`).

Коли просять "онови obsidian" / "sync obsidian" — прочитай актуальний стан
репо (структура, git log, CODING_GUIDE.md, documents/) і перепиши ці 4
файли тут напряму (Read/Write), без MCP.

`env.example.md` — тільки СТРУКТУРА `.env` (імена змінних + призначення),
без значень і секретів.

Онови ці файли одразу наприкінці сесії, якщо було зроблено значущу зміну
(задача, архітектурне рішення, зміна `.env`) — не відкладай.
