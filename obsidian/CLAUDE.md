# vehicle_cost_tracker — швидкий довідник

Frontend-репозиторій застосунку обліку транспортних витрат. React PWA,
навчальний проєкт (JS/React/TS з нуля) — весь процес написання коду
задокументований крок за кроком у `CODING_GUIDE.md` у корені репо.

> ⚠️ **Резинхронізовано 2026-09-06** — після `git fetch` виявилось, що
> `feat/panel-management` уже змержена в `main` (PR #18) і поверх неї
> напряму в `main` додано ще `/panel/events` + масовий Excel-імпорт
> довідників (усе це — Фази 18-21 + позапланова робота, вже було описано
> нижче раніше). Нове цієї сесії: **Фаза 22** (форма імпорту накладних
> з 1С, `/waybills/import`) реалізована в окремій гілці
> `faza-22-1c-import` (`npm run build` проходить чисто), ще НЕ
> змержена в `main`. Деталі й дати — `STATE.md`/`tasks.md`/`CHANGES.md`.
>
> Бекенд-шлях нижче перевірено 2026-08-30 через `PowerShell` (правило
> на майбутнє: Windows-шляхи з `\` перевіряти через `PowerShell`, не
> `Bash` — POSIX `ls` на такому шляху ненадійний). Деталі — `CLAUDE.md`
> цього репо (не vault-копія).
>
> **Підтверджено 2026-09-06:** бекенд `vehicle_tracker_api` для
> `apps.waybills` (`WaybillRecordViewSet.import_file`,
> `IsManagerOrHeadOnly`) уже написаний і відповідає точно тому, що
> описано в `CODING_GUIDE.md` Крок 22.1 — перевірено читанням реального
> `apps/waybills/views.py`/`importing.py`. Чи запушено це в `main`
> бекенд-репо — НЕ перевірено цією сесією.
>
> **Нове 2026-09-06 (та сама сесія): Фаза 23** (служби доставки,
> `/carriers`) реалізована в окремій гілці `faza-23-carriers` (від
> актуального `main`, включно з Фазою 22). `npm run build`+`eslint`
> чисті. Живий тест (Крок 23.10 гайду) НЕ проведений — той самий ризик
> для прод-БД, що й у Фазі 22. CSV-парсер витрат — тимчасовий, мапінг
> колонок не звірявся з реальним файлом жодної служби доставки.
>
> **Резинхронізовано 2026-09-10:** Фази 22/23 змержені в `main` (PR
> #19/#20), `documents/file_1C/` видалено. Ця сесія — велика робота
> поза нумерацією гайду (як і `panel-management` раніше): довідник
> **Категорії товарів** (`/panel/categories`, `CategoryList/Form.tsx`,
> масовий імпорт `CategoryImport.tsx`), 🗑 видалення в усіх чотирьох
> довідниках (Товари/Категорії/Клієнти/Магазини — спільний
> `ConfirmDelete`), інлайн-фільтри по клацанню заголовка колонки
> (`FilterableHeader.tsx`), клієнтська пагінація 25/50/100
> (`usePagination.ts`+`PageSizeSelect.tsx`, `Pagination.tsx` тепер не
> лише на Накладних), інлайн-перемикач статусу прямо в рядку списку.
> Заразом два системні баги на всьому застосунку: (1) усі `fetch*` в
> `src/api/*.ts` читали лише сторінку 1 DRF-пагінації (по 10) — тепер
> спільний `fetchAllPages()` в `config.ts`; (2) 9 форм редагування
> лишались порожніми на холодному кеші React Query (`useState`
> ініціалізувався з ще не довантажених даних) — виправлено патерном
> "adjust state during render". Залито реальний каталог у прод:
> Категорії 85, Клієнти 382, Магазини 2152, Товари 1120. PWA-іконки
> нарешті реальні (`manifest.icons` був порожній). **Спростування:**
> нотатка нижче й у "Бекенд коротко" про те, що `apps/waybills
> import_file` "звірено напряму й готовий" — перевірено ще раз
> 2026-09-10, ендпоінта НЕМАЄ, вкладка "Імпорт із 1С" 404-ить для
> будь-якої юрособи. Деталі — `tasks.md`.

Пов'язаний репозиторій: **vehicle_tracker_api** (Django-бекенд,
`C:\Users\b.kisliy\PycharmProjects\DjangoProject\vehicle_tracker_api\`) — один
застосунок, розділений на два репо. Vault-контекст бекенду: тека
`vehicle_tracker_api` поруч із цією в `projects/` (Junction на
`task_description/` у бекенд-репо).

## Стек

- React 19.2, TypeScript 6.0, Vite 8.1
- react-router-dom v7.18 (маршрутизація)
- TanStack Query v5.101 (data fetching/caching) — `useCurrentUser`,
  `QueryClientProvider` у `main.tsx`
- Tailwind CSS v4.3 + власний CSS-файл для лендінгу (`landing.css`)
- Recharts v3.9 (у залежностях, аналітика ще не написана — свідомо
  відкладено)
- html5-qrcode v2.3.8 — реально використовується (`QRScanner.tsx`,
  Фаза 15)
- xlsx (SheetJS) — масовий Excel-імпорт довідників (2026-08-31),
  `src/utils/excelImport.ts`. Встановлено НЕ з npm-реєстру (там 2
  непофікшені CVE) а з `https://cdn.sheetjs.com/xlsx-latest/xlsx-latest.tgz`
  — `package.json` посилається на URL, це очікувано ([[decisions.md]]).

## Структура репо (реальний стан коду, не лише гайд)

```
src/
  App.tsx                     — маршрути; RequireRole на /fleet і /driver,
                                 RoleRedirect на "/"
  main.tsx, index.css, assets/logo.png
  api/
    config.ts                — apiFetch (credentials, CSRF, JSON), USE_MOCK
    auth.ts, cars.ts, drivers.ts — повний CRUD (не read-only)
    routeEvents.ts            — create/delete (Фаза 17), fetchToday/fetchDriver/lastOdometer
    waybills.ts
  components/
    auth/AuthModal.tsx, RequireRole.tsx
    layouts/TopNav.tsx        — верхнє меню лендінгу
    layouts/MainLayout.tsx    — sidebar, офісні сторінки (/fleet, /waybills, ...)
    layouts/DriverLayout.tsx  — темна mobile-first тема, bottom nav (Telegram Mini App контекст)
    driver/ui.tsx, DayModeSwitch.tsx (compact-варіант), QRScanner.tsx
    waybills/WaybillList.tsx, WaybillTable.tsx, WaybillFiltersBar.tsx
    ui/ — Button, Input, Spinner, EmptyState, ErrorBanner, Badge,
          Pagination, SortHeader (світла нейтральна дизайн-система,
          НЕЗАЛЕЖНА від components/driver/ui.tsx — однакові назви,
          різні файли)
  pages/
    driver/DriverDashboard.tsx, EventForm.tsx, DriverHistory.tsx,
           EventDetail.tsx (Фаза 17 + inline-edit накладної, 2026-08-31)
    waybills/WaybillImportForm.tsx (Фаза 22, 2026-09-06) — вибір
           юрособи (РУБІН/ЄСП/ОПТ) + файл, без локед-режиму (одноразова
           дія, не форма редагування)
    fleet/FleetList.tsx, CarForm.tsx, DriverForm.tsx
    hired/HiredTripList.tsx, HiredTripForm.tsx (Фаза 18)
    carriers/CarrierShipmentList.tsx, CarrierShipmentForm.tsx,
             CarrierCostImport.tsx (Фаза 23, 2026-09-06, гілка
             faza-23-carriers) — той самий локед-режим/QR-сканування,
             що HiredTripForm; CarrierCostImport окремо для
             CSV-реєстру витрат (тимчасовий парсер колонок)
    costs/MonthlyCostsList.tsx, MonthlyCostsForm.tsx, BulkMonthlyCostsForm.tsx
          (Фаза 19/21, переїхало з admin/ у Фазі 20)
    panel/ — /panel, head-only "суперкористувацький" розділ
      PanelHome.tsx           — тайли-посилання (Автопарк, Події водіїв,
                                 Товари, Категорії, Клієнти, Магазини,
                                 Користувачі)
      ProductList/Form.tsx, ProductImport.tsx      (2026-08-30/31)
      CategoryList.tsx, CategoryForm.tsx, CategoryImport.tsx (2026-09-10,
                                 `/panel/categories`, `/panel/categories/import`
                                 — раніше `CategoryImport` жив під
                                 `/panel/products/categories/import`,
                                 переїхав разом з появою повного довідника)
      CustomerList/Form.tsx, CustomerImport.tsx    (2026-08-30/31)
      StoreList/Form.tsx, StoreImport.tsx          (2026-08-30/31)
      — усі чотири списки (Товари/Категорії/Клієнти/Магазини, 2026-09-10):
        🗑 видалення на рядок (`ConfirmDelete`, той самий компонент, що
        в `EventsAdminList`), інлайн-фільтр по клацанню заголовка
        колонки (`components/ui/FilterableHeader.tsx`), клієнтська
        пагінація 25/50/100 (`hocks/usePagination.ts` +
        `components/ui/PageSizeSelect.tsx` + наявний `Pagination.tsx`),
        інлайн-перемикач статусу прямо в рядку (той самий принцип, що
        швидка зміна статусу авто в `FleetList.tsx`)
      UserManagement.tsx      — підтвердження реєстрацій/зміна ролі
      EventsAdminList.tsx, EventAdminForm.tsx      (2026-08-31) — повний
                                 CRUD подій ВСІХ водіїв (не лише свого),
                                 бекенд не змінювався ([[decisions.md]])
    DriverMiniApp.tsx         — Telegram Mini App логін-екран, редіректить
                                 за роллю (ROLE_ROUTES) після логіну
    LandingPage.tsx, UnderConstruction.tsx, RoleRedirect.tsx, PlaceholderPage.tsx
  hocks/                      — тека названа "hocks", не "hooks" (навмисно, [[decision_hocks_typo]])
    useCars.ts, useDrivers.ts, useRouteEvents.ts (+useAllRouteEvents/
      useRouteEvent, 2026-08-31), useWaybills.ts, useWaybillFilters.ts,
    useHiredTrips.ts, useMonthlyCosts.ts, useProducts.ts (2026-09-10:
      +useDeleteProduct, +useUpdateProductById — id передається в
      mutate(), не фіксується при виклику хука, щоб працювало в .map()
      по рядках списку; +категорійні хуки), useCustomers.ts
      (2026-09-10: +useDeleteCustomer/useUpdateCustomerById + той самий
      принцип для Store — хуки Store живуть тут же, не в окремому
      файлі),
    useCarrierShipments.ts, useCarrierCosts.ts (Фаза 23, 2026-09-06),
    useAdminUsers.ts, useBulkImport.ts (2026-08-31 — спільний хук
      масового імпорту, послідовний цикл зі збором помилок по рядку),
    useWaybillImport.ts (Фаза 22, 2026-09-06 — одна мутація, інвалідує
      waybills + waybills-unassigned),
    usePagination.ts (2026-09-10 — page/pageSize, дефолт 25, для
      клієнтської пагінації довідників),
    useDayMode.ts (carId-scoped), useCurrentUser.ts, useAuthModal.ts
  api/ — routeEvents.ts, cars.ts, drivers.ts, waybills.ts, hiredTrips.ts,
         monthlyCosts.ts, products.ts (2026-09-10: +fetchProductCategory/
         updateProductCategory/deleteProductCategory — раніше лише
         createProductCategory існував; +deleteProduct),
         customers.ts (+deleteCustomer, +deleteStore — Store API теж
         тут), adminUsers.ts, carrierShipments.ts, carrierCosts.ts
         (Фаза 23, 2026-09-06 — той самий Raw/map патерн, що
         hiredTrips.ts),
         waybillImport.ts (Фаза 22, 2026-09-06 — apiFetchMultipart, не
         apiFetch: файл шле multipart/form-data, бекенд сам парсить
         CSV/XLS за legalEntity), config.ts (+ apiFetchMultipart;
         2026-09-10: + fetchAllPages<T>() — спільний хелпер, іде за
         `data.next` DRF-пагінації, доки не `null`; усі list-фетчери
         тепер через нього, бо кожен раніше читав лише сторінку 1
         (PAGE_SIZE=10) і мовчки губив решту записів),
         auth.ts (жоден з products/customers (+Store)/adminUsers/
         waybillImport НЕ має USE_MOCK гілки — завжди б'ють у реальний
         бекенд, навіть при VITE_USE_MOCK=true)
  utils/ — formatters, eventHelpers (+findEventGroup — явний маркер
           [stop:N], НЕ часова евристика, з 2026-08-28), calcSummary,
           calcTransportCost, calcProduct, parseQR.ts, clientFilter,
           roleAccess.ts (ROLE_ROUTES/rolesForRoute — єдине джерело
           правди роль↔маршрут, Фаза 20), carNumber.ts,
           excelImport.ts (2026-08-31 — parse/generate .xlsx на фронтенді)
  styles/landing.css
  types/index.ts               — Car/CarSpecs/Trailer/Driver/RouteEvent/
                                  WaybillRecord/HiredTransportTrip/
                                  CarrierShipment/Product/Customer/Store/
                                  аналітичні типи; CarStatus 5 значень
  mocks/ — cars.json, drivers.json, route-events.json, waybills.json (лише ці 4 —
           Product/Customer/Store/HiredTrip НЕ мають mock-файлів, бо їхні
           api/*.ts завжди б'ють у реальний бекенд, USE_MOCK їх не стосується)

documents/                    — ТЗ/специфікація проєкту (01-08), design-
                                 довідник, ресинхронізовано 2026-08-24 —
                                 НЕ джерело правди по факту імплементації,
                                 для цього CODING_GUIDE.md
CODING_GUIDE.md                — покроковий навчальний гайд, Фази 1-23
                                 реально набрані в коді (Фаза 22/23,
                                 обидві 2026-09-06, змержені PR #19/#20,
                                 живий тест жодної НЕ проведено, див.
                                 [[decisions.md]]); panel-management,
                                 /panel/events + Excel-імпорт, і весь
                                 довідниковий блок 2026-09-10 (Категорії,
                                 видалення, фільтри, пагінація,
                                 fetchAllPages/blank-form фікси) — НЕ
                                 описані як окремі Кроки/Фази (той самий
                                 винятковий статус, [[decisions.md]]);
                                 останній підсумований датованим блоком у
                                 "## Наступні кроки" 2026-09-10
Dockerfile, docker-compose.yml, nginx.conf — деплой на Raspberry Pi
.github/workflows/deploy.yml   — автодеплой при push у main
```

Стубів `src/pages/{fleet,hired,carriers,admin,analystics}`,
`src/components/{fleet,hired,carriers,analystics}` (Фаза 2) уже немає.
`/waybills/import` тепер `WaybillImportForm` (Фаза 22); `/carriers`
тепер `CarrierShipmentList`/`Form`/`CarrierCostImport` (Фаза 23,
гілка `faza-23-carriers`); `/waybills/unassigned`, `/waybills/returns`
і `/analytics` усе ще `PlaceholderPage` (аналітика не набрана);
`/admin` навмисно НЕ SPA-маршрут — nginx проксіює напряму на Django
admin, кастомна адмінка живе на `/panel` ([[decisions.md]]).

## Деплой

- Продакшн: **warehouse.mom** (Raspberry Pi вдома, за Cloudflare Tunnel).
- `main` = задеплоєний код. Push у `main` → GitHub Actions (`deploy.yml`)
  сам збирає Docker-образ і викочує на Pi через `ssh.warehouse.mom`
  (`cloudflared access ssh`).
- SSH-доступ на Pi: user `rasberry_kisliy`, ключ у секреті `PI_SSH_KEY`.
- ⚠️ При будь-якому переписуванні `App.tsx`/`src/api/cars.ts` — звірити,
  що маршрут `/driver-app` і сам `cars.ts` не зникли (вже двічі губили
  при рефакторингах, коментар `⚠️ НЕ ВИДАЛЯТИ` в `App.tsx`).
- **Перед пушем — обов'язково `npm run build`** (не лише `tsc --noEmit`)
  — `tsc -b` (реальний білд) ловив помилки, які `--noEmit` пропускав
  ([[verify-with-npm-run-build]]).

## Робочий процес

- Гілка на фазу з `CODING_GUIDE.md` → проміжні коміти → PR → merge у `main`
  → автодеплой. Пряма робота в `main` — тільки для ранніх фаз (1-4), поки
  коду було мало; пізніші фази теж часто йшли напряму в `main` (дивись
  git log — не завжди суворо через PR).
- Інший процес (не ця сесія) теж комітить/мержить у `main` незалежно —
  перед висновками про стан репо звіряй `git log`, не покладайся на
  пам'ять попередньої сесії.

## Бекенд коротко (деталі — vault-тека vehicle_tracker_api)

`apps/cars` (Car/Driver/RouteEvent/MonthlyCosts) — повний CRUD, живий,
рольовий захист: `get_permissions()` вимагає `IsAuthenticated` на
читання й `IsLogistOrAbove` на запис (DRF `ModelViewSet`). `RouteEventViewSet`
не перевизначає `get_permissions()` — діє дефолтний `IsAuthenticated`
на всі дії (включно з `destroy`), `get_queryset()` обмежує водія його
ж подіями. `CarStatus` — 5 значень (`active`/`repair`/`inactive`/
`pause`/`driver_downtime`, додано 2026-08-28).

`apps/logistics` (найманий транспорт + служби доставки, Фаза 15
бекенду) — **лише моделі** (`HiredTransportTrip`/`CarrierShipment`,
міграція, комміт `453d461`) і порожні заглушки `views.py`/`admin.py`
(по 3 рядки) — серіалізатори/URL ще не написані, `config/urls.py`
підключення закоментоване з `# TODO`. Попередні нотатки в цьому vault
(2026-08-26) стверджували, що серіалізатори/views/urls вже готові в
робочій копії — це виявилось хибним/застарілим при прямій перевірці
2026-08-28, або та робота була відкинута.

`apps/accounts` — ролі (`driver`/`logist`/`manager`/`head`),
Telegram-бот для реєстрації водіїв, задеплоєний і робочий у проді.
Email-реєстрація тепер теж створює порожній `Driver`-запис (раніше
цього не робила — [[telegram-email-account-linking-gap]], пофіксено
бекенд-комітом `e5b5f7f` 2026-08-28).

`products`/`customers`/`analysis` — app-теки існують, моделі не мінімальні
(реальний каталог 2026-09-10 підтверджує це) — стандартний CRUD API вже
написаний і використовується `/panel/*`. `apps/waybills` — стандартний
CRUD + `unassigned`/`assign_channel` написані й робочі, але
**⚠️ Спростування 2026-09-10:** нотатка нижче й вище (від 2026-09-06)
стверджувала, що `import_file` (1С-імпорт) теж уже готовий і звірений
напряму з кодом — перевірено ще раз 2026-09-10 прямим читанням
`apps/waybills/views.py`: **такого ендпоінта НЕМАЄ**, жодного `import_file`,
CSV/XLS-парсера чи `importers/`-модуля в поточному `views.py`. Вкладка
"Імпорт із 1С" (`WaybillImportForm.tsx`, Фаза 22) 404-ить для БУДЬ-ЯКОЇ
юрособи (РУБІН/ЄСП/ОПТ) в реальному проді. Причина розбіжності
2026-09-06 → 2026-09-10 не з'ясована (можливо, код читався в іншій
гілці бекенду й не був змержений/запушений) — перш ніж покладатись на
"живо й підтверджено" в старих записах цього файлу, перевіряй
`apps/waybills/views.py` напряму. Деталі й контекст — `tasks.md`,
[[open-items-2026-09-10]].

**Наслідок для фронтенду:** усі `/api/cars/`, `/api/drivers/`,
`/api/route-events/` вимагають автентифікованої сесії; DELETE на
`/api/route-events/<id>/` уже підтримується без додаткових бекенд-змін
(Фаза 17 фронтенду просто почала його викликати).

## Obsidian vault sync

Ця тека (`obsidian/` у корені репозиторію `vehicle_cost_tracker`) —
джерело правди для 8 файлів. У vault на неї вказує Windows Junction:
`projects\vehicle_cost_tracker` (той самий підхід, що й для
`vehicle_tracker_api`, де Junction веде на `task_description/`).

**Первинна четвірка** (від початку проєкту):
- `CLAUDE.md` — цей файл, швидкий довідник по репо.
- `tasks.md` — короткий статус-список: зроблено / наступний крок.
- `decisions.md` — архітектурні рішення "чому саме так".
- `env.example.md` — лише СТРУКТУРА `.env` (імена змінних + призначення),
  без значень і секретів.

**Додана 2026-08-24 четвірка** (за зразком аналогічних файлів у
`vehicle_tracker_api/task_description/`, для паритету документації
між репозиторіями):
- `STATE.md` — ширший наратив поточного стану (те саме, що й
  `tasks.md`, але детальніше, з контекстом "чому"; не дублюй сюди все з
  `tasks.md` механічно — `tasks.md` лишається коротким, `STATE.md`
  довшим).
- `CHANGES.md` — хронологічний журнал змін (детальніше, ніж записи в
  `tasks.md`, з розділами "Що зроблено / Чому / Статус" на кожну подію).
- `AGENTS_GLOBAL.md` — правила проєкту й стандарти коду (те, що в
  `decisions.md` — це "чому", тут — "як писати код": стиль,
  архітектурні принципи, git workflow).
- `AI_AGENT_CONTEXT.md` — технічні пастки для AI-агента: реальні
  сигнатури типів, розбіжності з планом, типові помилки (таблиця
  "Ситуація → Правильно").

Коли просять "онови obsidian" / "sync obsidian" — прочитай актуальний стан
репо (структура, git log, CODING_GUIDE.md, documents/) і перепиши потрібні
файли тут напряму (Read/Write), без MCP. Не всі 8 файлів обов'язково
торкати щоразу — онови ті, яких стосується зміна (напр. чисто
косметичний рефакторинг не потребує правки `AGENTS_GLOBAL.md`).

Онови ці файли одразу наприкінці сесії, якщо було зроблено значущу зміну
(задача, архітектурне рішення, зміна `.env`) — не відкладай.

> ⚠️ Урок 2026-08-28: цей vault лежав застарілим кілька сесій поспіль
> (STATE.md/tasks.md/AGENTS_GLOBAL.md/AI_AGENT_CONTEXT.md усі
> стверджували "Фаза 14-16 не набрана" вже ПІСЛЯ того, як вони були
> реально задеплоєні) — і кожен новий стверджувальний запис ("✅
> Резинхронізовано ЦЬОГО ЧИСЛА") сам ставав джерелом хибної інформації
> для наступної сесії, щойно код рухався далі. Довіряй позначкам
> "перевірено на дату X" лише як знімку на той момент, а не як
> постійному факту — перед плануванням завжди звіряй з `git log` і
> реальними файлами `src/`, а не тільки з текстом іншого нотатника.
