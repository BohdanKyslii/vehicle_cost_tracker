# vehicle_cost_tracker — задачі та статус

Останнє оновлення: 2026-07-12.

## Зроблено (за git log / CODING_GUIDE.md)

- **Фаза 1** — ініціалізація проєкту (Vite, залежності, `.env`).
- **Фаза 2** — структура папок, TypeScript-типи (`src/types/index.ts`).
- **Фаза 3** — лендінг: `TopNav`, `AuthModal` (без бекенда), маршрутизація,
  `LandingPage` / `UnderConstruction`.
- **Фаза 4** — git-репозиторій, Docker/nginx, GitHub Actions автодеплой на
  warehouse.mom (Raspberry Pi), гілка-на-фазу воркфлоу.
- **Фаза 4.5, кроки 4.5.1-4.5.7 (гілка `feature/faza-4-authorization`,
  ще не змержена)** — auth-шар фронтенду реалізовано в коді:
  - `src/api/config.ts` — `apiFetch` обгортка (credentials include,
    CSRF-заголовок, JSON parse/204 handling)
  - `src/api/auth.ts` — `fetchCsrf`, `fetchCurrentUser`, `login`,
    `register`, `logout`
  - `src/hocks/useCurrentUser.ts` — React Query хук (query + 3 мутації)
  - `src/main.tsx` — виклик `fetchCsrf()` перед рендером
  - `AuthModal.tsx` — контрольовані інпути, `handleLogin`/`handleRegister`
    підключені до форм, вивід `loginError`/`registerError`
  - `TopNav.tsx` — умовний рендер: ім'я користувача + "Вийти" замість
    "Sign Up", коли є сесія
  - Дорогою виправлено кілька багів: невірний шлях імпорту в `TopNav.tsx`
    (`hooks` замість реальної теки `hocks`), тайпо `X-CRRFToken` →
    `X-CSRFToken` у `config.ts`, інвертована умова `res.status !== 204`
    (парсила JSON лише коли тіла нема), відсутній `onClose()` в кінці
    `handleRegister`
- **2026-07-10** — фікс мобільного меню: `.menu-toggle` (гамбургер) не
  рендерився в `TopNav.tsx`, хоча CSS під нього вже існував — на мобільних
  меню було просто приховане без способу відкрити. Додано стан
  `isMenuOpen`, кнопка-гамбургер, мобільний dropdown у `landing.css`.
  Закомічено (`e85ccc0`) і запушено в `main` — автодеплой запущено,
  користувач перевірить на телефоні після викатки.
- **2026-07-10** — налаштовано Obsidian vault sync за тим самим підходом,
  що й для `vehicle_tracker_api`: тека `obsidian/` у корені репо +
  Junction з vault (`projects/vehicle_cost_tracker`), замість недоступного
  шляху `D:\Obsidian_Kisliy\...`.

## В процесі / наступне

- **Зараз (2026-07-12)**: перед Кроком 4.5.8 ("Перевірка .env") користувач
  переходить у `vehicle_tracker_api` (Django) реалізувати бекенд-частину —
  ендпоінти `/auth/csrf/`, `/auth/me/`, `/auth/login/`, `/auth/register/`,
  `/auth/logout/`, які вже викликає `src/api/auth.ts` на фронті. Без них
  Крок 4.5.8/4.5.9 (перевірка в браузері) не має сенсу виконувати.

За `CODING_GUIDE.md`, розділ "Що далі" (актуальний порядок після бекенда):

1. **Крок 4.5.8** — перевірка `.env` (`VITE_API_BASE=http://localhost:8000/api`),
   backend і `npm run dev` мають бути запущені одночасно.
2. **Крок 4.5.9** — перевірка авторизації в браузері.
3. **Фаза 5** — утиліти (`formatters.ts`, `eventHelpers.ts`,
   `calcSummary.ts`, `calcTransportCost.ts`, `parseQR.ts`,
   `clientFilter.ts`) — чиста логіка без React.
4. **Фаза 6** — API-шар для сутностей (`cars.ts`, `drivers.ts`,
   `waybills.ts`, `routeEvents.ts`).
5. **Фази 8-9** — UI-компоненти (`ErrorBanner`, `Button`, `Badge`,
   `Pagination`, `Input`) і layouts (`DriverLayout`, `MainLayout`).
6. **Фаза 10** — App.tsx і повна маршрутизація.
7. **Фаза 11** — перша реальна сторінка `WaybillList`.
8. Далі (без номерів фаз ще): `WaybillDetail`, `FleetList`,
   `DriverDashboard`, `QRScanner`, `HiredTripForm`,
   `CarrierShipmentForm`, аналітика/графіки (Recharts).

## Відкриті питання

- `.env` / `.env.production` локально відсутні (не закомічені, за задумом) —
  перевірити на Кроці 4.5.8, коли бекенд буде готовий.
- `src/api/auth.ts` викликає `POST /auth/logout` (без кінцевого `/`), а
  `CODING_GUIDE.md` (Крок 4.5.3) показує `/auth/logout/` — звірити з
  реальними Django URL patterns при реалізації бекенда, щоб не зловити
  зайвий редірект/404 через `APPEND_SLASH`.
