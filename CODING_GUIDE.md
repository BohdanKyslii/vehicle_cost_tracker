# Vehicle Cost Tracker — Покрокова інструкція з написання коду
# Для вивчення JavaScript / React / TypeScript з нуля

> Відкрий цей файл у другому вікні WebStorm (View → Split Right)
> і пиши код вручну — не копіюй, набирай руками, так краще запам'ятовується.

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 1 — ІНІЦІАЛІЗАЦІЯ ПРОЄКТУ
# ═══════════════════════════════════════════════════════════

## Крок 1.1 — Що таке Vite і навіщо він потрібен

Vite — це інструмент збірки (build tool). Він:
- Створює структуру React-проєкту за шаблоном
- Запускає локальний dev-сервер (localhost:5173)
- При збереженні файлу миттєво оновлює браузер (Hot Module Replacement)
- Перетворює TypeScript → JavaScript для браузера

Аналогія: Vite — це як Django management команда startproject,
тільки для фронтенду.

---

## Крок 1.2 — Створення проєкту

Відкрий термінал WebStorm (Alt+F12) і виконай по одній команді:

```
npm create vite@latest vehicle-tracker -- --template react-ts
```

Ця команда:
- `npm create vite@latest` — запускає генератор Vite
- `vehicle-tracker` — ім'я папки проєкту
- `--template react-ts` — шаблон: React + TypeScript

```
cd vehicle-tracker
```

Переходимо у папку проєкту.

```
npm install
```

Встановлює базові залежності (React, ReactDOM, TypeScript).
Аналог: pip install -r requirements.txt у Django.

---

## Крок 1.3 — Встановлення додаткових бібліотек

Виконуй по одному блоку:

```
npm install react-router-dom @tanstack/react-query
```

- `react-router-dom` — навігація між сторінками (як urls.py у Django)
- `@tanstack/react-query` — управління даними від сервера (loading/error/cache)

```
npm install tailwindcss @tailwindcss/vite
```

- `tailwindcss` — CSS-утиліти (класи типу `text-blue-600`, `flex`, `p-4`)

```
npm install recharts html5-qrcode papaparse date-fns
```

- `recharts` — графіки
- `html5-qrcode` — сканер QR-кодів через камеру телефону
- `papaparse` — парсинг CSV файлів
- `date-fns` — зручна робота з датами

```
npm install -D @types/papaparse @tanstack/react-query-devtools vite-plugin-pwa
```

- `-D` означає devDependency (тільки для розробки, не потрапляє у production)
- `@types/papaparse` — TypeScript-типи для papaparse
- `vite-plugin-pwa` — зробить додаток встановлюваним на телефон (PWA)

---

## Крок 1.4 — Налаштування vite.config.ts

Відкрий файл `vite.config.ts` (він вже існує після ініціалізації).
ВИДАЛИ весь вміст і напиши з нуля:

```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Vehicle Cost Tracker",
        short_name: "Трекер",
        theme_color: "#1e40af",
        display: "standalone",
        start_url: "/driver",
      },
    }),
  ],
});
```

ЩО РОБИТЬ КОД:
- `defineConfig` — функція Vite, яка приймає конфіг-об'єкт
- `plugins: []` — масив плагінів, що підключаються до Vite
- `react()` — дозволяє Vite розуміти JSX/TSX синтаксис
- `tailwindcss()` — обробляє Tailwind-класи
- `VitePWA({...})` — додає функціонал PWA (installable app)
- `manifest` — метадані додатку для телефону (назва, колір, стартова сторінка)

---

## Крок 1.5 — Створення .env файлів

Створи новий файл у корені проєкту: `.env`

```
VITE_USE_MOCK=true
VITE_API_BASE=http://localhost:8000/api
```

ЩО РОБИТЬ КОД:
- `.env` — файл змінних оточення (environment variables)
- `VITE_` — префікс обов'язковий, щоб Vite передав змінну у браузер
- `VITE_USE_MOCK=true` — поки немає Django backend, використовуємо JSON-файли
- В коді читається як: `import.meta.env.VITE_USE_MOCK`

Створи ще файл `.env.production` (для майбутнього Django backend):

```
VITE_USE_MOCK=false
VITE_API_BASE=https://your-domain.com/api
```

Додай `.env` у `.gitignore` (відкрий `.gitignore`, знайди рядок `*.local`
і додай після нього):

```
.env
.env.production
```

ВАЖЛИВО: `.env` файли ніколи не комітимо у git — там можуть бути паролі.

---

## Крок 1.6 — Налаштування index.css

Відкрий `src/index.css`, ВИДАЛИ весь вміст і напиши:

```css
/* src/index.css */
@import "tailwindcss";

/* Запобігає zoom на iOS при фокусі на input */
input,
select,
textarea {
  font-size: 16px;
}

/* Safe area для iPhone (notch / home indicator) */
.safe-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

/* Мінімальний розмір кнопок для пальця (44px — рекомендація Apple) */
button,
a[role="button"] {
  min-height: 44px;
  touch-action: manipulation;
}
```

ЩО РОБИТЬ КОД:
- `@import "tailwindcss"` — підключає всі Tailwind утиліти
- `font-size: 16px` на inputs — Safari не зумить сторінку при 16px+
- `env(safe-area-inset-bottom)` — CSS змінна від браузера,
  додає відступ під "чубчиком" iPhone
- `touch-action: manipulation` — прибирає 300ms затримку на тап

---

## Крок 1.7 — Перевірка запуску

```
npm run dev
```

Відкрий браузер: http://localhost:5173
Повинна з'явитись стандартна Vite + React сторінка.
Якщо бачиш — все налаштовано правильно ✅

Зупини сервер: Ctrl+C у терміналі.

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 2 — СТРУКТУРА ПАПОК І TYPESCRIPT ТИПИ
# ═══════════════════════════════════════════════════════════

## Крок 2.1 — Чому TypeScript і що таке типи

TypeScript — це JavaScript + система типів. Приклад:

```typescript
// JavaScript (без типів) — помилка видима тільки в runtime
function add(a, b) { return a + b; }
add("5", 3); // поверне "53" замість 8 — JavaScript конкатенує рядки!

// TypeScript — помилка видима одразу в редакторі
function add(a: number, b: number): number { return a + b; }
add("5", 3); // ❌ Помилка: Argument of type 'string' is not assignable to 'number'
```

Інтерфейс — це опис форми об'єкта:

```typescript
// Без інтерфейсу:
const car = { idCar: 1, nameCar: "Sprinter", numberCar: "АА1234ВВ" };

// З інтерфейсом:
interface Car {
  idCar: number;
  nameCar: string;
  numberCar: string;
}
const car: Car = { idCar: 1, nameCar: "Sprinter", numberCar: "АА1234ВВ" };
// Тепер редактор знає що є в об'єкті і підказує при наборі!
```

---

## Крок 2.2 — Створення структури папок

У WebStorm клацни правою кнопкою на папку `src` → New → Directory.
Створи такі папки (по одній):

```
src/
├── types/
├── mocks/
├── api/
├── hooks/
├── utils/
├── components/
│   ├── ui/
│   ├── layouts/
│   ├── driver/
│   ├── hired/
│   ├── carriers/
│   ├── fleet/
│   ├── waybills/
│   └── analytics/
└── pages/
    ├── driver/
    ├── fleet/
    ├── waybills/
    ├── hired/
    ├── carriers/
    ├── analytics/
    └── admin/
```

---

## Крок 2.3 — Файл типів: базові поняття

Перед написанням типів — розберемо синтаксис:

```typescript
// interface — опис об'єкта
interface Person {
  name: string;       // обов'язкове поле
  age?: number;       // ? означає опційне (може бути undefined)
  isActive: boolean;
}

// type alias — псевдонім для типу
type Status = "active" | "inactive" | "repair";
// Це Union Type — змінна може бути ТІЛЬКИ одним із цих рядків

// Omit<T, K> — копіює інтерфейс T але без поля K
type CarForm = Omit<Car, "idCar" | "createdAt">;
// Зручно для форм де id ще не існує

// Generic type <T> — тип-шаблон
interface PaginatedResponse<T> {
  items: T[];    // масив будь-якого типу
  total: number;
}
// Використання:
// PaginatedResponse<Car>     → items: Car[]
// PaginatedResponse<Waybill> → items: Waybill[]
```

---

## Крок 2.4 — Написання types/index.ts

Створи файл `src/types/index.ts`.
Набирай кожен блок руками, розуміючи що пишеш:

