# AI_AGENT_CONTEXT.md — Технічний контекст для AI-агентів (frontend, v1)

Читати після `AGENTS_GLOBAL.md`. Аналог до однойменного файлу в
бекенд-репо (`vehicle_tracker_api/task_description/AI_AGENT_CONTEXT.md`)
— тут лише фронтенд-специфіка.

> Створено 2026-08-24, звірено з реальним `src/`.

---

## Проєкт

**Тип:** React 19 + TypeScript SPA/PWA, Vite 8, TanStack Query v5,
Tailwind CSS v4. Django-бекенд (сесійна авторизація) — окремий
репозиторій `vehicle_tracker_api`.

`VITE_USE_MOCK` перемикає `api/*.ts` між mock JSON (`src/mocks/`) і
реальним DRF API — у проді завжди `false`.

---

## Ключові сутності (`src/types/index.ts` — Single Source of Truth)

### `Car`
```typescript
interface Car {
  idCar: number;
  nameCar: string;
  numberCar: string;
  fuelCardNumber?: number;
  amountCar: number;              // амортизація грн/міс
  defaultTrackingMode?: TrackingMode;
  statusCar: 'active' | 'repair' | 'inactive';
  isActive: boolean;
  specs?: CarSpecs;                // VIN, габарити, гідроборт — окремий інтерфейс
  trailer?: Trailer;
}
```
`CarSpecs.trailer` теж існує (дублює `Car.trailer`) — заповнюється лише
якщо `hasTrailer === true`. `CarStatusLog` (history) — окремий тип,
ніде поки не використовується в API-шарі.

### `WaybillRecord`
```typescript
interface WaybillRecord {
  id: number;
  legalEntity: 'ESP' | 'OPT' | 'Rubin';
  waybillNumber: string;
  waybillDate: string;
  linePosition: number;
  customerId: string;   // ⚠️ string, хоча Customer.idCustomer — number (жива непослідовність)
  productId: number;    // ⚠️ number, НЕ string — артикул із 1С зберігається як ціле
  quantity: number;     // + відвантаження, − повернення
  deliveryChannel?: 'own' | 'hired' | 'carrier' | null;
  // ... повний список — src/types/index.ts, секція "INVOICE REGISTRY"
}
```

### `RouteEvent`
```typescript
interface RouteEvent {
  id: number;
  carId: number;
  driverId: number;
  eventType: RouteEventType;   // ⚠️ поле "eventType", НЕ "type"
  eventTs: string;
  palletsCount?: number;       // обов'язково для depot_start(daily) / delivery(full)
  // ...
}

// Реальні значення enum (рівно 8):
type RouteEventType =
  | 'depot_start' | 'delivery' | 'parking_end' | 'depot_return'
  | 'refuel' | 'other_cost' | 'return_goods' | 'extra_cargo';
```

### `Driver`
```typescript
interface Driver {
  idDriver: number;
  nameDriver: string;
  phoneDriver?: string;      // ⚠️ "phoneDriver", НЕ "phone"
  driversLicense?: string;
  idCar: number | null;
  isActive: boolean;
  car?: Car;
}
```

### Auth (`src/api/auth.ts`)
```typescript
interface UserProfile {
  role: 'driver' | 'logist' | 'manager' | 'head';
  phone: string;
  telegram_id: number | null;   // ⚠️ snake_case всередині camelCase-інтерфейсу — так у коді
  driver: number | null;
}
interface CurrentUser {
  id: number; username: string; email: string; is_active: boolean;
  profile: UserProfile | null;   // null, поки роль не призначена/акаунт не активний
}
```
`register()` НЕ логінить одразу — акаунт `is_active=False` до ручного
підтвердження в Django Admin (бекенд-репо). `loginWithTelegram(initData)`
кидає `Error` з `message` рівно `'not_registered'` або
`'pending_approval'` при відповідних кодах бекенду — `DriverMiniApp.tsx`
матчить по точному тексту цих рядків, не по HTTP-статусу.

---

## Структура mock-даних (`src/mocks/`)

**Реально існує лише 4 файли:** `cars.json`, `drivers.json`,
`route-events.json`, `waybills.json`. Файлів на кшталт
`customers.json`, `stores.json`, `products.json`,
`hired-trips.json` — **не існує**, бо відповідних сторінок ще немає.
Не посилайся на них, поки не пишеш сторінку, яка їх реально споживає.

---

## UI-компоненти — реальний інвентар

### `src/components/ui/` (реально є)
`Badge`, `Button`, `EmptyState`, `ErrorBanner`, `Input`, `Pagination`,
`SortHeader`, `Spinner` — плюс `ui.tsx` (той самий набір: Button, Input,
Spinner, EmptyState, ErrorBanner — див. дублювання нижче).

