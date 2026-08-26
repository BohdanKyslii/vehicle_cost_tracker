# Vehicle Cost Tracker — Сторінки та маршрутизація

> ✅ Резинхронізовано 2026-08-24 з реальним `src/App.tsx`. Оригінальний
> план (нижче) мав інші компоненти на кожному маршруті — фактичний код
> зараз рендерить `PlaceholderPage` майже скрізь, крім водія й накладних.
> ⏳-позначки вказують що ще не набрано.

---

## Реальна структура маршрутів (`src/App.tsx`)

```tsx
<Routes>
  {/* ── Водій (мобільний), Фаза 13 ✅ ────────────────── */}
  <Route path="/driver" element={<DriverLayout />}>
    <Route index element={<DriverDashboard />} />          {/* ✅ реалізовано */}
    <Route path="event/new" element={<EventForm />} />     {/* ✅ реалізовано */}
    <Route path="scan" element={<PlaceholderPage title="Сканер QR" />} />   {/* ⏳ Фаза 15 */}
    <Route path="history" element={<PlaceholderPage title="Історія" />} /> {/* ⏳ */}
  </Route>

  {/* ── Автопарк — ⏳ Фаза 16 не набрана ─────────────── */}
  <Route path="/fleet" element={<MainLayout />}>
    <Route index element={<PlaceholderPage title="Автопарк" />} />
    <Route path=":carId" element={<PlaceholderPage title="Деталі авто" />} />
  </Route>

  {/* ── Накладні — Фаза 11 ✅ (частково) ─────────────── */}
  <Route path="/waybills" element={<MainLayout />}>
    <Route index element={<WaybillList />} />               {/* ✅ реалізовано */}
    <Route path=":waybillNumber" element={<PlaceholderPage title="Деталі накладної" />} />
    <Route path="import" element={<PlaceholderPage title="Імпорт із 1С" />} />
    <Route path="unassigned" element={<PlaceholderPage title="Не призначені" />} />
    <Route path="returns" element={<PlaceholderPage title="Матчинг повернень" />} />
  </Route>

  {/* ── Найманий транспорт — ⏳ нічого не набрано ────── */}
  <Route path="/hired" element={<MainLayout />}>
    <Route index element={<PlaceholderPage title="Найманий транспорт" />} />
    <Route path="new" element={<PlaceholderPage title="Новий рейс" />} />
    <Route path=":tripId" element={<PlaceholderPage title="Деталі рейсу" />} />
  </Route>

  {/* ── Служби доставки — ⏳ нічого не набрано ───────── */}
  <Route path="/carriers" element={<MainLayout />}>
    <Route index element={<PlaceholderPage title="Служби доставки" />} />
    <Route path="new" element={<PlaceholderPage title="Нове відправлення" />} />
    <Route path="import-costs" element={<PlaceholderPage title="Імпорт реєстру витрат" />} />
  </Route>

  {/* ── Аналітика — ⏳ нічого не набрано ──────────────── */}
  <Route path="/analytics" element={<MainLayout />}>
    <Route index element={<PlaceholderPage title="Аналітика" />} />
    <Route path="transport-costs" element={<PlaceholderPage title="Транспортна собівартість" />} />
    <Route path="customers" element={<PlaceholderPage title="По клієнтах" />} />
    <Route path="channels" element={<PlaceholderPage title="Порівняння каналів" />} />
  </Route>

  {/* ── Адміністрування — ⏳ нічого не набрано ────────── */}
  <Route path="/admin" element={<MainLayout />}>
    <Route index element={<PlaceholderPage title="Адміністрування" />} />
    <Route path="cars" element={<PlaceholderPage title="Авто" />} />
    <Route path="drivers" element={<PlaceholderPage title="Водії" />} />
    <Route path="products" element={<PlaceholderPage title="Товари" />} />
    <Route path="customers" element={<PlaceholderPage title="Клієнти" />} />
    <Route path="stores" element={<PlaceholderPage title="Магазини" />} />
    <Route path="monthly-costs" element={<PlaceholderPage title="Місячні витрати" />} />
  </Route>

  {/* ── Telegram Mini App — ✅ реалізовано, НОВЕ ──────── */}
  {/* Не видаляти при рефакторингу роутів (вже двічі губили — d792cfa,
      2026-08-10). Реальний production-маршрут: кнопка в @driver_car_bot
      веде саме сюди. Без TopNav/AuthModal — рендериться всередині
      Telegram WebView. */}
  <Route path="/driver-app" element={<DriverMiniApp />} />

  {/* Редирект з / на /driver */}
  <Route path="/" element={<Navigate to="/driver" replace />} />

  {/* 404 */}
  <Route path="*" element={<div className="p-8 text-center">...</div>} />
</Routes>
```

> ⚠️ **Реальна неузгодженість, варта уваги:** `src/pages/LandingPage.tsx`
> і `src/pages/UnderConstruction.tsx` (з TopNav, AuthModal, hero-секцією,
> списком фіч і ролей) — повністю збудовані компоненти, але **ніде не
> імпортуються в `App.tsx`**. `/` зараз веде прямо на `/driver`, минаючи
> лендінг. Якщо це не навмисно — варто підключити `LandingPage` на `/`
> замість `Navigate to="/driver"`.