```typescript
// src/types/index.ts

// ─────────────────────────────────────────────────────────
// ДОВІДНИКИ
// ─────────────────────────────────────────────────────────

// Категорія товарів (вина, горілка, пиво...)
export interface ProductCategory {
  idCategory: number;
  nameCategory: string;
}

// Товар із 1С
export interface Product {
  idProduct: string;      // артикул, наприклад "P001"
  nameProduct: string;
  idCategory: number | null;  // null якщо категорія не вказана
  isActive: boolean;
  // Опційні вкладені об'єкти (підвантажуються окремим запитом)
  category?: ProductCategory;
  logistics?: ProductLogistics;
}

// Логістичні дані товару — окрема таблиця в БД
export interface ProductLogistics {
  idProduct: string;
  unitWeightKg?: number;
  unitLengthCm?: number;
  unitWidthCm?: number;
  unitHeightCm?: number;
  unitsPerBox?: number;
  boxWeightKg?: number;
  boxLengthCm?: number;
  boxWidthCm?: number;
  boxHeightCm?: number;
  unitVolumeCbm?: number;   // Д×Ш×В / 1_000_000 — куб. м
  boxVolumeCbm?: number;
}

// Клієнт (компанія-покупець)
export interface Customer {
  idCustomer: string;
  nameCustomer: string;
  networkCustomer?: string;   // "Роздріб" / "Мережа" / "HoReCa"
  isActive: boolean;
}

// Магазин / торгова точка клієнта
export interface Store {
  idStore: string;
  idCustomer: string;
  nameStore: string;
  storeAddress?: string;
  isActive: boolean;
  // Вкладені об'єкти
  customer?: Customer;
  deliveryAddresses?: StoreDeliveryAddress[];
}

// Додаткова адреса доставки магазину
// Один магазин може мати кілька адрес
export interface StoreDeliveryAddress {
  id: number;
  idStore: string;
  deliveryAddress: string;
  isPrimary: boolean;   // основна адреса
  notes?: string;
}

// ─────────────────────────────────────────────────────────
// АВТОПАРК
// ─────────────────────────────────────────────────────────

// Режим трекінгу водія на авто
// daily = тільки ранковий одометр
// full = трекінг кожної точки вивантаження
export type TrackingMode = "daily" | "full";

// Статус авто
export type CarStatus = "active" | "repair" | "inactive";

// Авто власного автопарку
export interface Car {
  idCar: number;
  nameCar: string;            // "Mercedes Sprinter 315 CDI"
  numberCar: string;          // "АА1234ВВ"
  amountCar: number;          // амортизація грн/міс — фіксована
  defaultTrackingMode: TrackingMode;
  statusCar: CarStatus;
  isActive: boolean;
}

// Водій
export interface Driver {
  idDriver: number;
  nameDriver: string;
  phone?: string;
  idCar: number | null;   // до якого авто закріплений
  isActive: boolean;
  car?: Car;              // вкладений об'єкт (join)
}

// ─────────────────────────────────────────────────────────
// КАНАЛ ДОСТАВКИ
// ─────────────────────────────────────────────────────────

// Юридична особа компанії
export type LegalEntity = "ESP" | "OPT" | "Rubin";

// Канал доставки — кожна накладна належить ТІЛЬКИ одному каналу
// own     = власне авто (водій сканує QR)
// hired   = найманий транспорт (логіст вносить)
// carrier = служба доставки (НП, Міст Експрес)
export type DeliveryChannel = "own" | "hired" | "carrier";

// ─────────────────────────────────────────────────────────
// РЕЄСТР НАКЛАДНИХ (із 1С)
// ─────────────────────────────────────────────────────────

// Один рядок накладної із 1С
// quantity > 0 = відвантаження
// quantity < 0 = повернення
export interface WaybillRecord {
  id: number;
  legalEntity: LegalEntity;
  waybillNumber: string;
  waybillDate: string;        // "2026-06-29"
  linePosition: number;       // позиція рядка в накладній
  customerId: string;
  customerName: string;
  storeId?: string;
  productId: string;
  productName: string;
  quantity: number;
  priceUah: number;
  totalUah: number;
  comment?: string;
  // Логістика (з довідника, рахується при імпорті)
  totalWeightKg?: number;
  totalVolumeCbm?: number;
  volumetricWeightKg?: number;
  // Канал: null = ще не призначено
  deliveryChannel?: DeliveryChannel | null;
  importedAt: string;
  importBatchId?: string;
}

// Агрегована накладна (всі рядки одної накладної → один рядок у таблиці UI)
export interface WaybillSummary {
  legalEntity: LegalEntity;
  waybillNumber: string;
  waybillDate: string;
  customerId: string;
  customerName: string;
  storeId?: string;
  storeName?: string;
  linesCount: number;
  totalUah: number;       // сума відвантажень
  returnsUah: number;     // сума повернень (від'ємна)
  totalWeightKg?: number;
  totalVolumeCbm?: number;
  deliveryChannel?: DeliveryChannel | null;
  // Деталі каналу
  carId?: number;
  carNumber?: string;
  tripId?: number;
  tripRouteName?: string;
  shipmentId?: number;
  carrierName?: string;
  status: WaybillStatus;
}

export type WaybillStatus = "pending" | "scanned" | "delivered" | "cancelled";

// ─────────────────────────────────────────────────────────
// ТРЕКІНГ МАРШРУТУ (власний автопарк)
// ─────────────────────────────────────────────────────────

export type RouteEventType =
  | "depot_start"   // ранок, склад
  | "delivery"      // вивантаження у клієнта
  | "parking_end"   // кінець дня
  | "depot_return"  // повернення на склад
  | "refuel"        // заправка
  | "other_cost"    // інші витрати
  | "return_goods"  // повернення товару
  | "extra_cargo";  // додатковий вантаж

// Відмова від прийому товару
export interface DeliveryRejection {
  isFull: boolean;          // true = повна відмова
  productId?: string;
  quantity?: number;
  comment?: string;
}

// Одна подія маршруту
export interface RouteEvent {
  id: number;
  carId: number;
  driverId: number;
  trackingMode: TrackingMode;
  eventType: RouteEventType;
  eventTs: string;              // ISO 8601: "2026-06-29T08:15:00+03:00"
  odometerKm?: number;
  palletsCount?: number;        // к-сть палет (depot_start daily / delivery full)

  // Для delivery
  waybillNumber?: string;
  waybillDate?: string;
  customerName?: string;
  rejection?: DeliveryRejection;

  // Для refuel
  fuelLiters?: number;
  fuelCostUah?: number;
  adBlueLiters?: number;
  adBlueCostUah?: number;

  // Для other_cost
  otherCostsUah?: number;
  otherCostsComment?: string;

  // Для return_goods
  returnClientWaybill?: string;

  // Для extra_cargo
  extraFrom?: string;
  extraTo?: string;
  extraWeightKg?: number;
  extraWaybill?: string;
  extraComment?: string;

  notes?: string;
  createdAt: string;
}

// Тип для створення події (без id і createdAt — їх генерує сервер)
// Omit<T, K> — це TypeScript утиліта, яка прибирає поля K з типу T
export type RouteEventCreate = Omit<RouteEvent, "id" | "createdAt">;

// Відрізок маршруту між двома подіями (тільки full режим)
export interface RouteSegment {
  fromEvent: RouteEventType;
  toEvent: RouteEventType;
  waybillNumber?: string;
  customerName?: string;
  distanceKm: number;
  durationMin: number;
}

// Підсумок дня — розраховується з масиву RouteEvent
export interface DailySummary {
  carId: number;
  driverId: number;
  trackingMode: TrackingMode;
  date: string;
  totalMileageKm: number;
  loadedMileageKm: number | null;   // null для daily режиму
  emptyMileageKm: number | null;    // null для daily режиму
  palletsCount: number | null;
  fuelLiters: number;
  fuelCostUah: number;
  adBlueLiters: number;
  adBlueCostUah: number;
  otherCostsUah: number;
  deliveriesCount: number;
  returnsCount: number;
  extraCargoCount: number;
  waybillNumbers: string[];
  segments: RouteSegment[];   // [] для daily режиму
}

// ─────────────────────────────────────────────────────────
// МІСЯЧНІ ВИТРАТИ (від логіста)
// ─────────────────────────────────────────────────────────

export interface MonthlyCosts {
  id: number;
  carId: number;
  month: string;                // "2026-06"
  salaryUah: number;
  taxesUah: number;
  depreciationUah: number;
  repairActualUah?: number;     // якщо є — пріоритет над розрахунковим
  repairRateUahKm: number;      // default: 2.00 грн/км
  otherCostsUah: number;
  otherCostsComment?: string;
}

export type MonthlyCostsForm = Omit<MonthlyCosts, "id">;

// З розрахованими полями
export interface MonthlyCostsSummary extends MonthlyCosts {
  totalKm: number;
  repairCostUah: number;    // actual або rate × km
  totalCostUah: number;
}

// ─────────────────────────────────────────────────────────
// НАЙМАНИЙ ТРАНСПОРТ
// ─────────────────────────────────────────────────────────

export interface HiredTransportTrip {
  id: number;
  carNumber: string;      // вільний ввід, не з довідника
  routeName: string;      // "Пирятин, Полтава, Харків"
  tripDate: string;
  palletsCount?: number;
  costUah: number;        // фактична вартість рейсу
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

// ─────────────────────────────────────────────────────────
// СЛУЖБИ ДОСТАВКИ (НП, Міст Експрес)
// ─────────────────────────────────────────────────────────

export interface CarrierShipment {
  id: number;
  carrierName: string;    // "Нова Пошта" / "Міст Експрес"
  ttn: string;            // номер ТТН у службі
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

// ─────────────────────────────────────────────────────────
// АНАЛІТИКА
// ─────────────────────────────────────────────────────────

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
  allocatedCostUah: number;   // розподілені витрати авто
  costPctOfSale: number;      // % від суми продажу
}

export interface TransportCostPerCustomer {
  customerId: string;
  customerName: string;
  networkCustomer?: string;
  waybillsCount: number;
  saleUah: number;
  totalWeightKg?: number;
  // Розбивка по каналах
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

// ─────────────────────────────────────────────────────────
// UI ДОПОМІЖНІ ТИПИ
// ─────────────────────────────────────────────────────────

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Generic — T може бути будь-яким типом
// PaginatedResponse<Car>, PaginatedResponse<WaybillSummary> і т.д.
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

export interface SortParams {
  field: SortField;
  direction: SortDirection;
}

export interface ImportResult {
  batchId: string;
  imported: number;
  skipped: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

// Відскана накладна (у формі водія / логіста)
export interface ScannedWaybill {
  waybillNumber: string;
  waybillDate: string;
  scannedAt: string;
  customerName?: string;
  storeName?: string;
  deliveryChannel?: DeliveryChannel;  // для перевірки ексклюзивності
}
```

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 3 — MOCK ДАНІ (замінник API)
# ═══════════════════════════════════════════════════════════

## Крок 3.1 — Навіщо потрібні mock дані

Поки немає Django backend — будемо читати локальні JSON файли.
Перевага: можна розробляти UI незалежно від сервера.
Потім просто змінюємо `VITE_USE_MOCK=false` і все починає
працювати з реальним API без змін у компонентах.

---

## Крок 3.2 — Створення src/mocks/cars.json

```json
[
  {
    "idCar": 1,
    "nameCar": "Mercedes Sprinter 315 CDI",
    "numberCar": "АА1234ВВ",
    "amountCar": 8333,
    "defaultTrackingMode": "full",
    "statusCar": "active",
    "isActive": true
  },
  {
    "idCar": 2,
    "nameCar": "Volkswagen Crafter 35",
    "numberCar": "АА5678СС",
    "amountCar": 10417,
    "defaultTrackingMode": "daily",
    "statusCar": "active",
    "isActive": true
  },
  {
    "idCar": 3,
    "nameCar": "Ford Transit 350",
    "numberCar": "АА9012КК",
    "amountCar": 6806,
    "defaultTrackingMode": "daily",
    "statusCar": "repair",
    "isActive": true
  }
]
```

---

## Крок 3.3 — Створення src/mocks/drivers.json

```json
[
  {
    "idDriver": 1,
    "nameDriver": "Коваленко Іван Петрович",
    "phone": "+380501234567",
    "idCar": 1,
    "isActive": true
  },
  {
    "idDriver": 2,
    "nameDriver": "Мельник Сергій Олексійович",
    "phone": "+380677654321",
    "idCar": 2,
    "isActive": true
  },
  {
    "idDriver": 3,
    "nameDriver": "Бондаренко Олег Миколайович",
    "phone": "+380639876543",
    "idCar": 3,
    "isActive": true
  }
]
```

---

## Крок 3.4 — Створення src/mocks/customers.json

```json
[
  {
    "idCustomer": "C001",
    "nameCustomer": "ТОВ Сонячна торгівля",
    "networkCustomer": "Роздріб",
    "isActive": true
  },
  {
    "idCustomer": "C002",
    "nameCustomer": "ФОП Петренко В.М.",
    "networkCustomer": "Роздріб",
    "isActive": true
  },
  {
    "idCustomer": "C003",
    "nameCustomer": "Мережа Зоряний",
    "networkCustomer": "Мережа",
    "isActive": true
  },
  {
    "idCustomer": "C004",
    "nameCustomer": "ТОВ Смак України",
    "networkCustomer": "HoReCa",
    "isActive": true
  },
  {
    "idCustomer": "C005",
    "nameCustomer": "Супермаркет АТБ №312",
    "networkCustomer": "Мережа",
    "isActive": true
  }
]
```

---

## Крок 3.5 — Створення src/mocks/stores.json

```json
[
  {
    "idStore": "S001",
    "idCustomer": "C001",
    "nameStore": "Магазин Сонячний (Хрещатик)",
    "storeAddress": "вул. Хрещатик, 10, Київ",
    "isActive": true
  },
  {
    "idStore": "S002",
    "idCustomer": "C001",
    "nameStore": "Магазин Сонячний (Льва Толстого)",
    "storeAddress": "вул. Льва Толстого, 5, Київ",
    "isActive": true
  },
  {
    "idStore": "S003",
    "idCustomer": "C003",
    "nameStore": "Зоряний Полтава",
    "storeAddress": "вул. Соборності, 12, Полтава",
    "isActive": true
  },
  {
    "idStore": "S004",
    "idCustomer": "C003",
    "nameStore": "Зоряний Харків",
    "storeAddress": "пр. Науки, 45, Харків",
    "isActive": true
  },
  {
    "idStore": "S005",
    "idCustomer": "C005",
    "nameStore": "АТБ Пирятин",
    "storeAddress": "вул. Центральна, 1, Пирятин",
    "isActive": true
  }
]
```

---

## Крок 3.6 — Створення src/mocks/waybills.json

