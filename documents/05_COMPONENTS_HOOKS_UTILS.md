# Vehicle Cost Tracker — Компоненти, Hooks, Utils

> ✅ Резинхронізовано 2026-08-24 з реальним кодом. ⏳ позначає те, що
> лишається планом (функція/файл не існує). Реальна тека хуків
> називається **`src/hocks/`** (не `hooks/`) — це не помилка в документі,
> це реальна назва теки в репозиторії; лишено як є свідомо.

---

## `api/` — шар отримання даних

```typescript
// api/config.ts — ✅ реалізовано
export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export function apiFetch<T>(path: string, options?: FetchOptions): Promise<T>;
// credentials:'include' + X-CSRFToken header — сесійна авторизація, не JWT
export function mockDelay(ms?: number): Promise<void>;

// api/auth.ts — ✅ реалізовано, НЕ було в оригінальному плані
export interface UserProfile { role: 'driver'|'logist'|'manager'|'head'; phone: string; telegram_id: number|null; driver: number|null; }
export interface CurrentUser { id: number; username: string; email: string; is_active: boolean; profile: UserProfile | null; }
export function fetchCsrf(): Promise<{ csrfToken: string }>;
export function fetchCurrentUser(): Promise<{ user: CurrentUser | null }>;
export function login(username: string, password: string): Promise<CurrentUser>;
export function register(username: string, email: string, password: string, role: string): Promise<RegisterResult>;
export function logout(): Promise<void>;
export function loginWithTelegram(initData: string): Promise<CurrentUser>;  // Mini App

// api/cars.ts — ✅ частково (тільки читання)
export async function fetchCars(): Promise<Car[]>
export async function fetchCar(id: number): Promise<Car>
// ⏳ createCar/updateCar/deleteCar — заплановані на Фазу 16, ще НЕ написані

// api/drivers.ts — ✅ частково
export async function fetchDrivers(): Promise<Driver[]>
export async function fetchCurrentDriver(): Promise<Driver>
// ⏳ createDriver/updateDriver — заплановані (Фаза 16), ще НЕ написані

// api/routeEvents.ts — ✅ реалізовано
export async function fetchTodayEvents(carId: number): Promise<RouteEvent[]>
export async function fetchLastOdometer(carId: number): Promise<number | null>
export async function createRouteEvent(data: RouteEventCreate): Promise<RouteEvent>
// ⏳ fetchEventsByDate/fetchEventsByRange — з оригінального плану, ще НЕ написані

// api/waybills.ts — ✅ частково
export async function fetchWaybills(filters, sort, pagination): Promise<PaginatedResponse<WaybillSummary>>
export async function fetchWaybillDetail(number: string): Promise<WaybillRecord[]>
export async function checkWaybillChannel(number: string): Promise<{ waybillNumber: string; deliveryChannel: DeliveryChannel | null }>
export async function fetchUnassignedWaybills(): Promise<WaybillSummary[]>
// ⏳ importWaybillsCsv/fetchReturnsPending — з оригінального плану, ще НЕ написані

// ⏳ api/stores.ts, api/hiredTransport.ts, api/carriers.ts, api/monthlyCosts.ts,
//    api/analytics.ts — ЖОДЕН з цих файлів ще не існує (весь оригінальний
//    план для них лишається планом)
```

---

## `hocks/` — React Query хуки

