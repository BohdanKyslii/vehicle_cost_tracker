# AGENTS_GLOBAL.md — Глобальні правила проєкту Vehicle Cost Tracker (frontend, v1)

Цей документ містить правила, стандарти та архітектурні рішення для
**фронтенд-репозиторію** (`vehicle_cost_tracker`). Аналог до
`AGENTS_GLOBAL.md` у бекенд-репозиторії
(`C:\Users\b.kysliy\PycharmProjects\vehicle_tracker_api\task_description\AGENTS_GLOBAL.md`)
— читай обидва, якщо працюєш на стику фронтенда й бекенда.

> Створено 2026-08-24, резинхронізовано 2026-08-28 (шлях бекенду мав
> друкарську помилку в імені користувача й зайву підтеку; статус
> Фаз 14-17 був застарілим — усі вже набрані й задеплоєні).

---

## 1. Огляд проєкту

**Vehicle Cost Tracker** — система обліку, аналізу й управління
транспортними витратами. Компанія доставляє напої/товари власним
автопарком, найманим транспортом і службами доставки (НП, Міст
Експрес) — мета: порахувати реальну собівартість доставки по кожній
накладній.

**Два репозиторії, спільний деплой** (Raspberry Pi, `warehouse.mom`):
- `vehicle_cost_tracker` (цей репозиторій) — React + TypeScript + Vite frontend.
- `vehicle_tracker_api` — Django + DRF backend, шлях
  `C:\Users\b.kysliy\PycharmProjects\vehicle_tracker_api\`.

**Навчальний контекст:** увесь код пишеться крок за кроком за
`CODING_GUIDE.md` (корінь цього репо) — покроковою інструкцією для
вивчення JS/React/TS з нуля, руками, без копіювання. Це впливає на
темп і на те, що текст гайду може "забігати наперед" реального коду
(написана інструкція ≠ набраний код) — див. розділ 8 нижче.

**Основні модулі:**
- **Driver UI (мобільний)** — реалізовано (Фази 13, 15, 17
  `CODING_GUIDE.md`): `DriverDashboard`, `EventForm`, `DriverHistory`,
  `EventDetail` (видалення/групування подій), QR-сканер накладних,
  вхід через Telegram Mini App (`/driver-app`, `DriverMiniApp.tsx`).
- **Fleet / Logistics (десктоп)** — `/fleet` реалізовано (Фаза 16:
  `FleetList`, `CarForm`, `DriverForm`, з рольовим гейтом `RequireRole`
  з Фази 14); `/hired`, `/carriers`, `/admin` досі рендерять
  `PlaceholderPage` — бекенд для них (`apps.logistics`) поки лише
  моделі, без API.
- **Analytics** — свідомо відкладено, ні бекенд (`apps.analytics`), ні
  фронтенд не написані.

---

## 2. Tech Stack (з `package.json`, перевірено 2026-08-24)

| Компонент    | Технологія / версія |
|--------------|----------------------|
| Framework    | React 19.2, TypeScript 6.0, Vite 8.1 |
| Routing      | react-router-dom v7.18 |
| Data fetching | TanStack Query v5.101 |
| Styling      | Tailwind CSS v4.3 + окремий `landing.css` для лендінгу |
| Charts       | Recharts v3.9 (у залежностях, ще НЕ використано — аналітика не написана) |
| PWA          | vite-plugin-pwa v1.3 |
| Утиліти      | date-fns v4.4, papaparse v5.5, html5-qrcode v2.3.8 (у залежностях, `QRScanner` ще не написаний) |
| Auth         | Django session + CSRF cookie (`apiFetch` у `src/api/config.ts`) — **НЕ JWT, НЕ localStorage-токен** |

---

## 3. Архітектурні принципи

### 3.1 Ексклюзивність каналів доставки
Кожна накладна (`WaybillRecord`) належить тільки одному каналу:
`own` (власний автопарк), `hired` (найманий), `carrier` (служби
доставки), або `null` (не призначено). Перевірка — на бекенді, при
`attach_waybill`; клієнтського guard-хука на фронтенді немає (форм
`/hired`, `/carriers` ще не існує).

### 3.2 Режими трекінгу водія
- `daily` — мінімальний звіт (ранковий одометр + разом).
- `full` — детальний звіт з відміткою на кожній точці вивантаження.

Обидва режими вже реалізовані в `EventForm.tsx`/`DriverDashboard.tsx`.

### 3.3 Ролі та точки входу
Ролі (`UserProfile['role']` у `src/api/auth.ts`): `driver` / `logist`
/ `manager` / `head`. Дві точки входу, обидві реальні (Фаза 14):
- **Telegram Mini App** (`/driver-app`) — вхід водія у проді, логін
  через `window.Telegram.WebApp.initData`, після логіну сама
  редіректить за роллю (`ROLE_LANDING` у `DriverMiniApp.tsx`:
  `driver`→`/driver`, решта→`/fleet`).
- **Веб-лендінг** (`LandingPage`/`AuthModal`, username+пароль) —
  `/` рендерить `RoleRedirect` (не жорсткий `Navigate` на `/driver`):
  неавторизований бачить `LandingPage`, авторизований редіректиться за
  роллю.
- **`RequireRole`** (`components/auth/RequireRole.tsx`) гейтить
  `/driver` (ролі `driver`/`head`) і `/fleet` (`logist`/`manager`/`head`)
  — неавторизований на `/`, авторизований без потрібної ролі бачить
  "Доступ заборонено". Це лише UX-гейт, не заміна бекенд-перевірки
  (`permission_classes`).

---

## 4. Структура проєкту (`src/`, реальний стан 2026-08-28)

```
src/
├── types/index.ts        # Single Source of Truth для TS-типів
├── mocks/                 # ЛИШЕ 4 файли: cars, drivers, route-events, waybills
├── api/                   # config.ts (apiFetch: credentials+CSRF+JSON), auth,
│                           # cars, drivers (повний CRUD), routeEvents (+delete,
│                           # Фаза 17), waybills — products/customers/hired/
│                           # carriers/analytics ще немає
├── hocks/                 # ⚠️ так, "hocks" не "hooks" — реальна назва теки, свідомо
│                           # не перейменована (задокументовано в decisions.md)
├── utils/                 # Чисті функції: formatters, eventHelpers (+findEventGroup,
│                           # Фаза 17), calcSummary, calcTransportCost, calcProduct,
│                           # parseQR, clientFilter
├── components/
│   ├── ui/, driver/        # реальні; ui/ui.tsx і driver/ui.tsx дублюють одні й ті
│   │                       # самі назви (Button/Input/Spinner/EmptyState/ErrorBanner) —
│   │                       # два незалежні набори, не імпорт одне з одного. driver/ui.tsx
│   │                       # має третій варіант кнопки "danger" (Фаза 17, видалення)
│   ├── auth/                # AuthModal, RequireRole — обидва реально гейтять маршрути
│   ├── layouts/            # TopNav, DriverLayout, MainLayout — реальні
│   ├── driver/             # QRScanner, DayModeSwitch (+ compact-варіант, Фаза 17)
│   └── waybills/           # WaybillList, WaybillTable, WaybillFiltersBar — реальні
└── pages/
    ├── driver/              # DriverDashboard, EventForm, DriverHistory, EventDetail
    │                        # (Фаза 17 — деталі/видалення/групування) — усі реальні
    ├── fleet/               # FleetList, CarForm, DriverForm — реальні (Фаза 16)
    ├── DriverMiniApp.tsx, LandingPage.tsx, UnderConstruction.tsx,
    │   RoleRedirect.tsx, PlaceholderPage.tsx
    └── waybills/(частково), hired/, carriers/, admin/, analystics/  # ⏳ ще PlaceholderPage