```json
[
  {
    "id": 1,
    "legalEntity": "Rubin",
    "waybillNumber": "НН-000101",
    "waybillDate": "2026-06-27",
    "linePosition": 1,
    "customerId": "C001",
    "customerName": "ТОВ Сонячна торгівля",
    "storeId": "S001",
    "productId": "P001",
    "productName": "Вино Ркацителі 0.75л",
    "quantity": 60,
    "priceUah": 145.00,
    "totalUah": 8700.00,
    "totalWeightKg": 90.0,
    "totalVolumeCbm": 0.072,
    "deliveryChannel": "own",
    "status": "delivered",
    "importedAt": "2026-06-28T09:00:00+03:00"
  },
  {
    "id": 2,
    "legalEntity": "Rubin",
    "waybillNumber": "НН-000101",
    "waybillDate": "2026-06-27",
    "linePosition": 2,
    "customerId": "C001",
    "customerName": "ТОВ Сонячна торгівля",
    "storeId": "S001",
    "productId": "P002",
    "productName": "Вино Аліготе 0.75л",
    "quantity": 48,
    "priceUah": 132.00,
    "totalUah": 6336.00,
    "totalWeightKg": 72.0,
    "totalVolumeCbm": 0.058,
    "deliveryChannel": "own",
    "status": "delivered",
    "importedAt": "2026-06-28T09:00:00+03:00"
  },
  {
    "id": 3,
    "legalEntity": "ESP",
    "waybillNumber": "НН-000201",
    "waybillDate": "2026-06-27",
    "linePosition": 1,
    "customerId": "C003",
    "customerName": "Мережа Зоряний",
    "storeId": "S003",
    "productId": "P003",
    "productName": "Горілка Хортиця 0.5л",
    "quantity": 240,
    "priceUah": 210.00,
    "totalUah": 50400.00,
    "totalWeightKg": 156.0,
    "totalVolumeCbm": 0.080,
    "deliveryChannel": "hired",
    "status": "delivered",
    "importedAt": "2026-06-28T09:00:00+03:00"
  },
  {
    "id": 4,
    "legalEntity": "OPT",
    "waybillNumber": "НН-000301",
    "waybillDate": "2026-06-28",
    "linePosition": 1,
    "customerId": "C002",
    "customerName": "ФОП Петренко В.М.",
    "storeId": null,
    "productId": "P005",
    "productName": "Коньяк Тиса 0.5л",
    "quantity": 12,
    "priceUah": 385.00,
    "totalUah": 4620.00,
    "totalWeightKg": 9.0,
    "totalVolumeCbm": 0.008,
    "deliveryChannel": "carrier",
    "status": "delivered",
    "importedAt": "2026-06-29T09:00:00+03:00"
  },
  {
    "id": 5,
    "legalEntity": "Rubin",
    "waybillNumber": "НН-000401",
    "waybillDate": "2026-06-29",
    "linePosition": 1,
    "customerId": "C005",
    "customerName": "Супермаркет АТБ №312",
    "storeId": "S005",
    "productId": "P004",
    "productName": "Пиво Чернігівське 0.5л",
    "quantity": 480,
    "priceUah": 42.00,
    "totalUah": 20160.00,
    "totalWeightKg": 264.0,
    "totalVolumeCbm": 0.221,
    "deliveryChannel": null,
    "status": "pending",
    "importedAt": "2026-06-29T09:00:00+03:00"
  },
  {
    "id": 6,
    "legalEntity": "Rubin",
    "waybillNumber": "НН-000098-Р",
    "waybillDate": "2026-06-27",
    "linePosition": 1,
    "customerId": "C001",
    "customerName": "ТОВ Сонячна торгівля",
    "storeId": "S001",
    "productId": "P002",
    "productName": "Вино Аліготе 0.75л",
    "quantity": -12,
    "priceUah": 132.00,
    "totalUah": -1584.00,
    "comment": "НН-000088",
    "deliveryChannel": "own",
    "status": "delivered",
    "importedAt": "2026-06-28T09:00:00+03:00"
  }
]
```

---

## Крок 3.7 — Створення src/mocks/route-events.json

```json
[
  {
    "id": 1, "carId": 1, "driverId": 1, "trackingMode": "full",
    "eventType": "depot_start",
    "eventTs": "2026-06-27T07:45:00+03:00",
    "odometerKm": 87450, "palletsCount": null,
    "createdAt": "2026-06-27T07:46:00+03:00"
  },
  {
    "id": 2, "carId": 1, "driverId": 1, "trackingMode": "full",
    "eventType": "delivery",
    "eventTs": "2026-06-27T09:30:00+03:00",
    "odometerKm": 87523, "palletsCount": 3,
    "waybillNumber": "НН-000101",
    "waybillDate": "2026-06-27",
    "customerName": "ТОВ Сонячна торгівля",
    "rejectionFull": false,
    "createdAt": "2026-06-27T09:31:00+03:00"
  },
  {
    "id": 3, "carId": 1, "driverId": 1, "trackingMode": "full",
    "eventType": "refuel",
    "eventTs": "2026-06-27T12:00:00+03:00",
    "fuelLiters": 55.4, "fuelCostUah": 3158.0,
    "adBlueLiters": 2.0, "adBlueCostUah": 90.0,
    "createdAt": "2026-06-27T12:01:00+03:00"
  },
  {
    "id": 4, "carId": 1, "driverId": 1, "trackingMode": "full",
    "eventType": "parking_end",
    "eventTs": "2026-06-27T17:30:00+03:00",
    "odometerKm": 87648,
    "createdAt": "2026-06-27T17:31:00+03:00"
  },
  {
    "id": 5, "carId": 2, "driverId": 2, "trackingMode": "daily",
    "eventType": "depot_start",
    "eventTs": "2026-06-28T08:00:00+03:00",
    "odometerKm": 54478, "palletsCount": 6,
    "notes": "Накладні за сьогодні: НН-000201",
    "createdAt": "2026-06-28T08:01:00+03:00"
  },
  {
    "id": 6, "carId": 2, "driverId": 2, "trackingMode": "daily",
    "eventType": "refuel",
    "eventTs": "2026-06-28T10:30:00+03:00",
    "fuelLiters": 48.0, "fuelCostUah": 2736.0,
    "adBlueLiters": 0, "adBlueCostUah": 0,
    "createdAt": "2026-06-28T10:31:00+03:00"
  }
]
```

---

## Крок 3.8 — Створення src/mocks/monthly-costs.json

```json
[
  {
    "id": 1, "carId": 1, "month": "2026-06-01",
    "salaryUah": 25000, "taxesUah": 5500,
    "depreciationUah": 8333,
    "repairActualUah": null, "repairRateUahKm": 2.00,
    "otherCostsUah": 1200,
    "otherCostsComment": "Штраф за паркування"
  },
  {
    "id": 2, "carId": 2, "month": "2026-06-01",
    "salaryUah": 22000, "taxesUah": 4840,
    "depreciationUah": 10417,
    "repairActualUah": 3500, "repairRateUahKm": 2.00,
    "otherCostsUah": 800,
    "otherCostsComment": "Заміна гальмівних колодок"
  }
]
```

---

## Крок 3.9 — Створення src/mocks/hired-trips.json

```json
[
  {
    "id": 1,
    "carNumber": "ВВ1111АА",
    "routeName": "Пирятин, Полтава, Харків",
    "tripDate": "2026-06-27",
    "palletsCount": 8,
    "costUah": 4500.00,
    "comment": "Перевізник ТОВ Транслог",
    "createdAt": "2026-06-27T09:00:00+03:00"
  },
  {
    "id": 2,
    "carNumber": "КК2222ВВ",
    "routeName": "Суми, Конотоп",
    "tripDate": "2026-06-28",
    "palletsCount": 5,
    "costUah": 2800.00,
    "comment": null,
    "createdAt": "2026-06-28T10:00:00+03:00"
  }
]
```

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 4 — УТИЛІТИ (чиста логіка без React)
# ═══════════════════════════════════════════════════════════

## Крок 4.1 — Що таке чисті функції і навіщо utils/

Чиста функція (pure function) — функція яка:
1. Завжди повертає однаковий результат для однакових аргументів
2. Не змінює нічого поза собою (немає side effects)

```typescript
// НЕЧИСТА — залежить від зовнішнього стану
let rate = 2;
function calcRepair(km: number) { return km * rate; }  // rate може змінитись

// ЧИСТА — тільки з аргументів
function calcRepair(km: number, rate: number) { return km * rate; }
```

Переваги чистих функцій:
- Легко тестувати (не потрібен DOM, React, мережа)
- Легко переносити (у Django backend, у тести, у іншій компонент)

---

## Крок 4.2 — Створення src/utils/formatters.ts

```typescript
// src/utils/formatters.ts

// Форматування числа у гривнях
// Intl.NumberFormat — вбудований браузерний форматер
// "uk-UA" — локаль (тисячники через пробіл, кома як розділювач)
export function formatUah(value: number): string {
  return new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    minimumFractionDigits: 2,
  }).format(value);
}
// formatUah(12345.67) → "12 345,67 ₴"

// Форматування кілометрів
export function formatKm(value: number): string {
  return `${new Intl.NumberFormat("uk-UA").format(value)} км`;
}
// formatKm(87523) → "87 523 км"

// Форматування літрів
export function formatLiters(value: number): string {
  return `${value.toFixed(1)} л`;
}
// formatLiters(55.4) → "55.4 л"

// Форматування кілограмів
export function formatKg(value: number): string {
  return `${value.toFixed(1)} кг`;
}

// Форматування кубічних метрів
export function formatCbm(value: number): string {
  return `${value.toFixed(3)} м³`;
}

// Форматування відсотків
export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

// Форматування дати з ISO рядка
// new Date("2026-06-29") → об'єкт Date
// toLocaleDateString з uk-UA локаллю → "29.06.2026"
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
// formatDate("2026-06-29") → "29.06.2026"

// Форматування дати + часу
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
// formatDateTime("2026-06-29T08:15:00+03:00") → "29.06.2026, 08:15"

// Форматування місяця
export function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString("uk-UA", {
    month: "long",
    year: "numeric",
  });
}
// formatMonth("2026-06-01") → "червень 2026"

// Юридична особа → людська назва
export function formatLegalEntity(entity: "ESP" | "OPT" | "Rubin"): string {
  const labels = { ESP: "ESP", OPT: "OPT", Rubin: "Rubin" };
  return labels[entity] ?? entity;
}

// Канал доставки → українська назва
export function channelLabel(channel: "own" | "hired" | "carrier" | null | undefined): string {
  if (!channel) return "Не призначено";
  const labels = {
    own: "Власне авто",
    hired: "Найманий транспорт",
    carrier: "Служба доставки",
  };
  return labels[channel];
}
```

---

## Крок 4.3 — Створення src/utils/eventHelpers.ts

```typescript
// src/utils/eventHelpers.ts
import type { RouteEventType, TrackingMode } from "../types";

// Повертає масив доступних типів подій для поточного режиму
// daily: тільки 5 типів (без точок маршруту)
// full: всі 8 типів
export function getAvailableEventTypes(mode: TrackingMode): RouteEventType[] {
  if (mode === "daily") {
    return ["depot_start", "refuel", "other_cost", "return_goods", "extra_cargo"];
  }
  return [
    "depot_start",
    "delivery",
    "refuel",
    "other_cost",
    "return_goods",
    "extra_cargo",
    "parking_end",
    "depot_return",
  ];
}

// Чи потрібне поле одометра для цього типу події?
export function requiresOdometer(type: RouteEventType): boolean {
  // refuel, other_cost, return_goods, extra_cargo — без одометра
  return !["refuel", "other_cost", "return_goods", "extra_cargo"].includes(type);
}

// Чи потрібне сканування накладної?
export function requiresWaybill(type: RouteEventType): boolean {
  return type === "delivery";
}

// Чи потрібне поле кількості палет?
// daily depot_start = завжди (загальна к-сть на день)
// full delivery = завжди (к-сть на точку)
export function requiresPallets(type: RouteEventType, mode: TrackingMode): boolean {
  if (type === "depot_start" && mode === "daily") return true;
  if (type === "delivery" && mode === "full") return true;
  return false;
}

// Українська назва типу події для відображення у UI
export function eventTypeLabel(type: RouteEventType): string {
  const labels: Record<RouteEventType, string> = {
    depot_start: "Старт зі складу",
    delivery: "Вивантаження",
    parking_end: "Кінець маршруту",
    depot_return: "Повернення на склад",
    refuel: "Заправка",
    other_cost: "Інші витрати",
    return_goods: "Повернення товару",
    extra_cargo: "Додатковий вантаж",
  };
  return labels[type];
}

// Emoji іконка для типу події
export function eventTypeIcon(type: RouteEventType): string {
  const icons: Record<RouteEventType, string> = {
    depot_start: "🏭",
    delivery: "📦",
    parking_end: "🅿️",
    depot_return: "↩️",
    refuel: "⛽",
    other_cost: "💸",
    return_goods: "↪️",
    extra_cargo: "🚛",
  };
  return icons[type];
}
```

