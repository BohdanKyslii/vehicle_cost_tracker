# Vehicle Cost Tracker — TypeScript типи

Файл: `src/types/index.ts`

> ✅ Резинхронізовано 2026-08-24 напряму з реального файлу (раніше цей
> документ описував ранній варіант типів, написаний до кодингу — з тих
> пір типи розійшлись помітно: кілька ID-полів стали `number` замість
> `string`, з'явились `CarSpecs`/`Trailer`/`CarStatusLog`, назви кількох
> полів не збігаються з backend-серіалізаторами один-в-один). Коментарі
> в реальному файлі — англійською; тут перекладено заголовки розділів,
> сам код — як у джерелі.

---

## Довідники

```typescript
// ── Категорія товару ──────────────────────────────────────
export interface ProductCategory {
  idCategory: number;
  nameCategory: string;
  parentID: number | null;    // ієрархія категорій — нове відносно плану
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

// Константи для зручності в коді
export const CATEGORY_DEFAULTS = {
  ROOT_OTHER: 3,
  CHILD_OTHER: 15,
};

// ── Товар (з 1С) ──────────────────────────────────────────
export interface Product {
  idProduct: number;           // ⚠️ number, не string як в оригінальному плані
  nameProduct: string;
  idCategory: number;          // default: 15 ("Інше" → "Аксесуари")
  isActive: boolean;           // default: true
  description?: string;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory;
  logistics?: ProductLogistics;
}

// Дефолти для форми створення нового товару
export const PRODUCT_DEFAULTS: Partial<Product> = {
  idCategory: CATEGORY_DEFAULTS.CHILD_OTHER,
  isActive: true,
};

// ── Логістичні дані товару ────────────────────────────────
// ⚠️ Відносно плану: немає boxWeightKg, і немає розрахункових
// unitVolumeCbm/boxVolumeCbm як полів типу (лишились закоментовані
// формули в utils/calcProduct.ts — TODO, ще не ввімкнено).
export interface ProductLogistics {
  idProduct: number;
  unitWeightKg?: number;
  unitLengthCm?: number;
  unitWidthCm?: number;
  unitHeightCm?: number;
  unitsPerBox?: number;
  boxLengthCm?: number;
  boxWidthCm?: number;
  boxHeightCm?: number;
}

// ── Клієнт ────────────────────────────────────────────────
export interface Customer {
  idCustomer: number;          // ⚠️ number, не string як в оригінальному плані
  nameCustomer: string;
  networkCustomer?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Магазин / торгова точка ───────────────────────────────
export interface Store {
  idStore: number;             // ⚠️ number, не string як в оригінальному плані
  idCustomer: number;
  nameStore: string;
  storeAddress?: string;
  isActive: boolean;
  customer?: Customer;
  deliveryAddress?: StoreDeliveryAddress[];  // ⚠️ однина в назві поля, масив
}

export interface StoreDeliveryAddress {
  id: number;
  idStore: number;
  deliveryAddress: string;
  isPrimary: boolean;
  notes?: string;
}
```

⏳ Жоден з цих типів ще не має ні mock-даних, ні `api/`-виклику, ні UI —
`Product`/`Customer`/`Store` існують лише як TS-типи.

---

## Автопарк