```typescript
// hocks/useCars.ts — ✅
export function useCars()
export function useCar(id: number)

// hocks/useDrivers.ts — ✅ (частково: лише поточний водій)
export function useCurrentDriver()
// ⏳ useDrivers() (список) — з оригінального плану useCurrentDriver.ts, ще НЕ написано

// hocks/useRouteEvents.ts — ✅
export function useTodayEvents(carId: number)      // refetchInterval: 60_000
export function useLastOdometer(carId: number)
export function useCreateRouteEvent()
// ⏳ useEventsByDate — з оригінального плану, ще НЕ написано

// hocks/useDayMode.ts — ✅
// Зберігає вибір режиму водія в localStorage, ключ "dayMode:{дата}"
// (⚠️ без carId у ключі — відрізняється від опису в оригінальному плані,
// але й дефолт кожен раз береться з поточного carDefaultMode)
export function useDayMode(carDefaultMode: TrackingMode): {
  dayMode: TrackingMode; setDayMode: (mode: TrackingMode) => void; isOverridden: boolean;
}

// hocks/useWaybills.ts — ✅ частково
export function useWaybills(filters, sort, pagination)
export function useWaybillDetail(waybillNumber: string)
export function useCheckWaybillChannel(waybillNumber: string)
export function useUnassignedWaybills()
// ⏳ useImportWaybills/useReturnsPending — з оригінального плану, ще НЕ написані

// hocks/useWaybillFilters.ts — ✅
// Стан фільтрів/сортування/сторінки в URL search params
export function useWaybillFilters()

// hocks/useCurrentUser.ts — ✅ реалізовано, НЕ було в оригінальному плані
export function useCurrentUser(): {
  user, isLoading, login, register, logout, loginWithTelegram,
  loginError, registerError, logoutError, loginWithTelegramError,
}

// hocks/useAuthModal.ts — ✅ реалізовано, НЕ було в оригінальному плані
export function useAuthModal(): { isOpen, isSignup, openLogin, openSignup, close, switchTo }

// ⏳ Жоден з цих хуків з оригінального плану ще не існує:
//    useDailySummary, useHiredTransport, useCarriers, useMonthlyCosts,
//    useWaybillChannelGuard, useTransportCosts
```

---

## `utils/` — Бізнес-логіка