```

Стубів `components/{fleet,hired,carriers,analystics}` з Фази 2 більше
немає в дереві — `fleet/` став реальним, решта прибрана разом з
рештою ненаписаних розділів. Повний реальний інвентар — сам код,
`documents/05_COMPONENTS_HOOKS_UTILS.md`/`08_PROJECT_STRUCTURE.md`
(ресинхронізовані 2026-08-24 — можуть уже трохи відставати від Фази 17).

---

## 5. Стиль коду та патерни

### 5.1 React
- Функціональні компоненти (FC), пропси типізовані через `interface`.
- Логіка виноситься в кастомні хуки (`src/hocks/`, не `hooks/`).
- Дані від сервера — через TanStack Query, не `useEffect`+`fetch` напряму.

### 5.2 TypeScript
- Суворий режим, уникати `any`.
- Усі сутності відповідають `src/types/index.ts` — це Single Source of Truth,
  а не текст у `documents/03_TYPESCRIPT_TYPES.md` (той лише документує факт).

### 5.3 Стилізація
- Tailwind CSS для основної частини застосунку.
- Лендінг (`TopNav`/`AuthModal`/`LandingPage`) — свідомий виняток, чистий CSS
  (`src/styles/landing.css`), рішення із `CODING_GUIDE.md` Крок 3.4.
- Мобільні екрани: `min-height: 44px` на кнопках, `safe-area-inset-bottom`.

### 5.4 API-шар
- `USE_MOCK` (`VITE_USE_MOCK`) — паралельна `if`-гілка в кожному `api/*.ts`,
  не окремий шар "на майбутнє": реальний Django API вже є, mock — лише
  альтернативний шлях для розробки без бекенду під рукою.
- `apiFetch` (`src/api/config.ts`) сама додає `credentials: 'include'` і
  `X-CSRFToken` — не дублюй цю логіку в окремих `api/*.ts` файлах.

---

## 6. Git Workflow

- Гілка на фазу з `CODING_GUIDE.md` → проміжні коміти → PR → merge у `main`
  → автодеплой (GitHub Actions → SSH через Cloudflare Tunnel → Raspberry Pi).
  Пряма робота в `main` — лише для ранніх фаз (1-4), поки коду було мало.
- Коміти НЕ дотримуються суворо Conventional Commits — орієнтуйся на
  стислий змістовний опис "чому", не жорсткий формат.
- Перед комітом: `npx tsc -b` має пройти чисто.
- **Інший процес (не поточна сесія) теж комітить/мержить у `main`
  незалежно** — перед висновками про стан репо звіряй `git log`, не
  покладайся на пам'ять попередньої сесії ([[feedback_parallel_git_activity]]).
- ⚠️ При будь-якому переписуванні `App.tsx`/`src/api/cars.ts` — звірити, що
  маршрут `/driver-app` і сам `cars.ts` не зникли (вже двічі губили при
  рефакторингах — коментар `⚠️ НЕ ВИДАЛЯТИ` в `App.tsx`).

---

## 7. Пов'язаний бекенд коротко

`vehicle_tracker_api` (`C:\Users\b.kysliy\PycharmProjects\vehicle_tracker_api\`) —
Django + DRF, сесійна авторизація (не JWT). `apps.cars` — повний CRUD,
живий, рольовий захист (`IsAuthenticated`+`IsLogistOrAbove` на запис).
`apps.accounts` — ролі, Telegram-бот реєстрації водіїв (задеплоєний,
робочий), email-реєстрація теж створює `Driver`-запис (пофіксено
2026-08-28). `apps.logistics` (найманий транспорт + служби доставки) —
**лише моделі** (`HiredTransportTrip`/`CarrierShipment`), `views.py`/
`admin.py` — порожні заглушки, URL не підключено. `apps.analytics` —
порожній, свідомо. Деталі — vault-тека `vehicle_tracker_api` (Junction
на `task_description/` у бекенд-репо) або напряму файли там.

⚠️ DRF там завжди віддає `403`, не `401`, без авторизації —
`SessionAuthentication` не має `WWW-Authenticate`, тому DRF занижує
`401 → 403`. Це для всього API, не помилка конкретного ендпоінту.

---

## 8. Джерела істини (де шукати актуальний стан)

| Питання | Де дивитись |
|---|---|
| Що реально набрано в код (крок за кроком) | `CODING_GUIDE.md` (Фаза 1-17) |
| Бізнес-логіка, ролі, БД-схема (design-довідник, не факт коду) | `documents/01-08_*.md` (ресинхронізовано 2026-08-24, кожен розділ позначено ✅/⏳) |
| Поточний прогрес, живі інциденти | `obsidian/STATE.md` (цей файл) |
| Хронологія змін | `obsidian/CHANGES.md` |
| Технічні пастки для AI-агента | `obsidian/AI_AGENT_CONTEXT.md` |
| Архітектурні рішення "чому саме так" | `obsidian/decisions.md` |
| `.env` структура | `obsidian/env.example.md` |

> `CODING_GUIDE.md` — сценарій для ручного набору коду ("пиши руками"),
> **не changelog**: перевіряй, що файл справді існує в `src/`, перш ніж
> вважати крок виконаним — вже траплялись неправдиві позначки "виконано"
> (Фаза 15/16, виправлено коміт `206b595`).
