# vehicle_cost_tracker — швидкий довідник

Frontend-репозиторій застосунку обліку транспортних витрат. React PWA,
навчальний проєкт (JS/React/TS з нуля) — весь процес написання коду
задокументований крок за кроком у `CODING_GUIDE.md` у корені репо.

> ⚠️ **Резинхронізовано 2026-08-30** — шлях бекенду нижче знову
> виправлено, третій раз поспіль: сесія 2026-08-28 "перевірила напряму"
> й записала шлях БЕЗ підтеки `DjangoProject\` та з друкарською
> помилкою `b.kysliy` — і те, й інше хибне. Причина: та перевірка
> йшла через `Bash` (POSIX sh), де зворотний слеш у Windows-шляхах —
> escape-символ і `ls` на такому шляху ненадійний. Перевірено 2026-08-30
> через `PowerShell` (`Get-ChildItem`) — правильний шлях нижче. Правило
> на майбутнє: Windows-шляхи з `\` перевіряти через `PowerShell`, не
> `Bash`. Деталі — `CLAUDE.md` цього репо (не vault-копія).
>
> Того самого дня (2026-08-30) написано й закодовано **Фазу 18**
> (`CODING_GUIDE.md`) — `MonthlyCosts`/`HiredTransportTrip` для логіста
> (витрати по своїх авто + найманий транспорт). Бекендова частина
> (`apps.logistics` serializers/views/urls, і виправлення прав
> `MonthlyCostsViewSet`) закомічена в `vehicle_tracker_api` (`main`,
> локально) — ще НЕ запушена.

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
           EventDetail.tsx (Фаза 17 — деталі/видалення/групування подій)
    fleet/FleetList.tsx, CarForm.tsx, DriverForm.tsx
    DriverMiniApp.tsx         — Telegram Mini App логін-екран, редіректить
                                 за роллю (ROLE_LANDING) після логіну
    LandingPage.tsx, UnderConstruction.tsx, RoleRedirect.tsx, PlaceholderPage.tsx
  hocks/                      — тека названа "hocks", не "hooks" (навмисно, [[decision_hocks_typo]])
    useCars.ts, useDrivers.ts, useRouteEvents.ts (+useDeleteRouteEvent, Фаза 17),
    useWaybills.ts, useWaybillFilters.ts, useDayMode.ts (carId-scoped),
    useCurrentUser.ts, useAuthModal.ts
  utils/ — formatters, eventHelpers (+findEventGroup, Фаза 17),
           calcSummary, calcTransportCost, calcProduct, parseQR.ts, clientFilter
  styles/landing.css
  types/index.ts               — Car/CarSpecs/Trailer/Driver/RouteEvent/
                                  WaybillRecord/HiredTransportTrip/
                                  CarrierShipment/аналітичні типи;
                                  CarStatus тепер 5 значень (+pause/driver_downtime)
  mocks/ — cars.json, drivers.json, route-events.json, waybills.json (лише ці 4)

documents/                    — ТЗ/специфікація проєкту (01-08), design-
                                 довідник, ресинхронізовано 2026-08-24 —
                                 НЕ джерело правди по факту імплементації,
                                 для цього CODING_GUIDE.md
CODING_GUIDE.md                — покроковий навчальний гайд, Фази 1-17,
                                 джерело правди по тому, що реально
                                 набрано в код (крок за кроком)
Dockerfile, docker-compose.yml, nginx.conf — деплой на Raspberry Pi
.github/workflows/deploy.yml   — автодеплой при push у main
```

Стубів `src/pages/{fleet,hired,carriers,admin,analystics}`,
`src/components/{fleet,hired,carriers,analystics}` (Фаза 2) уже немає —
`fleet/` реальний, решта директорій прибрані разом з рештою
не-`PlaceholderPage`-маршрутів, які досі порожні (`/hired`, `/carriers`,
`/admin`, `/analytics` — рендерять `PlaceholderPage`, коду під них ще
нема).

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

`products`/`customers`/`analysis`/`waybills` (1С-імпорт) — app-теки
існують, моделі мінімальні або відсутні, API ще не написане.

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