---

## Крок 4.4 — Створення src/utils/calcSummary.ts

```typescript
// src/utils/calcSummary.ts
import type { RouteEvent, DailySummary, RouteSegment, TrackingMode } from "../types";

// Будує денний підсумок з масиву подій за один день.
// Ключова логіка:
// - daily: пробіг = depot_start сьогодні − lastOdometer вчора
// - full: пробіг = одометр parking_end − одометр depot_start
// - сегменти (час/відстань між точками) — тільки для full

export function buildDailySummary(
  events: RouteEvent[],
  prevDayLastOdometer: number | null,
): DailySummary {
  // Сортуємо події за часом (на випадок якщо прийшли не впорядковані)
  const sorted = [...events].sort(
    (a, b) => new Date(a.eventTs).getTime() - new Date(b.eventTs).getTime()
  );

  const mode = sorted[0]?.trackingMode ?? "daily";
  const date = sorted[0]?.eventTs.slice(0, 10) ?? "";

  // Підсумовуємо витрати — filter по типу, потім reduce для суми
  // filter повертає масив елементів де умова true
  // reduce(callback, початкове_значення) — по черзі проходить масив і накопичує значення
  const fuelLiters = sorted
    .filter(e => e.eventType === "refuel")
    .reduce((sum, e) => sum + (e.fuelLiters ?? 0), 0);

  const fuelCostUah = sorted
    .filter(e => e.eventType === "refuel")
    .reduce((sum, e) => sum + (e.fuelCostUah ?? 0), 0);

  const adBlueLiters = sorted
    .filter(e => e.eventType === "refuel")
    .reduce((sum, e) => sum + (e.adBlueLiters ?? 0), 0);

  const adBlueCostUah = sorted
    .filter(e => e.eventType === "refuel")
    .reduce((sum, e) => sum + (e.adBlueCostUah ?? 0), 0);

  const otherCostsUah = sorted
    .filter(e => e.eventType === "other_cost")
    .reduce((sum, e) => sum + (e.otherCostsUah ?? 0), 0);

  // Підрахунок подій по типу
  const deliveriesCount = sorted.filter(e => e.eventType === "delivery").length;
  const returnsCount = sorted.filter(e => e.eventType === "return_goods").length;
  const extraCargoCount = sorted.filter(e => e.eventType === "extra_cargo").length;

  // Всі накладні за день
  const waybillNumbers = sorted
    .filter(e => e.waybillNumber)
    .map(e => e.waybillNumber!);  // ! — non-null assertion (ми вже відфільтрували null)

  // Розрахунок пробігу
  const depotStart = sorted.find(e => e.eventType === "depot_start");
  const parkingEnd = sorted.find(e => e.eventType === "parking_end");

  let totalMileageKm = 0;
  let loadedMileageKm: number | null = null;
  let emptyMileageKm: number | null = null;

  if (mode === "daily") {
    // daily: одометр depot_start − одометр вчора
    if (depotStart?.odometerKm && prevDayLastOdometer) {
      totalMileageKm = depotStart.odometerKm - prevDayLastOdometer;
    }
  } else {
    // full: одометр parking_end − одометр depot_start
    if (parkingEnd?.odometerKm && depotStart?.odometerKm) {
      totalMileageKm = parkingEnd.odometerKm - depotStart.odometerKm;
    }

    // Порожній пробіг = від останнього delivery до parking_end
    const lastDelivery = [...sorted]
      .reverse()
      .find(e => e.eventType === "delivery");

    if (lastDelivery?.odometerKm && parkingEnd?.odometerKm) {
      emptyMileageKm = parkingEnd.odometerKm - lastDelivery.odometerKm;
      loadedMileageKm = totalMileageKm - emptyMileageKm;
    }
  }

  // Кількість палет
  let palletsCount: number | null = null;
  if (mode === "daily" && depotStart?.palletsCount) {
    palletsCount = depotStart.palletsCount;
  } else if (mode === "full") {
    const total = sorted
      .filter(e => e.eventType === "delivery" && e.palletsCount)
      .reduce((sum, e) => sum + (e.palletsCount ?? 0), 0);
    if (total > 0) palletsCount = total;
  }

  const segments = mode === "full" ? buildRouteSegments(sorted) : [];

  return {
    carId: sorted[0]?.carId ?? 0,
    driverId: sorted[0]?.driverId ?? 0,
    trackingMode: mode,
    date,
    totalMileageKm,
    loadedMileageKm,
    emptyMileageKm,
    palletsCount,
    fuelLiters,
    fuelCostUah,
    adBlueLiters,
    adBlueCostUah,
    otherCostsUah,
    deliveriesCount,
    returnsCount,
    extraCargoCount,
    waybillNumbers,
    segments,
  };
}

// Будує масив відрізків маршруту між послідовними подіями (тільки full)
export function buildRouteSegments(events: RouteEvent[]): RouteSegment[] {
  const segments: RouteSegment[] = [];
  // Беремо тільки події з одометром (виключаємо refuel без пробігу)
  const withOdometer = events.filter(e => e.odometerKm !== undefined);

  for (let i = 0; i < withOdometer.length - 1; i++) {
    const curr = withOdometer[i];
    const next = withOdometer[i + 1];

    const distanceKm = (next.odometerKm ?? 0) - (curr.odometerKm ?? 0);
    // Час у мілісекундах → хвилини
    const durationMin = Math.round(
      (new Date(next.eventTs).getTime() - new Date(curr.eventTs).getTime()) / 60000
    );

    segments.push({
      fromEvent: curr.eventType,
      toEvent: next.eventType,
      waybillNumber: next.waybillNumber,
      customerName: next.customerName,
      distanceKm: Math.max(0, distanceKm),  // захист від від'ємного
      durationMin: Math.max(0, durationMin),
    });
  }

  return segments;
}
```

---

## Крок 4.5 — Створення src/utils/calcTransportCost.ts

```typescript
// src/utils/calcTransportCost.ts
import type {
  MonthlyCosts,
  MonthlyCostsSummary,
  WaybillSummary,
  TransportCostPerWaybill,
  HiredTransportTrip,
} from "../types";

// Розраховує вартість ремонту:
// якщо логіст вніс фактичні витрати — беремо їх,
// інакше рахуємо: ставка × пробіг
export function calcRepairCost(costs: MonthlyCosts, totalKm: number): number {
  if (costs.repairActualUah !== undefined && costs.repairActualUah !== null) {
    return costs.repairActualUah;
  }
  return costs.repairRateUahKm * totalKm;
}

// Загальна сума місячних витрат по авто
export function calcTotalMonthlyCost(costs: MonthlyCosts, totalKm: number): number {
  return (
    costs.salaryUah +
    costs.taxesUah +
    costs.depreciationUah +
    calcRepairCost(costs, totalKm) +
    costs.otherCostsUah
  );
}

// Розподіляє місячні витрати по накладних
// Метод: пропорційно до суми продажу (більша накладна — більша частка витрат)
// Формула: витрати_i = загальні_витрати × (сума_i / Σ_всіх_сум)
export function allocateMonthlyCosts(
  waybills: WaybillSummary[],
  costs: MonthlyCostsSummary,
  carNumber: string,
): TransportCostPerWaybill[] {
  // Тільки відвантаження (quantity > 0), тільки власний автопарк
  const shipments = waybills.filter(w => w.totalUah > 0 && w.deliveryChannel === "own");

  // Загальна сума продажів через це авто за місяць
  const totalSales = shipments.reduce((sum, w) => sum + w.totalUah, 0);

  if (totalSales === 0) return [];

  return shipments.map(w => {
    const allocatedCostUah = costs.totalCostUah * (w.totalUah / totalSales);
    const costPctOfSale = (allocatedCostUah / w.totalUah) * 100;

    return {
      legalEntity: w.legalEntity,
      waybillNumber: w.waybillNumber,
      waybillDate: w.waybillDate,
      customerId: w.customerId,
      customerName: w.customerName,
      storeId: w.storeId,
      carId: w.carId ?? 0,
      carNumber,
      saleUah: w.totalUah,
      totalWeightKg: w.totalWeightKg,
      totalVolumeCbm: w.totalVolumeCbm,
      allocatedCostUah: Math.round(allocatedCostUah * 100) / 100,
      costPctOfSale: Math.round(costPctOfSale * 100) / 100,
    };
  });
}

// Розподіляє вартість рейсу найманого транспорту рівномірно по накладних
// (проста рівна частка — без ваги/об'єму)
export function allocateHiredTripCost(
  trip: HiredTransportTrip,
): { waybillNumber: string; costUah: number }[] {
  const waybills = trip.waybills ?? [];
  if (waybills.length === 0) return [];

  const costPerWaybill = trip.costUah / waybills.length;

  return waybills.map(w => ({
    waybillNumber: w.waybillNumber,
    costUah: Math.round(costPerWaybill * 100) / 100,
  }));
}
```

---

## Крок 4.6 — Створення src/utils/parseQR.ts

```typescript
// src/utils/parseQR.ts

export interface QRResult {
  waybillNumber: string;
  waybillDate: string;
}

// Парсить рядок QR-коду у об'єкт { waybillNumber, waybillDate }
// Підтримує два формати:
// 1. JSON: {"number":"НН-000101","date":"2026-06-27"}
// 2. Pipe:  НН-000101|2026-06-27
export function parseQRCode(raw: string): QRResult | null {
  if (!raw || raw.trim() === "") return null;

  // Спроба 1: JSON формат
  // try-catch ловить помилку якщо JSON.parse не вдається
  try {
    const parsed = JSON.parse(raw);
    if (parsed.number && parsed.date) {
      return {
        waybillNumber: parsed.number.trim(),
        waybillDate: parsed.date.trim(),
      };
    }
  } catch {
    // Не JSON — пробуємо pipe формат
  }

  // Спроба 2: pipe формат "НН-000101|2026-06-27"
  // split розбиває рядок по роздільнику і повертає масив
  const parts = raw.trim().split("|");
  if (parts.length === 2 && parts[0] && parts[1]) {
    return {
      waybillNumber: parts[0].trim(),
      waybillDate: parts[1].trim(),
    };
  }

  return null;  // Невідомий формат
}
```

---

## Крок 4.7 — Створення src/utils/clientFilter.ts