⏳ Жодного `RequireRole`-гейту немає — всі маршрути в `MainLayout` доступні
без перевірки ролі (гейт по ролі — Фаза 14, не набрана, `CODING_GUIDE.md`).

---

## `/driver-app` — DriverMiniApp ✅ (НОВЕ, не було в оригінальному плані)

**Файл:** `src/pages/DriverMiniApp.tsx`

Вхідна точка для водія в проді — кнопка в Telegram-боті (`@driver_car_bot`,
Menu Button), не прямий URL і не інстальований PWA. Рендериться всередині
Telegram WebView, тому без `TopNav`/`AuthModal` — власний мінімальний UI.

**Логіка:**
```
1. window.Telegram.WebApp.initData відсутній (відкрито поза Telegram)
   → одразу стан "error", без запиту на бекенд
2. initData є → tg.ready() → loginWithTelegram(initData) (POST /auth/telegram/)
3. За результатом:
   ├── успіх → визначаємо landing за роллю (ROLE_LANDING) → редирект
   ├── 'not_registered'    → "Ви ще не зареєстровані" + посилання на бота
   ├── 'pending_approval'  → "Заявку надіслано. Очікуйте підтвердження"
   └── інша помилка        → загальний "Сталася помилка"
```

**Редирект за роллю (`ROLE_LANDING`):**

| Роль | Куди веде |
|------|-----------|
| `driver` | `/driver` — єдина роль з повноцінним готовим екраном (DriverDashboard) |
| `logist` / `manager` / `head` | `/fleet` — правильний за змістом розділ, навіть якщо сам він поки `PlaceholderPage` |

> Реєстрація нового користувача відбувається НЕ через цю сторінку —
> водій реєструється прямо в самому Telegram-боті (бот питає номер
> телефону кнопкою), звідси й посилання "напишіть боту" у стані
> `not_registered`.

---

## Сторінки детально

> Розділ нижче — здебільшого ще ОРИГІНАЛЬНИЙ ПЛАН для того, що не
> збудовано (компоненти на кшталт `FleetList`, `CarDetail`,
> `HiredTripForm` в описах — ще не написані файли, лише орієнтир того,
> якими вони мають стати). Розділи, де є реальний код, позначені ✅ і
> описують те, що фактично працює зараз, не план.

---

### `/driver` — DriverDashboard ✅ реалізовано

**Файл:** `src/pages/driver/DriverDashboard.tsx`

**Що реально відображає:**
- Картку авто (назва, номер) + останній одометр
- `DayModeSwitch` — перемикач daily/full з індикатором "змінено вручну"
- Сітку кнопок доступних типів подій (залежно від режиму,
  `getAvailableEventTypes`) — кожна веде на `/driver/event/new?type=...`
- Список подій сьогодні (timeline), кожна з іконкою/градієнтом за типом

⏳ Не реалізовано з оригінального плану: FAB "Сканувати QR" (сканера ще
немає), іконки палет прямо в timeline.

---

### `/driver/event/new` — EventForm ✅ реалізовано

**Файл:** `src/pages/driver/EventForm.tsx`

**Query param:** `?type=depot_start|delivery|refuel|other_cost|return_goods|extra_cargo|parking_end|depot_return`

Умовний рендеринг полів за типом (через `requiresOdometer`/`requiresWaybill`/
`requiresPallets` з `utils/eventHelpers.ts`):

| Тип | Поля, що реально показуються |
|-----|-------------------------------|
| `depot_start`, `delivery`, `parking_end`, `depot_return` | Одометр (якщо `requiresOdometer`) |
| `depot_start` (daily) / `delivery` (full) | + Кількість палет |
| `delivery` | + Номер накладної, Клієнт (текстові поля — не QR) |
| `refuel` | Літри, Сума (грн) |
| `other_cost` | Сума (грн), Коментар |
| `return_goods` | Накладна клієнта (повернення) |
| `extra_cargo` | Звідки, Куди, Вага (кг) |
| Усі типи | Нотатки (опційно) |

⏳ Не реалізовано з оригінального плану: QR-сканування накладних (номер
вводиться вручну), логіка "перша накладна → підтвердження точки"
(`StoreConfirmModal`), перевірка ексклюзивності каналу
(`checkWaybillChannel`/channel guard), форма відмови від поставки
(`RejectionForm`).

---

### `/driver/scan` — QRScanner ⏳ план, не набрано (Фаза 15)

Зараз `PlaceholderPage`. План лишається як був:
- Мульти-скан без закриття камери
- Для кожної відсканованої накладної: показати `customerName` + `storeName`
- При duplicate: попередження «Вже відскановано»
- При вже призначеній до іншого каналу: попередження «Зайнята»

---

### `/fleet` — FleetList ⏳ план, не набрано (Фаза 16)

Зараз `PlaceholderPage` для будь-якої ролі, включно з `logist`/`manager`/
`head`, які редиректяться сюди з Mini App після логіну — це поточний
головний UX-розрив (`CODING_GUIDE.md`, розділ "ЩО ДАЛІ"). План лишається
як був:

