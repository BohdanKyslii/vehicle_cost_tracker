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
# ФАЗА 3 — ЛЕНДІНГ: NAV, АВТОРИЗАЦІЯ ТА МАРШРУТИЗАЦІЯ
# ═══════════════════════════════════════════════════════════

## Крок 3.1 — Навіщо ця фаза перед mock-даними

План курсу спочатку передбачав mock JSON, а вже потім routing.
Але зручніше почати з "вхідних дверей" застосунку — сторінки,
яку бачить будь-який користувач першою: навігація + вхід/реєстрація.

Це дає одразу:
- робочий `react-router-dom` (був у залежностях, але не підключений)
- каркас маршрутів під усі майбутні розділи (`/fleet`, `/waybills`, ...)
- місце, куди пізніше підʼєднається реальна авторизація через Django

Дизайн узятий із готового прототипу (`documents/start_page/`) —
статичний HTML/CSS/vanilla-JS, який ми переносимо в React-компоненти.

---

## Крок 3.2 — Підключення React Router

`react-router-dom` вже встановлений (Крок 1.3), лишилось його
активувати. Відкрий `src/main.tsx`:

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

ЩО РОБИТЬ КОД:
- `BrowserRouter` — обгортка, яка дає всім дочірнім компонентам
  доступ до навігації (через History API браузера, без перезавантаження)
- Обгортати потрібно ЗОВНІ `<App />`, а не всередині — інакше
  `<Routes>` у App.tsx не запрацюють

---

## Крок 3.3 — Структура файлів цієї фази

```
src/
├── assets/
│   └── logo.png
├── styles/
│   └── landing.css
├── hocks/
│   └── useAuthModal.ts
├── components/
│   ├── layouts/
│   │   └── TopNav.tsx
│   └── auth/
│       └── AuthModal.tsx
└── pages/
    ├── LandingPage.tsx
    └── UnderConstruction.tsx
```

Скопіюй `documents/start_page/rubin_logo_512.8ebfaa2f5f9a.png`
у `src/assets/logo.png`.

---

## Крок 3.4 — Стилі: чому окремий CSS-файл, а не Tailwind

Модалка авторизації має складну анімовану верстку (grid із
двома панелями, які перемикаються прозорістю/трансформаціями).
Переписувати це у Tailwind-класи — довше і менш читабельно,
ніж перенести готовий CSS майже без змін.

Створи `src/styles/landing.css` і перенеси туди вміст
`documents/start_page/style.css`, обгорнувши колірний фон у клас
`.landing` (щоб не зачепити інші сторінки глобально):

```css
.landing {
  min-height: 100vh;
  color: #fff;
  background: linear-gradient(180deg, #2b1330 0%, #0f1724 100%);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}
/* .top-nav, .auth-backdrop, .auth-card ... — решта класів як у прототипі,
   без .landing-префікса: вони мають position:fixed, тому працюють
   незалежно від DOM-вкладеності */
```

Імпортується CSS прямо в компоненті сторінки (Крок 3.8), не глобально —
Vite підвантажує його лише коли рендериться відповідна сторінка.

---

## Крок 3.5 — useAuthModal: свій React hook

Замість vanilla-JS (`classList.toggle`, `addEventListener`) —
стан модалки через `useState`. Створи `src/hocks/useAuthModal.ts`:

```typescript
// src/hocks/useAuthModal.ts
import { useState } from 'react';

export function useAuthModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  return {
    isOpen,
    isSignup,
    openLogin: () => {
      setIsSignup(false);
      setIsOpen(true);
    },
    openSignup: () => {
      setIsSignup(true);
      setIsOpen(true);
    },
    close: () => setIsOpen(false),
    switchTo: (signup: boolean) => setIsSignup(signup),
  };
}
```

ЩО РОБИТЬ КОД:
- Custom hook — звичайна функція, що починається з `use` і всередині
  викликає інші hooks (`useState`). React дозволяє так виносити
  повторювану логіку стану з компонента
- Повертає обʼєкт з даними (`isOpen`, `isSignup`) і функціями
  для їх зміни — компонент, що використовує hook, не знає ПРО
  саму реалізацію стану, тільки про API

---

## Крок 3.6 — AuthModal.tsx: форма без бекенда

Django ще не має `/api/auth/` — форми поки що лише `preventDefault()`.
Створи `src/components/auth/AuthModal.tsx`:

