# vehicle_cost_tracker — задачі та статус

Останнє оновлення: 2026-08-04.

## Зроблено (за git log / CODING_GUIDE.md)

- **Фаза 1** — ініціалізація проєкту (Vite, залежності, `.env`).
- **Фаза 2** — структура папок, TypeScript-типи (`src/types/index.ts`).
  Виправлено кілька тайпо, знайдених під час роботи над Кроком 13:
  `Car.specs` (було `pecs`), `RouteEventType` без `depot_return`,
  `CarStatus` без `"inactive"`, `Driver.idCar` мав тип `string` замість
  `number`, прибрано застаріле `Driver.telegramId` (тепер живе на
  бекенді в `Profile`, не в `Driver`).
- **Фаза 3** — лендінг: `TopNav`, `AuthModal`, маршрутизація,
  `LandingPage`/`UnderConstruction`. Пізніше перероблено (окрема сесія,
  без номера фази) — новий hero з mockup-графіком, попап умов
  використання, показ/приховання пароля.
- **Фаза 4** — git-репозиторій, Docker/nginx, GitHub Actions автодеплой
  на warehouse.mom (Raspberry Pi), гілка-на-фазу воркфлоу. Пізніше
  доданий фікс кешування nginx (`Cache-Control: no-cache` для
  `index.html`/`sw.js`, інакше старий білд міг лишатись у браузері
  після деплою).
- **Фаза 4.5 — ПОВНІСТЮ ЗАВЕРШЕНА, задеплоєна й перевірена** (Кроки
  4.5.1-4.5.9, включно з бекендом у `vehicle_tracker_api`). Логін/
  реєстрація/вихід через Django-сесію працюють на проді.
- **Позапланово (без номера фази) — Telegram-реєстрація водіїв**:
  - Backend (`vehicle_tracker_api`) — Telegram-бот (aiogram), вхід
    через Mini App (`initData`), підтвердження заявки прямо в
    Telegram із вибором ролі. Деталі —
    `TELEGRAM_BOT_SETUP.md` у корені бекенд-репо.
  - Frontend — `/driver-app` (`DriverMiniApp.tsx`, логінить і веде в
    `/driver`), робоча Telegram-кнопка в `AuthModal` (deep-link на
    бота, рендериться лише якщо задано `VITE_TELEGRAM_BOT_USERNAME`).
  - Реального бота через @BotFather ще не створено — код готовий,
    чекає токена.
- **Позапланово — `/panel` (заглушка внутрішньої адмінки)**: гейтиться
  по `user.profile.role === 'head'`, реальний бекенд-ендпоінт — це
  "Крок 18" у гайді (описаний, ще не реалізований).
- **CODING_GUIDE.md — дописано Крок 13 (DriverDashboard)**: DayModeSwitch,
  тайли типів подій, EventForm — повністю написано й перевірено
  наскрізь проти реального Django API (не mock), включно зі створенням
  реальних `RouteEvent` записів. **Ще не набрано руками в репозиторій**
  (окрім самого тексту гайду) — саме з цього починати Фазу 13, коли
  дійдете. Заразом виправлено реальні баги у Фазі 6 (`api/cars.ts` тощо
  з гайду не мапили `snake_case`→`camelCase`, не розгортали DRF-пагінацію,
  використовували сирий `fetch()` без CSRF) і Фазі 7 (`useDayMode` мав
  `setState` синхронно в ефекті).

## Наступний крок — Фаза 5

`src/utils/` майже порожній (є тільки старий `calcProduct.ts`-заглушка
з закоментованим TODO, не з Фази 5 — не плутати). Починайте нову гілку:

```bash
git checkout main
git pull origin main
git checkout -b feature/faza-5-utils
```

За `CODING_GUIDE.md`:
1. **Фаза 5** — утиліти (`formatters.ts`, `eventHelpers.ts`,
   `calcSummary.ts`, `calcTransportCost.ts`, `parseQR.ts`,
   `clientFilter.ts`) — чиста логіка без React.
2. **Фаза 6** — API-шар (`cars.ts`, `drivers.ts`, `waybills.ts`,
   `routeEvents.ts`) — **читайте уважно, тут щойно виправлені реальні
   баги** (адаптери snake_case→camelCase, `apiFetch` замість сирого
   `fetch`, правильний URL для `last_odometer`).
3. **Фаза 7** — React Query hooks.
4. **Фаза 8-9** — UI-компоненти й layouts.
5. **Фаза 10** — App.tsx і повна маршрутизація (⚠️ фрагмент коду в
   гайді повністю переписує роутер і губить `LandingPage`/`AuthModal`
   — у гайді вже є примітка, як змержити правильно: `/` лишається
   лендінгом, тільки `/driver` стає `DriverLayout`).
6. **Фаза 11** — перша реальна сторінка `WaybillList`.
7. **Фаза 13** — DriverDashboard (уже повністю описана, готова до
   набору).
8. Далі: `WaybillDetail`, `FleetList`, `QRScanner`, `HiredTripForm`,
   `CarrierShipmentForm`, аналітика/графіки (Recharts).

## Відкриті питання

- `package-lock.json` — досі дрібні локальні розходження, не мої,
  не займав жодного разу.