```typescript
// utils/calcSummary.ts — ✅ реалізовано
// daily: пробіг = depot_start сьогодні − lastOdometer вчора.
// full: пробіг = одометр parking_end − одометр depot_start;
//       порожній пробіг = від останнього delivery до parking_end.
// palletsCount: depot_start (daily) або SUM по delivery (full).
export function buildDailySummary(events: RouteEvent[], prevDayLastOdometer: number | null): DailySummary
export function buildRouteSegments(events: RouteEvent[]): RouteSegment[]
// ⏳ calcEmptyMileage/calcTotalPallets як ОКРЕМІ експорти з оригінального
//    плану — логіка є, але інлайнена всередину buildDailySummary, не
//    винесена окремими функціями

// utils/calcProduct.ts — ⏳ ПОРОЖНІЙ файл, лише закоментований TODO
// (calcUnitVolumeCbm/calcBoxVolumeCbm/calcBoxWeightKg — план, коду немає)

// utils/calcTransportCost.ts — ✅ реалізовано
export function calcRepairCost(costs: MonthlyCosts, totalKm: number): number
export function calcTotalMonthlyCost(costs: MonthlyCosts, totalKm: number): number
export function allocateMonthlyCosts(waybills: WaybillSummary[], costs: MonthlyCostsSummary, carNumber: string): TransportCostPerWaybill[]
export function allocateHiredTripCost(trip: HiredTransportTrip): { waybillNumber: string; costUah: number }[]
// ⏳ aggregateByCustomer — з оригінального плану, ще НЕ написано

// utils/parseQR.ts — ✅ реалізовано (формат ІНШИЙ, ніж в оригінальному плані)
// Реальний формат з ESP/OPT/Rubin: "номер:ДД.ММ.РР", напр. "0000391877:06.07.26"
// (не JSON, як спочатку планувалось — JSON лишено як запасний варіант парсингу)
export interface QRResult { waybillNumber: string; waybillDate: string; }
export function parseQRCode(raw: string): QRResult | null

// ⏳ utils/parseCsv.ts — файл ще НЕ існує (ні parseCsvToWaybills,
//    ні parseCsvToCarrierCosts)

// utils/formatters.ts — ✅ реалізовано, збігається з планом
export function formatUah(v: number): string
export function formatKm(v: number): string
export function formatLiters(v: number): string
export function formatKg(v: number): string
export function formatCbm(v: number): string
export function formatDate(iso: string): string
export function formatDateTime(iso: string): string
export function formatMonth(iso: string): string
export function formatPct(v: number): string
export function formatLegalEntity(e: LegalEntity): string
export function channelLabel(ch: DeliveryChannel | null | undefined): string

// utils/eventHelpers.ts — ✅ реалізовано (+ 4 функції понад план)
// ✅ Резинхронізовано 2026-08-27 (двічі того ж дня) — спершу daily/full
// розійшлись по одометру й підпису delivery, потім full сам розпався на
// дві стадії load/unload (див. 01_PROJECT_OVERVIEW.md, розділ 4)
export interface EventTile { type: RouteEventType; stage?: DeliveryStage }  // ⚠️ нове — один тайл дашборду; для full+delivery їх два (load/unload)
export function getAvailableEventTypes(mode: TrackingMode): EventTile[]  // ⚠️ тепер повертає EventTile[], не RouteEventType[] — full містить "delivery" двічі (stage: "load" і "unload")
export function requiresOdometer(type: RouteEventType, mode: TrackingMode, stage?: DeliveryStage): boolean  // ⚠️ додався stage: full-delivery показує одометр лише на "unload", не на "load"
export function requiresWaybill(type: RouteEventType): boolean
export function requiresPallets(type: RouteEventType, mode: TrackingMode, stage?: DeliveryStage): boolean  // ⚠️ depot_start завжди true; full-delivery — лише "unload"
export function eventTypeLabel(type: RouteEventType, mode?: TrackingMode, stage?: DeliveryStage): string  // ⚠️ delivery: daily або stage="load" → "Скан накладної", інакше "Вивантаження"
export function eventTypeIcon(type: RouteEventType): string
export function eventTypeGradient(type: RouteEventType): string  // ⚠️ нове, не було в плані — колір тайла на DriverDashboard/EventForm
export function eventSummaryBadges(e: RouteEvent): string[]  // ⚠️ нове — права колонка картки (одометр/№накладної/літри/грн/кг), будується з наявності полів
export function eventComment(e: RouteEvent): string | undefined  // ⚠️ нове — notes або otherCostComment, показується під назвою події
export function inferDeliveryStage(e: RouteEvent): DeliveryStage | undefined  // ⚠️ нове — stage ніде не зберігається в БД, для вже збережених подій вираховується з наявності odometerKm

// utils/clientFilter.ts — ✅ реалізовано, збігається з планом
export function filterWaybills(items: WaybillSummary[], filters: WaybillFilters): WaybillSummary[]
export function sortItems<T>(items: T[], sort: SortParams): T[]
export function paginate<T>(items: T[], pagination: PaginationParams): PaginatedResponse<T>
```

---

## `components/ui/` — Атомарні компоненти

> ⚠️ **Реальне дублювання, варте уваги:** той самий набір
> (`Button`/`Input`/`Spinner`/`EmptyState`/`ErrorBanner`) визначений
> ДВІЧІ — окремими файлами в `components/ui/` (використовуються
> `WaybillList`/`WaybillTable` через іменовані імпорти
> `../../components/ui/Spinner` тощо) і ще раз усередині одного файлу
> `components/ui/ui.tsx` **та** `components/driver/ui.tsx` (майже
> ідентичний вміст, використовується `DriverDashboard`/`EventForm` через
> `../../components/driver/ui`). Функціонально ідентичні, різні файли —
> варто мати на увазі при правках стилю, щоб не редагувати лише одну копію.

```
Button.tsx             — ✅ variant: primary/ghost (⚠️ план мав ще secondary/danger, sm/md/lg — не реалізовано)
Badge.tsx               — ✅ StatusBadge + ChannelBadge + LegalEntityBadge + CarStatusBadge, всі в ОДНОМУ файлі
                           (план мав окремі LegalEntityBadge.tsx/ChannelBadge.tsx/CarStatusBadge.tsx файли)
Spinner.tsx             — ✅ size: sm/md/lg
EmptyState.tsx          — ✅
ErrorBanner.tsx         — ✅ + onRetry (використовує WaybillList)
Pagination.tsx          — ✅ ковзне вікно сторінок (WINDOW_SIZE=5)
SortHeader.tsx           — ✅
Input.tsx               — ✅ label/error/helpText
ui.tsx                  — ⚠️ дублює Button/Input/Spinner/EmptyState/ErrorBanner (див. вище)

⏳ Не існує: SkeletonRow.tsx, Modal.tsx, Select.tsx, Textarea.tsx,
   DatePicker.tsx, MonthPicker.tsx, Toast.tsx
```