```typescript
// src/components/auth/AuthModal.tsx
import { useEffect } from 'react';
import type { FormEvent } from 'react';

interface Props {
  open: boolean;
  signup: boolean;
  onClose: () => void;
  onSwitch: (signup: boolean) => void;
}

// TODO: підключити до /api/auth/, коли Django-ендпоінти будуть готові
function handleSubmit(e: FormEvent) {
  e.preventDefault();
}

export function AuthModal({ open, signup, onClose, onSwitch }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`auth-backdrop${open ? ' open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`auth-card${signup ? ' is-signup' : ''}`}>
        {/* pane-login, pane-left-promo, pane-right-promo, pane-signup —
            чотири панелі, видимість яких перемикає клас .is-signup
            на .auth-card (та сама логіка, що й у прототипі, лише
            через className замість classList.toggle) */}
      </div>
    </div>
  );
}
```

ЩО РОБИТЬ КОД:
- Два `useEffect`: перший блокує скрол сторінки поки модалка відкрита
  (і повертає скрол назад при закритті — `return () => {...}` це
  cleanup-функція, React викликає її автоматично)
- Другий підписується на Escape лише поки модалка відкрита
- `onClick` на backdrop перевіряє `e.target === e.currentTarget` —
  тобто клікнули саме по фону, а не по картці всередині нього
- Повний JSX чотирьох панелей — дивись готовий файл
  `src/components/auth/AuthModal.tsx`, тут наведена лише логіка

---

## Крок 3.7 — TopNav.tsx: навігація

Створи `src/components/layouts/TopNav.tsx`:

```typescript
// src/components/layouts/TopNav.tsx
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

interface Props {
  onOpenAuth: () => void;
}

export function TopNav({ onOpenAuth }: Props) {
  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <div className="logo">
          <Link to="/"><img src={logo} alt="Logo" /></Link>
        </div>
        <ul className="menu">
          <li><Link to="/fleet">Автопарк</Link></li>
          <li><Link to="/waybills">Накладні</Link></li>
          <li><Link to="/driver">Водії</Link></li>
          <li><Link to="/analytics">Аналітика</Link></li>
          <li className="has-submenu">
            <span>Ще</span>
            <ul className="submenu">
              <li><Link to="/hired">Найманий транспорт</Link></li>
              <li><Link to="/carriers">Служби доставки</Link></li>
              <li><Link to="/admin">Адмін</Link></li>
            </ul>
          </li>
        </ul>
        <div className="actions">
          <button type="button" className="signup-btn" onClick={onOpenAuth}>
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
```

ЩО РОБИТЬ КОД:
- `<Link to="...">` — аналог `<a href="...">`, але БЕЗ перезавантаження
  сторінки: React Router перехоплює клік і сам підмінює компонент
- `onOpenAuth` — колбек, переданий згори (Крок 3.8/3.9): TopNav
  не знає ПРО стан модалки, тільки викликає функцію при кліку —
  так компонент лишається переносним між сторінками

---

## Крок 3.8 — Сторінки: LandingPage і UnderConstruction

Кожен пункт меню веде на розділ, якого ще не існує. Замість
порожньої білої сторінки — однакова заглушка "в розробці" зі
збереженою навігацією. Створи `src/pages/UnderConstruction.tsx`:

```typescript
// src/pages/UnderConstruction.tsx
import { TopNav } from '../components/layouts/TopNav';
import { useAuthModal } from '../hocks/useAuthModal';
import { AuthModal } from '../components/auth/AuthModal';
import '../styles/landing.css';

interface Props {
  title: string;
}

export function UnderConstruction({ title }: Props) {
  const auth = useAuthModal();

  return (
    <div className="landing">
      <TopNav onOpenAuth={auth.openSignup} />
      <main className="page">
        <div>
          <h1>{title}</h1>
          <p>Ця сторінка ще в розробці.</p>
        </div>
      </main>
      <AuthModal
        open={auth.isOpen}
        signup={auth.isSignup}
        onClose={auth.close}
        onSwitch={auth.switchTo}
      />
    </div>
  );
}
```

І `src/pages/LandingPage.tsx` — та сама структура, лише замість
`title`/тексту "в розробці" — вітальний текст головної сторінки:

```typescript
// src/pages/LandingPage.tsx
import { TopNav } from '../components/layouts/TopNav';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuthModal } from '../hocks/useAuthModal';
import '../styles/landing.css';

