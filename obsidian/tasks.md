# vehicle_cost_tracker — задачі та статус

Останнє оновлення: 2026-08-31 (другий раз того самого дня — додано
`/panel/events` і Excel-імпорт довідників, поза нумерацією
`CODING_GUIDE.md`, як і `panel-management`).

> ⚠️ Резинхронізовано напряму проти коду й `git log` — попередня версія
> (2026-08-30) стверджувала "Фаза 18 ще не набрана в цьому репо"; на
> момент цього резинку в git log вже злиті Фази 18-21, окрема
> panel-management-фіча (поза `CODING_GUIDE.md`) і waybill inline-edit.
> Детальніший наратив — `STATE.md`, хронологія — `CHANGES.md`.

## Зроблено (за git log / CODING_GUIDE.md)

- **Фаза 1-17** — див. попередні версії цього файлу / `STATE.md` для
  повного списку; коротко: лендінг, auth, API-шар/hooks, layouts,
  `WaybillList`, `DriverDashboard`/`EventForm`, `RequireRole`/
  `RoleRedirect`, `QRScanner`, `FleetList`/`CarForm`/`DriverForm`,
  `EventDetail` (групування/видалення накладних).
- **Фаза 18 (2026-08-30)** — найманий транспорт: `src/api/hiredTrips.ts`,
  `useHiredTrips.ts`, `pages/hired/HiredTripList.tsx`/`HiredTripForm.tsx`
  (спільний `QRScanner`), маршрути `/hired`, `/hired/new`, `/hired/:tripId`.
- **Фаза 19 (2026-08-30)** — місячні витрати по своїх авто:
  `src/api/monthlyCosts.ts`, `useMonthlyCosts.ts`,
  `pages/admin/MonthlyCostsList.tsx`/`MonthlyCostsForm.tsx`.
- **Фаза 20 (2026-08-30)** — навігація/ролі впорядковані:
  `src/utils/roleAccess.ts` (`ROLE_ROUTES`/`rolesForRoute` — єдине
  джерело правди роль↔маршрут, підмінило розрізнений гейт в `App.tsx`),
  гамбургер-меню в `MainLayout` з фільтром за роллю, `PanelHome.tsx`
  (index-сторінка `/panel`), `MonthlyCosts*` переїхали з
  `pages/admin/` у `pages/costs/` (маршрут `/admin` навмисно НЕ
  використовується як SPA-роут — nginx проксіює `/admin/` напряму на
  Django admin, кастомний адмін-розділ живе на `/panel`).
- **Фаза 21 (2026-08-30)** — фікс `/panel` 404 (Service Worker
  перехоплював навігацію — додано denylist на `/admin`, не `/panel`),
  уніфікація форм (локед-режим, темний select, компактні пари полів),
  `BulkMonthlyCostsForm.tsx` (масове введення витрат), права Postgres на
  таблиці `apps.logistics`.
- **Panel-management (2026-08-30, поза нумерацією `CODING_GUIDE.md`)** —
  `/panel/products`, `/panel/customers` (+ їхні магазини),
  `/panel/stores` — повний CRUD на реальних `apps.products`/
  `apps.customers` (бекенд уже існував, лишалось підключити фронтенд);
  `/panel/users` (`UserManagement.tsx`, лише `head`) — підтвердження
  реєстрацій із вибором ролі, зміна ролі активних, деактивація, лінк
  Telegram-заявки до наявного email-акаунта
  (`apps.accounts.AdminUserViewSet`). Заразом виправлено
  `Product`/`Customer`/`Store`-типи в `types/index.ts` — попередні форми
  були придумані ще до першого реального споживача (`id_category` vs
  `id`, відсутній `stores_count` тощо), тепер відповідають реальному
  DRF-виводу.
- **Inline-редагування накладної (2026-08-31)** — `EventDetail.tsx`:
  водій може поправити номер/дату/клієнта/одометр/палети вже
  відсканованої накладної (`PATCH /route-events/:id/`,
  `useUpdateRouteEvent`) замість видалення й пересканування з нуля.
  Підтвердження видалення замінено з "натисни ту саму кнопку двічі" на
  явну картку "Так, видалити"/"Скасувати" ([[decisions.md]] — обидва
  рішення документовані там, друге замінює запис від 2026-08-28).

