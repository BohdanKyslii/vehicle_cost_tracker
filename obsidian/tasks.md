# vehicle_cost_tracker — задачі та статус

Останнє оновлення: 2026-07-10.

## Зроблено (за git log / CODING_GUIDE.md)

- **Фаза 1** — ініціалізація проєкту (Vite, залежності, `.env`).
- **Фаза 2** — структура папок, TypeScript-типи (`src/types/index.ts`).
- **Фаза 3** — лендінг: `TopNav`, `AuthModal` (без бекенда), маршрутизація,
  `LandingPage` / `UnderConstruction`.
- **Фаза 4** — git-репозиторій, Docker/nginx, GitHub Actions автодеплой на
  warehouse.mom (Raspberry Pi), гілка-на-фазу воркфлоу.
- **Фаза 4.5 (опис)** — крок за кроком в `CODING_GUIDE.md` вже описано
  реєстрацію/авторизацію через cookie (`src/api/config.ts`, `auth.ts`,
  `useCurrentUser.ts`), але **в коді ще не реалізовано** — `src/api/`
  відсутній. Це наступний крок для виконання за гайдом.
- **2026-07-10** — фікс мобільного меню: `.menu-toggle` (гамбургер) не
  рендерився в `TopNav.tsx`, хоча CSS під нього вже існував — на мобільних
  меню було просто приховане без способу відкрити. Додано стан
  `isMenuOpen`, кнопка-гамбургер, мобільний dropdown у `landing.css`.
  Закомічено (`e85ccc0`) і запушено в `main` — автодеплой запущено,
  користувач перевірить на телефоні після викатки.
- **2026-07-10** — налаштовано Obsidian vault sync за тим самим підходом,
  що й для `vehicle_tracker_api`: тека `obsidian/` у корені репо +
  symlink з vault (`projects/vehicle_cost_tracker`), замість недоступного
  шляху `D:\Obsidian_Kisliy\...`.

## В процесі / наступне

За `CODING_GUIDE.md`, розділ "Що далі" (актуальний порядок):

1. Виконати Фазу 4.5 в коді — API-шар (`src/api/config.ts`, `auth.ts`),
   `useCurrentUser`, реальне підключення `AuthModal` до бекенда.
2. **Фаза 5** — утиліти (`formatters.ts`, `eventHelpers.ts`,
   `calcSummary.ts`, `calcTransportCost.ts`, `parseQR.ts`,
   `clientFilter.ts`) — чиста логіка без React.
3. **Фаза 6** — API-шар для сутностей (`cars.ts`, `drivers.ts`,
   `waybills.ts`, `routeEvents.ts`).
4. **Фази 8-9** — UI-компоненти (`ErrorBanner`, `Button`, `Badge`,
   `Pagination`, `Input`) і layouts (`DriverLayout`, `MainLayout`).
5. **Фаза 10** — App.tsx і повна маршрутизація.
6. **Фаза 11** — перша реальна сторінка `WaybillList`.
7. Далі (без номерів фаз ще): `WaybillDetail`, `FleetList`,
   `DriverDashboard`, `QRScanner`, `HiredTripForm`,
   `CarrierShipmentForm`, аналітика/графіки (Recharts).

## Відкриті питання

- `.env` / `.env.production` локально відсутні (не закомічені, за задумом) —
  перевірити, що вони створені на машині розробки перед стартом Фази 4.5/6.