**Фільтри:** `search` (номер/назва), `statusCar`, `trackingMode`, `isActive`

**Колонки:**

| Колонка | Джерело |
|---------|---------|
| Номер + назва | `cars` |
| Статус | badge: active/repair/inactive |
| Режим (дефолт) | `cars.default_tracking_mode` |
| Пробіг / місяць | `daily_summaries` |
| Палет / місяць | `daily_summaries.pallets_count` |
| Паливо л/100км | розрахунок |
| Загальні витрати | `monthly_costs` |
| Остання активність | `route_events` |

---

### `/fleet/:carId` — CarDetail ⏳ план, не набрано

**Tabs:** `route` (timeline дня) | `month` (графік + таблиця) | `waybills`

---

### `/waybills` — WaybillList ✅ реалізовано (Фаза 11)

**Файли:** `src/components/waybills/WaybillList.tsx` (сторінка живе в
`components/`, не в `pages/waybills/` як в оригінальному плані),
`WaybillFiltersBar.tsx`, `WaybillTable.tsx`.

**Фільтри, що реально працюють** (стан — в URL query string через
`useWaybillFilters`):
```typescript
interface WaybillFilters {
  search?: string;
  status?: WaybillStatus;
  deliveryChannel?: DeliveryChannel | "unassigned" | "all";
  legalEntity?: LegalEntity;
  lineType?: "shipment" | "return" | "all";
  dateFrom?: string;
  dateTo?: string;
  // carId, storeId — типізовані, але ще не мають контролу у WaybillFiltersBar
}
```

**Колонки таблиці:** дата, накладна (+ к-сть позицій), юр. особа
(`LegalEntityBadge`), клієнт (+ магазин, якщо є `storeName`), канал
(`ChannelBadge`), сума (+ повернення червоним), вага, статус
(`StatusBadge`). Сортування (`SortHeader`) по: дата/сума/клієнт/вага.
Пагінація — `Pagination.tsx`, 10 на сторінку.

⏳ Кнопки "⚠️ Не призначені" й "Імпорт із 1С" вже є в UI, обидві ведуть
на `PlaceholderPage`.

---

### `/waybills/unassigned` — UnassignedWaybills ⏳ план, не набрано

**Призначення:** Список накладних без каналу доставки (`delivery_channel IS NULL`).
`api/waybills.ts::fetchUnassignedWaybills` вже готовий (mock-режим працює),
самої сторінки немає.

---

### `/hired` — HiredTripList ⏳ план, не набрано

**Призначення:** Список рейсів найманого транспорту.

**Фільтри:** дата від/до, номер авто (текст), маршрут

---

### `/hired/new` — HiredTripForm ⏳ план, не набрано

**Поля:**
```typescript
interface HiredTripFormFields {
  carNumber: string;
  routeName: string;
  tripDate: string;
  palletsCount: number;
  costUah: number;
  comment?: string;
  waybills: ScannedWaybill[];
}
```

---

### `/carriers` — CarrierShipmentList ⏳ план, не набрано

**Колонки:** дата, служба, ТТН, к-сть накладних, вартість.

---

### `/carriers/new` — CarrierShipmentForm ⏳ план, не набрано

Аналогічна структура до HiredTripForm, без `carNumber`/`palletsCount`/
`costUah`; натомість `carrierName` (select) і `ttn`.

---

### `/carriers/import-costs` — CarrierCostsImport ⏳ план, не набрано

**Очікувані колонки реєстру:** `TTN, дата, вага (кг), вартість (грн)`

---

### `/analytics/channels` — ChannelComparison ⏳ план, не набрано

Розрахунок вже частково готовий (`allocateHiredTripCost`,
`src/utils/calcTransportCost.ts`), UI немає.

---

### `/admin/*` — CarAdmin / StoreAdmin / MonthlyCostsAdmin тощо ⏳ план, не набрано

> Не плутати з `/panel` (Крок 15, `CODING_GUIDE.md`) — це окремий,
> пізніше запланований екран підтвердження реєстрацій для ролі `head`,
> навмисно НЕ на `/admin` (той шлях nginx проксіює напряму на Django
> admin, `nginx.conf`). Пункт меню "Адмін" у `TopNav.tsx` зараз веде на
> `/panel`, видимий лише для `role === 'head'`.

---

## Layouts, що реально є

| Layout | Файл | Використовується для |
|--------|------|----------------------|
| `DriverLayout` | `src/components/layouts/DriverLayout.tsx` | `/driver/*` — glass-хедер + bottom nav (Маршрут/Сканер/Історія) |
| `MainLayout` | `src/components/layouts/MainLayout.tsx` | `/fleet`, `/waybills`, `/hired`, `/carriers`, `/analytics`, `/admin` — sidebar на десктопі |
| `TopNav` | `src/components/layouts/TopNav.tsx` | Верхнє меню на `LandingPage`/`UnderConstruction` (⚠️ обидва наразі не підключені до жодного маршруту в `App.tsx`) |

`DriverMiniApp` — без layout, власний мінімальний рендер.