export function LandingPage() {
  const auth = useAuthModal();

  return (
    <div className="landing">
      <TopNav onOpenAuth={auth.openSignup} />
      <main className="page">
        <div>
          <h1>Vehicle Cost Tracker</h1>
          <p>Облік транспортних витрат — автопарк, накладні, аналітика.</p>
        </div>
      </main>
      <AuthModal
        open={auth.isOpen}
        signup={auth.isSignup}
        onClose={auth.close}
        onSwitch={auth.switchTo}
      />
    </div>
  );
}
```

ЩО РОБИТЬ КОД:
- Обидві сторінки викликають `useAuthModal()` кожна СВІЙ екземпляр
  стану — це нормально, модалка на будь-якій сторінці працює
  незалежно (пізніше, коли зʼявиться Layout-компонент, стан можна
  буде підняти на рівень вище, щоб не дублювати)
- `UnderConstruction` приймає `title` пропсом — один компонент
  на всі майбутні розділи, поки вони не готові

---

## Крок 3.9 — App.tsx: маршрути

ВИДАЛИ дефолтний вміст `src/App.tsx` (лічильник HMR від Vite
з посиланнями на react.dev/vite.dev — він більше не потрібен)
і напиши:

```typescript
// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UnderConstruction } from './pages/UnderConstruction';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/fleet" element={<UnderConstruction title="Автопарк" />} />
      <Route path="/waybills" element={<UnderConstruction title="Накладні" />} />
      <Route path="/driver" element={<UnderConstruction title="Водії" />} />
      <Route path="/analytics" element={<UnderConstruction title="Аналітика" />} />
      <Route path="/hired" element={<UnderConstruction title="Найманий транспорт" />} />
      <Route path="/carriers" element={<UnderConstruction title="Служби доставки" />} />
      <Route path="/admin" element={<UnderConstruction title="Адмін" />} />
      <Route path="*" element={<UnderConstruction title="Сторінку не знайдено" />} />
    </Routes>
  );
}

export default App
```

ЩО РОБИТЬ КОД:
- `<Routes>` перебирає дочірні `<Route>` і рендерить ПЕРШИЙ, чий
  `path` збігається з поточною адресою
- `path="*"` — catch-all, спрацьовує коли жоден інший маршрут
  не підійшов (аналог `404`)
- Коли зʼявиться реальна сторінка (наприклад Фаза 11 — WaybillList),
  просто заміниш відповідний `<UnderConstruction .../>` на
  `<WaybillListPage />` — решта маршрутів і TopNav не зміняться

---

## Крок 3.10 — Перевірка

```
npm run dev
```

Відкрий http://localhost:5173 — має зʼявитись темний фон,
верхнє меню з логотипом і кнопкою Sign Up.

Перевір:
- Клік "Sign Up" → відкривається модалка у режимі реєстрації
- Кнопка "Sign In" у лівій панелі → перемикає на форму входу
- `Escape` або клік по темному фону → закриває модалку
- Клік по "Автопарк" у меню → переходить на `/fleet`,
  показує "Ця сторінка ще в розробці", меню лишається зверху

Якщо все working — переходь до наступної фази.

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 4 — GIT-РЕПОЗИТОРІЙ ТА АВТОДЕПЛОЙ
# ═══════════════════════════════════════════════════════════

## Крок 4.1 — Навіщо ця фаза саме тут

З цього моменту проєкт житиме на реальному сервері (Raspberry Pi,
домен `warehouse.mom`), і кожна наступна фаза буде розробкою
у гілці з подальшим злиттям у `main`. Простіше налаштувати це
одразу, поки коду небагато, ніж розбиратись, коли фаз стане 10.

---

## Крок 4.2 — Ініціалізація репозиторію

Якщо репозиторій ще не створений:

```bash
git init
git add .
git commit -m "Initial commit"
```

На GitHub створи новий приватний репозиторій (без README/.gitignore —
вони вже є локально), тоді підключи remote:

```bash
git remote add origin git@github.com:<твій-акаунт>/vehicle_cost_tracker.git
git branch -M main
git push -u origin main
```

Перевір `.gitignore` — обов'язково мають бути виключені:

```
node_modules
dist
.env
.env.production
```

`.env`/`.env.production` НІКОЛИ не комітяться — там може бути
адреса реального API чи інші налаштування середовища. Замість
цього значення для сервера кладуться туди вручну (Крок 4.4).

---

## Крок 4.3 — Docker: пакування React-збірки

Продакшн-збірка React — це просто статичні файли (`npm run build`
кладе їх у `dist/`). Їх треба чимось віддавати браузеру — для
цього використовуємо nginx усередині Docker-контейнера.

Створи `Dockerfile` у корені проєкту:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
```

