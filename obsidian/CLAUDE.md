# vehicle_cost_tracker — швидкий довідник

Frontend-репозиторій застосунку обліку транспортних витрат. React PWA,
навчальний проєкт (JS/React/TS з нуля) — весь процес написання коду
задокументований крок за кроком у `CODING_GUIDE.md` у корені репо
(зараз Фази 1-16: **1-13 набрано в код**, **14-16 щойно дописані в
гайд** — рольова маршрутизація, QR-сканер водія, CRUD автопарку для
логіста — ще НЕ набрані руками в репозиторій, це наступний крок).

Пов'язаний репозиторій: **vehicle_tracker_api** (Django-бекенд,
`C:\Users\b.kisliy\PycharmProjects\DjangoProject\vehicle_tracker_api\`) —
один застосунок, розділений на два репо. Vault-контекст бекенду: тека
`vehicle_tracker_api` поруч із цією в `projects/` (Junction на
`task_description/` у бекенд-репо).

## Стек

- React 19, TypeScript, Vite
- react-router-dom v7 (маршрутизація)
- TanStack Query v5 (data fetching/caching) — підключено з Фази 4.5
  (`useCurrentUser`, `QueryClientProvider` у `main.tsx`)
- Tailwind CSS + власний CSS-файл для лендінгу (`landing.css`)
- Recharts (аналітика, заплановано, ще не в гайді)
- html5-qrcode — у `package.json`, гайд написаний (Фаза 15 —
  `QRScanner`, `parseQR.ts`), сам компонент ще не набраний у код

## Структура репо (реальний стан коду, не лише гайд)

```
src/
  App.tsx                     — маршрути; `/` зараз Navigate на /driver
                                 (Фаза 14 гайду це виправляє на рольовий
                                 редирект, ще не набрано)
  main.tsx, index.css, assets/logo.png
  api/
    config.ts                — apiFetch (credentials, CSRF, JSON)
    auth.ts, cars.ts (read-only!), drivers.ts (read-only!),
    routeEvents.ts, waybills.ts
  components/
    auth/AuthModal.tsx
    layouts/TopNav.tsx        — верхнє меню лендінгу; LandingPage/TopNav
                                 зараз "осиротілі" — жоден route на / їх
                                 не показує (Фаза 14 виправляє)
    layouts/MainLayout.tsx    — ліва sidebar, темний градієнт (не
                                 верхнє меню; офісні сторінки)
    layouts/DriverLayout.tsx  — окрема темна mobile-first тема, bottom
                                 nav, навмисно відділена від MainLayout
                                 (Telegram Mini App контекст)
    driver/ui.tsx, DayModeSwitch.tsx — driver-версія ui/-компонентів
    waybills/WaybillList.tsx, WaybillTable.tsx, WaybillFiltersBar.tsx
    ui/ — Button, Input, Spinner, EmptyState, ErrorBanner, Badge,
          Pagination, SortHeader (світла нейтральна дизайн-система)
    fleet/, hired/, carriers/, analystics/ — ПОРОЖНІ заготовки (Фаза 2)
  pages/
    driver/DriverDashboard.tsx, EventForm.tsx — реальні, живі
    DriverMiniApp.tsx         — Telegram Mini App логін-екран; після
                                 логіну сама редіректить за роллю
                                 (ROLE_LANDING: driver→/driver,
                                 logist/manager/head→/fleet) — це вже
                                 набрано (коміт d82b5eb), окремо від
                                 Фази 14 (`RequireRole`, захист самих
                                 роутів для прямих переходів в URL —
                                 досі не набрано)
    LandingPage.tsx, UnderConstruction.tsx — код є, route відсутній
    PlaceholderPage.tsx
    fleet/, waybills/, hired/, carriers/, admin/, analystics/ — порожні
  hocks/                      — тека названа "hocks", не "hooks" (навмисно)
    useCars.ts (read-only), useDrivers.ts (read-only), useRouteEvents.ts,
    useWaybills.ts, useWaybillFilters.ts, useDayMode.ts, useCurrentUser.ts,
    useAuthModal.ts
  utils/ — formatters, eventHelpers, calcSummary, calcTransportCost,
           parseQR.ts (готовий парсер QR ESP/OPT/Rubin), clientFilter
  styles/landing.css
  types/index.ts               — Car/CarSpecs/Trailer/Driver/RouteEvent/
                                  WaybillRecord/HiredTransportTrip/
                                  CarrierShipment/аналітичні типи
  mocks/ — cars.json, drivers.json, route-events.json, waybills.json

