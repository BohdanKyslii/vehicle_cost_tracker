# STATE.md — Стан проєкту (Vehicle Cost Tracker, frontend)

> Оновлюється після кожної значущої сесії. Детальна хронологія —
> `CHANGES.md`. Задачі/наступний крок у форматі списку — `tasks.md`
> (цей файл — ширший наратив, `tasks.md` — короткий статус-список,
> обидва підтримуються одночасно, не дублюй сюди все з `tasks.md`).

**Останнє оновлення:** 2026-08-31 (другий раз того самого дня)

---

## Поточна фаза

Frontend (`vehicle_cost_tracker`, React 19 + Vite + TanStack Query)
розгорнутий на Raspberry Pi (`warehouse.mom`, Docker Compose, nginx).
Бекенд — окремий репозиторій `vehicle_tracker_api`
(`C:\Users\b.kysliy\PycharmProjects\vehicle_tracker_api\`), Django+DRF,
сесійна авторизація, задеплоєний і живий.

За `CODING_GUIDE.md`: **Фази 1-21 набрані в код і задеплоєні**, плюс
одна фіча поза нумерацією гайду (`panel-management`, [[decisions.md]]).
Перевірено проти `git log` цієї сесії (2026-08-31) — `npm run build`
проходить чисто на HEAD. **Не перевірено цією сесією:** чи запушений
бекенд `vehicle_tracker_api` для Фаз 18-19 (`apps.logistics`) — за
попередніми нотатками (2026-08-30) закомічений лише локально; якщо це
досі так, прод може працювати проти старішого бекенду, ніж очікує
фронтенд. Гайд написав ще Крок 22 (waybill-імпорт) і Крок 23
(carrier shipments) — код під них ще НЕ набраний, `/carriers` і
`/waybills/import` усе ще `PlaceholderPage`.

## Що зроблено

- **Фаза 1-4** — ініціалізація, типи, лендінг (`TopNav`, `AuthModal`,
  `LandingPage`/`UnderConstruction`), git/Docker/GitHub Actions
  автодеплой.
- **Фаза 4.5** — логін/реєстрація/вихід через Django-сесію.
- **Фаза 5-11** — утиліти (включно з `parseQR.ts`), API-шар, React
  Query hooks, ui/-компоненти, layouts, `App.tsx`/маршрутизація, перша
  реальна сторінка `WaybillList`.
- **Фаза 13** — `DriverDashboard`/`EventForm`.
- **Фаза 14** — `RequireRole`/`RoleRedirect`: `/` → `LandingPage` для
  неавторизованих, роль-редирект після логіну, `/driver` і `/fleet`
  гейтяться по ролі.
- **Фаза 15** — `QRScanner` (html5-qrcode) + `parseQR.ts`, `DriverHistory`,
  групове сканування кількох накладних за один захід (2-4 на точку),
  сканер для повернення/додаткового вантажу.
- **Фаза 16** — CRUD автопарку для логіста: `FleetList`, `CarForm`
  (причіп, призначення водія, блокування полів), `DriverForm`. Статуси
  авто розширено до 5 (`pause`/`driver_downtime` додано 2026-08-28,
  той самий день бекенд паралельно виправив car-creation 400 і
  trailer 500 — див. нижче).
- **Фаза 17 (2026-08-28, ця сесія)** — компактна мобільна `CarForm`
  (короткі поля по два в рядок), редизайн `DriverDashboard` (перемикач
  режиму праворуч у картці авто, горизонтальні компактні тайли "Нова
  подія", прибрано дубльований список "Події сьогодні"), нова сторінка
  `EventDetail` (`/driver/event/:id`): групування накладних однієї
  точки заднім числом (`findEventGroup`, часове вікно 10 хв — немає
  явного зв'язку в БД), видалення помилково відсканованої/зайвої
  накладної або цілої події (два дотики замість `confirm()`), додавання
  ще однієї накладної в ту саму точку. Бекенд змін не потребував —
  `DELETE /api/route-events/<id>/` уже дозволений `IsAuthenticated` +
  `get_queryset()` водія.
- **Фаза 17.9 (той самий день) — виправлення живого тестування**:
  компактний перемикач режиму став вертикальним стеком (усе ще
  розширював картку авто); `DriverHistory`/`EventDetail` перемкнено з
  усієї історії на `useTodayEvents` (показували вчорашні події —
  заразом виправлено UTC-vs-локальна-дата баг у mock-гілці
  `fetchTodayEvents`); `useCreateRouteEvent`/`useDeleteRouteEvent`
  тепер `return Promise.all(...)` в `onSuccess` (вікно гонки давало
  іноді пройти повторному скану тієї самої накладної); `CarForm` —
  режим/статус/водій в один ряд (`grid-cols-3`). Деталі й код — Крок
  17.9 `CODING_GUIDE.md`, [[decisions.md]].
- **Telegram Mini App** — `DriverMiniApp.tsx` (`/driver-app`), логін
  через `initData`, редіректить за роллю.
- **2026-08-28 (бекенд, паралельна сесія)** — виправлено відомий
  відкритий баг "Request failed: 400" при створенні авто без причепа
  (`CarSerializer.trailer` без `required=False`, комміт `e5b5f7f`), і
  окремо баг "trailer creation always 500'd" (осиротіла колонка БД +
  неатомарний create, комміт `deb38c8`). Той самий комміт `e5b5f7f`
  також закрив [[telegram-email-account-linking-gap]] — email-реєстрація
  тепер теж створює порожній `Driver`-запис, як і Telegram-шлях.
- **2026-08-28 (ця сесія) — виправлено сам vault**: `CLAUDE.md`,
  `AGENTS_GLOBAL.md`, `AI_AGENT_CONTEXT.md`, `tasks.md`, цей файл —
  усі стверджували застарілий стан (Фаза 14-16 "не набрана", неправильний
  шлях бекенду `C:\Users\b.kisliy\...\DjangoProject\...`). Резинхронізовано
  проти реального коду.
- **Фаза 18 (2026-08-30)** — найманий транспорт: `src/api/hiredTrips.ts`,
  `useHiredTrips.ts`, `pages/hired/HiredTripList.tsx`/`HiredTripForm.tsx`
  (спільний `QRScanner`), маршрути `/hired`.
- **Фаза 19 (2026-08-30)** — місячні витрати по своїх авто:
  `src/api/monthlyCosts.ts`, `useMonthlyCosts.ts`,
  `pages/admin/MonthlyCostsList.tsx`/`MonthlyCostsForm.tsx`.
- **Фаза 20 (2026-08-30)** — `src/utils/roleAccess.ts` (`ROLE_ROUTES`/
  `rolesForRoute`, єдине джерело правди роль↔маршрут для `RequireRole`
  і навігації), гамбургер-меню в `MainLayout` фільтроване за роллю,
  `PanelHome.tsx`, `MonthlyCosts*` переїхали `pages/admin/` →
  `pages/costs/`. `/admin` навмисно не використовується як SPA-маршрут
  (nginx проксіює на Django admin) — кастомна адмінка на `/panel`.
- **Фаза 21 (2026-08-30)** — фікс `/panel` 404 (Service Worker
  denylist перенесено з `/admin` на `/panel`), уніфікація форм,
  `BulkMonthlyCostsForm.tsx`, права Postgres на `apps.logistics`.
- **Panel-management (2026-08-30, поза нумерацією гайду)** —
  `/panel/products`/`customers`/`stores` (CRUD на існуючому бекенді
  `apps.products`/`apps.customers`) і `/panel/users`
  (`UserManagement.tsx`, head-only: підтвердження реєстрацій, зміна
  ролі, деактивація, лінк Telegram-заявки до email-акаунта). Заразом
  виправлено `Product`/`Customer`/`Store` типи проти реального
  DRF-виводу — [[decisions.md]].
- **Inline-редагування накладної (2026-08-31)** — `EventDetail.tsx`
  тепер дозволяє поправити номер/дату/клієнта/одометр/палети вже
  збереженої накладної через `PATCH /route-events/:id/`
  (`useUpdateRouteEvent`), без видалення й пересканування. Підтвердження
  видалення замінено з "два дотики" на явну картку "Так, видалити"/
  "Скасувати" — [[decisions.md]].

- **`/panel/events` (адмінський CRUD подій водіїв) і масовий Excel-імпорт
  Товарів/Клієнтів/Магазинів (2026-08-31)** — обидві поза нумерацією
  `CODING_GUIDE.md`. Жодна не потребувала змін бекенду (перевірено
  дослідженням `RouteEventViewSet`/серіалізаторів products/customers) —
  деталі й обґрунтування в [[decisions.md]]. Перевірено вручну проти
  реального локального бекенду (не mock): створення події, імпорт
  клієнтів і товарів (з логістикою) — усе відпрацювало коректно.

## Наступні кроки

1. `WaybillDetail`, `/waybills/import`/`unassigned`/`returns` (Крок 22
   `CODING_GUIDE.md`) — гайд написаний, код фронтенду ще НЕ набраний.
2. `CarrierShipmentForm`/`CarrierCostImport` (Крок 23 `CODING_GUIDE.md`)
   — гайд написаний, код ще НЕ набраний, `/carriers` усе ще
   `PlaceholderPage`.
3. Аналітика/графіки (Recharts) — і бекенд (`apps.analytics`), і
   фронтенд свідомо не почато.
4. Перевірити backend-репо `vehicle_tracker_api`: чи запушено
   `apps.logistics` серіалізатори/views для Фаз 18-19 (за нотатками
   2026-08-30 — закомічені локально, не запушені; ця сесія бекенд не
   перевіряла).
5. Дрібне: `findEventGroup()` більше НЕ часова евристика — з
   2026-08-28 групує за явним маркером `[stop:N]` у `notes`
   (`decisions.md`). Попередня версія цього файлу все ще описувала
   стару часову логіку — виправлено.

## Відомі блокери

- Немає активних блокерів деплою. "Request failed: 400" при створенні
  авто (описаний у `CODING_GUIDE.md` Крок 16.8 і в пам'яті сесії
  `session-2026-08-28-fleet-work-and-open-400.md`) — **схоже, вже
  пофіксено** бекенд-комітом `e5b5f7f` того ж дня (`trailer`
  `required=False`); підтвердити на живому проді при першій нагоді,
  а не просто довіряти повідомленню коміту.
- Раніше (до 10.08) двічі губили маршрут `/driver-app` і
  `src/api/cars.ts` при рефакторингах `App.tsx` — позначено коментарем
  `⚠️ НЕ ВИДАЛЯТИ`, звіряти при кожному великому переписуванні `App.tsx`.
- `package-lock.json` — дрібні локальні розходження, не наші, не
  чіпати.
- Інший процес комітить/мержить у `main` незалежно від поточної сесії
  — перед плануванням нової гілки звіряти `git log`
  ([[feedback_parallel_git_activity]]).