ЩО РОБИТЬ КОД:
- Multi-stage build: перший етап (`AS build`) ставить залежності
  й збирає проєкт у Node-контейнері, другий — бере ГОТОВІ файли
  з `dist/` і кладе в легкий nginx-образ. Сам Node у фінальному
  образі не залишається — менший розмір
- `npm ci` (не `npm install`) — ставить залежності СУВОРО за
  `package-lock.json`, без несподіваних оновлень версій

Створи `nginx.conf` поруч:

```nginx
server {
    listen 8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
    }

    location /static/ {
        proxy_pass http://127.0.0.1:8000/static/;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

ЩО РОБИТЬ КОД:
- `location /api/`, `/admin/`, `/static/` — усе, що починається
  з цих шляхів, nginx перенаправляє на Django-бекенд (порт 8000
  на тому ж сервері)
- `location /` з `try_files $uri $uri/ /index.html` — це SPA-fallback:
  якщо файлу за адресою немає (наприклад `/fleet` — це не файл,
  а React-маршрут), nginx все одно віддає `index.html`, а
  React Router вже сам розбирається, яку сторінку показати

Створи `docker-compose.yml`:

```yaml
services:
  ui:
    build: .
    restart: unless-stopped
    network_mode: host  # доступ до backend (127.0.0.1:8000) напряму
```

---

## Крок 4.4 — GitHub Actions: автодеплой

Мета: `git push` у `main` сам збирає і перезапускає контейнер
на сервері. Створи `.github/workflows/deploy.yml`:

```yaml
name: Deploy UI

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Install cloudflared
        run: |
          curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 \
            -o cloudflared
          chmod +x cloudflared
          sudo mv cloudflared /usr/local/bin/

      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh
          printf '%s\n' "${{ secrets.PI_SSH_KEY }}" > ~/.ssh/deploy_key
          chmod 600 ~/.ssh/deploy_key
          cat > ~/.ssh/config << 'EOF'
          Host pi-deploy
            HostName ssh.warehouse.mom
            User rasberry_kisliy
            IdentityFile ~/.ssh/deploy_key
            ProxyCommand cloudflared access ssh --hostname ssh.warehouse.mom
            StrictHostKeyChecking no
          EOF
          chmod 600 ~/.ssh/config

      - name: Deploy via SSH
        run: |
          ssh pi-deploy '
            cd ~/vehicle_cost_tracker
            git pull origin main
            docker compose build
            docker compose up -d
            docker image prune -f
          '
```

ЩО РОБИТЬ КОД:
- Сервер (Raspberry Pi) не має публічної IP-адреси — GitHub Actions
  не може достукатись до нього напряму. Замість цього SSH-зʼєднання
  тунелюється через Cloudflare Tunnel (`cloudflared access ssh`),
  який уже налаштований на самому Pi
- Секрети (`PI_SSH_KEY`) додаються в `Settings → Secrets and
  variables → Actions` репозиторію на GitHub — НЕ в `.env` файл
  проєкту. Це різні речі: `.env` читає сам застосунок під час
  роботи, secrets використовує лише сам workflow під час деплою
- Скрипт заходить на сервер, підтягує код, пересобирає
  Docker-образ і перезапускає контейнер

---

## Крок 4.5 — Робота з гілками для наступних фаз

Починаючи з Фази 5, кожна фаза розробляється в окремій гілці,
а не напряму в `main`. Причина: `main` — це те, що вже задеплоєне
й показується користувачам через `warehouse.mom`. Незавершений або
зламаний код туди потрапляти не повинен.

### Створення гілки під фазу

Перед початком нової фази:

```bash
git checkout main
git pull origin main          # підтягнути все, що змержено раніше
git checkout -b feature/faza-5-utils
```

Назва гілки: `feature/faza-N-коротка-назва` — видно одразу,
що це за робота, без відкриття гілки.

### Робота і проміжні коміти

Комітити можна часто, дрібними кроками — це НЕ `main`, зламаний
проміжний стан тут нормальний:

```bash
git add src/utils/formatters.ts
git commit -m "Add currency/date formatters"