```typescript
// src/utils/clientFilter.ts
import type {
  WaybillSummary,
  WaybillFilters,
  SortParams,
  PaginationParams,
  PaginatedResponse,
} from "../types";

// Фільтрує масив накладних за критеріями
// Кожен критерій — додаткова умова (AND логіка)
export function filterWaybills(
  items: WaybillSummary[],
  filters: WaybillFilters,
): WaybillSummary[] {
  return items.filter(item => {
    // Пошук по тексту: клієнт або номер накладної
    // toLowerCase → порівнюємо без урахування регістру
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchCustomer = item.customerName.toLowerCase().includes(q);
      const matchNumber = item.waybillNumber.toLowerCase().includes(q);
      if (!matchCustomer && !matchNumber) return false;
    }

    // Фільтр по статусу
    if (filters.status && item.status !== filters.status) return false;

    // Фільтр по каналу доставки
    if (filters.deliveryChannel && filters.deliveryChannel !== "all") {
      if (filters.deliveryChannel === "unassigned") {
        if (item.deliveryChannel !== null && item.deliveryChannel !== undefined) return false;
      } else {
        if (item.deliveryChannel !== filters.deliveryChannel) return false;
      }
    }

    // Фільтр по юридичній особі
    if (filters.legalEntity && item.legalEntity !== filters.legalEntity) return false;

    // Фільтр відвантаження/повернення
    if (filters.lineType && filters.lineType !== "all") {
      if (filters.lineType === "shipment" && item.totalUah <= 0) return false;
      if (filters.lineType === "return" && item.returnsUah >= 0) return false;
    }

    // Фільтр по магазину
    if (filters.storeId && item.storeId !== filters.storeId) return false;

    // Фільтр по даті "від"
    if (filters.dateFrom && item.waybillDate < filters.dateFrom) return false;

    // Фільтр по даті "до"
    if (filters.dateTo && item.waybillDate > filters.dateTo) return false;

    return true;  // Всі умови виконані — залишаємо
  });
}

// Сортує масив за вказаним полем і напрямком
// Generics <T> — функція працює з будь-яким типом
export function sortItems<T>(items: T[], sort: SortParams): T[] {
  return [...items].sort((a, b) => {
    // Отримуємо значення поля за ключем
    // as any — обходимо TypeScript перевірку (спрощення)
    const aVal = (a as any)[sort.field] ?? "";
    const bVal = (b as any)[sort.field] ?? "";

    let result = 0;
    if (typeof aVal === "string") {
      // localeCompare — порівняння рядків з урахуванням мови
      result = aVal.localeCompare(bVal, "uk");
    } else {
      result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    }

    // asc = за зростанням, desc = за спаданням
    return sort.direction === "asc" ? result : -result;
  });
}

// Розбиває масив на сторінки і повертає поточну сторінку
export function paginate<T>(
  items: T[],
  { page, pageSize }: PaginationParams,
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.ceil(total / pageSize);
  // slice(start, end) — вирізає частину масиву
  // (page-1)*pageSize = індекс першого елементу сторінки
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return { items: pageItems, total, page, pageSize, totalPages };
}
```

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 5 — API ШАР
# ═══════════════════════════════════════════════════════════

## Крок 5.1 — Що таке async/await і Promises

```typescript
// Promise — це об'єкт який представляє майбутнє значення
// (результат fetch, читання файлу тощо)

// БЕЗ async/await — колбек-пекло:
fetch("/api/cars")
  .then(response => response.json())
  .then(data => { console.log(data); })
  .catch(err => { console.error(err); });

// З async/await — читабельно як синхронний код:
async function getCars() {
  try {
    const response = await fetch("/api/cars");  // чекаємо відповіді
    const data = await response.json();          // чекаємо парсингу
    return data;
  } catch (err) {
    console.error(err);
    throw err;  // пробрасуємо помилку далі
  }
}

// await можна використовувати тільки всередині async функції
```

---

## Крок 5.2 — Створення src/api/config.ts

```typescript
// src/api/config.ts

// import.meta.env — спосіб читати .env змінні у Vite
// ?? — nullish coalescing: якщо ліва частина null/undefined → бери праву
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const API_BASE = import.meta.env.VITE_API_BASE ?? "/api";

// Допоміжна функція: імітує мережеву затримку у mock режимі
// Без неї компоненти не встигають показати loading стан
export function mockDelay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## Крок 5.3 — Створення src/api/cars.ts

```typescript
// src/api/cars.ts
import type { Car } from "../types";
import { USE_MOCK, API_BASE, mockDelay } from "./config";
import mockCars from "../mocks/cars.json";

// Отримати список всіх авто
export async function fetchCars(): Promise<Car[]> {
  if (USE_MOCK) {
    await mockDelay();
    // as Car[] — явне приведення типу (TypeScript довіряємо що JSON відповідає типу)
    return mockCars as Car[];
  }
  const res = await fetch(`${API_BASE}/cars/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

// Отримати одне авто по id
export async function fetchCar(id: number): Promise<Car> {
  if (USE_MOCK) {
    await mockDelay();
    const car = (mockCars as Car[]).find(c => c.idCar === id);
    if (!car) throw new Error(`Авто #${id} не знайдено`);
    return car;
  }
  const res = await fetch(`${API_BASE}/cars/${id}/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

---

## Крок 5.4 — Створення src/api/drivers.ts

```typescript
// src/api/drivers.ts
import type { Driver } from "../types";
import { USE_MOCK, API_BASE, mockDelay } from "./config";
import mockDrivers from "../mocks/drivers.json";

export async function fetchDrivers(): Promise<Driver[]> {
  if (USE_MOCK) {
    await mockDelay();
    return mockDrivers as Driver[];
  }
  const res = await fetch(`${API_BASE}/drivers/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Поточний водій — у реальному застосунку визначається по JWT токену
// В mock режимі — завжди перший активний водій
export async function fetchCurrentDriver(): Promise<Driver> {
  if (USE_MOCK) {
    await mockDelay(100);
    const driver = (mockDrivers as Driver[]).find(d => d.isActive);
    if (!driver) throw new Error("Водія не знайдено");
    return driver;
  }
  const res = await fetch(`${API_BASE}/drivers/me/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

---

## Крок 5.5 — Створення src/api/waybills.ts

```typescript
// src/api/waybills.ts
import type {
  WaybillRecord,
  WaybillSummary,
  WaybillFilters,
  SortParams,
  PaginationParams,
  PaginatedResponse,
  DeliveryChannel,
} from "../types";
import { USE_MOCK, API_BASE, mockDelay } from "./config";
import mockWaybills from "../mocks/waybills.json";
import { filterWaybills, sortItems, paginate } from "../utils/clientFilter";

// Агрегує рядки накладних у WaybillSummary (один рядок UI на накладну)
function aggregateToSummaries(records: WaybillRecord[]): WaybillSummary[] {
  // Групуємо по waybillNumber за допомогою Map
  // Map — структура даних "ключ → значення" (як dict у Python)
  const grouped = new Map<string, WaybillRecord[]>();

  records.forEach(r => {
    const key = r.waybillNumber;
    // has(key) — перевіряємо чи є ключ
    // get(key) — отримуємо значення
    // set(key, value) — встановлюємо значення
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(r);
  });

  const summaries: WaybillSummary[] = [];

  // Ітерація по Map: [key, values] — деструктуризація
  grouped.forEach((lines, waybillNumber) => {
    const first = lines[0];

    const totalUah = lines
      .filter(l => l.quantity > 0)
      .reduce((sum, l) => sum + l.totalUah, 0);

    const returnsUah = lines
      .filter(l => l.quantity < 0)
      .reduce((sum, l) => sum + l.totalUah, 0);

    summaries.push({
      legalEntity: first.legalEntity,
      waybillNumber,
      waybillDate: first.waybillDate,
      customerId: first.customerId,
      customerName: first.customerName,
      storeId: first.storeId,
      linesCount: lines.length,
      totalUah,
      returnsUah,
      totalWeightKg: lines.reduce((s, l) => s + (l.totalWeightKg ?? 0), 0) || undefined,
      totalVolumeCbm: lines.reduce((s, l) => s + (l.totalVolumeCbm ?? 0), 0) || undefined,
      deliveryChannel: first.deliveryChannel,
      status: (first as any).status ?? "pending",
    });
  });

  return summaries;
}

// Отримати список накладних з фільтрами, сортуванням і пагінацією
export async function fetchWaybills(
  filters: WaybillFilters,
  sort: SortParams,
  pagination: PaginationParams,
): Promise<PaginatedResponse<WaybillSummary>> {
  if (USE_MOCK) {
    await mockDelay(400);
    const records = mockWaybills as WaybillRecord[];
    const summaries = aggregateToSummaries(records);
    // Застосовуємо фільтр → сортування → пагінацію по черзі
    const filtered = filterWaybills(summaries, filters);
    const sorted = sortItems(filtered, sort);
    return paginate(sorted, pagination);
  }

  // Для реального API передаємо параметри через URL query string
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.status) params.set("status", filters.status);
  if (filters.deliveryChannel) params.set("channel", filters.deliveryChannel);
  if (filters.legalEntity) params.set("legal_entity", filters.legalEntity);
  params.set("sort_field", sort.field);
  params.set("sort_dir", sort.direction);
  params.set("page", String(pagination.page));
  params.set("page_size", String(pagination.pageSize));

  const res = await fetch(`${API_BASE}/waybills/?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Деталі накладної — всі рядки
export async function fetchWaybillDetail(number: string): Promise<WaybillRecord[]> {
  if (USE_MOCK) {
    await mockDelay();
    return (mockWaybills as WaybillRecord[]).filter(w => w.waybillNumber === number);
  }
  const res = await fetch(`${API_BASE}/waybills/${number}/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Перевірка чи накладна вже призначена до каналу
// Використовується перед кожним скануванням (channel guard)
export async function checkWaybillChannel(
  number: string,
): Promise<{ waybillNumber: string; deliveryChannel: DeliveryChannel | null }> {
  if (USE_MOCK) {
    await mockDelay(100);
    const record = (mockWaybills as WaybillRecord[]).find(
      w => w.waybillNumber === number
    );
    return {
      waybillNumber: number,
      deliveryChannel: record?.deliveryChannel ?? null,
    };
  }
  const res = await fetch(`${API_BASE}/waybills/${number}/channel/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Не призначені накладні (для сторінки UnassignedWaybills)
export async function fetchUnassignedWaybills(): Promise<WaybillSummary[]> {
  if (USE_MOCK) {
    await mockDelay();
    const records = mockWaybills as WaybillRecord[];
    const summaries = aggregateToSummaries(records);
    return summaries.filter(w => !w.deliveryChannel);
  }
  const res = await fetch(`${API_BASE}/waybills/unassigned/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

---

## Крок 5.6 — Створення src/api/routeEvents.ts

```typescript
// src/api/routeEvents.ts
import type { RouteEvent, RouteEventCreate } from "../types";
import { USE_MOCK, API_BASE, mockDelay } from "./config";
import mockEvents from "../mocks/route-events.json";

// Поточні події водія за сьогодні
export async function fetchTodayEvents(carId: number): Promise<RouteEvent[]> {
  if (USE_MOCK) {
    await mockDelay(200);
    const today = new Date().toISOString().slice(0, 10);  // "2026-06-29"
    return (mockEvents as RouteEvent[]).filter(
      e => e.carId === carId && e.eventTs.startsWith(today)
    );
  }
  const res = await fetch(`${API_BASE}/route-events/?car_id=${carId}&date=today`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

// Останній одометр авто (для розрахунку пробігу daily режиму)
export async function fetchLastOdometer(carId: number): Promise<number | null> {
  if (USE_MOCK) {
    await mockDelay(100);
    const events = (mockEvents as RouteEvent[])
      .filter(e => e.carId === carId && e.odometerKm !== undefined)
      .sort((a, b) => b.eventTs.localeCompare(a.eventTs));  // спадання по часу
    return events[0]?.odometerKm ?? null;
  }
  const res = await fetch(`${API_BASE}/route-events/${carId}/last-odometer/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.odometerKm;
}

// Створення нової події (POST запит)
export async function createRouteEvent(data: RouteEventCreate): Promise<RouteEvent> {
  if (USE_MOCK) {
    await mockDelay(500);
    // В mock режимі просто повертаємо об'єкт з фіктивним id
    const newEvent: RouteEvent = {
      ...data,
      id: Date.now(),  // Date.now() — кількість мс від 1970-01-01, завжди унікальний
      createdAt: new Date().toISOString(),
    };
    return newEvent;
  }
  // POST запит: method, headers, body (серіалізований JSON)
  const res = await fetch(`${API_BASE}/route-events/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
```

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 6 — REACT QUERY HOOKS
# ═══════════════════════════════════════════════════════════

## Крок 6.1 — Що таке React Query і навіщо він

Без React Query ти б писав так у кожному компоненті:

```typescript
const [data, setData] = useState(null);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  setIsLoading(true);
  fetchCars()
    .then(d => setData(d))
    .catch(e => setError(e))
    .finally(() => setIsLoading(false));
}, []);
```

З React Query — одна стрічка:

```typescript
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ["cars"],
  queryFn: fetchCars,
});
```

React Query також:
- Кешує результати (повторний запит? → миттєво з кешу)
- Автоматично оновлює при поверненні у вкладку браузера
- Інвалідує кеш після мутацій (додав подію → список оновився)

---

## Крок 6.2 — Налаштування main.tsx

Відкрий `src/main.tsx`, ВИДАЛИ вміст і напиши:

```typescript
// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// QueryClient — центральний об'єкт React Query
// Зберігає кеш і конфігурацію
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,     // дані "свіжі" 1 хвилину (не рефетчимо зайво)
      retry: 2,                  // при помилці — повторити 2 рази
      throwOnError: false,       // помилки обробляємо через isError у компоненті
    },
  },
});

// document.getElementById("root") — знаходить <div id="root"> в index.html
// createRoot → render → підключає React до DOM
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {/* QueryClientProvider — передає queryClient у всі дочірні компоненти */}
    <QueryClientProvider client={queryClient}>
      {/* BrowserRouter — дає компонентам доступ до React Router */}
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* DevTools — панель налагодження React Query (тільки в dev режимі) */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
```

---

## Крок 6.3 — Створення hooks/useCars.ts

```typescript
// src/hooks/useCars.ts
import { useQuery } from "@tanstack/react-query";
import { fetchCars, fetchCar } from "../api/cars";

// useQuery приймає об'єкт з двома обов'язковими полями:
// queryKey — унікальний ключ для кешу (масив)
// queryFn  — async функція що повертає дані

export function useCars() {
  return useQuery({
    queryKey: ["cars"],       // кеш-ключ: ["cars"]
    queryFn: fetchCars,
  });
}

export function useCar(id: number) {
  return useQuery({
    queryKey: ["cars", id],   // кеш-ключ: ["cars", 1] — унікальний per-id
    queryFn: () => fetchCar(id),
    enabled: !!id,            // !! перетворює у boolean; не запускаємо якщо id = 0
  });
}
```

---

## Крок 6.4 — Створення hooks/useRouteEvents.ts

```typescript
// src/hooks/useRouteEvents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTodayEvents,
  fetchLastOdometer,
  createRouteEvent,
} from "../api/routeEvents";
import type { RouteEventCreate } from "../types";

export function useTodayEvents(carId: number) {
  return useQuery({
    queryKey: ["route-events", carId, "today"],
    queryFn: () => fetchTodayEvents(carId),
    enabled: !!carId,
    refetchInterval: 60_000,  // автооновлення кожну хвилину
  });
}

export function useLastOdometer(carId: number) {
  return useQuery({
    queryKey: ["last-odometer", carId],
    queryFn: () => fetchLastOdometer(carId),
    enabled: !!carId,
  });
}

// useMutation — для POST/PUT/DELETE запитів (змінюють дані)
export function useCreateRouteEvent() {
  // useQueryClient дає доступ до QueryClient для інвалідації кешу
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RouteEventCreate) => createRouteEvent(data),
    // onSuccess викликається після успішного запиту
    onSuccess: (newEvent) => {
      // invalidateQueries — позначає кеш як застарілий → автоматичний рефетч
      queryClient.invalidateQueries({
        queryKey: ["route-events", newEvent.carId],
      });
      queryClient.invalidateQueries({
        queryKey: ["last-odometer", newEvent.carId],
      });
    },
  });
}
```

---

## Крок 6.5 — Створення hooks/useWaybills.ts

```typescript
// src/hooks/useWaybills.ts
import { useQuery } from "@tanstack/react-query";
import { keepPreviousData } from "@tanstack/react-query";
import {
  fetchWaybills,
  fetchWaybillDetail,
  checkWaybillChannel,
  fetchUnassignedWaybills,
} from "../api/waybills";
import type { WaybillFilters, SortParams, PaginationParams } from "../types";