- **`/panel/events` — адмінський CRUD подій водіїв (2026-08-31, head-only)**
  — на етапі живого тестування дозволяє переглянути/поправити/додати
  подію будь-якого водія (не лише вузький PATCH, який має сам водій у
  `EventDetail.tsx`). Дослідження бекенду показало: змін бекенду НЕ
  знадобилось — `RouteEventViewSet` уже пускає non-driver ролі до ВСІХ
  подій (черга фільтрується лише для `role=driver`), `perform_create`
  форсує `car`/`driver` з сесії теж лише для водія. `EventsAdminList.tsx`
  (фільтр дата+авто на бекенді, водій — клієнтський), `EventAdminForm.tsx`
  (повна форма — авто/водій/тип/час обираються вручну, той самий набір
  умовних полів, що `driver/EventForm.tsx`). `RouteEventPatch` розширено
  до всіх полів `RouteEvent` (був — лише 5), кеш-інвалідація мутацій
  розширена до всього префіксу `["route-events"]`.
- **Масовий Excel-імпорт Товарів/Клієнтів/Магазинів (2026-08-31)** —
  парсинг на фронтенді (`xlsx`/SheetJS), без змін бекенду: PK-поля
  (`idProduct`/`idCustomer`/`idStore`) уже приймались звичайним POST.
  Спільні `src/utils/excelImport.ts` (parse/generate template) +
  `src/hocks/useBulkImport.ts` (послідовний цикл зі збором помилок по
  рядку, той самий підхід, що `BulkMonthlyCostsForm.tsx`), три тонкі
  сторінки `*Import.tsx`. **Важливо:** пакет `xlsx` встановлено НЕ з npm
  (0.18.5 звідти має 2 непофікшені CVE — prototype pollution, ReDoS), а
  напряму з `https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz`
  (офіційний патчений білд SheetJS) — `package.json` посилається на цей
  URL замість версії. Перевірено вручну на реальному бекенді (не mock):
  Клієнти й Товари (з вкладеною логістикою) імпортуються коректно;
  Магазини вимагають, щоб клієнт з "ID клієнта" уже існував (`customer`
  — обов'язковий FK, `on_delete=RESTRICT`).

- **Живе тестування `/panel/events` (2026-08-31, того ж дня)** — знайдено
  й виправлено: "Режим обліку" показував сирі `daily`/`full` замість
  української; `EventAdminForm.tsx` не мав локед-режиму й можливості
  додати ще одну накладну до точки; видалення йшло через
  `window.confirm()` замість UI-підтвердження. Заразом виправлено
  реальний 400-баг (порожня "Дата накладної" слала `""`, не `null`).
  Користувач зафіксував локед-режим і custom-підтвердження видалення як
  ЗАГАЛЬНЕ правило проєкту — [[decisions.md]] і пам'ять Claude Code.

## Наступний крок

1. `WaybillDetail`, `/waybills/import`, `/waybills/unassigned`,
   `/waybills/returns` (Крок 22 `CODING_GUIDE.md`, waybill-імпорт з 1С)
   — гайд написаний, код фронтенду ще НЕ набраний.
2. `CarrierShipmentForm`/`CarrierCostImport` (Крок 23 `CODING_GUIDE.md`)
   — гайд написаний, код ще НЕ набраний; `/carriers` усе ще
   `PlaceholderPage`.
3. Аналітика/графіки (Recharts) — і бекенд (`apps.analytics`), і
   фронтенд свідомо не почато.
4. Перевірити backend-репо `vehicle_tracker_api` — попередні нотатки
   (2026-08-30) стверджували, що `apps.logistics` серіалізатори/views
   для Фаз 18-19 закомічені локально, але НЕ запушені; ця сесія код
   бекенду не перевіряла. Якщо досі не запушено — Фази 18-21 і
   panel-management у проді можуть працювати проти старішого бекенду,
   ніж очікується.
5. Дрібне: `findEventGroup()` тепер групує за явним маркером
   `[stop:N]` у `notes`, НЕ за часовою евристикою (замінено ще
   2026-08-28, той самий день, що й Фаза 17 — старі записи без
   маркера залишаються кожен сам собі групою).

```bash
git checkout main
git pull origin main
git checkout -b feature/waybill-detail
```

## Відкриті питання

- `package-lock.json` — досі дрібні локальні розходження, не мої,
  не займав жодного разу.
- Інший процес комітить/мержить у `main` незалежно від цієї сесії —
  перед плануванням нової гілки звіряй `git log`.
- Panel-management і waybill inline-edit не описані в
  `CODING_GUIDE.md` (на відміну від решти проєкту) — якщо гайд і
  далі ведеться як джерело правди для навчального формату, варто
  дописати ці розділи заднім числом або явно зафіксувати, що вони
  поза навчальним форматом.