git add src/utils/eventHelpers.ts
git commit -m "Add route event helpers"
```

### Перевірка перед злиттям

Перш ніж зливати гілку в `main`:

```bash
npm run build      # проєкт взагалі збирається без помилок?
npm run dev         # і виглядає як треба у браузері?
```

Якщо `main` тим часом пішов вперед (хтось інший або ти сам
злив іншу гілку) — онови свою гілку ПЕРЕД злиттям:

```bash
git checkout feature/faza-5-utils
git fetch origin
git rebase origin/main
```

`rebase` переносить твої коміти "поверх" свіжого `main` —
історія лишається лінійною. Якщо виникають конфлікти,
git зупиниться і покаже файли, де треба вручну обрати
правильний варіант (`git status` покаже які), потім:

```bash
git add <вирішений-файл>
git rebase --continue
```

### Злиття у main

Два варіанти — обери один підхід і дотримуйся його по всіх фазах.

**Варіант А (рекомендовано): Pull Request на GitHub**

```bash
git push -u origin feature/faza-5-utils
```

Потім на GitHub: `Compare & pull request` → перевір diff →
`Merge pull request`. Плюс: видно історію рішень, можна
переглянути зміни перед злиттям навіть працюючи самостійно.

**Варіант Б: злиття локально**

```bash
git checkout main
git pull origin main
git merge --no-ff feature/faza-5-utils
git push origin main
```

`--no-ff` (no fast-forward) — навіть якщо злиття можна було б
зробити "прямою лінією", git все одно створює merge-коміт.
Завдяки цьому в історії видно ГРАНИЦІ фази (де вона почалась
і де закінчилась), а не суцільний список окремих комітів.

### Після злиття

```bash
git branch -d feature/faza-5-utils            # видалити локально
git push origin --delete feature/faza-5-utils  # видалити на GitHub
```

Злиття в `main` = push у GitHub = автодеплой (Крок 4.4) сам
збере й викотить нову версію на `warehouse.mom`.

### Підсумок цикла на прикладі Фази 5

```bash
git checkout main && git pull origin main
git checkout -b feature/faza-5-utils
# ... пишеш код, комітиш поетапно ...
npm run build && npm run dev   # перевірка
git fetch origin && git rebase origin/main   # якщо main пішов вперед
git push -u origin feature/faza-5-utils
# Pull Request на GitHub → Merge
git checkout main && git pull origin main
git branch -d feature/faza-5-utils
```

Цей цикл повторюється для кожної фази з 5 по 11.

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 4.5 — РЕЄСТРАЦІЯ ТА АВТОРИЗАЦІЯ
# ═══════════════════════════════════════════════════════════

> Ця фаза йде поза початковою нумерацією (див. `task_description/ROADMAP.md`
> у `vehicle_tracker_api`). AuthModal (Фаза 3) поки лише візуальна —
> `handleSubmit` робить `preventDefault()` і нічого не відправляє.
> Ця фаза підключає її до реального Django API з Фази 4.5 бекенду
> (`DJANGO_CODING_GUIDE.md`) — **зроби спочатку backend-частину**,
> без неї фронтенду немає куди стукати.
>
> Гілка: `feature/faza-4.5-auth` (той самий процес, що в Кроці 4.5
> Фази 4 — checkout, коміти, PR, merge).

## Крок 4.5.1 — Чому cookie, а не localStorage

Backend видає Django `sessionid` cookie при логіні. Браузер сам
зберігає й надсилає її з кожним запитом — фронтенду не треба:
- вручну класти токен у `localStorage` (вразливо до XSS),
- вручну додавати `Authorization` header у кожен `fetch`.

Єдине, що треба зробити самим — увімкнути `credentials: "include"`
(інакше `fetch` не надішле cookie) і додати `X-CSRFToken` header
у мутуючі запити (POST/PUT/DELETE) — Django CSRF-захист працює
навіть для сесійної автентифікації.

## Крок 4.5.2 — src/api/config.ts

```typescript
// src/api/config.ts
export const API_BASE = import.meta.env.VITE_API_BASE;

// Читає значення cookie за іменем — Django кладе CSRF-токен
// у cookie "csrftoken", яку JS може прочитати напряму
function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

interface FetchOptions extends RequestInit {
  json?: unknown;
}