```typescript
export type TrackingMode = 'daily' | 'full';
// pause/driver_downtime додані 2026-08-28 (backend migration
// 0005_car_status_pause_downtime) — вимушений простій (тахограф) і
// простій через відсутність водія відповідно
export type CarStatus = "active" | "repair" | "inactive" | "pause" | "driver_downtime";

// ── Авто власного автопарку ───────────────────────────────
export interface Car {
  idCar: number;
  nameCar: string;              // "Mercedes Sprinter 315 CDI"
  numberCar: string;            // держ. номер, "АА1234ВВ"
  fuelCardNumber?: number;      // ⚠️ нове відносно плану: номер паливної картки
  amountCar: number;            // амортизація грн/міс
  defaultTrackingMode?: TrackingMode;  // ⚠️ опційне (не обов'язкове, як у плані)
  statusCar: CarStatus;
  isActive: boolean;
  specs?: CarSpecs;             // ⚠️ нове відносно плану
  trailer?: Trailer;            // ⚠️ нове відносно плану
}

// ⚠️ Повністю нове відносно оригінального плану — технічні характеристики авто
export interface CarSpecs {
  idCar: number;
  vinCode?: string;
  yearManufactured?: number;
  weightKg?: number;
  payloadKg?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  hasTailLift: boolean;         // гідравлічний борт, default: false
  hasTrailer: boolean;          // default: false
  trailer?: Trailer;            // заповнюється лише якщо hasTrailer = true
}

// ⚠️ Повністю нове відносно оригінального плану — причіп
// ✅ Резинхронізовано 2026-08-28: поле `model` прибрано — на бекенді
// його ніколи не було (ні в DB, ні в TrailerSerializer), фронтенд
// надсилав його даремно, DRF мовчки ігнорував, введене значення
// губилось безслідно (backend commit deb38c8)
export interface Trailer {
  idTrailer: number;
  vinCode?: string;
  yearManufactured?: number;
  nameTrailer: string;
  idCar: number;
  numberTrailer: string;
  isActive: boolean;
}

// ⚠️ Типізовано, але жоден api/-виклик ще не читає/пише цей тип
export interface CarStatusLog {
  id: number;
  idCar: number;
  status: CarStatus;
  reason?: string;
  changedAt: string;
  changedBy?: number;
}

// ── Водій ─────────────────────────────────────────────────
export interface Driver {
  idDriver: number;
  nameDriver: string;
  phoneDriver?: string;         // ⚠️ phoneDriver, не phone як у плані
  driversLicense?: string;      // ⚠️ нове відносно плану
  idCar: number | null;
  isActive: boolean;
  car?: Car;
}
```

✅ `Car`/`Driver` активно використовуються (Фаза 13, `useCars`, `useDrivers`).
`CarSpecs`/`Trailer`/`CarStatusLog` — реальні поля API (`RawCarSpecs`/
`RawTrailer` у `src/api/cars.ts`), але ще без форми редагування на фронтенді
(Фаза 16 — CRUD для `FleetList`/`CarForm` — не набрана, див.
`04_PAGES_AND_ROUTING.md`).

---

## Канал доставки

```typescript
export type LegalEntity = 'ESP' | 'OPT' | 'Rubin';

// own     = власне авто (водій сканує QR)
// hired   = найманий транспорт (логіст вносить)
// carrier = служба доставки (Нова Пошта, Міст Експрес)
export type DeliveryChannel = 'own' | 'hired' | 'carrier';
```

---

## Реєстр накладних

```typescript
// ── Рядок накладної із 1С ─────────────────────────────────
export interface WaybillRecord {
  id: number;
  legalEntity: LegalEntity;
  waybillNumber: string;
  waybillDate: string;
  linePosition: number;
  customerId: string;
  customerName: string;
  storeId?: string;
  productId: number;            // ⚠️ number, не string як у плані
  productName: string;
  quantity: number;             // + відвантаження, − повернення
  priceUah: number;
  totalUah: number;
  comment?: string;
  totalWeightKg?: number;
  totalVolumeCbm?: number;
  volumetricWeightKg?: number;
  deliveryChannel?: DeliveryChannel | null;
  status?: WaybillStatus;       // ⚠️ нове поле прямо в рядку (не тільки в Summary)
  importedAt: string;
  importBatchId?: string;
}

// ── Агрегована накладна ───────────────────────────────────
export interface WaybillSummary {
  legalEntity: LegalEntity;
  waybillNumber: string;
  waybillDate: string;
  customerId: string;
  customerName: string;
  storeId?: string;
  storeName?: string;
  linesCount: number;
  totalUah: number;
  returnsUah: number;
  totalWeightKg?: number;
  totalVolumeCbm?: number;
  deliveryChannel?: DeliveryChannel | null;
  carId?: number;
  carNumber?: string;
  tripId?: number;
  tripRouteName?: string;
  shipmentId?: number;
  carrierName?: string;
  status: WaybillStatus;
}

export type WaybillStatus = "pending" | "scanned" | "delivered" | "cancelled";
```

✅ `WaybillRecord`/`WaybillSummary` активно в роботі (Фаза 11, `WaybillList`,
`aggregateToSummaries` в `src/api/waybills.ts`). `storeId`/`storeName`
типізовані, але ще не заповнюються реальними даними (немає mock/API для
`stores`).

---

## Трекінг — власний автопарк