export function useWaybills(
  filters: WaybillFilters,
  sort: SortParams,
  pagination: PaginationParams,
) {
  return useQuery({
    // queryKey включає всі параметри — при їх зміні → новий запит
    queryKey: ["waybills", filters, sort, pagination],
    queryFn: () => fetchWaybills(filters, sort, pagination),
    // keepPreviousData — при зміні сторінки показує старі дані поки грузяться нові
    // (без мигання порожнього стану)
    placeholderData: keepPreviousData,
  });
}

export function useWaybillDetail(waybillNumber: string) {
  return useQuery({
    queryKey: ["waybill-detail", waybillNumber],
    queryFn: () => fetchWaybillDetail(waybillNumber),
    enabled: !!waybillNumber,
  });
}

export function useCheckWaybillChannel(waybillNumber: string) {
  return useQuery({
    queryKey: ["waybill-channel", waybillNumber],
    queryFn: () => checkWaybillChannel(waybillNumber),
    enabled: !!waybillNumber,
  });
}

export function useUnassignedWaybills() {
  return useQuery({
    queryKey: ["waybills-unassigned"],
    queryFn: fetchUnassignedWaybills,
  });
}
```

---

## Крок 6.6 — Створення hooks/useDayMode.ts

```typescript
// src/hooks/useDayMode.ts
import { useState, useEffect } from "react";
import type { TrackingMode } from "../types";

// Зберігає вибір режиму водія у localStorage
// localStorage — сховище браузера яке зберігається між сесіями
// (як cookies але для JS)
export function useDayMode(carDefaultMode: TrackingMode) {
  const today = new Date().toISOString().slice(0, 10);
  // Ключ включає дату — щодня режим скидається до дефолту
  const storageKey = `dayMode:${today}`;

  // Початкове значення: з localStorage або дефолт від авто
  const [dayMode, setDayModeState] = useState<TrackingMode>(() => {
    const stored = localStorage.getItem(storageKey);
    // Перевіряємо чи збережене значення є валідним TrackingMode
    if (stored === "daily" || stored === "full") return stored;
    return carDefaultMode;
  });

  // При зміні режиму — зберігаємо у localStorage
  const setDayMode = (mode: TrackingMode) => {
    localStorage.setItem(storageKey, mode);
    setDayModeState(mode);
  };

  // isOverridden = true якщо водій вибрав інший режим ніж дефолт
  const isOverridden = dayMode !== carDefaultMode;

  // useEffect — виконується після рендеру
  // Якщо carDefaultMode змінився (напр. логіст поміняв) і не було override — оновлюємо
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setDayModeState(carDefaultMode);
    }
  }, [carDefaultMode, storageKey]);

  return { dayMode, setDayMode, isOverridden };
}
```

---

## Крок 6.7 — Створення hooks/useWaybillFilters.ts

```typescript
// src/hooks/useWaybillFilters.ts
import { useSearchParams } from "react-router-dom";
import type { WaybillFilters, SortParams, SortField, SortDirection, WaybillStatus, LegalEntity, DeliveryChannel } from "../types";

// Зберігає фільтри у URL query string
// Переваги: фільтри не зникають при оновленні сторінки,
// можна поділитись посиланням з конкретним фільтром

export function useWaybillFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Зчитуємо фільтри з URL
  const filters: WaybillFilters = {
    search: searchParams.get("search") ?? undefined,
    status: (searchParams.get("status") as WaybillStatus) ?? undefined,
    deliveryChannel:
      (searchParams.get("channel") as DeliveryChannel | "unassigned" | "all") ?? undefined,
    legalEntity: (searchParams.get("legal") as LegalEntity) ?? undefined,
    lineType:
      (searchParams.get("line") as "shipment" | "return" | "all") ?? undefined,
    storeId: searchParams.get("store") ?? undefined,
    dateFrom: searchParams.get("from") ?? undefined,
    dateTo: searchParams.get("to") ?? undefined,
  };

  const sort: SortParams = {
    field: (searchParams.get("sortBy") as SortField) ?? "date",
    direction: (searchParams.get("sortDir") as SortDirection) ?? "desc",
  };

  const page = Number(searchParams.get("page") ?? "1");

  // Оновлення одного фільтру
  const setFilter = (key: string, value: string | undefined) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value) {
        next.set(key, value);
      } else {
        next.delete(key);
      }
      next.set("page", "1");  // при зміні фільтру — скидаємо на першу сторінку
      return next;
    });
  };

  const setSort = (field: SortField) => {
    const currentDir = sort.field === field ? sort.direction : "asc";
    const newDir: SortDirection = currentDir === "asc" ? "desc" : "asc";
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("sortBy", field);
      next.set("sortDir", newDir);
      return next;
    });
  };

  const setPage = (p: number) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set("page", String(p));
      return next;
    });
  };

  return { filters, sort, page, setFilter, setSort, setPage };
}
```

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 7 — UI КОМПОНЕНТИ (АТОМАРНІ)
# ═══════════════════════════════════════════════════════════

## Крок 7.1 — Що таке JSX і props

```typescript
// JSX — це HTML-подібний синтаксис у JS/TS
// Браузер його не розуміє — Vite перетворює у звичайний JS

// Props — аргументи компонента (як параметри функції)
// Компонент — це функція яка приймає props і повертає JSX

interface ButtonProps {
  children: React.ReactNode;  // вміст між тегами <Button>...</Button>
  onClick?: () => void;       // обробник кліку (опційний)
  variant?: "primary" | "secondary";
}

// Деструктуризація props — замість props.children, props.onClick...
function Button({ children, onClick, variant = "primary" }: ButtonProps) {
  return (
    <button onClick={onClick} className={variant === "primary" ? "bg-blue-600" : "bg-gray-200"}>
      {children}
    </button>
  );
}

// Використання:
// <Button onClick={() => alert("Привіт!")}>Натисни</Button>
```

---

## Крок 7.2 — Створення components/ui/Spinner.tsx

```typescript
// src/components/ui/Spinner.tsx

// Record<string, string> — тип для словника рядків
const sizeClasses: Record<string, string> = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

// SVG анімований спіннер
// animate-spin — Tailwind клас для анімації обертання
export function Spinner({ size = "md", label = "Завантаження..." }: SpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg
        className={`animate-spin text-blue-600 ${sizeClasses[size]}`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-label={label}
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      {label && <span className="text-sm text-gray-500">{label}</span>}
    </div>
  );
}
```

---

## Крок 7.3 — Створення components/ui/EmptyState.tsx

```typescript
// src/components/ui/EmptyState.tsx

interface EmptyStateProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;  // опційна кнопка
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Іконка — великий символ */}
      <div className="text-5xl mb-4">📭</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-sm text-gray-500 max-w-sm">{subtitle}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
```

---

## Крок 7.4 — Створення components/ui/ErrorBanner.tsx

```typescript
// src/components/ui/ErrorBanner.tsx

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorBanner({
  message = "Сталася помилка. Спробуйте ще раз.",
  onRetry,
}: ErrorBannerProps) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
      <span className="text-red-500 text-xl">⚠️</span>
      <div className="flex-1">
        <p className="text-sm text-red-700">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-sm text-red-600 underline hover:text-red-800"
          >
            Повторити
          </button>
        )}
      </div>
    </div>
  );
}
```

---

## Крок 7.5 — Створення components/ui/Button.tsx

```typescript
// src/components/ui/Button.tsx

// Record<Variant, string> — Tailwind класи для кожного варіанту кнопки
const variantClasses = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
  secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200 active:bg-gray-300",
  ghost: "text-gray-600 hover:bg-gray-100 active:bg-gray-200",
  danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizeClasses = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  isLoading?: boolean;
  children: React.ReactNode;
}