// Обгортка над fetch: credentials + CSRF header + JSON body/parse в одному місці
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken") ?? "",
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  // 204 No Content (logout) — немає тіла для парсингу
  if (res.status === 204) return undefined as T;
  return res.json();
}
```

ЩО РОБИТЬ КОД:
- `getCookie` — регулярка витягує значення `csrftoken` із рядка
  `document.cookie` (браузер зберігає всі cookie в одному рядку
  `"ім'я1=знач1; ім'я2=знач2"`)
- `credentials: "include"` — обов'язково для крос-портового запиту
  (`:5173` → `:8000` під час розробки; в проді `/api/` той самий
  origin через nginx, але прапорець нічого не ламає й там)
- Єдина обгортка над `fetch` — усі майбутні `api/*.ts` файли
  (Фаза 6) використовуватимуть саме її, а не голий `fetch`

## Крок 4.5.3 — src/api/auth.ts

```typescript
// src/api/auth.ts
import { apiFetch } from "./config";

export interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

// Проставляє csrftoken cookie в браузері — викликається один раз
// при старті застосунку, ДО першого логіну/реєстрації
export function fetchCsrf() {
  return apiFetch<{ csrfToken: string }>("/auth/csrf/");
}

export function fetchCurrentUser() {
  return apiFetch<{ user: CurrentUser | null }>("/auth/me/");
}

export function login(username: string, password: string) {
  return apiFetch<CurrentUser>("/auth/login/", {
    method: "POST",
    json: { username, password },
  });
}

export function register(username: string, email: string, password: string) {
  return apiFetch<CurrentUser>("/auth/register/", {
    method: "POST",
    json: { username, email, password },
  });
}

export function logout() {
  return apiFetch<void>("/auth/logout/", { method: "POST" });
}
```

## Крок 4.5.4 — src/hooks/useCurrentUser.ts

```typescript
// src/hooks/useCurrentUser.ts
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { fetchCurrentUser, login, register, logout } from "../api/auth";

export function useCurrentUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => (await fetchCurrentUser()).user,
  });

  // onSuccess тут не типовий React Query API — оновлюємо кеш вручну
  // одразу після успішного логіну/реєстрації, щоб не чекати refetch
  const loginMutation = useMutation({
    mutationFn: ({ username, password }: { username: string; password: string }) =>
      login(username, password),
    onSuccess: (user) => queryClient.setQueryData(["currentUser"], user),
  });

  const registerMutation = useMutation({
    mutationFn: ({ username, email, password }: { username: string; email: string; password: string }) =>
      register(username, email, password),
    onSuccess: (user) => queryClient.setQueryData(["currentUser"], user),
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => queryClient.setQueryData(["currentUser"], null),
  });

  return {
    user: query.data,
    isLoading: query.isLoading,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}
```

## Крок 4.5.5 — Виклик fetchCsrf при старті застосунку

Відкрий `src/main.tsx`, виклич `fetchCsrf()` один раз перед рендером
(щоб cookie вже була в браузері до першого відкриття AuthModal):

```typescript
// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.tsx'
import { fetchCsrf } from './api/auth'

fetchCsrf();

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)
```

ЩО РОБИТЬ КОД:
- `QueryClientProvider` — тут з'являється вперше, бо `useCurrentUser`
  (Крок 4.5.4) вже використовує `@tanstack/react-query`. Решта
  застосунку (Фаза 7) буде використовувати той самий `queryClient`

## Крок 4.5.6 — Підключення AuthModal до реального API

Онови `src/components/auth/AuthModal.tsx` — заміни заглушку
`handleSubmit` на реальні виклики. Ключова зміна логіки (повний
JSX панелей — без змін із Фази 3):

```typescript
// src/components/auth/AuthModal.tsx (фрагмент)
import { useState } from 'react';
import type { FormEvent } from 'react';
import { useCurrentUser } from '../../hooks/useCurrentUser';

// ... Props без змін ...

export function AuthModal({ open, signup, onClose, onSwitch }: Props) {
  const { login, register, loginError, registerError } = useCurrentUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    await login({ username, password });
    onClose();
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    await register({ username, email, password });
    onClose();
  }

  // ... useEffect для скролу/Escape без змін ...

  return (
    <div className={`auth-backdrop${open ? ' open' : ''}`} /* ... */>
      <div className={`auth-card${signup ? ' is-signup' : ''}`}>
        {/* pane-login: <form onSubmit={handleLogin}> з input value={username}/onChange
            і т.д., {loginError && <p className="error">{loginError.message}</p>} */}
        {/* pane-signup: <form onSubmit={handleRegister}> аналогічно + поле email,
            {registerError && <p className="error">{registerError.message}</p>} */}
      </div>
    </div>
  );
}
```

ЩО РОБИТЬ КОД:
- `useState` для полів форми — контрольовані інпути (React завжди
  знає поточне значення, а не читає його з DOM при сабміті)
- `await login(...)` — `mutateAsync` кидає виняток при помилці,
  тому `loginError`/`registerError` з `useCurrentUser` вже містять
  причину (напр. "Невірний логін або пароль" від бекенду) —
  просто показати їх текстом під формою
- Немає try/catch навколо `await login` навмисно: якщо мутація
  впаде, `onClose()` просто не викликається і форма лишається
  відкритою з помилкою — саме та поведінка, яка потрібна

## Крок 4.5.7 — TopNav: показ поточного користувача

Відкрий `src/components/layouts/TopNav.tsx` — замінити завжди
видиму кнопку "Sign Up" на умовний рендер:

```typescript
// src/components/layouts/TopNav.tsx (фрагмент)
import { useCurrentUser } from '../../hooks/useCurrentUser';