---

## `components/auth/` — ✅ реалізовано, НЕ було в оригінальному плані

```
AuthModal.tsx
  — вхід/реєстрація, чотири панелі (pane-login/pane-left-promo/
    pane-right-promo/pane-signup), перемикання класом .is-signup
  — реєстрація НЕ логінить одразу: акаунт is_active=False до підтвердження
    адміном (Django Admin) — форма показує повідомлення й перемикає на вхід
  — Telegram deep-link (TelegramButton) як альтернатива email-реєстрації
    для водіїв без пошти
  — модалка умов використання (showTerms) — окремий inline-backdrop
```

---

## `components/driver/`

```
DayModeSwitch.tsx       — ✅ toggle daily/full + індикатор "змінено вручну на сьогодні"
ui.tsx                  — ✅ (дублікат components/ui/ui.tsx, див. попередження вище)
QRScanner.tsx           — ✅ Фаза 15, html5-qrcode, задня камера. Резинхронізовано 2026-08-27:
                           приймає notice?: string | null (попередження поверх камери, напр.
                           "цю накладну вже відскановано"); onScan НЕ закриває камеру сам —
                           викликач (EventForm) вирішує, закривати чи лишити відкритою (потрібно
                           для повторної спроби скану при дублікаті)

⏳ Не існує: RouteTimeline.tsx, EventTypeButtons.tsx, ScannedWaybillList.tsx,
   PalletsInput.tsx, StoreConfirmModal.tsx, RejectionForm.tsx,
   ReturnGoodsForm.tsx, ExtraCargoForm.tsx
   (їхня логіка зараз інлайнена прямо в DriverDashboard.tsx/EventForm.tsx)
```

---

## `components/hired/`, `components/carriers/`, `components/fleet/` — ⏳ порожні теки

Жоден файл з оригінального плану (`HiredTripCard`, `CarrierShipmentCard`,
`CarCard`, `CarTable`, `DailyCostsChart`, `CostBreakdownPie` тощо) ще не
написаний.

---

## `components/waybills/` — ✅ частково (Фаза 11)

```
WaybillFiltersBar.tsx   — ✅ search + status + channel + legalEntity + lineType + dates
                           (⏳ store-фільтр типізований, контролу в UI ще немає)
WaybillTable.tsx        — ✅ + ChannelBadge + LegalEntityBadge + StatusBadge
WaybillList.tsx         — ✅ сама сторінка живе тут, не в pages/waybills/

⏳ Не існує: WaybillLineTable.tsx, CsvPreview.tsx, ReturnMatchRow.tsx, UnassignedRow.tsx
```

---

## `components/analystics/` — ⏳ порожня тека

> ⚠️ Назва теки в реальному коді — `analystics` (не `analytics`). Якщо
> колись почнеться робота над аналітикою — варто вирішити свідомо,
> перейменовувати чи лишати: наразі тека порожня, тож перейменування
> нічого не зламає.

---

## `components/layouts/` — ✅ реалізовано

```
DriverLayout.tsx  — glass-хедер + bottom nav (Маршрут/Історія) — окремої вкладки
                     "Сканер" немає, сканування камери відбувається інлайн у EventForm
                     (окрема вкладка/маршрут /driver/scan був видалений як мертвий)
MainLayout.tsx     — sidebar (Автопарк/Накладні/Найманий/Служби/Аналітика/Адміністрування)
TopNav.tsx         — верхнє меню лендінгу (⚠️ див. 04_PAGES_AND_ROUTING.md —
                     LandingPage/UnderConstruction, які його використовують,
                     наразі не підключені в App.tsx)
```