```typescript
export type RouteEventType =
  | 'depot_start'
  | 'delivery'
  | 'parking_end'
  | 'depot_return'
  | 'refuel'
  | 'other_cost'
  | 'return_goods'
  | 'extra_cargo';

// ── Відмова від поставки ──────────────────────────────────
export interface DeliveryRejection {
  isFull: boolean;
  productId?: number;           // ⚠️ number, не string як у плані
  quantity?: number;
  comment?: string;
}

// ── Подія маршруту ────────────────────────────────────────
export interface RouteEvent {
  id: number;
  carId: number;
  driverId: number;
  trackingMode?: TrackingMode;  // ⚠️ опційне (не обов'язкове, як у плані)
  eventType: RouteEventType;
  eventTs: string;
  odometerKm?: number;
  palletsCount?: number;

  // delivery
  waybillNumber?: string;
  waybillDate?: string;
  customerName?: string;
  rejection?: DeliveryRejection;

  // refuel
  fuelLiters?: number;
  fuelCostUah?: number;
  adBlueLiters?: number;
  adBlueCostUah?: number;

  // other_cost — ⚠️ ОДНИНА (otherCostUah), не otherCostsUah як у плані
  otherCostUah?: number;
  otherCostComment?: string;

  // return_goods
  returnClientWaybill?: string;

  // extra_cargo
  extraFrom?: string;
  extraTo?: string;
  extraWeightKg?: number;
  extraWaybill?: string;
  extraComment?: string;

  notes?: string;
  createdAt: string;
}

export type RouteEventCreate = Omit<RouteEvent, 'id' | 'createdAt'>;

// ── Відрізок маршруту ─────────────────────────────────────
export interface RouteSegment {
  fromEvent: RouteEventType;
  toEvent: RouteEventType;
  waybillNumber?: string;
  customerName?: string;
  distanceKm: number;
  durationMin: number;
}

// ── Денний підсумок ───────────────────────────────────────
export interface DailySummary {
  carId: number;
  driverId: number;
  trackingMode: TrackingMode;
  date: string;
  totalMileageKm: number;
  loadedMileageKm: number | null;
  emptyMileageKm: number | null;
  palletsCount: number | null;
  fuelLiters: number;
  fuelCostUah: number;
  adBlueLiters: number;
  adBlueCostUah: number;
  otherCostUah: number;
  deliveriesCount: number;
  returnCount: number;          // ⚠️ returnCount, не returnsCount як у плані
  extraCargoCount: number;
  waybillNumbers: string[];
  segments: RouteSegment[];
}
```

> ⚠️ **Реальна пастка (задокументована прямо в коді, `src/api/routeEvents.ts`):**
> TS-поле — `otherCostUah` (однина), поле Django-моделі — `other_costs_uah`
> (множина). `toRouteEventPayload`/`mapRouteEvent` вручну мапують це
> розходження — якщо додаєш нове поле за аналогією, звір назву з моделлю,
> не покладайся на "дзеркальність" camelCase↔snake_case.

✅ Весь цей блок активно в роботі — Фаза 13 (`DriverDashboard`, `EventForm`),
`buildDailySummary`/`buildRouteSegments` в `src/utils/calcSummary.ts`.

---

## Місячні витрати

```typescript
export interface MonthlyCosts {
  id: number;
  carId: number;
  month: string;                // формат YYYY-MM
  salaryUah: number;
  taxesUah: number;
  depreciationUah: number;
  repairActualUah?: number;
  repairRateUahKm: number;      // default: 2.00
  otherCostUah: number;         // ⚠️ однина, не otherCostsUah як у плані
  otherCostComment?: string;
}

export type MonthlyCostsForm = Omit<MonthlyCosts, "id">;

export interface MonthlyCostsSummary extends MonthlyCosts {
  totalKm: number;
  repairCostUah: number;
  totalCostUah: number;
}
```

✅ Розрахункові функції (`calcRepairCost`, `calcTotalMonthlyCost`) готові в
`src/utils/calcTransportCost.ts`. ⏳ Немає ні mock-даних, ні форми внесення
(`MonthlyCostsAdmin`).

---

## Найманий транспорт

```typescript
export interface HiredTransportTrip {
  id: number;
  carNumber: string;
  routeName: string;
  tripDate: string;
  palletsCount?: number;
  costUah: number;
  comment?: string;
  createdAt: string;
  waybills?: HiredTripWaybill[];
}

export type HiredTransportTripCreate = Omit<
  HiredTransportTrip,
  "id" | "createdAt" | "waybills"
>;

export interface HiredTripWaybill {
  id: number;
  tripId: number;
  waybillNumber: string;
  scannedAt: string;
}
```

✅ Типи готові й не змінились відносно плану. ⏳ Немає ні mock-даних, ні
`api/hiredTransport.ts`, ні UI.