// React.ButtonHTMLAttributes<HTMLButtonElement> — включаємо всі стандартні
// атрибути кнопки (onClick, disabled, type тощо)
// ...rest — spread operator: передаємо решту props у <button>
export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
      {...rest}
    >
      {isLoading && (
        // Маленький спіннер всередині кнопки
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
```

---

## Крок 7.6 — Створення components/ui/Badge.tsx

```typescript
// src/components/ui/Badge.tsx
import type { WaybillStatus, DeliveryChannel, LegalEntity, CarStatus } from "../../types";

// Статус накладної
const statusConfig: Record<WaybillStatus, { label: string; class: string }> = {
  pending:   { label: "Очікує",      class: "bg-yellow-100 text-yellow-800" },
  scanned:   { label: "Відскановано", class: "bg-blue-100 text-blue-800"   },
  delivered: { label: "Доставлено",  class: "bg-green-100 text-green-800"  },
  cancelled: { label: "Скасовано",   class: "bg-gray-100 text-gray-600"    },
};

export function StatusBadge({ status }: { status: WaybillStatus }) {
  const { label, class: cls } = statusConfig[status];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// Канал доставки
const channelConfig: Record<DeliveryChannel | "unassigned", { label: string; class: string }> = {
  own:       { label: "Власне авто",        class: "bg-slate-100 text-slate-700"   },
  hired:     { label: "Найманий транспорт", class: "bg-amber-100 text-amber-800"   },
  carrier:   { label: "Служба доставки",   class: "bg-purple-100 text-purple-800" },
  unassigned:{ label: "⚠️ Не призначено",   class: "bg-orange-100 text-orange-800" },
};

export function ChannelBadge({ channel }: { channel: DeliveryChannel | null | undefined }) {
  const key = channel ?? "unassigned";
  const { label, class: cls } = channelConfig[key as keyof typeof channelConfig];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}

// Юридична особа
const legalConfig: Record<LegalEntity, string> = {
  ESP:   "bg-blue-100 text-blue-800",
  OPT:   "bg-green-100 text-green-800",
  Rubin: "bg-red-100 text-red-800",
};

export function LegalEntityBadge({ entity }: { entity: LegalEntity }) {
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${legalConfig[entity]}`}>
      {entity}
    </span>
  );
}

// Статус авто
const carStatusConfig: Record<CarStatus, { label: string; class: string }> = {
  active:   { label: "Активне",   class: "bg-green-100 text-green-800"  },
  repair:   { label: "Ремонт",    class: "bg-yellow-100 text-yellow-800" },
  inactive: { label: "Неактивне", class: "bg-gray-100 text-gray-600"    },
};

export function CarStatusBadge({ status }: { status: CarStatus }) {
  const { label, class: cls } = carStatusConfig[status];
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  );
}
```

---

## Крок 7.7 — Створення components/ui/Pagination.tsx

```typescript
// src/components/ui/Pagination.tsx

interface PaginationProps {
  total: number;
  page: number;
  pageSize: number;
  onChange: (page: number) => void;
}

export function Pagination({ total, page, pageSize, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / pageSize);

  // Не показуємо якщо сторінка одна
  if (totalPages <= 1) return null;

  // Генеруємо масив номерів сторінок
  // Array.from({ length: n }, (_, i) => i + 1) → [1, 2, 3, ..., n]
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between py-3">
      {/* Інформація: "1-10 з 47" */}
      <span className="text-sm text-gray-500">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} з {total}
      </span>

      {/* Кнопки навігації */}
      <div className="flex gap-1">
        <button
          onClick={() => onChange(page - 1)}
          disabled={page === 1}
          className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
        >
          ‹
        </button>

        {pages.map(p => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`px-3 py-1 rounded text-sm ${
              p === page
                ? "bg-blue-600 text-white"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            {p}
          </button>
        ))}

        <button
          onClick={() => onChange(page + 1)}
          disabled={page === totalPages}
          className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
        >
          ›
        </button>
      </div>
    </div>
  );
}
```

---

## Крок 7.8 — Створення components/ui/Input.tsx

```typescript
// src/components/ui/Input.tsx

// InputHTMLAttributes<HTMLInputElement> — типи всіх стандартних атрибутів input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, id, className = "", ...rest }: InputProps) {
  // Генеруємо унікальний id якщо не передано
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
          ${className}
        `.trim()}
        {...rest}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
    </div>
  );
}
```

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 8 — LAYOUTS (ШАБЛОНИ СТОРІНОК)
# ═══════════════════════════════════════════════════════════

## Крок 8.1 — Що таке Layout і Outlet

```typescript
// Layout — компонент-обгортка що задає загальну структуру сторінки
// Outlet — місце куди React Router вставляє дочірню сторінку

// Структура:
// <DriverLayout>           ← Header + BottomNav
//   <Outlet />             ← сюди вставляється DriverDashboard або EventForm
// </DriverLayout>
```

---

## Крок 8.2 — Створення components/layouts/DriverLayout.tsx

```typescript
// src/components/layouts/DriverLayout.tsx
import { Outlet, NavLink, useLocation } from "react-router-dom";

// NavLink — як Link але додає клас "active" коли URL збігається
// useLocation — хук що повертає поточний URL

export function DriverLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white px-4 py-3 flex items-center justify-between">
        <h1 className="font-semibold text-lg">🚛 Vehicle Tracker</h1>
        <span className="text-sm opacity-80">
          {new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "long" })}
        </span>
      </header>

      {/* Основний контент */}
      {/* max-w-md — максимальна ширина для мобільного вигляду */}
      {/* mx-auto — центрування на великих екранах */}
      {/* pb-20 — відступ знизу щоб контент не перекривався bottom nav */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom">
        <div className="max-w-md mx-auto flex">
          {[
            { to: "/driver", label: "Маршрут", icon: "🗺️", exact: true },
            { to: "/driver/scan", label: "Сканер", icon: "📷", exact: false },
            { to: "/driver/history", label: "Історія", icon: "📋", exact: false },
          ].map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}  // end=true → активний тільки при точному збігу URL
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs
                ${isActive ? "text-blue-600 font-medium" : "text-gray-500"}`
              }
            >
              <span className="text-xl">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
```

---

## Крок 8.3 — Створення components/layouts/MainLayout.tsx

```typescript
// src/components/layouts/MainLayout.tsx
import { Outlet, NavLink } from "react-router-dom";

const navItems = [
  { to: "/fleet",     label: "Автопарк",      icon: "🚛" },
  { to: "/waybills",  label: "Накладні",       icon: "📄" },
  { to: "/hired",     label: "Найманий",       icon: "🔄" },
  { to: "/carriers",  label: "Служби",         icon: "📮" },
  { to: "/analytics", label: "Аналітика",      icon: "📊" },
  { to: "/admin",     label: "Адміністрування", icon: "⚙️" },
];

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar — тільки на великих екранах (hidden на мобільному) */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="font-bold text-gray-800">Vehicle Tracker</h1>
          <p className="text-xs text-gray-500 mt-0.5">Облік витрат</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Основний контент */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
```

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 9 — App.tsx ТА МАРШРУТИЗАЦІЯ
# ═══════════════════════════════════════════════════════════

## Крок 9.1 — Що таке React Router

React Router — бібліотека навігації для SPA (Single Page Application).
Замість перезавантаження сторінки — React замінює компонент.

```typescript
// <Route path="/waybills" element={<WaybillList />} />
// При переході на /waybills → рендериться WaybillList
// Без перезавантаження сторінки!
```

---

## Крок 9.2 — Тимчасові заглушки для сторінок

Перед написанням App.tsx нам потрібні хоча б порожні компоненти.
Створи файл `src/pages/PlaceholderPage.tsx`:

```typescript
// src/pages/PlaceholderPage.tsx
// Тимчасова заглушка — замінимо на реальні сторінки пізніше

interface PlaceholderProps {
  title: string;
}

export function PlaceholderPage({ title }: PlaceholderProps) {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      <p className="mt-2 text-gray-500">Сторінка в розробці...</p>
    </div>
  );
}
```

---

## Крок 9.3 — Написання src/App.tsx

ВИДАЛИ вміст `src/App.tsx` і напиши:

```typescript
// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { DriverLayout } from "./components/layouts/DriverLayout";
import { MainLayout } from "./components/layouts/MainLayout";
import { PlaceholderPage } from "./pages/PlaceholderPage";

// Далі будемо замінювати PlaceholderPage на реальні компоненти

export default function App() {
  return (
    <Routes>
      {/* ── Водій (мобільний) ────────────────────────── */}
      <Route path="/driver" element={<DriverLayout />}>
        <Route index element={<PlaceholderPage title="Маршрут водія" />} />
        <Route path="event/new" element={<PlaceholderPage title="Нова подія" />} />
        <Route path="scan" element={<PlaceholderPage title="Сканер QR" />} />
        <Route path="history" element={<PlaceholderPage title="Історія" />} />
      </Route>

      {/* ── Автопарк ─────────────────────────────────── */}
      <Route path="/fleet" element={<MainLayout />}>
        <Route index element={<PlaceholderPage title="Автопарк" />} />
        <Route path=":carId" element={<PlaceholderPage title="Деталі авто" />} />
      </Route>

      {/* ── Накладні ─────────────────────────────────── */}
      <Route path="/waybills" element={<MainLayout />}>
        <Route index element={<PlaceholderPage title="Реєстр накладних" />} />
        <Route path=":waybillNumber" element={<PlaceholderPage title="Деталі накладної" />} />
        <Route path="import" element={<PlaceholderPage title="Імпорт із 1С" />} />
        <Route path="unassigned" element={<PlaceholderPage title="Не призначені" />} />
        <Route path="returns" element={<PlaceholderPage title="Матчинг повернень" />} />
      </Route>

      {/* ── Найманий транспорт ───────────────────────── */}
      <Route path="/hired" element={<MainLayout />}>
        <Route index element={<PlaceholderPage title="Найманий транспорт" />} />
        <Route path="new" element={<PlaceholderPage title="Новий рейс" />} />
        <Route path=":tripId" element={<PlaceholderPage title="Деталі рейсу" />} />
      </Route>

      {/* ── Служби доставки ──────────────────────────── */}
      <Route path="/carriers" element={<MainLayout />}>
        <Route index element={<PlaceholderPage title="Служби доставки" />} />
        <Route path="new" element={<PlaceholderPage title="Нове відправлення" />} />
        <Route path="import-costs" element={<PlaceholderPage title="Імпорт реєстру витрат" />} />
      </Route>

      {/* ── Аналітика ────────────────────────────────── */}
      <Route path="/analytics" element={<MainLayout />}>
        <Route index element={<PlaceholderPage title="Аналітика" />} />
        <Route path="transport-costs" element={<PlaceholderPage title="Транспортна собівартість" />} />
        <Route path="customers" element={<PlaceholderPage title="По клієнтах" />} />
        <Route path="channels" element={<PlaceholderPage title="Порівняння каналів" />} />
      </Route>

      {/* ── Адміністрування ──────────────────────────── */}
      <Route path="/admin" element={<MainLayout />}>
        <Route index element={<PlaceholderPage title="Адміністрування" />} />
        <Route path="cars" element={<PlaceholderPage title="Авто" />} />
        <Route path="drivers" element={<PlaceholderPage title="Водії" />} />
        <Route path="products" element={<PlaceholderPage title="Товари" />} />
        <Route path="customers" element={<PlaceholderPage title="Клієнти" />} />
        <Route path="stores" element={<PlaceholderPage title="Магазини" />} />
        <Route path="monthly-costs" element={<PlaceholderPage title="Місячні витрати" />} />
      </Route>

      {/* Редирект з / на /driver */}
      <Route path="/" element={<Navigate to="/driver" replace />} />

      {/* 404 */}
      <Route path="*" element={
        <div className="p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-400">404</h2>
          <p className="text-gray-500 mt-2">Сторінку не знайдено</p>
        </div>
      } />
    </Routes>
  );
}
```

---

## Крок 9.4 — Запуск і перевірка структури

```
npm run dev
```

Перевір у браузері:
- http://localhost:5173 → редирект на /driver
- http://localhost:5173/fleet → Автопарк (заглушка)
- http://localhost:5173/waybills → Реєстр накладних (заглушка)

Якщо все відкривається — базова структура готова ✅

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 10 — ПЕРША РЕАЛЬНА СТОРІНКА: WaybillList
# ═══════════════════════════════════════════════════════════

## Крок 10.1 — Чому починаємо з WaybillList

Це ключова сторінка для оцінки проєкту. Містить:
- Фільтри (search, status, channel, legalEntity)
- Сортування по колонках
- Пагінацію
- Всі три UI-стани: loading / empty / error

---

## Крок 10.2 — Компонент SortHeader

```typescript
// src/components/ui/SortHeader.tsx