documents/                    — ТЗ/специфікація проєкту (01-08), 2026-08-24
                                 повністю ресинхронізована з фактичним
                                 кодом (кожен розділ позначено ✅
                                 реалізовано / ⏳ заплановано) — досі
                                 pre-dev дизайн-документ, НЕ джерело
                                 правди по факту імплементації, для
                                 цього CODING_GUIDE.md
CODING_GUIDE.md                — покроковий навчальний гайд, Фази 1-16,
                                 джерело правди по тому, що реально
                                 набрано в код (крок за кроком)
Dockerfile, docker-compose.yml, nginx.conf — деплой на Raspberry Pi
.github/workflows/deploy.yml   — автодеплой при push у main
```

**Порожні заготовки з Фази 2** (директорії існують, файлів немає):
`src/pages/{fleet,waybills,hired,carriers,admin,analystics}`,
`src/components/{fleet,hired,carriers,analystics}`, і typo-директорія
`src/componentsu/carriers` (сміття, ніде не імпортується).

## Деплой

- Продакшн: **warehouse.mom** (Raspberry Pi вдома, за Cloudflare Tunnel).
- `main` = задеплоєний код. Кожна фаза — окрема гілка, мерж у `main` →
  GitHub Actions (`deploy.yml`) сам збирає Docker-образ і викочує на Pi
  через `ssh.warehouse.mom` (`cloudflared access ssh`).
- SSH-доступ на Pi: user `rasberry_kisliy`, ключ у секреті `PI_SSH_KEY`.
- ⚠️ При будь-якому переписуванні `App.tsx`/`src/api/cars.ts` — звірити,
  що маршрут `/driver-app` і сам `cars.ts` не зникли (вже двічі губили
  при рефакторингах, коментар `⚠️ НЕ ВИДАЛЯТИ` в `App.tsx`).

## Робочий процес

- Гілка на фазу з `CODING_GUIDE.md` → проміжні коміти → PR → merge у `main`
  → автодеплой. Пряма робота в `main` — тільки для ранніх фаз (1-4), поки
  коду було мало.
- Інший процес (не ця сесія) теж комітить/мержить у `main` незалежно —
  перед висновками про стан репо звіряй `git log`, не покладайся на
  пам'ять попередньої сесії.

## Бекенд коротко (деталі — vault-тека vehicle_tracker_api)

> ⚠️ Перевірено напряму 2026-08-26 — бекенд пішов значно вперед,
> нижче виправлено (був застарілий запис "AllowAny").

`apps/cars` (Car/Driver/RouteEvent/MonthlyCosts) — повний CRUD, живий,
підключений до фронтенду, **вже з рольовим захистом**: `get_permissions()`
вимагає `IsAuthenticated` на читання й `IsLogistOrAbove` на запис
(`DJANGO_CODING_GUIDE.md` Фаза 9, змержено PR #1, коміт `5364f32`).
Фаза 10 (nested `specs`/`trailer` write) — теж змержена (PR #2,
`6df8ac5`/`2da211f`). `apps/logistics` (найманий транспорт + служби
доставки, Фаза 11) — моделі закомічені, повна реалізація
(serializers/views/urls/admin) готова й перевірена (`manage.py check`),
але ще НЕ закомічена (лежить у робочій копії бекенду). `apps/accounts`
— ролі (`driver`/`logist`/`manager`/`head`), Telegram-бот для реєстрації
водіїв, задеплоєний і робочий у проді (деталі —
`TELEGRAM_BOT_SETUP.md` у бекенд-репо). `products`/`customers`/
`waybills`(1С-імпорт) — моделі є, API ще не написане.

**Наслідок для фронтенду:** `/api/cars/`, `/api/drivers/` тепер
вимагають автентифікованої сесії навіть на читання — раніше були
відкриті. Варто перевірити, що живий `/driver`-флоу (вхід через
Telegram Mini App) досі отримує ці дані без 401/403.

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
  `tasks.md`, але детальніше, з контекстом "чому"; не дублюй один в
  одного механічно — `tasks.md` лишається коротким, `STATE.md` довшим).
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