---

## Служби доставки

```typescript
export interface CarrierShipment {
  id: number;
  carrierName: string;
  ttn: string;
  shipmentDate: string;
  comment?: string;
  createdAt: string;
  waybills?: CarrierWaybill[];
  cost?: CarrierCost;
}

export type CarrierShipmentCreate = Omit<
  CarrierShipment,
  "id" | "createdAt" | "waybills" | "cost"
>;

export interface CarrierWaybill {
  id: number;
  shipmentId: number;
  waybillNumber: string;
  scannedAt: string;
}

export interface CarrierCost {
  id: number;
  shipmentId?: number;
  carrierName: string;
  ttn: string;
  costDate: string;
  weightKg?: number;
  costUah: number;
  importBatchId?: string;
  importedAt: string;
}
```

✅ Типи готові й не змінились відносно плану. ⏳ Немає ні mock-даних, ні
`api/carriers.ts`, ні UI.

---

## Аналітика

```typescript
export interface TransportCostPerWaybill {
  legalEntity: LegalEntity;
  waybillNumber: string;
  waybillDate: string;
  customerId: string;
  customerName: string;
  storeId?: string;
  carId: number;
  carNumber: string;
  saleUah: number;
  totalWeightKg?: number;
  totalVolumeCbm?: number;
  allocatedCostUah: number;
  costPctOfSale: number;
}

export interface TransportCostPerCustomer {
  customerId: string;
  customerName: string;
  networkCustomer?: string;
  waybillsCount: number;
  saleUah: number;
  totalWeightKg?: number;
  ownCostUah: number;
  hiredCostUah: number;
  carrierCostUah: number;
  totalCostUah: number;
  costPctOfSale: number;
}

export interface CarMonthlySummary {
  carId: number;
  carNumber: string;
  month: string;
  totalKm: number;
  totalPallets: number;
  fuelLiters: number;
  fuelCostUah: number;
  adBlueLiters: number;
  adBlueCostUah: number;
  fuelLitersPer100Km: number;
  totalCostUah: number;
  costPerKmUah: number;
}

export interface ChannelComparison {
  month: string;
  ownWaybillsCount: number;
  ownTotalCostUah: number;
  ownCostPerPallet: number;
  hiredWaybillsCount: number;
  hiredTotalCostUah: number;
  hiredCostPerPallet: number;
  carrierWaybillsCount: number;
  carrierTotalCostUah: number;
}
```

⏳ Типи готові, `allocateMonthlyCosts`/`allocateHiredTripCost` рахують
`TransportCostPerWaybill[]` в `utils/`, але жоден `api/analytics.ts` чи
сторінка аналітики ще не існують.

---

## Допоміжні типи (UI)

```typescript
export type LoadingState = "idle" | "loading" | "success" | "error";

export interface PaginationParams { page: number; pageSize: number; }

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WaybillFilters {
  search?: string;
  status?: WaybillStatus;
  deliveryChannel?: DeliveryChannel | "unassigned" | "all";
  carId?: number;
  legalEntity?: LegalEntity;
  lineType?: "shipment" | "return" | "all";
  storeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export type SortField = "date" | "total" | "customer" | "vehicle" | "weight";
export type SortDirection = "asc" | "desc";
export interface SortParams { field: SortField; direction: SortDirection; }

export interface ImportResult {
  batchId: string;
  imported: number;
  skipped: number;
  errors: ImportError[];
}

export interface ImportError { row: number; field: string; message: string; }

export interface ScannedWaybill {
  waybillNumber: string;
  waybillDate: string;
  scannedAt: string;
  customerName?: string;
  storeName?: string;
  deliveryChannel?: DeliveryChannel;
}
```

✅ Активно в роботі: `WaybillFilters`/`SortParams`/`PaginatedResponse` —
Фаза 11 (`useWaybillFilters`, `WaybillList`). `ScannedWaybill`/`ImportResult`/
`ImportError` — типізовані про запас, ще без коду що їх використовує
(QR-сканер і CSV-імпорт не набрані).

---

## Що ще НЕ типізовано, хоч і присутнє в реальному коді

- `UserProfile`/`CurrentUser` (авторизація, `src/api/auth.ts`) — живуть
  окремо від `src/types/index.ts`, не задокументовані в оригінальному плані
  взагалі (авторизації там не було). `UserProfile.role` — `'driver' |
  'logist' | 'manager' | 'head'`.