// ... всередині TopNav, після існуючого JSX меню ...
const { user, logout } = useCurrentUser();

// В actions:
{user ? (
  <div className="user-actions">
    <span>{user.username}</span>
    <button type="button" onClick={() => logout()}>Вийти</button>
  </div>
) : (
  <button type="button" className="signup-btn" onClick={onOpenAuth}>
    Sign Up
  </button>
)}
```

## Крок 4.5.8 — Перевірка .env

`.env` (Крок 1.5) уже містить `VITE_API_BASE=http://localhost:8000/api` —
переконайся, що це так. Backend (Фаза 4.5, Крок 4.5.2) має бути
запущений (`python manage.py runserver`) одночасно з `npm run dev`.

## Крок 4.5.9 — Перевірка в браузері

1. `npm run dev`, відкрий http://localhost:5173
2. Sign Up → заповни форму → сабміт
3. У Django admin (`http://localhost:8000/admin/auth/user/`) має
   з'явитись новий користувач
4. Onload TopNav показує ім'я замість "Sign Up"
5. Онови сторінку (F5) — користувач лишається залогіненим
   (сесія в cookie, `fetchCurrentUser()` при старті це підтверджує)
6. "Вийти" → TopNav знову показує "Sign Up"

Якщо все працює — мерж гілку (Крок 4.5 із Фази 4) і переходь до
Фази 5 (Утиліти) за початковим планом гайду.

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 5 — УТИЛІТИ (чиста логіка без React)
# ═══════════════════════════════════════════════════════════

## Крок 5.1 — Що таке чисті функції і навіщо utils/

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

## Крок 5.2 — Створення src/utils/formatters.ts

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

## Крок 5.3 — Створення src/utils/eventHelpers.ts

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

## Крок 5.4 — Створення src/utils/calcSummary.ts

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

## Крок 5.5 — Створення src/utils/calcTransportCost.ts

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

## Крок 5.6 — Створення src/utils/parseQR.ts

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

## Крок 5.7 — Створення src/utils/clientFilter.ts

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
# ФАЗА 6 — API ШАР
# ═══════════════════════════════════════════════════════════

## Крок 6.1 — Що таке async/await і Promises

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

## Крок 6.2 — Створення src/api/config.ts

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

## Крок 6.3 — Створення src/api/cars.ts

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

## Крок 6.4 — Створення src/api/drivers.ts

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

## Крок 6.5 — Створення src/api/waybills.ts

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

## Крок 6.6 — Створення src/api/routeEvents.ts

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
# ФАЗА 7 — REACT QUERY HOOKS
# ═══════════════════════════════════════════════════════════

## Крок 7.1 — Що таке React Query і навіщо він

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

## Крок 7.2 — Налаштування main.tsx

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

## Крок 7.3 — Створення hooks/useCars.ts

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

## Крок 7.4 — Створення hooks/useRouteEvents.ts

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

## Крок 7.5 — Створення hooks/useWaybills.ts

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

## Крок 7.6 — Створення hooks/useDayMode.ts

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

## Крок 7.7 — Створення hooks/useWaybillFilters.ts

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
# ФАЗА 8 — UI КОМПОНЕНТИ (АТОМАРНІ)
# ═══════════════════════════════════════════════════════════

