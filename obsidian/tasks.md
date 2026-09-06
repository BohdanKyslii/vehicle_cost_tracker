# vehicle_cost_tracker — задачі та статус

Останнє оновлення: 2026-09-06.

> ⚠️ Резинхронізовано напряму проти `git log` (був виконаний `git fetch`,
> попередній стан `main` у цій сесії був не підтягнутий) — виявилось,
> що `feat/panel-management` уже змержена в `main` (PR #18), і поверх
> неї напряму в `main` додано ще `/panel/events` + масовий Excel-імпорт
> довідників. Цієї ж сесії реалізовано **Фазу 22** в окремій гілці
> `faza-22-1c-import` (пізніше змерджена в `main`, PR #19). У наступній
> сесії того самого дня (2026-09-06) реалізовано **Фазу 23** в окремій
> гілці `faza-23-carriers` — користувач змержив її сам (PR #20) і того
> ж дня видалив `documents/file_1C/` напряму на `main` (реальні дані
> продажів клієнта, тепер у `.gitignore`, [[decisions.md]]).
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

- **Фаза 22 (2026-09-06)** — форма імпорту накладних з 1С,
  `/waybills/import`: `WaybillImportForm.tsx` (юрособа РУБІН/ЄСП/ОПТ +
  файл), `api/waybillImport.ts` + `apiFetchMultipart` в `config.ts`
  (multipart/form-data, без `JSON.stringify`), `useWaybillImport.ts`.
  Гілка `faza-22-1c-import`, `npm run build` чистий. Бекенд
  (`apps/waybills`, `IsManagerOrHeadOnly`) уже був готовий, звірений
  напряму з кодом. **Живий тест реальним файлом (Крок 22.8) НЕ
  проведений** — локальний бекенд конфігурований на прод-БД (Pi),
  а `import_file` робить DELETE+INSERT; ризик для прод-даних визнано
  невиправданим без dev-стенду ([[decisions.md]]).

- **Фаза 23 (2026-09-06, та сама сесія)** — служби доставки, `/carriers`:
  `CarrierShipmentList.tsx`/`CarrierShipmentForm.tsx` (локед-режим,
  сканування накладних QR — той самий флоу, що `HiredTripForm`),
  `CarrierCostImport.tsx` (CSV-реєстр витрат, окремий маршрут
  `/carriers/import-costs`), `api/carrierShipments.ts`/`carrierCosts.ts`,
  `useCarrierShipments.ts`/`useCarrierCosts.ts`,
  `utils/parseCarrierCostsCsv.ts`. Бекенд (`apps/logistics`,
  `CarrierShipmentViewSet`/`CarrierCostViewSet`) уже був готовий і
  задеплований разом з Фазою 18 — звірений напряму з кодом, `types/index.ts`
  виправлено проти реальної моделі (`carrier` — enum, не вільний текст;
  `CarrierCost.weightKg` обов'язкове). Гілка `faza-23-carriers`
  (від актуального `main`), `npm run build`+`eslint` чисті. **Живий тест
  (Крок 23.10) НЕ проведений** — той самий ризик для прод-БД, що й
  Фаза 22. Мапінг колонок CSV-парсера — тимчасовий, реальних файлів
  від Нової Пошти/Міст Експрес ще не бачили (Крок 23.6 гайду). Гілку
  змержено (PR #20) тим самим днем, живий тест — окремим кроком.

- **Видалення `documents/file_1C/` (2026-09-06, тим самим днем)** —
  реальний CSV/XLS-експорт продажів клієнта видалено напряму на `main`
  (не мав лежати в git); директорія додана в `.gitignore`, щоб файли,
  якщо повернути їх локально для тестування CSV-імпорту, не потрапляли
  в коміт випадково знову ([[decisions.md]]).

- **Живе тестування `/panel/events` (2026-08-31, того ж дня)** — знайдено
  й виправлено: "Режим обліку" показував сирі `daily`/`full` замість
  української; `EventAdminForm.tsx` не мав локед-режиму й можливості
  додати ще одну накладну до точки; видалення йшло через
  `window.confirm()` замість UI-підтвердження. Заразом виправлено
  реальний 400-баг (порожня "Дата накладної" слала `""`, не `null`).
  Користувач зафіксував локед-режим і custom-підтвердження видалення як
  ЗАГАЛЬНЕ правило проєкту — [[decisions.md]] і пам'ять Claude Code.

## Наступний крок

1. Фази 22 й 23 обидві змержені в `main` (PR #19, #20). Живий тест
   Кроку 22.8 (реальний файл 1С) і Кроку 23.10 (реальний файл-реєстр
   служби доставки + звірка мапінгу `parseCarrierCostsCsv.ts`) — ще
   попереду, свідомо пропущені перед мержем (ризик для прод-БД).
   `WaybillDetail`, `/waybills/unassigned`, `/waybills/returns`
   лишаються не набраними.
2. Аналітика/графіки (Recharts) — і бекенд (`apps.analytics`), і
   фронтенд свідомо не почато.
3. Перевірити backend-репо `vehicle_tracker_api` — попередні нотатки
   (2026-08-30) стверджували, що `apps.logistics` серіалізатори/views
   для Фаз 18-19 закомічені локально, але НЕ запушені; ця сесія код
   бекенду не перевіряла (окрім `apps/waybills` для Фази 22 і
   `apps/logistics` views/serializers для Фази 23, обидва звірено
   читанням і виявилось готовими). Якщо щось із цього досі не
   запушено — прод може працювати проти старішого бекенду, ніж
   очікується.
4. Дрібне: `findEventGroup()` тепер групує за явним маркером
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