interface SortHeaderProps {
  label: string;
  field: string;
  currentField: string;
  direction: "asc" | "desc";
  onSort: (field: string) => void;
}

export function SortHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
}: SortHeaderProps) {
  const isActive = field === currentField;

  return (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {/* Іконка сортування */}
        <span className={`text-xs ${isActive ? "text-blue-600" : "text-gray-300"}`}>
          {isActive ? (direction === "asc" ? "▲" : "▼") : "⇅"}
        </span>
      </div>
    </th>
  );
}
```

---

## Крок 10.3 — Компонент WaybillFiltersBar

```typescript
// src/components/waybills/WaybillFiltersBar.tsx
import type { WaybillFilters, LegalEntity, DeliveryChannel, WaybillStatus } from "../../types";

interface WaybillFiltersBarProps {
  filters: WaybillFilters;
  onChange: (key: string, value: string | undefined) => void;
}

export function WaybillFiltersBar({ filters, onChange }: WaybillFiltersBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
      {/* Пошук */}
      <input
        type="search"
        placeholder="Пошук по клієнту або номеру накладної..."
        value={filters.search ?? ""}
        onChange={e => onChange("search", e.target.value || undefined)}
        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Рядок фільтрів */}
      <div className="flex flex-wrap gap-2">
        {/* Статус */}
        <select
          value={filters.status ?? ""}
          onChange={e => onChange("status", e.target.value || undefined)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Всі статуси</option>
          <option value="pending">Очікує</option>
          <option value="scanned">Відскановано</option>
          <option value="delivered">Доставлено</option>
          <option value="cancelled">Скасовано</option>
        </select>

        {/* Канал доставки */}
        <select
          value={filters.deliveryChannel ?? ""}
          onChange={e => onChange("channel", e.target.value || undefined)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Всі канали</option>
          <option value="own">Власне авто</option>
          <option value="hired">Найманий транспорт</option>
          <option value="carrier">Служба доставки</option>
          <option value="unassigned">⚠️ Не призначено</option>
        </select>

        {/* Юридична особа */}
        <select
          value={filters.legalEntity ?? ""}
          onChange={e => onChange("legal", e.target.value || undefined)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Всі ЮО</option>
          <option value="ESP">ESP</option>
          <option value="OPT">OPT</option>
          <option value="Rubin">Rubin</option>
        </select>

        {/* Тип рядка */}
        <select
          value={filters.lineType ?? ""}
          onChange={e => onChange("line", e.target.value || undefined)}
          className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Відвантаження і повернення</option>
          <option value="shipment">Тільки відвантаження</option>
          <option value="return">Тільки повернення</option>
        </select>

        {/* Кнопка скидання */}
        {Object.values(filters).some(Boolean) && (
          <button
            onClick={() => {
              // Скидаємо всі фільтри
              ["search", "status", "channel", "legal", "line", "store", "from", "to"].forEach(
                k => onChange(k, undefined)
              );
            }}
            className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg"
          >
            Скинути фільтри
          </button>
        )}
      </div>

      {/* Дати */}
      <div className="flex gap-2 items-center">
        <span className="text-xs text-gray-500">Дата:</span>
        <input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={e => onChange("from", e.target.value || undefined)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-400">—</span>
        <input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={e => onChange("to", e.target.value || undefined)}
          className="rounded-lg border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
```

---

## Крок 10.4 — Компонент WaybillTable

```typescript
// src/components/waybills/WaybillTable.tsx
import { Link } from "react-router-dom";
import type { WaybillSummary, SortParams, SortField } from "../../types";
import { SortHeader } from "../ui/SortHeader";
import { StatusBadge, ChannelBadge, LegalEntityBadge } from "../ui/Badge";
import { formatDate, formatUah, formatKg } from "../../utils/formatters";

interface WaybillTableProps {
  items: WaybillSummary[];
  sort: SortParams;
  onSort: (field: SortField) => void;
}

export function WaybillTable({ items, sort, onSort }: WaybillTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <SortHeader label="Дата" field="date" currentField={sort.field} direction={sort.direction} onSort={onSort} />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Накладна</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ЮО</th>
            <SortHeader label="Клієнт" field="customer" currentField={sort.field} direction={sort.direction} onSort={onSort} />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Канал</th>
            <SortHeader label="Сума" field="total" currentField={sort.field} direction={sort.direction} onSort={onSort} />
            <SortHeader label="Вага" field="weight" currentField={sort.field} direction={sort.direction} onSort={onSort} />
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {items.map(item => (
            <tr key={item.waybillNumber} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {formatDate(item.waybillDate)}
              </td>
              <td className="px-4 py-3">
                {/* Link — навігація без перезавантаження сторінки */}
                <Link
                  to={`/waybills/${item.waybillNumber}`}
                  className="text-blue-600 hover:underline font-medium"
                >
                  {item.waybillNumber}
                </Link>
                <div className="text-xs text-gray-400">{item.linesCount} поз.</div>
              </td>
              <td className="px-4 py-3">
                <LegalEntityBadge entity={item.legalEntity} />
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{item.customerName}</div>
                {item.storeName && (
                  <div className="text-xs text-gray-500">{item.storeName}</div>
                )}
              </td>
              <td className="px-4 py-3">
                <ChannelBadge channel={item.deliveryChannel} />
              </td>
              <td className="px-4 py-3 text-gray-800 font-medium whitespace-nowrap">
                {formatUah(item.totalUah)}
                {item.returnsUah < 0 && (
                  <div className="text-xs text-red-500">{formatUah(item.returnsUah)}</div>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                {item.totalWeightKg ? formatKg(item.totalWeightKg) : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Крок 10.5 — Основна сторінка WaybillList

```typescript
// src/pages/waybills/WaybillList.tsx
import { useWaybills } from "../../hooks/useWaybills";
import { useWaybillFilters } from "../../hooks/useWaybillFilters";
import { WaybillFiltersBar } from "../../components/waybills/WaybillFiltersBar";
import { WaybillTable } from "../../components/waybills/WaybillTable";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Pagination } from "../../components/ui/Pagination";
import { Link } from "react-router-dom";
import type { SortField } from "../../types";

const PAGE_SIZE = 10;

export function WaybillList() {
  // Всі фільтри, сортування і сторінка — в URL (зручно для шерингу посилань)
  const { filters, sort, page, setFilter, setSort, setPage } = useWaybillFilters();

  const { data, isLoading, isError, refetch } = useWaybills(
    filters,
    sort,
    { page, pageSize: PAGE_SIZE },
  );

  return (
    <div className="p-6 space-y-4">
      {/* Заголовок і кнопка імпорту */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Реєстр накладних</h1>
        <div className="flex gap-2">
          <Link
            to="/waybills/unassigned"
            className="px-3 py-2 text-sm rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100"
          >
            ⚠️ Не призначені
          </Link>
          <Link
            to="/waybills/import"
            className="px-3 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Імпорт із 1С
          </Link>
        </div>
      </div>

      {/* Панель фільтрів */}
      <WaybillFiltersBar filters={filters} onChange={setFilter} />

      {/* ── Стани ───────────────────────────────────────── */}

      {/* Loading — показуємо тільки при першому завантаженні */}
      {isLoading && (
        <div className="py-12">
          <Spinner size="lg" label="Завантаження накладних..." />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <ErrorBanner
          message="Не вдалось завантажити накладні"
          onRetry={refetch}
        />
      )}

      {/* Empty */}
      {!isLoading && !isError && data?.items.length === 0 && (
        <EmptyState
          title="Накладних не знайдено"
          subtitle="Спробуйте змінити або скинути фільтри"
        />
      )}

      {/* Таблиця (показуємо коли є дані) */}
      {!isLoading && !isError && data && data.items.length > 0 && (
        <>
          {/* Лічильник результатів */}
          <p className="text-sm text-gray-500">
            Знайдено: {data.total} накладних
          </p>

          <WaybillTable
            items={data.items}
            sort={sort}
            onSort={(field: SortField) => setSort(field)}
          />

          <Pagination
            total={data.total}
            page={page}
            pageSize={PAGE_SIZE}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
```

---

## Крок 10.6 — Підключення WaybillList до App.tsx

Відкрий `src/App.tsx` і заміни рядок:

```typescript
// ЗНАЙДИ:
<Route index element={<PlaceholderPage title="Реєстр накладних" />} />

// ЗАМІНИ НА:
<Route index element={<WaybillList />} />
```

І додай імпорт на початку файлу:

```typescript
import { WaybillList } from "./pages/waybills/WaybillList";
```

Запусти `npm run dev` і перейди на http://localhost:5173/waybills —
повинна з'явитись таблиця з накладними з mock даних!

---

# ═══════════════════════════════════════════════════════════
# ЩО ДАЛІ
# ═══════════════════════════════════════════════════════════

## Наступні кроки (в такому порядку):

### Крок 11 — WaybillDetail (деталі накладної)
- Виводимо всі рядки однієї накладної
- Кнопка "← Назад"
- Підсумки: сума, вага, об'єм

### Крок 12 — FleetList (реєстр авто)
- Аналогічна структура до WaybillList
- Фільтри: статус авто, режим трекінгу
- CarStatusBadge у таблиці

### Крок 13 — DriverDashboard (екран водія)
- DayModeSwitch (перемикач daily/full)
- Кнопки типів подій
- EventForm (форма нової події)

### Крок 14 — QRScanner
- html5-qrcode бібліотека
- Мульти-скан (камера не закривається)
- Channel guard перевірка

### Крок 15 — HiredTripForm (найманий транспорт)
### Крок 16 — CarrierShipmentForm (служби доставки)
### Крок 17 — Аналітика і графіки (Recharts)

---

## Корисні команди WebStorm:

```
Alt+Enter          — швидкі виправлення (Quick Fix)
Ctrl+Space         — автодоповнення
Ctrl+Click         — перейти до визначення
Shift+F6           — перейменувати (рефакторинг)
Ctrl+/             — закоментувати рядок
Alt+F12            — відкрити термінал
Ctrl+Shift+F       — пошук по всьому проєкту
```

## Корисні знання JavaScript:

```javascript
// Деструктуризація масиву
const [first, ...rest] = [1, 2, 3];  // first=1, rest=[2,3]

// Деструктуризація об'єкту
const { name, age = 25 } = person;   // age=25 якщо undefined

// Optional chaining (?.) — безпечний доступ до вкладених полів
const city = user?.address?.city;    // undefined замість помилки

// Nullish coalescing (??) — значення за замовчуванням
const name = user.name ?? "Гість";   // "Гість" якщо null або undefined

// Spread operator (...)
const newArr = [...arr, newItem];     // копія масиву + новий елемент
const newObj = { ...obj, name: "B" }; // копія об'єкту + перезапис поля

// Array методи (вчи напам'ять!):
arr.map(x => x * 2)              // перетворення
arr.filter(x => x > 0)           // фільтрація
arr.reduce((sum, x) => sum + x, 0) // накопичення
arr.find(x => x.id === 1)        // перший збіг
arr.some(x => x > 10)            // чи є хоч один збіг
arr.every(x => x > 0)            // чи всі збігаються
arr.sort((a, b) => a - b)        // сортування
```