## Крок 8.1 — Що таке JSX і props

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

## Крок 8.2 — Створення components/ui/Spinner.tsx

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

## Крок 8.3 — Створення components/ui/EmptyState.tsx

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

## Крок 8.4 — Створення components/ui/ErrorBanner.tsx

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

## Крок 8.5 — Створення components/ui/Button.tsx

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

## Крок 8.6 — Створення components/ui/Badge.tsx

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

## Крок 8.7 — Створення components/ui/Pagination.tsx

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

## Крок 8.8 — Створення components/ui/Input.tsx

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
# ФАЗА 9 — LAYOUTS (ШАБЛОНИ СТОРІНОК)
# ═══════════════════════════════════════════════════════════

## Крок 9.1 — Що таке Layout і Outlet

```typescript
// Layout — компонент-обгортка що задає загальну структуру сторінки
// Outlet — місце куди React Router вставляє дочірню сторінку

// Структура:
// <DriverLayout>           ← Header + BottomNav
//   <Outlet />             ← сюди вставляється DriverDashboard або EventForm
// </DriverLayout>
```

---

## Крок 9.2 — Створення components/layouts/DriverLayout.tsx

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

## Крок 9.3 — Створення components/layouts/MainLayout.tsx

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
# ФАЗА 10 — App.tsx ТА МАРШРУТИЗАЦІЯ
# ═══════════════════════════════════════════════════════════

> ПРИМІТКА: `BrowserRouter` і базовий `App.tsx` з `<Routes>` вже
> налаштовані у Фазі 3 (лендінг), під `UnderConstruction`-заглушки.
> Ця фаза замінює заглушки на реальні `Layout`-компоненти й сторінки —
> сам Router переналаштовувати не треба, лише розширити список `<Route>`.

## Крок 10.1 — Що таке React Router

React Router — бібліотека навігації для SPA (Single Page Application).
Замість перезавантаження сторінки — React замінює компонент.

```typescript
// <Route path="/waybills" element={<WaybillList />} />
// При переході на /waybills → рендериться WaybillList
// Без перезавантаження сторінки!
```

---

## Крок 10.2 — Тимчасові заглушки для сторінок

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

## Крок 10.3 — Написання src/App.tsx

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

## Крок 10.4 — Запуск і перевірка структури

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
# ФАЗА 11 — ПЕРША РЕАЛЬНА СТОРІНКА: WaybillList
# ═══════════════════════════════════════════════════════════

## Крок 11.1 — Чому починаємо з WaybillList

Це ключова сторінка для оцінки проєкту. Містить:
- Фільтри (search, status, channel, legalEntity)
- Сортування по колонках
- Пагінацію
- Всі три UI-стани: loading / empty / error

---

## Крок 11.2 — Компонент SortHeader

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

## Крок 11.3 — Компонент WaybillFiltersBar

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

## Крок 11.4 — Компонент WaybillTable

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

## Крок 11.5 — Основна сторінка WaybillList

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

## Крок 11.6 — Підключення WaybillList до App.tsx

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

### Крок 18 — Адмін: підтвердження реєстрацій користувачів
Зараз нові акаунти (`is_active=False`) підтверджуються ВРУЧНУ через Django
Admin бекенду (`vehicle_tracker_api`); адмін лише отримує лист-сповіщення
(див. `apps/accounts/views.py::_notify_admin_new_registration`, ADMIN_EMAIL
у `.env`). Цей крок — про зручний екран підтвердження прямо в застосунку,
замість Django Admin:

- **Backend** (`vehicle_tracker_api`, `apps/accounts`):
  - `GET /api/auth/pending-users/` — список `is_active=False` користувачів
    (username, email, role, дата реєстрації), доступ лише для ролі HEAD
  - `POST /api/auth/pending-users/<id>/approve/` — `is_active=True`
  - `POST /api/auth/pending-users/<id>/reject/` — видалити або позначити
    відхиленим (вирішити на етапі реалізації)
  - Permission-клас: тільки `Profile.role == HEAD`
- **Frontend** (цей репозиторій): сторінка `/admin` (зараз `UnderConstruction`)
  — таблиця заявок на реєстрацію з кнопками "Підтвердити" / "Відхилити",
  React Query hook на кшталт `usePendingUsers()`
- Мій план (адмін = HEAD) — заходити в реальний застосунок, а не в Django
  Admin, для рутинного підтвердження нових співробітників

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