**Не існують:** `ChannelBadge`, `CarStatusBadge`, `PalletsInput`,
`StoreConfirmModal`, `Modal`, `Select`, `Textarea`, `DatePicker`,
`MonthPicker`, `Toast`, `LegalEntityBadge`.

### ⚠️ Дублювання: `components/ui/ui.tsx` vs `components/driver/ui.tsx`
Обидва файли визначають ОДНАКОВІ назви (`Button`, `Input`, `Spinner`,
`EmptyState`, `ErrorBanner`) — це два НЕЗАЛЕЖНІ набори компонентів, не
один імпортує інший. Перш ніж редагувати "Button" — перевір, з якого
саме файлу він імпортований у місці виклику (`components/ui/ui`
vs `components/driver/ui`), інакше правки підуть не в той компонент.

### Хуки (`src/hocks/` — так, "hocks", не "hooks")
Реально є: `useAuthModal`, `useCars`, `useCurrentUser`, `useDayMode`,
`useDrivers`, `useRouteEvents`, `useWaybillFilters`, `useWaybills`.
`useWaybillChannelGuard` (клієнтська перевірка ексклюзивності каналу)
— **не існує**, перевірка лише на бекенді.

---

## Роутинг (`src/App.tsx`) — що реально рендериться

| Маршрут | Статус |
|---|---|
| `/driver`, `/driver/event/new` | ✅ реальні (`DriverDashboard`, `EventForm`) |
| `/driver/scan`, `/driver/history` | ⏳ `PlaceholderPage` |
| `/driver-app` | ✅ `DriverMiniApp` — Telegram Mini App логін, редіректить за роллю |
| `/waybills` (index) | ✅ реальний `WaybillList` |
| `/waybills/:id`, `/import`, `/unassigned`, `/returns` | ⏳ `PlaceholderPage` |
| `/fleet`, `/hired`, `/carriers`, `/analytics`, `/admin` (усі під-маршрути) | ⏳ `PlaceholderPage` |
| `/` | `Navigate` на `/driver` для БУДЬ-КОГО (не веде на `LandingPage`) |

`RequireRole` / захист маршрутів по ролі — **не існує в коді взагалі**
(Фаза 14 `CODING_GUIDE.md` написана текстом, не набрана). `LandingPage`/
`TopNav`/`AuthModal` — код повністю готовий, але жоден `<Route>` його не
рендерить.

---

## Бізнес-логіка — що реально порахований, а що ні

- **Аллокація собівартості власного автопарку** — формула описана в
  `documents/01_PROJECT_OVERVIEW.md` §5.2, фактичного розрахунку/ендпоінту
  на фронтенді немає (`apps.analytics` на бекенді теж порожній).
- **Ексклюзивність каналів** — перевіряється ЛИШЕ на бекенді
  (`attach_waybill`), клієнтського guard-хука немає.
- **Режим дня (`daily`/`full`)** — `useDayMode` зберігає в `localStorage`,
  ключ без `carId` (лише дата) — перевіряй фактичний ключ у коді хука
  перед тим, як покладатись на нього в новій фічі.

---

## Типові помилки та як їх уникнути

| Ситуація | Правильно |
|---|---|
| Поле типу події маршруту | `eventType`, НЕ `type` |
| Шлях до хуків | `src/hocks/`, НЕ `src/hooks/` (реальна назва теки) |
| Артикул товару (`productId` у `WaybillRecord`) | `number`, не `string` |
| Телефон водія | `Driver.phoneDriver`, не `phone` |
| UI-компоненти з однаковими іменами | Перевір, з якого файлу імпортовано — `components/ui/ui.tsx` чи `components/driver/ui.tsx`, це різні реалізації |
| Ексклюзивність каналу доставки | Тільки на бекенді (`attach_waybill`), клієнтського guard-хука немає |
| Мобільний UI | `min-height: 44px` на кнопках/тап-цілях |
| Auth | Django-сесія + `X-CSRFToken` cookie (`apiFetch`), НЕ JWT, НЕ `localStorage`-токен |
| Довіра "виконано" в `CODING_GUIDE.md` | Це сценарій для ручного набору, не changelog — перевіряй, що файл справді існує в `src/`, перш ніж вважати крок готовим (Фаза 15/16 вже раз хибно позначались виконаними) |
| Пошук актуального стану | `CODING_GUIDE.md` = факт коду; `documents/*.md` = design-довідник (ресинхронізовано 2026-08-24, але не Джерело Правди по імплементації) |
