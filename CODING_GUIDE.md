# Vehicle Cost Tracker — Покрокова інструкція з написання коду
# Для вивчення JavaScript / React / TypeScript з нуля

> Відкрий цей файл у другому вікні WebStorm (View → Split Right)
> і пиши код вручну — не копіюй, набирай руками, так краще запам'ятовується.

---

## Зміст

1. [Фаза 1 — Ініціалізація проєкту](#faza-1)
2. [Фаза 2 — Структура папок і TypeScript типи](#faza-2)
3. [Фаза 3 — Лендінг: nav, авторизація та маршрутизація](#faza-3)
4. [Фаза 4 — Git-репозиторій та автодеплой](#faza-4)
5. [Фаза 4.5 — Реєстрація та авторизація](#faza-4-5)
6. [Фаза 5 — Утиліти (чиста логіка без React)](#faza-5)
7. [Фаза 6 — API шар](#faza-6)
8. [Фаза 7 — React Query hooks](#faza-7)
9. [Фаза 8 — UI компоненти (атомарні)](#faza-8)
10. [Фаза 9 — Layouts (шаблони сторінок)](#faza-9)
11. [Фаза 10 — App.tsx та маршрутизація](#faza-10)
12. [Фаза 11 — Перша реальна сторінка: WaybillList](#faza-11)
13. [Фаза 13 — DriverDashboard (екран водія)](#faza-13)
14. [Фаза 14 — Рольова маршрутизація](#faza-14)
15. [Фаза 15 — QR-сканер накладних для водія](#faza-15)
16. [Фаза 16 — Автопарк для логіста (Fleet CRUD)](#faza-16)
17. [Що далі](#shcho-dali)

> Фази нумеруються так, як вони йшли по факту написання коду — Фази 12
> у файлі немає (пропущена в нумерації), це не помилка змісту.

---

# ═══════════════════════════════════════════════════════════
<a id="faza-1"></a>
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
<a id="faza-2"></a>
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
  otherCostUah?: number;
  otherCostComment?: string;

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
  otherCostUah: number;
  deliveriesCount: number;
  returnCount: number;
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
  otherCostUah: number;
  otherCostComment?: string;
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
<a id="faza-3"></a>
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
<a id="faza-4"></a>
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
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Без слеша в кінці "/admin" не матчить "location /admin/" нижче і
    # провалюється в SPA-заглушку (index.html) — редіректимо на "/admin/"
    location = /admin {
        return 301 /admin/;
    }

    location /admin/ {
        proxy_pass http://127.0.0.1:8000/admin/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        proxy_pass http://127.0.0.1:8000/static/;
    }

    # index.html і PWA service worker/маніфест — НІКОЛИ не кешувати:
    # інакше браузер може довго показувати стару версію застосунку
    # (стара index.html посилається на JS/CSS файли з хешем, яких вже
    # немає на диску після наступного деплою)
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
    location ~* \.(?:webmanifest|json)$ {
        add_header Cache-Control "no-cache";
    }
    location = /sw.js {
        add_header Cache-Control "no-cache";
    }
    location = /registerSW.js {
        add_header Cache-Control "no-cache";
    }

    # JS/CSS з хешем у назві файлу — можна кешувати надовго,
    # ім'я змінюється при кожному новому білді
    location ~* \.(?:js|css)$ {
        add_header Cache-Control "public, max-age=31536000, immutable";
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
- ✅ Виправлено 2026-08-27: `location /admin/` матчить лише URI зі
  слешем у кінці — `/admin` (без слеша, як природно набирають в
  адресному рядку) під це правило не підпадав і провалювався в
  SPA-fallback нижче, тобто React Router рендерив СВОЮ заглушку
  "Адміністрування" (`PlaceholderPage`, окремий, ще не збудований
  розділ фронтенду) замість реального Django Admin. Додано
  `location = /admin { return 301 /admin/; }` перед основним блоком.
- `location /` з `try_files $uri $uri/ /index.html` — це SPA-fallback:
  якщо файлу за адресою немає (наприклад `/fleet` — це не файл,
  а React-маршрут), nginx все одно віддає `index.html`, а
  React Router вже сам розбирається, яку сторінку показати
- Блоки `Cache-Control: no-cache` для `index.html`/`sw.js`/маніфесту —
  без цього браузер (особливо з увімкненим PWA service worker'ом) може
  роками показувати СТАРУ версію застосунку навіть після успішного
  деплою: `index.html` кешується, посилається на JS/CSS файли з хешем
  попереднього білду, яких вже немає на диску. Симптом: нові фічі не
  з'являються в конкретному браузері, хоча сервер оновився (в іншому
  браузері/інкогніто — все ок). Хеш-файли (`.js`/`.css`) навпаки можна
  кешувати надовго — ім'я змінюється при кожному білді, тож старий кеш
  просто ніколи не переприсвоюється новому файлу

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
<a id="faza-4-5"></a>
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
<a id="faza-5"></a>
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

// Градієнт для тайла кожного типу події (Крок 13, DriverDashboard) —
// різні кольори полегшують пошук потрібної кнопки одним поглядом.
export function eventTypeGradient(type: RouteEventType): string {
  const gradients: Record<RouteEventType, string> = {
    depot_start: "from-blue-500 to-cyan-400",
    delivery: "from-violet-500 to-purple-400",
    parking_end: "from-slate-500 to-slate-400",
    depot_return: "from-indigo-500 to-blue-400",
    refuel: "from-amber-500 to-orange-400",
    other_cost: "from-pink-500 to-rose-400",
    return_goods: "from-teal-500 to-emerald-400",
    extra_cargo: "from-fuchsia-500 to-pink-400",
  };
  return gradients[type];
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

  const otherCostUah = sorted
    .filter(e => e.eventType === "other_cost")
    .reduce((sum, e) => sum + (e.otherCostUah ?? 0), 0);

  // Підрахунок подій по типу
  const deliveriesCount = sorted.filter(e => e.eventType === "delivery").length;
  const returnCount = sorted.filter(e => e.eventType === "return_goods").length;
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
    otherCostUah,
    deliveriesCount,
    returnCount,
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
    costs.otherCostUah
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
  waybillDate: string; // завжди ISO "YYYY-MM-DD" — так само як waybillDate по всьому застосунку
}

// Перетворює дату з QR "ДД.ММ.РР" (РР — 2 цифри року) у ISO "20РР-ММ-ДД".
// Джерела віддають рік двома цифрами, тому припускаємо 2000+ (актуально для waybill-ів).
function normalizeQrDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `20${year}-${month}-${day}`;
}

// Парсить рядок QR-коду у об'єкт { waybillNumber, waybillDate }
// Реальний формат з ESP, OPT та Rubin: "номер:ДД.ММ.РР"
//   ESP/OPT: "0000391877:06.07.26"
//   Rubin:   "7908:03.08.26"        (номер коротший, без провідних нулів)
// Довжина номера різна між джерелами, тому вона не валідується.
export function parseQRCode(raw: string): QRResult | null {
  if (!raw || raw.trim() === "") return null;
  const trimmed = raw.trim();

  // Спроба 1: JSON формат — про запас, якщо колись з'явиться інше джерело
  // try-catch ловить помилку якщо JSON.parse не вдається
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.number && parsed.date) {
      return {
        waybillNumber: String(parsed.number).trim(),
        waybillDate: String(parsed.date).trim(),
      };
    }
  } catch {
    // Не JSON — пробуємо формат "номер:дата"
  }

  // Спроба 2: "номер:ДД.ММ.РР" — формат ESP, OPT, Rubin
  // lastIndexOf(":") — на випадок якщо в номері документу теж трапиться ":"
  const sepIndex = trimmed.lastIndexOf(":");
  if (sepIndex > 0 && sepIndex < trimmed.length - 1) {
    const number = trimmed.slice(0, sepIndex).trim();
    const isoDate = normalizeQrDate(trimmed.slice(sepIndex + 1));
    if (number && isoDate) {
      return { waybillNumber: number, waybillDate: isoDate };
    }
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
<a id="faza-6"></a>
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

## Крок 6.2 — Доповнення src/api/config.ts

`src/api/config.ts` вже існує (Фаза 4.5) — там уже є `API_BASE` і
`apiFetch()` (обгортка над `fetch` з `credentials: 'include'` і
CSRF-заголовком, потрібна для сесійної авторизації). ДОДАЙ у той самий
файл (не створюй новий, не перезаписуй `API_BASE`/`apiFetch`):

```typescript
// додати в src/api/config.ts

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Допоміжна функція: імітує мережеву затримку у mock режимі
// Без неї компоненти не встигають показати loading стан
export function mockDelay(ms = 300): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

⚠️ **У решті Фази 6 (`cars.ts`, `drivers.ts`, `routeEvents.ts`) реальні
запити йдуть через `apiFetch()`, а не сирий `fetch()`.** Причина не
стилістична: `fetch()` без `credentials: 'include'` не надішле
сесійну cookie, а POST без CSRF-заголовка Django відхилить з `403`
(`CsrfViewMiddleware` увімкнений). `apiFetch` з Фази 4.5 вже вирішує
обидві проблеми — просто перевикористовуємо його.

---

## Крок 6.3 — Створення src/api/cars.ts

> ⚠️ Django REST Framework повертає списки загорнутими в пагінацію
> (`{"count":.., "results":[...]}`), а поля бекенду — `snake_case`
> (`name_car`), тоді як наші TS-типи — `camelCase` (`nameCar`). Функції
> `mapCar`/`mapCarSpecs`/`mapTrailer` — єдине місце, де відбувається
> це перетворення, щоб решта коду про це не думала.

```typescript
// src/api/cars.ts
import type { Car, CarSpecs, TrackingMode, CarStatus, Trailer } from "../types";
import { USE_MOCK, mockDelay, apiFetch } from "./config";
import mockCars from "../mocks/cars.json";

interface Paginated<T> {
  results: T[];
}

// Форма відповіді бекенду (snake_case) — окремо від camelCase TS-типів вище.
interface RawCarSpecs {
  vin_code?: string;
  year_manufactured?: number;
  weight_kg?: string;
  payload_kg?: string;
  length_cm?: string;
  width_cm?: string;
  height_cm?: string;
  has_tail_lift: boolean;
  has_trailer: boolean;
}

interface RawTrailer {
  vin_code?: string;
  year_manufactured?: number;
  name_trailer: string;
  model: string;
  number_trailer: string;
  is_active: boolean;
}

interface RawCar {
  id: number;
  name_car: string;
  number_car: string;
  fuel_card_number?: number;
  amount_car: string;
  default_tracking_mode: TrackingMode;
  status_car: CarStatus;
  is_active: boolean;
  specs?: RawCarSpecs | null;
  trailer?: RawTrailer | null;
}

function mapCarSpecs(raw: RawCarSpecs, carId: number): CarSpecs {
  return {
    idCar: carId, // CarSpecsSerializer виключає id/car — переюзаємо id авто
    vinCode: raw.vin_code,
    yearManufactured: raw.year_manufactured,
    // DRF серіалізує DecimalField як рядок у JSON — тому Number(...)
    weightKg: raw.weight_kg ? Number(raw.weight_kg) : undefined,
    payloadKg: raw.payload_kg ? Number(raw.payload_kg) : undefined,
    lengthCm: raw.length_cm ? Number(raw.length_cm) : undefined,
    widthCm: raw.width_cm ? Number(raw.width_cm) : undefined,
    heightCm: raw.height_cm ? Number(raw.height_cm) : undefined,
    hasTailLift: raw.has_tail_lift,
    hasTrailer: raw.has_trailer,
  };
}

function mapTrailer(raw: RawTrailer, carId: number): Trailer {
  return {
    idTrailer: carId, // TrailerSerializer теж виключає id/car
    vinCode: raw.vin_code,
    yearManufactured: raw.year_manufactured,
    nameTrailer: raw.name_trailer,
    idCar: carId,
    model: raw.model,
    numberTrailer: raw.number_trailer,
    isActive: raw.is_active,
  };
}

function mapCar(raw: RawCar): Car {
  return {
    idCar: raw.id,
    nameCar: raw.name_car,
    numberCar: raw.number_car,
    fuelCardNumber: raw.fuel_card_number ?? undefined,
    amountCar: Number(raw.amount_car),
    defaultTrackingMode: raw.default_tracking_mode,
    statusCar: raw.status_car,
    isActive: raw.is_active,
    specs: raw.specs ? mapCarSpecs(raw.specs, raw.id) : undefined,
    trailer: raw.trailer ? mapTrailer(raw.trailer, raw.id) : undefined,
  };
}

// Отримати список всіх авто
export async function fetchCars(): Promise<Car[]> {
  if (USE_MOCK) {
    await mockDelay();
    // as Car[] — явне приведення типу (TypeScript довіряємо що JSON відповідає типу)
    return mockCars as Car[];
  }
  const data = await apiFetch<Paginated<RawCar>>("/cars/");
  return data.results.map(mapCar);
}

// Отримати одне авто по id
export async function fetchCar(id: number): Promise<Car> {
  if (USE_MOCK) {
    await mockDelay();
    const car = (mockCars as Car[]).find(c => c.idCar === id);
    if (!car) throw new Error(`Авто #${id} не знайдено`);
    return car;
  }
  const raw = await apiFetch<RawCar>(`/cars/${id}/`);
  return mapCar(raw);
}
```

---

## Крок 6.4 — Створення src/api/drivers.ts

```typescript
// src/api/drivers.ts
import type { Driver } from "../types";
import { USE_MOCK, mockDelay, apiFetch } from "./config";
import mockDrivers from "../mocks/drivers.json";

interface Paginated<T> {
  results: T[];
}

// DriverSerializer: id, name_driver, phone, car, car_number, car_name, is_active
interface RawDriver {
  id: number;
  name_driver: string;
  phone?: string;
  car: number | null;
  is_active: boolean;
}

function mapDriver(raw: RawDriver): Driver {
  return {
    idDriver: raw.id,
    nameDriver: raw.name_driver,
    phoneDriver: raw.phone || undefined,
    idCar: raw.car ?? null,
    isActive: raw.is_active,
  };
}

export async function fetchDrivers(): Promise<Driver[]> {
  if (USE_MOCK) {
    await mockDelay();
    return mockDrivers as Driver[];
  }
  const data = await apiFetch<Paginated<RawDriver>>("/drivers/");
  return data.results.map(mapDriver);
}

// Поточний водій — визначається бекендом по сесії (Profile.driver, apps/accounts)
export async function fetchCurrentDriver(): Promise<Driver> {
  if (USE_MOCK) {
    await mockDelay(100);
    const driver = (mockDrivers as Driver[]).find(d => d.isActive);
    if (!driver) throw new Error("Водія не знайдено");
    return driver;
  }
  const raw = await apiFetch<RawDriver>("/drivers/me/");
  return mapDriver(raw);
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

> ⚠️ Реальний ендпоінт останнього одометра — `@action(detail=False)` на
> `RouteEventViewSet`, викликається як `?car_id=`-параметр:
> `GET /route-events/last_odometer/?car_id=1`, а НЕ
> `/route-events/{id}/last-odometer/`, як могло б здатись інтуїтивно.

```typescript
// src/api/routeEvents.ts
import type { RouteEvent, RouteEventCreate, RouteEventType, TrackingMode } from "../types";
import { USE_MOCK, mockDelay, apiFetch } from "./config";
import mockEvents from "../mocks/route-events.json";

interface Paginated<T> {
  results: T[];
}

// RouteEventSerializer (fields = "__all__") — snake_case поля моделі
interface RawRouteEvent {
  id: number;
  car: number;
  driver: number;
  tracking_mode: TrackingMode;
  event_type: RouteEventType;
  event_ts: string;
  odometer_km: number | null;
  pallets_count: number | null;
  waybill_number: string;
  waybill_date: string | null;
  customer_name: string;
  rejection_full: boolean | null;
  rejection_product_id: string;
  rejection_qty: string | null;
  rejection_comment: string;
  fuel_liters: string | null;
  fuel_cost_uah: string | null;
  ad_blue_liters: string | null;
  ad_blue_cost_uah: string | null;
  other_costs_uah: string | null;
  other_costs_comment: string;
  return_client_waybill: string;
  extra_from: string;
  extra_to: string;
  extra_weight_kg: string | null;
  extra_waybill: string;
  extra_comment: string;
  notes: string;
  created_at: string;
}

function mapRouteEvent(raw: RawRouteEvent): RouteEvent {
  return {
    id: raw.id,
    carId: raw.car,
    driverId: raw.driver,
    trackingMode: raw.tracking_mode,
    eventType: raw.event_type,
    eventTs: raw.event_ts,
    odometerKm: raw.odometer_km ?? undefined,
    palletsCount: raw.pallets_count ?? undefined,
    waybillNumber: raw.waybill_number || undefined,
    waybillDate: raw.waybill_date || undefined,
    customerName: raw.customer_name || undefined,
    rejection:
      raw.rejection_full !== null && raw.rejection_full !== undefined
        ? {
            isFull: raw.rejection_full,
            productId: raw.rejection_product_id ? Number(raw.rejection_product_id) : undefined,
            quantity: raw.rejection_qty != null ? Number(raw.rejection_qty) : undefined,
            comment: raw.rejection_comment || undefined,
          }
        : undefined,
    fuelLiters: raw.fuel_liters != null ? Number(raw.fuel_liters) : undefined,
    fuelCostUah: raw.fuel_cost_uah != null ? Number(raw.fuel_cost_uah) : undefined,
    adBlueLiters: raw.ad_blue_liters != null ? Number(raw.ad_blue_liters) : undefined,
    adBlueCostUah: raw.ad_blue_cost_uah != null ? Number(raw.ad_blue_cost_uah) : undefined,
    // Увага: TS-поле — otherCostUah (однина), поле моделі — other_costs_uah (множина)
    otherCostUah: raw.other_costs_uah != null ? Number(raw.other_costs_uah) : undefined,
    otherCostComment: raw.other_costs_comment || undefined,
    returnClientWaybill: raw.return_client_waybill || undefined,
    extraFrom: raw.extra_from || undefined,
    extraTo: raw.extra_to || undefined,
    extraWeightKg: raw.extra_weight_kg != null ? Number(raw.extra_weight_kg) : undefined,
    extraWaybill: raw.extra_waybill || undefined,
    extraComment: raw.extra_comment || undefined,
    notes: raw.notes || undefined,
    createdAt: raw.created_at,
  };
}

// Зворотне перетворення — camelCase форма → snake_case тіло POST-запиту
function toRouteEventPayload(data: RouteEventCreate) {
  return {
    car: data.carId,
    driver: data.driverId,
    tracking_mode: data.trackingMode,
    event_type: data.eventType,
    event_ts: data.eventTs,
    odometer_km: data.odometerKm ?? null,
    pallets_count: data.palletsCount ?? null,
    waybill_number: data.waybillNumber ?? "",
    waybill_date: data.waybillDate ?? null,
    customer_name: data.customerName ?? "",
    rejection_full: data.rejection?.isFull ?? null,
    rejection_product_id: data.rejection?.productId != null ? String(data.rejection.productId) : "",
    rejection_qty: data.rejection?.quantity ?? null,
    rejection_comment: data.rejection?.comment ?? "",
    fuel_liters: data.fuelLiters ?? null,
    fuel_cost_uah: data.fuelCostUah ?? null,
    ad_blue_liters: data.adBlueLiters ?? null,
    ad_blue_cost_uah: data.adBlueCostUah ?? null,
    other_costs_uah: data.otherCostUah ?? null,
    other_costs_comment: data.otherCostComment ?? "",
    return_client_waybill: data.returnClientWaybill ?? "",
    extra_from: data.extraFrom ?? "",
    extra_to: data.extraTo ?? "",
    extra_weight_kg: data.extraWeightKg ?? null,
    extra_waybill: data.extraWaybill ?? "",
    extra_comment: data.extraComment ?? "",
    notes: data.notes ?? "",
  };
}

// Поточні події водія за сьогодні
export async function fetchTodayEvents(carId: number): Promise<RouteEvent[]> {
  if (USE_MOCK) {
    await mockDelay(200);
    const today = new Date().toISOString().slice(0, 10);  // "2026-06-29"
    return (mockEvents as RouteEvent[]).filter(
      e => e.carId === carId && e.eventTs.startsWith(today)
    );
  }
  const data = await apiFetch<Paginated<RawRouteEvent>>(`/route-events/?car_id=${carId}&date=today`);
  return data.results.map(mapRouteEvent);
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
  const data = await apiFetch<{ odometer_km: number | null }>(
    `/route-events/last_odometer/?car_id=${carId}`,
  );
  return data.odometer_km;
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
  const raw = await apiFetch<RawRouteEvent>("/route-events/", {
    method: "POST",
    json: toRouteEventPayload(data),
  });
  return mapRouteEvent(raw);
}
```

---

# ═══════════════════════════════════════════════════════════
<a id="faza-7"></a>
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

> ⚠️ Перша версія цього хука мала `useEffect`, який синхронно викликав
> `setState` у тілі ефекту (щоб підхопити зміну `carDefaultMode`, коли
> немає override) — React (`eslint-plugin-react-hooks`) вважає це
> антипатерном: зайвий ре-рендер замість похідного значення. Той самий
> баг був і в `DriverMiniApp.tsx` (Крок 4.5.6 нижче за текстом, вже
> виправлено). Правильно — зберігати в `useState` тільки явний вибір
> водія (`override`), а сам `dayMode` рахувати як `override ?? carDefaultMode`
> щорендеру, без ефекту взагалі.

```typescript
// src/hooks/useDayMode.ts
import { useState } from "react";
import type { TrackingMode } from "../types";

// Зберігає вибір режиму водія у localStorage
// localStorage — сховище браузера яке зберігається між сесіями
// (як cookies але для JS)
export function useDayMode(carDefaultMode: TrackingMode) {
  const today = new Date().toISOString().slice(0, 10);
  // Ключ включає дату — щодня режим скидається до дефолту
  const storageKey = `dayMode:${today}`;

  // Зберігаємо лише ЯВНИЙ вибір водія — немає override → беремо дефолт авто
  const [override, setOverride] = useState<TrackingMode | null>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored === "daily" || stored === "full" ? stored : null;
  });

  // Похідне значення: якщо carDefaultMode зміниться (логіст поміняв авто),
  // а override немає — dayMode підхопить новий дефолт сам, без ефекту
  const dayMode = override ?? carDefaultMode;

  const setDayMode = (mode: TrackingMode) => {
    localStorage.setItem(storageKey, mode);
    setOverride(mode);
  };

  // isOverridden = true якщо водій вибрав інший режим ніж дефолт
  const isOverridden = override !== null && override !== carDefaultMode;

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
<a id="faza-8"></a>
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
<a id="faza-9"></a>
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

> 🎨 Задумувалось як відмінність від `MainLayout` (Крок 9.3, спершу
> світла офісна тема) — `DriverLayout` продовжує темну
> фіолетово-рожеву мову лендінгу (`src/styles/landing.css`, `.landing`),
> бо водій відкриває це у Telegram WebView і бренд має одразу
> впізнаватись. **У реальному коді `MainLayout` пізніше теж перефарбували
> в той самий темний градієнт** (Крок 9.3 нижче показує актуальний
> варіант) — тож зараз відмінність DriverLayout/MainLayout лише в
> компоновці (bottom nav vs sidebar, max-w-md vs full-width), не в
> кольоровій темі. `ui/`-компоненти Фази 8 і досі лишаються світлими й
> нейтральними — вони не використовуються ні в DriverLayout, ні в
> MainLayout, а в сторінках-нащадках `MainLayout` (`WaybillList` тощо).
> Driver-версії кнопок/полів — окремо у Кроці 13 (`components/driver/ui.tsx`).

```typescript
// src/components/layouts/DriverLayout.tsx
import { Outlet, NavLink } from "react-router-dom";

export function DriverLayout() {
  return (
    <div
      className="min-h-screen flex flex-col text-white"
      style={{ background: "linear-gradient(180deg, #2b1330 0%, #0f1724 100%)" }}
    >
      {/* Header — скляна панель поверх градієнта (backdrop-blur) */}
      <header className="sticky top-0 z-10 backdrop-blur-md bg-white/5 border-b border-white/10 px-5 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg flex items-center gap-2">
          <span className="text-xl">🚛</span>
          <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
            Vehicle Tracker
          </span>
        </h1>
        <span className="text-sm text-white/50">
          {new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "long" })}
        </span>
      </header>

      {/* Основний контент */}
      {/* max-w-md — максимальна ширина для мобільного вигляду */}
      {/* mx-auto — центрування на великих екранах */}
      {/* pb-24 — відступ знизу щоб контент не перекривався bottom nav */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 pb-24">
        <Outlet />
      </main>

      {/* Bottom Navigation — скляна панель, активний пункт — акцентний колір */}
      <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-[#0f1724]/90 border-t border-white/10">
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
                `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs transition-colors
                ${isActive ? "text-violet-300 font-semibold" : "text-white/40"}`
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

> Нижче — актуальний варіант (темний градієнт, як у `DriverLayout`).
> Перша версія тут була світлою (`bg-gray-50`/`bg-white`, сині акценти) —
> якщо в тебе в проєкті ще та, звір з файлом і онови на цю.

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
    <div
      className="min-h-screen flex text-white"
      style={{ background: "linear-gradient(180deg, #2b1330 0%, #0f1724 100%)" }}
    >
      {/* Sidebar — тільки на великих екранах (hidden на мобільному) */}
      <aside className="hidden md:flex w-56 backdrop-blur-md bg-white/5 border-r border-white/10 flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
            Vehicle Tracker
          </h1>
          <p className="text-xs text-white/50 mt-0.5">Облік витрат</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                  ? "bg-white/10 text-violet-300 font-medium"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
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

Це sidebar (ліве меню), НЕ верхнє меню — те, що на скріншотах виглядає
"меню зверху", це `TopNav.tsx` (Крок 3.x, лендінг), окремий компонент
для `LandingPage`/`UnderConstruction`, не для сторінок під `MainLayout`.
Детальніше, чому вони досі не з'єднані в одну навігацію — Фаза 14.

---

# ═══════════════════════════════════════════════════════════
<a id="faza-10"></a>
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
<a id="faza-11"></a>
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
<a id="faza-13"></a>
# ФАЗА 13 — DRIVERDASHBOARD (ЕКРАН ВОДІЯ)
# ═══════════════════════════════════════════════════════════

> Реальний "запуск і тестування водіями" — саме ця фаза. До цього
> моменту `/driver-app` (Telegram Mini App, окрема фіча з `TELEGRAM_BOT_SETUP.md`
> у бекенд-репо) вже логінить водія через `initData`, але веде в
> заглушку — ось тут з'являється справжній екран.

## Крок 13.0 — Чого бракує з попередніх фаз

Дві дрібниці, які Фаза 7 і Крок 4.5.6 не покрили, а DriverDashboard
без них не збереться:

1. **`hooks/useDrivers.ts` не існує** — Фаза 7 (Крок 7.3) написала
   тільки `useCars.ts`. Хук на `fetchCurrentDriver()` (Крок 6.4)
   додається окремо, Крок 13.1 нижче.
2. **`DriverMiniApp.tsx` (Крок 4.5.6) після успішного логіну має
   вести саме сюди.** Якщо там зараз заглушка на кшталт
   `Вітаємо, {user}!` — заміни її на `<Navigate to="/driver" replace />`
   з `react-router-dom` (і прибери тепер уже непотрібний `user` з
   деструктуризації `useCurrentUser()`, якщо він більше ніде не
   використовується).

## Крок 13.1 — Доповнення hooks/useDrivers.ts

```typescript
// src/hooks/useDrivers.ts
import { useQuery } from "@tanstack/react-query";
import { fetchCurrentDriver } from "../api/drivers";

export function useCurrentDriver() {
  return useQuery({ queryKey: ["drivers", "me"], queryFn: fetchCurrentDriver });
}
```

---

## Крок 13.2 — Driver-версії UI-компонентів

`ui/Button.tsx`, `ui/Input.tsx` тощо (Фаза 8) лишаються світлими й
нейтральними — вони ще знадобляться офісним сторінкам (`MainLayout`,
Крок 9.3, Фаза 11+). Екран водія візуально інший (темний
фіолетово-рожевий градієнт лендінгу, Крок 9.2) — тому для нього окремий,
маленький набір driver-стилізованих версій тих самих примітивів, в
одному файлі (тільки те, що реально потрібно DriverDashboard/EventForm):

```typescript
// src/components/driver/ui.tsx
import type { ReactNode } from "react";

// ── Button ──────────────────────────────────────────────
const variantClasses = {
  primary:
    "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 active:scale-[0.98]",
  ghost: "text-white/70 hover:bg-white/5 hover:text-white active:scale-[0.98]",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantClasses;
  isLoading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = "primary",
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
        inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm
        rounded-xl font-semibold transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantClasses[variant]} ${className}
      `.trim()}
      {...rest}
    >
      {isLoading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// ── Input ───────────────────────────────────────────────
// Той самий .field-wrap патерн, що й у AuthModal (landing.css),
// перенесений у Tailwind: rgba(255,255,255,.05) фон, тонка світла рамка.
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export function Input({ label, error, helpText, id, className = "", ...rest }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-white/70">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full rounded-xl px-4 py-3 text-sm text-white bg-white/5 border transition-colors
          placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40
          ${error ? "border-rose-400/60 bg-rose-500/5" : "border-white/10 focus:border-violet-400/60"}
          ${className}
        `.trim()}
        {...rest}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
      {helpText && !error && <p className="text-xs text-white/40">{helpText}</p>}
    </div>
  );
}

// ── Spinner ─────────────────────────────────────────────
export function Spinner({ size = "md", label = "Завантаження..." }: { size?: "sm" | "md" | "lg"; label?: string }) {
  const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-6">
      <svg className={`animate-spin text-violet-400 ${sizeClasses[size]}`} viewBox="0 0 24 24" fill="none" aria-label={label}>
        <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      {label && <span className="text-sm text-white/40">{label}</span>}
    </div>
  );
}

// ── EmptyState ──────────────────────────────────────────
export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl bg-white/[0.03] border border-white/5">
      <div className="text-5xl mb-4 opacity-80">📭</div>
      <h3 className="text-base font-semibold text-white/90">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-white/40 max-w-xs">{subtitle}</p>}
    </div>
  );
}

// ── ErrorBanner ─────────────────────────────────────────
export function ErrorBanner({ message = "Сталася помилка. Спробуйте ще раз." }: { message?: string }) {
  return (
    <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start gap-3">
      <span className="text-rose-400 text-xl">⚠️</span>
      <p className="text-sm text-rose-200">{message}</p>
    </div>
  );
}
```

---

## Крок 13.3 — Створення components/driver/DayModeSwitch.tsx

```typescript
// src/components/driver/DayModeSwitch.tsx
import type { TrackingMode } from "../../types";

interface Props {
  mode: TrackingMode;
  onChange: (mode: TrackingMode) => void;
  isOverridden: boolean;
}

export function DayModeSwitch({ mode, onChange, isOverridden }: Props) {
  return (
    <div>
      <div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1">
        {(["daily", "full"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              mode === m
                ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/25"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {m === "daily" ? "Щоденний" : "Повний"}
          </button>
        ))}
      </div>
      {isOverridden && (
        <p className="mt-2 text-xs text-amber-300/80">⚡ Змінено вручну на сьогодні</p>
      )}
    </div>
  );
}
```

---

## Крок 13.4 — Створення pages/driver/DriverDashboard.tsx

```typescript
// src/pages/driver/DriverDashboard.tsx
import { useNavigate } from "react-router-dom";
import { useCurrentDriver } from "../../hooks/useDrivers";
import { useCar } from "../../hooks/useCars";
import { useTodayEvents, useLastOdometer } from "../../hooks/useRouteEvents";
import { useDayMode } from "../../hooks/useDayMode";
import { getAvailableEventTypes, eventTypeLabel, eventTypeIcon, eventTypeGradient } from "../../utils/eventHelpers";
import { formatKm, formatDateTime } from "../../utils/formatters";
import { Spinner, ErrorBanner, EmptyState } from "../../components/driver/ui";
import { DayModeSwitch } from "../../components/driver/DayModeSwitch";

export function DriverDashboard() {
  const navigate = useNavigate();
  const { data: driver, isLoading: driverLoading, error: driverError } = useCurrentDriver();
  const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
  const { dayMode, setDayMode, isOverridden } = useDayMode(car?.defaultTrackingMode ?? "daily");
  const { data: events, isLoading: eventsLoading } = useTodayEvents(car?.idCar ?? 0);
  const { data: lastOdometer } = useLastOdometer(car?.idCar ?? 0);

  if (driverLoading || carLoading) return <Spinner label="Завантаження даних водія..." />;
  if (driverError) return <ErrorBanner message="Не вдалось завантажити дані водія" />;
  if (!driver || !car) {
    return <EmptyState title="Авто не закріплене" subtitle="Зверніться до диспетчера, щоб прив'язати вас до авто" />;
  }

  const availableTypes = getAvailableEventTypes(dayMode);

  return (
    <div className="flex flex-col gap-6">
      {/* Картка авто — glass-панель у стилі лендінгу */}
      <div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl shrink-0">
            🚐
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{car.nameCar}</h2>
            <p className="text-sm text-white/50">{car.numberCar}</p>
          </div>
        </div>
        {lastOdometer != null && (
          <p className="mt-3 text-xs text-white/40">
            Останній одометр: <span className="text-white/70">{formatKm(lastOdometer)}</span>
          </p>
        )}
      </div>

      <DayModeSwitch mode={dayMode} onChange={setDayMode} isOverridden={isOverridden} />

      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3 tracking-wide uppercase">Нова подія</h3>
        <div className="grid grid-cols-2 gap-3">
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => navigate(`/driver/event/new?type=${type}`)}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${eventTypeGradient(type)} flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110`}>
                {eventTypeIcon(type)}
              </div>
              <span className="text-xs font-medium text-white/80 text-center px-1">{eventTypeLabel(type)}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-white/60 mb-3 tracking-wide uppercase">Події сьогодні</h3>
        {eventsLoading ? (
          <Spinner size="sm" label="" />
        ) : !events || events.length === 0 ? (
          <EmptyState title="Ще немає подій" subtitle="Натисніть кнопку вище, щоб додати першу" />
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((e) => (
              <li key={e.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <div className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${eventTypeGradient(e.eventType)} flex items-center justify-center text-base`}>
                  {eventTypeIcon(e.eventType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/90">{eventTypeLabel(e.eventType)}</p>
                  <p className="text-xs text-white/40">{formatDateTime(e.eventTs)}</p>
                </div>
                {e.odometerKm != null && <span className="text-xs text-white/50 shrink-0">{formatKm(e.odometerKm)}</span>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
```

---

## Крок 13.5 — Створення pages/driver/EventForm.tsx

`eventHelpers.ts` (Крок 5.3) уже каже, які поля показувати для якого
типу події (`requiresOdometer`/`requiresWaybill`/`requiresPallets`) —
`EventForm` просто читає ці прапорці й рендерить потрібні `Input`.
Тип події приходить з URL (`?type=refuel`), яку задає кнопка на
`DriverDashboard`.

```typescript
// src/pages/driver/EventForm.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RouteEventType, RouteEventCreate } from "../../types";
import { useCurrentDriver } from "../../hooks/useDrivers";
import { useCar } from "../../hooks/useCars";
import { useDayMode } from "../../hooks/useDayMode";
import { useCreateRouteEvent, useLastOdometer } from "../../hooks/useRouteEvents";
import { requiresOdometer, requiresWaybill, requiresPallets, eventTypeLabel, eventTypeIcon, eventTypeGradient } from "../../utils/eventHelpers";
import { Input, Button, ErrorBanner, Spinner } from "../../components/driver/ui";

export function EventForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const type = (searchParams.get("type") ?? "other_cost") as RouteEventType;

  const { data: driver, isLoading: driverLoading } = useCurrentDriver();
  const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
  const { dayMode } = useDayMode(car?.defaultTrackingMode ?? "daily");
  const { data: lastOdometer } = useLastOdometer(car?.idCar ?? 0);
  const createEvent = useCreateRouteEvent();

  const [odometerKm, setOdometerKm] = useState("");
  const [palletsCount, setPalletsCount] = useState("");
  const [waybillNumber, setWaybillNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [fuelLiters, setFuelLiters] = useState("");
  const [fuelCostUah, setFuelCostUah] = useState("");
  const [otherCostUah, setOtherCostUah] = useState("");
  const [otherCostComment, setOtherCostComment] = useState("");
  const [returnClientWaybill, setReturnClientWaybill] = useState("");
  const [extraFrom, setExtraFrom] = useState("");
  const [extraTo, setExtraTo] = useState("");
  const [extraWeightKg, setExtraWeightKg] = useState("");
  const [notes, setNotes] = useState("");

  if (driverLoading || carLoading) return <Spinner label="Завантаження..." />;
  if (!driver || !car) return <ErrorBanner message="Немає закріпленого авто" />;

  const needsOdometer = requiresOdometer(type);
  const needsWaybill = requiresWaybill(type);
  const needsPallets = requiresPallets(type, dayMode);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const data: RouteEventCreate = {
      carId: car!.idCar,
      driverId: driver!.idDriver,
      trackingMode: dayMode,
      eventType: type,
      eventTs: new Date().toISOString(),
      odometerKm: needsOdometer && odometerKm ? Number(odometerKm) : undefined,
      palletsCount: needsPallets && palletsCount ? Number(palletsCount) : undefined,
      waybillNumber: needsWaybill ? waybillNumber : undefined,
      customerName: needsWaybill ? customerName : undefined,
      fuelLiters: type === "refuel" && fuelLiters ? Number(fuelLiters) : undefined,
      fuelCostUah: type === "refuel" && fuelCostUah ? Number(fuelCostUah) : undefined,
      otherCostUah: type === "other_cost" && otherCostUah ? Number(otherCostUah) : undefined,
      otherCostComment: type === "other_cost" ? otherCostComment : undefined,
      returnClientWaybill: type === "return_goods" ? returnClientWaybill : undefined,
      extraFrom: type === "extra_cargo" ? extraFrom : undefined,
      extraTo: type === "extra_cargo" ? extraTo : undefined,
      extraWeightKg: type === "extra_cargo" && extraWeightKg ? Number(extraWeightKg) : undefined,
      notes: notes || undefined,
    };

    await createEvent.mutateAsync(data);
    navigate("/driver");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-3 mb-1">
        <div className={`h-12 w-12 rounded-full bg-gradient-to-br ${eventTypeGradient(type)} flex items-center justify-center text-2xl shadow-lg`}>
          {eventTypeIcon(type)}
        </div>
        <h2 className="text-lg font-bold text-white">{eventTypeLabel(type)}</h2>
      </div>

      {needsOdometer && (
        <Input
          label="Одометр (км)"
          type="number"
          value={odometerKm}
          onChange={(e) => setOdometerKm(e.target.value)}
          helpText={lastOdometer != null ? `Останній: ${lastOdometer} км` : undefined}
          required
        />
      )}

      {needsPallets && (
        <Input label="Кількість палет" type="number" value={palletsCount} onChange={(e) => setPalletsCount(e.target.value)} />
      )}

      {needsWaybill && (
        <>
          <Input label="Номер накладної" value={waybillNumber} onChange={(e) => setWaybillNumber(e.target.value)} required />
          <Input label="Клієнт" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </>
      )}

      {type === "refuel" && (
        <>
          <Input label="Літрів" type="number" step="0.1" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} required />
          <Input label="Сума (грн)" type="number" step="0.01" value={fuelCostUah} onChange={(e) => setFuelCostUah(e.target.value)} required />
        </>
      )}

      {type === "other_cost" && (
        <>
          <Input label="Сума (грн)" type="number" step="0.01" value={otherCostUah} onChange={(e) => setOtherCostUah(e.target.value)} required />
          <Input label="Коментар" value={otherCostComment} onChange={(e) => setOtherCostComment(e.target.value)} />
        </>
      )}

      {type === "return_goods" && (
        <Input label="Накладна клієнта (повернення)" value={returnClientWaybill} onChange={(e) => setReturnClientWaybill(e.target.value)} />
      )}

      {type === "extra_cargo" && (
        <>
          <Input label="Звідки" value={extraFrom} onChange={(e) => setExtraFrom(e.target.value)} />
          <Input label="Куди" value={extraTo} onChange={(e) => setExtraTo(e.target.value)} />
          <Input label="Вага (кг)" type="number" value={extraWeightKg} onChange={(e) => setExtraWeightKg(e.target.value)} />
        </>
      )}

      <Input label="Нотатки" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {createEvent.isError && <ErrorBanner message={(createEvent.error as Error).message} />}

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="ghost" onClick={() => navigate("/driver")}>
          Скасувати
        </Button>
        <Button type="submit" isLoading={createEvent.isPending} className="flex-1">
          Зберегти
        </Button>
      </div>
    </form>
  );
}
```

---

## Крок 13.6 — Підключення до App.tsx

Створи `src/pages/PlaceholderPage.tsx`, якщо ще не робив цього в
Фазі 10 (той самий компонент, використовується і тут для `/driver/scan`
і `/driver/history` — Історія це Фаза 15, ще попереду).

> ⚠️ **Виправлено пост-фактум (Фаза 15.5):** `/driver/scan` як окремий
> екран так і не зʼявився — коли дійшло до QR-сканера, дизайн змінився
> (сканер вбудували прямо в `EventForm`, не окремою вкладкою). Цей
> маршрут і пункт "Сканер" у нижній навігації (Фаза 9, Крок 9.х) пізніше
> прибрані — див. Крок 15.5.

Заміни блок `/driver` у `src/App.tsx` — з flat-маршруту на вкладені
routes через `DriverLayout`:

```typescript
// src/App.tsx — фрагмент, що змінюється
import { DriverLayout } from "./components/layouts/DriverLayout";
import { DriverDashboard } from "./pages/driver/DriverDashboard";
import { EventForm } from "./pages/driver/EventForm";
import { PlaceholderPage } from "./pages/PlaceholderPage";

// ...

{/* Водій (мобільний екран) */}
<Route path="/driver" element={<DriverLayout />}>
  <Route index element={<DriverDashboard />} />
  <Route path="event/new" element={<EventForm />} />
  <Route path="scan" element={<PlaceholderPage title="Сканер QR" />} />
  <Route path="history" element={<PlaceholderPage title="Історія" />} />
</Route>

{/* Telegram Mini App — логінить через initData, далі веде в /driver (Крок 13.0) */}
<Route path="/driver-app" element={<DriverMiniApp />} />
```

> ⚠️ **Розходження з фактичним кодом:** ідея цього кроку була лишити
> `/` на `LandingPage` (сайт обслуговує і водіїв, і офіс/маркетинг,
> лендінг мав лишатись коренем) — але в реальному `App.tsx` `/` досі
> `<Navigate to="/driver" replace />` зі старої Фази 10, і його ніхто не
> повернув на `LandingPage`. Через це `LandingPage`/`TopNav`/`AuthModal`
> зараз "осиротілі" — код є, жоден route на них не веде. Не виправляй
> це тут вручну — Фаза 14 (нижче) робить це правильно одразу з
> рольовим редиректом (не просто "`/` = LandingPage", а
> "неавторизований → LandingPage, водій → `/driver`, логіст/менеджер/head
> → `/fleet`"), заодно прибирає дублікат `<Route path="/driver-app">`
> (у поточному `App.tsx` він задекларований ДВІЧІ — лишиться один).

---

## Крок 13.7 — Перевірка

```bash
npm run dev
```

Із `VITE_USE_MOCK=false` і робочим бекендом (`python manage.py runserver`,
`apps/cars` API з Фази 6-7 `DJANGO_CODING_GUIDE.md`):

1. Залогинься звичайною формою (`/`, кнопка "Вхід") користувачем, чий
   `Profile.driver` прив'язаний до картки водія в Django Admin.
2. Перейди на `/driver` — має завантажитись картка авто, перемикач
   режиму і кнопки типів подій (5 у `daily`, 8 у `full`).
3. Натисни будь-яку кнопку — відкриється `EventForm` із правильним
   набором полів для цього типу (одометр не питається для `refuel`,
   накладна питається тільки для `delivery` тощо).
4. Заповни й натисни "Зберегти" — має редиректнути назад на `/driver`,
   і нова подія має з'явитись у списку "Події сьогодні".
5. Перевір у Django Admin (`/admin/cars/routeevent/`) — рядок реально
   створився з правильними `car`/`driver`/полями.

Якщо все спрацювало — наступний крок: реальний Telegram-бот
(`TELEGRAM_BOT_SETUP.md` у бекенд-репо) відкриє саме цей екран, а не
заглушку.

---

# ═══════════════════════════════════════════════════════════
<a id="faza-14"></a>
# ФАЗА 14 — РОЛЬОВА МАРШРУТИЗАЦІЯ
# ═══════════════════════════════════════════════════════════

> Навіщо: зараз `/` жорстко веде на `/driver` (Крок 10.3), а
> `LandingPage`/`TopNav`/`AuthModal` — код є, але жоден route на нього
> не веде (Крок 13.6). Через це водій і логіст/офіс бачать одну й ту
> саму точку входу лише випадково — сайт відкривається одразу мобільним
> екраном водія, навіть для тих, хто заходить з десктопу як логіст.
> Ця фаза не "зливає" `DriverLayout` і `MainLayout` в одну навігацію —
> вони навмисно різні (мобільний Telegram Mini App vs офісний
> desktop-застосунок, різна аудиторія й контекст використання). Замість
> цього вона: (а) повертає `LandingPage` на `/` як спільну точку входу,
> (б) після логіну кожен потрапляє одразу у СВІЙ layout за роллю, без
> ручного переходу, (в) закриває сторінки від чужих ролей — не лише в
> UI (Крок 15 у "Що далі" вже це робить для `/panel`), а системно для
> всіх маршрутів.

## Крок 14.1 — RequireRole

Компонент-охоронець route — не пускає далі, якщо роль користувача не
підходить. Створи `src/components/auth/RequireRole.tsx`:

```typescript
// src/components/auth/RequireRole.tsx
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../../hocks/useCurrentUser";
import type { UserProfile } from "../../api/auth";

interface RequireRoleProps {
  roles: UserProfile["role"][];
  children: ReactNode;
}

export function RequireRole({ roles, children }: RequireRoleProps) {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div className="p-8 text-center text-white/40">Завантаження…</div>;
  }
  // Не залогинений — на лендінг, а не на 404
  if (!user) {
    return <Navigate to="/" replace />;
  }
  if (!user.profile || !roles.includes(user.profile.role)) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-white">Доступ заборонено</h2>
        <p className="mt-2 text-white/50">
          Ваша роль ({user.profile?.role ?? "невідома"}) не має доступу
          до цієї сторінки.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
```

> ⚠️ Це UX-гейт (сховати сторінку, показати повідомлення), НЕ заміна
> реального захисту — справжня перевірка ролі завжди на бекенді
> (`DJANGO_CODING_GUIDE.md`, Фаза 9.2: `IsManagerOrHead`/`IsLogistOrAbove`
> на запис). Той самий принцип уже сформульований у "Що далі" → Крок 15.

---

## Крок 14.2 — RoleRedirect для `/`

`/` більше не жорсткий `Navigate`, а компонент, що вирішує куди вести
залежно від стану авторизації:

```typescript
// src/pages/RoleRedirect.tsx
import { Navigate } from "react-router-dom";
import { useCurrentUser } from "../hocks/useCurrentUser";
import { LandingPage } from "./LandingPage";

export function RoleRedirect() {
  const { user, isLoading } = useCurrentUser();

  if (isLoading) return null;
  if (!user) return <LandingPage />;

  // Водій — одразу в мобільний екран; решта ролей — в офісний застосунок
  return user.profile?.role === "driver"
    ? <Navigate to="/driver" replace />
    : <Navigate to="/fleet" replace />;
}
```

---

## Крок 14.3 — Підключення в App.tsx

Онови `src/App.tsx`: заміни `<Route path="/" ...>` і обгорни `/driver`
та офісні маршрути в `RequireRole`. Заодно прибери дублікат
`<Route path="/driver-app">` — у поточному коді він задекларований
двічі (Крок 13.6):

```typescript
// src/App.tsx — фрагмент
import { RequireRole } from "./components/auth/RequireRole";
import { RoleRedirect } from "./pages/RoleRedirect";

// ...

<Route path="/" element={<RoleRedirect />} />

{/* Водій — мобільний, лишається доступним і для head (тестування/підтримка) */}
<Route
  path="/driver"
  element={
    <RequireRole roles={["driver", "head"]}>
      <DriverLayout />
    </RequireRole>
  }
>
  <Route index element={<DriverDashboard />} />
  <Route path="event/new" element={<EventForm />} />
  <Route path="scan" element={<PlaceholderPage title="Сканер QR" />} />
  <Route path="history" element={<PlaceholderPage title="Історія" />} />
</Route>

{/* Офісні розділи — logist/manager/head, той самий гейт на кожен */}
<Route
  path="/fleet"
  element={
    <RequireRole roles={["logist", "manager", "head"]}>
      <MainLayout />
    </RequireRole>
  }
>
  <Route index element={<PlaceholderPage title="Автопарк" />} />
  <Route path=":carId" element={<PlaceholderPage title="Деталі авто" />} />
</Route>
{/* /waybills, /hired, /carriers, /analytics, /admin — та сама обгортка RequireRole */}

{/* Telegram Mini App — залишається ЄДИНИМ маршрутом, без RequireRole
    (сам логінить через initData ще до того, як роль відома) */}
<Route path="/driver-app" element={<DriverMiniApp />} />
```

---

## Крок 14.4 — Перевірка

```bash
npm run dev
```

1. Розлогинений → `/` показує `LandingPage` (не мобільний екран водія).
2. Логін користувачем з `role="driver"` → редирект на `/driver`.
3. Логін користувачем з `role="logist"` (або `manager`/`head`) →
   редирект на `/fleet`.
4. Спроба відкрити `/driver` під логістом напряму в адресному рядку →
   "Доступ заборонено" (логіст в списку `roles` для `/driver` не
   значиться — якщо треба інакше, онач список ролей у Кроці 14.3).
5. Спроба відкрити `/fleet` водієм → так само заборонено.

---

# ═══════════════════════════════════════════════════════════
<a id="faza-15"></a>
# ФАЗА 15 — QR-СКАНЕР НАКЛАДНИХ ДЛЯ ВОДІЯ
# ═══════════════════════════════════════════════════════════

> Навіщо: `parseQRCode()` (`src/utils/parseQR.ts`, Фаза 5) вже вміє
> розпізнати текст QR-коду накладної (формати ESP/OPT/Rubin:
> `"номер:ДД.ММ.РР"`, плюс запасний JSON) у `{waybillNumber, waybillDate}`.
> `html5-qrcode` вже стоїть у `package.json` (Фаза 1). Не вистачає лише
> одного — компонента камери, який зчитує кадр і віддає сирий текст у
> `parseQRCode`. Ніякого нового бекенд-функціоналу це не потребує
> (`DJANGO_CODING_GUIDE.md`, Крок 10.4) — форма `EventForm` уже
> відправляє `waybillNumber`/`waybillDate` в `POST /api/route-events/`,
> сканер лише позбавляє водія ручного набору цих двох полів.

## Крок 15.1 — Компонент QRScanner

```typescript
// src/components/driver/QRScanner.tsx
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface QRScannerProps {
  onScan: (rawValue: string) => void;
  onClose: () => void;
  notice?: string | null; // напр. "цю накладну вже відскановано" — показується поверх камери
}

const CONTAINER_ID = "qr-reader";

export function QRScanner({ onScan, onClose, notice }: QRScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scanner = new Html5Qrcode(CONTAINER_ID);
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: "environment" },  // задня камера
        { fps: 10, qrbox: 250 },
        (decodedText) => onScan(decodedText),
        () => {}, // помилки розпізнавання окремого кадру — норма, ігноруємо
      )
      .catch(() => setError("Не вдалося увімкнути камеру — перевір дозвіл у браузері"));

    // Cleanup — зупиняємо камеру при закритті/розмонтуванні компонента,
    // інакше вона лишиться увімкненою у фоні
    return () => {
      scannerRef.current?.stop().catch(() => {});
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
      <div id={CONTAINER_ID} className="w-full max-w-sm rounded-xl overflow-hidden" />
      {error && <p className="text-red-300 text-sm mt-3 text-center">{error}</p>}
      {notice && <p className="text-amber-300 text-sm mt-3 text-center">{notice}</p>}
      <button
        onClick={onClose}
        className="mt-5 px-4 py-2 text-sm text-white/70 underline underline-offset-4"
      >
        Закрити
      </button>
    </div>
  );
}
```

> Мульти-скан (з "Що далі" у старій версії гайду — камера не
> закривається після скану) свідомо НЕ тут: у `EventForm` один скан =
> одна накладна на подію `delivery`, і закриття сканера одразу після
> успішного розпізнавання (Крок 15.2) — очікуваніша поведінка. Якщо
> згодом з'явиться окремий екран "відсканувати пачку накладних одразу"
> (наприклад, приймання на складі) — `onScan` тут не викликає `stop()`
> сам, тому компонент і без змін підтримає виклик `onScan` кілька разів
> поспіль, просто екран, що його використовує, не повинен закривати
> `QRScanner` після першого спрацювання.
>
> ✅ **Резинхронізовано 2026-08-27** (тестування з водієм): додано
> `notice` — саме цей механізм "не закривати камеру" тепер реально
> використовується в `EventForm` (Крок 15.2) для попередження про
> дублікат накладної, а не лише теоретична можливість з нотатки вище.

---

## Крок 15.2 — Підключення в EventForm

> ✅ **Резинхронізовано 2026-08-27** — після першого тесту з водієм
> зʼясувалось, що camera-first UX і захист від дублю важливіші за
> "кнопка → сканер → форма": (1) камера має відкриватись ОДРАЗУ при
> вході на екран `delivery` (не за кнопкою) — форма зʼявляється лише
> після скану; (2) та сама накладна не може потрапити в систему двічі
> за день. Код нижче — вже фінальна версія з цим урахуванням, не
> перший прохід.

У `src/pages/driver/EventForm.tsx`:

```typescript
// src/pages/driver/EventForm.tsx — доповнення
import { useState } from "react";
import { QRScanner } from "../../components/driver/QRScanner";
import { parseQRCode } from "../../utils/parseQR";
import { useTodayEvents } from "../../hocks/useRouteEvents";

// needsWaybill залежить лише від type (searchParams) — відомо одразу,
// ще ДО завантаження driver/car, тому можна ним ініціалізувати useState
const needsWaybill = requiresWaybill(type);

// ... всередині компонента, поруч з іншими useState:
const { data: todayEvents } = useTodayEvents(car?.idCar ?? 0);
// Камера відкривається одразу, якщо тип вимагає накладну —
// водій спершу сканує, форма з'являється вже з підтягнутим номером
const [scannerOpen, setScannerOpen] = useState(needsWaybill);
const [scanError, setScanError] = useState<string | null>(null);

// Та сама накладна не може бути відскановано двічі за день
function isAlreadyScannedToday(num: string): boolean {
  return todayEvents?.some(e => e.waybillNumber === num) ?? false;
}

function handleScan(raw: string) {
  const parsed = parseQRCode(raw);
  if (!parsed) return;

  if (type === "return_goods") {
    setReturnClientWaybill(parsed.waybillNumber);
    setScannerOpen(false);
  } else if (type === "extra_cargo") {
    setExtraWaybill(parsed.waybillNumber);
    setScannerOpen(false);
  } else {
    // delivery — єдиний тип, якому потрібна ще й дата накладної
    if (isAlreadyScannedToday(parsed.waybillNumber)) {
      setScanError(`Накладну №${parsed.waybillNumber} вже відскановано сьогодні — спробуйте іншу`);
      return; // НЕ закриваємо камеру — водій одразу сканує правильну накладну
    }
    setScanError(null);
    setWaybillNumber(parsed.waybillNumber);
    setWaybillDate(parsed.waybillDate);
    setScannerOpen(false);
  }
}

async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  // Та сама перевірка ще раз — на випадок ручного редагування номера
  if (needsWaybill && isAlreadyScannedToday(waybillNumber)) {
    setScanError(`Накладну №${waybillNumber} вже відскановано сьогодні — спробуйте іншу`);
    return;
  }
  // ...решта handleSubmit без змін
}

// ... у розмітці:
{needsWaybill && (
  <>
    {/* Кнопка повторного сканування прихована після успішного скану —
        одна накладна на подію, без можливості випадково передублювати */}
    {!waybillNumber && (
      <Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
        📷 Сканувати QR накладної
      </Button>
    )}
    <Input label="Номер накладної" value={waybillNumber} onChange={(e) => setWaybillNumber(e.target.value)} required />
    <Input label="Клієнт" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
    {scanError && <ErrorBanner message={scanError} />}
  </>
)}

{scannerOpen && <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} notice={scanError} />}
```

Поле "Номер накладної" лишається редагованим вручну й після скану —
якщо `parseQRCode` не розпізнав формат (повертає `null` при "чужому"
QR) або камера взагалі не запустилась (`error` в `QRScanner`), водій
вводить номер сам.

---

## Крок 15.3 — Реальна /driver/history

Зараз `/driver/history` — заглушка. Потрібен ще один спосіб дістати
події водія: усі за весь час (не лише "сьогодні", як `fetchTodayEvents`).
Додай у `src/api/routeEvents.ts`:

```typescript
// src/api/routeEvents.ts — новий експорт поруч з fetchTodayEvents
export async function fetchDriverEvents(carId: number): Promise<RouteEvent[]> {
  if (USE_MOCK) {
    await mockDelay(200);
    return (mockEvents as RouteEvent[])
      .filter(e => e.carId === carId)
      .sort((a, b) => b.eventTs.localeCompare(a.eventTs)); // нові зверху
  }
  const data = await apiFetch<Paginated<RawRouteEvent>>(`/route-events/?car_id=${carId}`);
  return data.results.map(mapRouteEvent).sort((a, b) => b.eventTs.localeCompare(a.eventTs));
}
```

Хук у `src/hocks/useRouteEvents.ts`:

```typescript
export function useDriverEvents(carId: number) {
  return useQuery({
    queryKey: ["route-events", carId, "all"],
    queryFn: () => fetchDriverEvents(carId),
    enabled: !!carId,
  });
}
```

Сторінка `src/pages/driver/DriverHistory.tsx` — та сама структура
списку подій, що вже є в `DriverDashboard` ("Події сьогодні"), лише
без фільтра по даті:

```typescript
// src/pages/driver/DriverHistory.tsx
import { useNavigate } from "react-router-dom";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useDriverEvents } from "../../hocks/useRouteEvents";
import { eventTypeLabel, eventTypeIcon, eventTypeGradient, eventSummaryBadges, eventComment, inferDeliveryStage } from "../../utils/eventHelpers";
import { formatDateTime } from "../../utils/formatters";
import { Spinner, EmptyState, ErrorBanner } from "../../components/driver/ui";

export function DriverHistory() {
  const navigate = useNavigate();
  const { data: driver, isLoading: driverLoading } = useCurrentDriver();
  const { data: car } = useCar(driver?.idCar ?? 0);
  const { data: events, isLoading, isError } = useDriverEvents(car?.idCar ?? 0);

  if (driverLoading || isLoading) return <Spinner label="Завантаження історії..." />;
  if (isError) return <ErrorBanner message="Не вдалось завантажити історію" />;
  if (!events || events.length === 0) {
    return <EmptyState title="Подій ще немає" subtitle="Зареєстровані події з'являться тут" />;
  }

  return (
    <ul className="flex flex-col gap-2">
      {events.map((e) => {
        const badges = eventSummaryBadges(e);
        const comment = eventComment(e);
        return (
          <li
            key={e.id}
            onClick={() => navigate(`/driver/event/${e.id}`)}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm cursor-pointer transition-colors hover:bg-white/10 active:scale-[0.99]"
          >
            <div className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${eventTypeGradient(e.eventType)} flex items-center justify-center text-base`}>
              {eventTypeIcon(e.eventType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/90">{eventTypeLabel(e.eventType, e.trackingMode, inferDeliveryStage(e))}</p>
              {comment && <p className="text-xs text-white/40 truncate">💬 {comment}</p>}
              <p className="text-xs text-white/40">{formatDateTime(e.eventTs)}</p>
            </div>
            {badges.length > 0 && (
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                {badges.map((b, i) => <span key={i} className="text-xs text-white/50">{b}</span>)}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
```

> ✅ **Резинхронізовано 2026-08-27** — права колонка більше не показує
> лише одометр, а `eventSummaryBadges()` (Крок 15.5): одометр, номер
> накладної, номер накладної повернення, літри, грн, кг — залежно від
> того, які поля заповнені на конкретній події. Під назвою також
> зʼявився коментар водія (`eventComment()`), тому "Повернення товару"
> зі сканом і коментарем видно в списку, а не лише іконка з часом.
> `eventTypeLabel` тепер приймає другим аргументом `trackingMode` події —
> без нього `delivery` завжди підписувався б "Вивантаження", навіть для
> daily-запису, де це просто скан накладної.
>
> ⚠️ **Резинхронізовано 2026-08-28** — рядки тепер клікабельні
> (`onClick` → `/driver/event/:id`), відкривають нову сторінку деталей
> події з можливістю видалення/додавання накладних — Фаза 17 нижче.
> `inferDeliveryStage(e)` додано третім аргументом `eventTypeLabel`, щоб
> історичні записи в цьому списку теж підписувались "Скан накладної"
> vs "Вивантаження" коректно (раніше цей аргумент тут пропускали, хоч
> `DriverDashboard` уже його передавав).

У `App.tsx` заміни `<Route path="history" element={<PlaceholderPage .../>} />`
на `<Route path="history" element={<DriverHistory />} />`.

---

## Крок 15.4 — Перевірка

1. `npm run dev`, зайди на `/driver`, натисни тип події "Доставка".
2. Камера відкривається одразу (без проміжної кнопки) — браузер
   попросить дозвіл.
3. Наведи на QR у форматі `"12345:15.03.26"` (або згенеруй тестовий
   QR із таким текстом) — номер і дата мають підставитись у поля,
   сканер закриється, зʼявиться форма.
4. Спробуй ще раз відсканувати ТУ Ж САМУ накладну (нову подію того ж
   дня) — камера має лишитись відкритою з попередженням "вже
   відскановано сьогодні", а не мовчки прийняти дублікат.
5. Збережи подію, перейди на "Історія" (bottom nav) — подія має бути
   в списку, найновіші зверху, з номером накладної справа.

---

## Крок 15.5 — Розмежування daily/full для `delivery`, блокування "Старт зі складу"

> Навіщо: перший реальний тест із водієм (2026-08-27, режим `daily`)
> показав, що `delivery` не може поводитись однаково в обох режимах.
> За планом (`01_PROJECT_OVERVIEW.md`, розділ 4): у `daily` це просто
> "скан накладної поточного дня" без одометра/палет (вони вже разово
> зафіксовані в `depot_start`), а в `full` — повноцінна точка
> вивантаження з одометром і палетами. Спроба зробити один спільний
> `delivery`-екран без урахування режиму змушувала водія вводити
> одометр там, де це не мало сенсу. Заразом виявилось, що ніщо не
> заважало натиснути "Старт зі складу" кілька разів за день.

`src/utils/eventHelpers.ts` — `requiresOdometer` і `eventTypeLabel`
тепер беруть режим до уваги:

```typescript
// daily delivery = скан накладної без одометра (одометр вже є в depot_start);
// full delivery = одометр обов'язково (пробіг/час між точками)
export function requiresOdometer(type: RouteEventType, mode: TrackingMode): boolean {
  if (["refuel", "other_cost", "return_goods", "extra_cargo"].includes(type)) return false;
  if (type === "delivery") return mode === "full";
  return true;
}

// daily-режим: "delivery" — лише скан накладної (без прив'язки до
// фізичної точки вивантаження), тому назва інша, ніж у full-режимі
export function eventTypeLabel(type: RouteEventType, mode?: TrackingMode): string {
  if (type === "delivery" && mode === "daily") return "Скан накладної";
  const labels: Record<RouteEventType, string> = { /* ...без змін... */ };
  return labels[type];
}

// Права колонка карток історії/сьогоднішніх подій — компактні бейджі,
// побудовані з наявності полів, а не switch по типу
export function eventSummaryBadges(e: RouteEvent): string[] {
  const badges: string[] = [];
  if (e.odometerKm != null) badges.push(formatKm(e.odometerKm));
  if (e.waybillNumber) badges.push(`№ ${e.waybillNumber}`);
  if (e.returnClientWaybill) badges.push(`№ ${e.returnClientWaybill}`);
  if (e.fuelLiters != null) badges.push(formatLiters(e.fuelLiters));
  if (e.otherCostUah != null) badges.push(formatUah(e.otherCostUah));
  if (e.extraWeightKg != null) badges.push(formatKg(e.extraWeightKg));
  return badges;
}

export function eventComment(e: RouteEvent): string | undefined {
  return e.notes || e.otherCostComment || undefined;
}
```

`getAvailableEventTypes("daily")` доповнено `"delivery"` (раніше в daily
його не було взагалі — доставку/накладну нічим було відсканувати без
переходу у `full`).

`src/pages/driver/EventForm.tsx` — виклики оновлено під нову сигнатуру:
`requiresOdometer(type, dayMode)`, `eventTypeLabel(type, dayMode)`.

`src/pages/driver/DriverDashboard.tsx` — блокування "Старт зі складу"
після першого запису за день:

```typescript
const hasDepotStartToday = events?.some(e => e.eventType === "depot_start") ?? false;

// ...у рендері тайлів:
const isLockedDepotStart = type === "depot_start" && hasDepotStartToday;
<button
  disabled={isLockedDepotStart}
  onClick={() => !isLockedDepotStart && navigate(`/driver/event/new?type=${type}`)}
  className={isLockedDepotStart ? "opacity-40 cursor-not-allowed" : "..."}
>
  {/* ... */}
  {eventTypeLabel(type, dayMode)}{isLockedDepotStart && " ✓"}
</button>
```

Працює через `useTodayEvents` (кеш інвалідується автоматично після
`createRouteEvent` — `useCreateRouteEvent`), тому тайл сіріє одразу
після збереження, без ручного релоаду.

> Перевірка: збережи "Старт зі складу" в будь-якому режимі — тайл
> одразу стає неактивним (сірий, з ✓) до завтра, в обох режимах
> одночасно (перевірка не залежить від `dayMode`, лише від наявності
> `depot_start`-події за сьогодні).

---

## Крок 15.6 — Кілька накладних на одну точку вивантаження (full)

> Навіщо: реальний маршрут (напр. Вінницька/Хмельницька обл., 8 точок)
> має на кожній точці 2-4 накладних, а не одну. `EventForm` мав рівно
> одне поле `waybillNumber` на подію `delivery` — без способу зафіксувати
> "ще одну накладну цієї ж точки", не задвоївши одометр і кількість
> палет. Розглядали два варіанти: (а) змінити схему `route_events` під
> масив накладних на подію, (б) лишити по одному запису на накладну, але
> групувати їх на рівні форми. Обрали (б) — **без змін бекенду**
> (`vehicle_tracker_api`, окремий репозиторій, зараз не відкритий у цій
> сесії) — і воно вкладається в наявну модель без жодної міграції.

`src/pages/driver/EventForm.tsx`:

```typescript
// Кілька накладних на точку має сенс лише там, де точка й так має
// одометр+палети (full-режим delivery)
const groupsMultipleWaybills = needsWaybill && needsPallets;

const [additionalWaybills, setAdditionalWaybills] = useState<{ waybillNumber: string; waybillDate: string }[]>([]);
const [scanningAdditional, setScanningAdditional] = useState(false);

// isAlreadyScannedToday() тепер звіряє і з todayEvents, і з уже
// заповненим waybillNumber, і зі списком additionalWaybills —
// та сама накладна не повинна повторитись у межах ОДНОГО подання форми

// у handleScan(), у гілці delivery:
if (scanningAdditional) {
  setAdditionalWaybills(prev => [...prev, parsed]);
  setScanningAdditional(false);
} else {
  setWaybillNumber(parsed.waybillNumber);
  setWaybillDate(parsed.waybillDate);
}

// handleSubmit() — основний запис як і раніше, потім по одному
// POST-у на кожну додаткову накладну, АЛЕ без одометра/палет:
await createEvent.mutateAsync(data);
for (const w of additionalWaybills) {
  await createEvent.mutateAsync({
    carId: car!.idCar, driverId: driver!.idDriver, trackingMode: dayMode,
    eventType: type, eventTs: new Date().toISOString(),
    waybillNumber: w.waybillNumber, waybillDate: w.waybillDate,
    customerName: customerName || undefined,
    // odometerKm/palletsCount навмисно НЕ передаються — undefined
  });
}
```

**Чому це безпечно без зміни `calcSummary.ts`:**
- `buildRouteSegments()` фільтрує події за `odometerKm !== null/undefined`
  — додаткові записи (без одометра) просто не потрапляють у сегменти,
  тож зайвих "точок" між реальними зупинками не з'являється.
- Сума палет по точках (`full`-гілка в `buildDailySummary`) підсумовує
  `palletsCount` — у додаткових записів воно `null`, тож не задвоюється.

У розмітці: кнопка "📷 Ще одна накладна цієї точки" показується лише
після того, як основну накладну вже відскановано
(`groupsMultipleWaybills && waybillNumber`), список уже доданих —
з кнопкою "✕" на видалення до збереження.

**Заразом (те саме тестування з водієм) — ще дві дрібні правки:**
- `requiresPallets(depot_start, mode)` тепер `true` для обох режимів
  (раніше — тільки `daily`): у `full` це "загальна кількість палет на
  маршрут", окреме поле від палет по точках, підпис у формі — "Кількість
  палет (загальна на маршрут)".
- "Назва маршруту" для власного авто — поля `route_name` **немає** в
  схемі `route_events` (є лише в `hired_transport_trips`, інша фіча).
  Тимчасово, без міграції бекенду: для `depot_start` у `full`-режимі
  поле "Нотатки" перепідписується на "Назва маршруту"
  (`isRouteNameField = type === "depot_start" && dayMode === "full"`
  в `EventForm.tsx`) — значення й далі йде в те саме поле `notes`.

---

## Крок 15.7 — `delivery` у full розпадається на "Скан накладної" (load) і "Вивантаження" (unload)

> Навіщо: буквально в той же день, одразу після Кроку 15.6, зʼясувалось,
> що Крок 15.6 сам розв'язував не ту задачу. Реальний водій сканує ВСІ
> накладні сьогоднішнього маршруту одразу на складі, ДО виїзду (авто ще
> не рухалось — одометр там безглуздий), а не по одній на кожній точці.
> Тайл "Вивантаження", який завжди вимагав одометр, водій фактично
> використовував як "Завантаження". На фізичній точці водій сканує
> БУДЬ-ЯКУ ОДНУ з уже завантажених накладних — це підтвердження
> доставки, а не нове сканування — і вже тут вносить одометр і палети.

`src/types/index.ts` — нове поняття, ЛИШЕ фронтенд (немає колонки в БД):

```typescript
export type DeliveryStage = 'load' | 'unload';
```

`src/utils/eventHelpers.ts` — `getAvailableEventTypes` тепер повертає
тайли, а не голі типи (для `full` `delivery` дає ДВА тайли):

```typescript
export interface EventTile {
  type: RouteEventType;
  stage?: DeliveryStage;
}

export function getAvailableEventTypes(mode: TrackingMode): EventTile[] {
  if (mode === "daily") {
    return [{ type: "depot_start" }, { type: "delivery" }, /* ... */];
  }
  return [
    { type: "depot_start" },
    { type: "delivery", stage: "load" },   // склад, до виїзду
    { type: "delivery", stage: "unload" }, // точка, після приїзду
    /* refuel, other_cost, return_goods, extra_cargo, parking_end, depot_return */
  ];
}

export function requiresOdometer(type: RouteEventType, mode: TrackingMode, stage?: DeliveryStage): boolean {
  if (["refuel", "other_cost", "return_goods", "extra_cargo"].includes(type)) return false;
  if (type === "delivery") {
    if (mode === "daily") return false;
    return stage === "unload"; // full: одометр лише на unload
  }
  return true;
}

export function requiresPallets(type: RouteEventType, mode: TrackingMode, stage?: DeliveryStage): boolean {
  if (type === "depot_start") return true;
  if (type === "delivery" && mode === "full") return stage === "unload";
  return false;
}

export function eventTypeLabel(type: RouteEventType, mode?: TrackingMode, stage?: DeliveryStage): string {
  if (type === "delivery" && (mode === "daily" || stage === "load")) return "Скан накладної";
  // ...інакше з labels-словника ("Вивантаження" для delivery)
}

// stage ніде не зберігається в БД — для вже збережених подій вираховуємо
// заднім числом: одометр є → це була unload, нема → load
export function inferDeliveryStage(e: RouteEvent): DeliveryStage | undefined {
  if (e.eventType !== "delivery" || e.trackingMode !== "full") return undefined;
  return e.odometerKm != null ? "unload" : "load";
}
```

`src/pages/driver/EventForm.tsx` — читає `stage` з query-параметра й
передає його у всі три функції вище; головна зміна — **дублікат-гард
тепер stage-залежний**:

```typescript
const stage = (searchParams.get("stage") as DeliveryStage | null) ?? undefined;
const isUnloadStage = type === "delivery" && dayMode === "full" && stage === "unload";

function isDuplicateForStage(num: string): boolean {
  // на load: будь-який сьогоднішній запис з таким номером — дублікат
  // на unload: дублікат лише якщо цей номер УЖЕ підтверджено (одометр є) —
  // сам факт що він був на load, підтвердженню не заважає
  const savedMatch = todayEvents?.some(e =>
    e.waybillNumber === num && (isUnloadStage ? e.odometerKm != null : true)
  ) ?? false;
  return savedMatch || num === waybillNumber || additionalWaybills.some(w => w.waybillNumber === num);
}
```

`src/pages/driver/DriverDashboard.tsx` — тайли тепер мапляться з
`{type, stage}`, а не голого `type` (`key` і query-рядок враховують
`stage`); `src/pages/driver/DriverHistory.tsx` і "Події сьогодні" на
дашборді викликають `eventTypeLabel(e.eventType, e.trackingMode,
inferDeliveryStage(e))`, щоб історичні записи теж підписувались вірно.

> Перевірка: у `full`-режимі на дашборді тепер 9 тайлів (не 8) —
> "Скан накладної" і "Вивантаження" окремо. Скануй кілька накладних на
> "Скані накладної" (без одометра) на складі, потім піди на "Вивантаження"
> і відскануй ОДНУ з тих самих накладних — вона МАЄ прийнятись (не
> дублікат), з'явиться поле одометра/палет. Спроба підтвердити ту саму
> накладну ще раз на "Вивантаженні" — має заблокуватись.

---

## Крок 15.8 — "+ Ще одна накладна" і на "Скані накладної" (не лише на "Вивантаженні")

> Навіщо: Крок 15.6 увімкнув групове сканування (`groupsMultipleWaybills`)
> лише коли `needsPallets` true — тобто тільки на unload. Але "Скан
> накладної" (load, склад) — це якраз місце, де водій сканує ДЕСЯТКИ
> накладних підряд, і кнопки "+ще одна" там найбільше бракувало;
> без неї довелось би виходити на дашборд і заходити в форму заново на
> кожну окрему накладну.

Одна зміна в `src/utils/eventHelpers.ts`-логіці `EventForm.tsx`:

```typescript
// було: const groupsMultipleWaybills = needsWaybill && needsPallets;
const groupsMultipleWaybills = needsWaybill;
```

Тепер групування працює для будь-якого `delivery` — і на `load`
(склад/daily, без одометра й палет узагалі), і на `unload` (точка, з
одометром/палетами на основній накладній). Текст кнопки — стадієзалежний
(`isUnloadStage ? "цієї точки" : ""`), решта механіки (дублікат-гард,
збереження N записів по черзі) без змін.

---

## Крок 15.9 — Кількість палет і на "Скані накладної" (load, full)

> Навіщо: після Кроку 15.8 з'ясувалось, що на "Скані накладної" (склад)
> теж бракує поля палет — не на кожну накладну окремо (уточнено у
> водія), а ОДНЕ число за весь захід сканування (скільки палет
> завантажили на маршрут загалом).

`src/utils/eventHelpers.ts` — `requiresPallets` більше не залежить від
`stage` для `delivery`+`full` (обидві стадії дають `true`), тому й
параметр `stage` тут став зайвим:

```typescript
// було: requiresPallets(type, mode, stage) { ...; return stage === "unload"; }
export function requiresPallets(type: RouteEventType, mode: TrackingMode): boolean {
  if (type === "depot_start") return true;
  if (type === "delivery" && mode === "full") return true; // і load, і unload
  return false;
}
```

⚠️ **Важливо** — це значення на `load` НЕ можна плюсувати до суми палет
по точках (`unload`) в аналітиці, інакше задвоїться. `calcSummary.ts`
вже рахує суму лише по подіях з одометром (`odometerKm != null` —
ознака unload), тому довелось додати цей фільтр явно:

```typescript
// utils/calcSummary.ts, гілка mode === "full"
const total = sorted
  .filter(e => e.eventType === "delivery" && e.odometerKm != null && e.palletsCount)
  .reduce((sum, e) => sum + (e.palletsCount ?? 0), 0);
```

`src/pages/driver/EventForm.tsx` — підпис поля тепер трирівневий
(`depot_start`+full → "загальна на маршрут", `delivery`+full+load →
"за весь цей скан", інакше — просто "Кількість палет").

---

## Крок 15.5 — Сканер для "Повернення" і "Додаткового вантажу", прибирання вкладки "Сканер"

> Додано пост-фактум, після того як Кроки 15.1-15.4 вже були набрані й
> задеплоєні. Рішення обговорювались і затверджувались перед реалізацією:
> один спільний `scannerOpen`/`handleScan` на всю форму (а не окремий
> сканер на кожен тип події), з QR береться лише номер накладної (дата з
> QR тут не потрібна — у бізнес-логіці §4.3 `documents/01_PROJECT_OVERVIEW.md`
> далі номером оригінальної накладної вручну оперує менеджер, застосунку
> дата не потрібна).

`handleScan` тепер розрізняє поточний `type` і кладе номер у потрібне поле:

```typescript
// src/pages/driver/EventForm.tsx — оновлений handleScan
function handleScan(raw: string) {
  const parsed = parseQRCode(raw);
  if (parsed) {
    if (type === "return_goods") {
      setReturnClientWaybill(parsed.waybillNumber);
    } else if (type === "extra_cargo") {
      setExtraWaybill(parsed.waybillNumber);
    } else {
      // delivery — єдиний тип, якому потрібна ще й дата накладної
      setWaybillNumber(parsed.waybillNumber);
      setWaybillDate(parsed.waybillDate);
    }
  }
  setScannerOpen(false);
}
```

Кнопка "📷 Сканувати QR" додається в блоки `return_goods` і `extra_cargo`,
той самий `{scannerOpen && <QRScanner .../>}` (визначений один раз у
Кроці 15.2) обслуговує всі три типи — позиція в JSX не важлива, бо
`QRScanner` рендериться як `fixed inset-0` поверх усього екрана.
Заразом додано поле `extraWaybill` для `extra_cargo` — воно було в
`RouteEventCreate` (`types/index.ts`) від самого початку, але при наборі
`EventForm` (Фаза 13) в JSX його забули намалювати:

```typescript
// src/pages/driver/EventForm.tsx — доповнення блоків
{type === "return_goods" && (
  <>
    <Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
      📷 Сканувати QR
    </Button>
    <Input label="Накладна клієнта (повернення)" value={returnClientWaybill} onChange={(e) => setReturnClientWaybill(e.target.value)} />
  </>
)}

{type === "extra_cargo" && (
  <>
    <Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
      📷 Сканувати QR
    </Button>
    <Input label="Накладна (опційно)" value={extraWaybill} onChange={(e) => setExtraWaybill(e.target.value)} />
    <Input label="Звідки" value={extraFrom} onChange={(e) => setExtraFrom(e.target.value)} />
    <Input label="Куди" value={extraTo} onChange={(e) => setExtraTo(e.target.value)} />
    <Input label="Вага (кг)" type="number" value={extraWeightKg} onChange={(e) => setExtraWeightKg(e.target.value)} />
  </>
)}
```

Не забудь додати `const [extraWaybill, setExtraWaybill] = useState("")`
і включити `extraWaybill` в об'єкт, що йде в `createEvent.mutateAsync(...)`.

**Прибирання мертвої вкладки "Сканер":** окремий екран `/driver/scan`
(заведений ще в Фазі 9/13 як заглушка "на майбутнє") так і не знадобився
— QR живе тільки всередині `EventForm`. Прибери:

```typescript
// src/components/layouts/DriverLayout.tsx — нижня навігація
{ to: "/driver", label: "Маршрут", icon: "🗺️", exact: true },
{ to: "/driver/history", label: "Історія", icon: "📋", exact: false },
// рядок з "/driver/scan" / "Сканер" — видалити
```

```typescript
// src/App.tsx — усередині /driver
<Route path="event/new" element={<EventForm />} />
<Route path="history" element={<DriverHistory />} />
{/* <Route path="scan" .../> — видалено, PlaceholderPage тут більше не потрібен */}
```

### Перевірка

1. У нижньому меню водія лишається два пункти: "Маршрут" і "Історія".
2. "Нова подія" → "Повернення товару" → кнопка "📷 Сканувати QR" підставляє
   номер у "Накладна клієнта (повернення)".
3. "Нова подія" → "Додатковий вантаж" → та сама кнопка підставляє номер у
   нове поле "Накладна (опційно)", інші поля (Звідки/Куди/Вага) вводяться
   вручну як і раніше.

---

# ═══════════════════════════════════════════════════════════
<a id="faza-16"></a>
# ФАЗА 16 — АВТОПАРК ДЛЯ ЛОГІСТА (Fleet CRUD)
# ═══════════════════════════════════════════════════════════

> ⚠️ **Резинхронізовано 2026-08-28 напряму проти коду** — цей розділ
> раніше містив ДОПРОЕКТНИЙ план (мінімальна форма з 4 полів, без
> причепа/водія/статусів/блокування). Фаза 16 була в реальності набрана
> вручну (`faza_16 logostic_driver_car`) і потім суттєво доопрацьована
> тим самим днем (FleetList: колонки "Режим"/"Водій", швидкий
> перемикач статусу; CarForm: причіп, призначення водія, блокування
> полів; DriverForm — нова сторінка). Нижче — те, що РЕАЛЬНО є в
> `src/pages/fleet/`, `src/api/cars.ts`, `src/api/drivers.ts`,
> `src/hocks/useCars.ts`, `src/hocks/useDrivers.ts` зараз, як
> послідовність кроків "з нуля".
>
> Навіщо ця фаза: бекенд-CRUD уже є (`DJANGO_CODING_GUIDE.md`, Фаза
> 6-7, nested `specs`/`trailer` запис — Фаза 10), а на фронтенді до неї
> не було жодної сторінки для логіста, щоб додати/редагувати авто чи
> водія.

## Крок 16.1 — CRUD-методи в src/api/cars.ts

`CarPayload` включає `specs` (характеристики авто) і **окремо**
`trailer` (причіп) — це не вкладено в `specs`, хоч `specs.hasTrailer`
і каже, чи причіп взагалі є:

```typescript
// src/api/cars.ts
export interface CarPayload {
  nameCar: string;
  numberCar: string;
  fuelCardNumber?: number;
  amountCar: number;
  defaultTrackingMode: TrackingMode;
  statusCar: CarStatus;
  isActive: boolean;
  specs?: {
    vinCode?: string;
    yearManufactured?: number;
    weightKg?: number;
    payloadKg?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    hasTailLift: boolean;
    hasTrailer: boolean;
  };
  trailer?: {
    vinCode?: string;
    yearManufactured?: number;
    nameTrailer: string;
    numberTrailer: string;
    isActive: boolean;
  };
}

function toCarPayload(data: CarPayload) {
  return {
    name_car: data.nameCar,
    number_car: data.numberCar,
    fuel_card_number: data.fuelCardNumber ?? null,
    amount_car: data.amountCar,
    default_tracking_mode: data.defaultTrackingMode,
    status_car: data.statusCar,
    is_active: data.isActive,
    ...(data.specs && {
      specs: {
        vin_code: data.specs.vinCode ?? "",
        year_manufactured: data.specs.yearManufactured ?? null,
        weight_kg: data.specs.weightKg ?? null,
        payload_kg: data.specs.payloadKg ?? null,
        length_cm: data.specs.lengthCm ?? null,
        width_cm: data.specs.widthCm ?? null,
        height_cm: data.specs.heightCm ?? null,
        has_tail_lift: data.specs.hasTailLift,
        has_trailer: data.specs.hasTrailer,
      },
    }),
    ...(data.trailer && {
      trailer: {
        vin_code: data.trailer.vinCode ?? "",
        year_manufactured: data.trailer.yearManufactured ?? null,
        name_trailer: data.trailer.nameTrailer,
        number_trailer: data.trailer.numberTrailer,
        is_active: data.trailer.isActive,
      },
    }),
  };
}

export async function createCar(data: CarPayload): Promise<Car> {
  const raw = await apiFetch<RawCar>("/cars/", { method: "POST", json: toCarPayload(data) });
  return mapCar(raw);
}

export async function updateCar(id: number, data: CarPayload): Promise<Car> {
  const raw = await apiFetch<RawCar>(`/cars/${id}/`, { method: "PATCH", json: toCarPayload(data) });
  return mapCar(raw);
}

export async function deleteCar(id: number): Promise<void> {
  await apiFetch<void>(`/cars/${id}/`, { method: "DELETE" });
}

// Швидка зміна статусу авто (без відкриття повної форми) — окремий
// бекенд-ендпоінт, що пише запис в CarStatusLog (для підрахунку "днів
// у ремонті"), на відміну від звичайного PATCH через updateCar
export async function changeCarStatus(id: number, newStatus: CarStatus, reason = ""): Promise<Car> {
  const raw = await apiFetch<RawCar>(`/cars/${id}/change_status/`, {
    method: "POST",
    json: { status: newStatus, reason },
  });
  return mapCar(raw);
}
```

> ⚠️ `RawTrailer`/`Trailer` НЕ мають поля `model` — фронтенд це поле
> колись мав (обов'язковий інпут "Модель причепа" в `CarForm`), але
> `TrailerSerializer` на бекенді його ніколи не мав, тож DRF мовчки
> ігнорував усе, що туди вводилось. Заразом на бекенді довго лишалась
> сирітська NOT NULL колонка `trailers.model` без відповідного поля в
> моделі (правилась без `makemigrations`), через що створення авто З
> причепом падало 500-кою `IntegrityError`, а `CarSerializer.create()`
> без `transaction.atomic()` лишало по собі напівстворений `Car`-рядок.
> Виправлено бекенд-міграцією `0004_fix_trailer_schema_drift.py` +
> `@transaction.atomic` на `create`/`update` серіалізатора (деталі —
> `DJANGO_CODING_GUIDE.md`, Крок 10.1). Якщо колись знову бачиш "форма
> проситься зберегти, а бекенд каже 400/500 без зрозумілої причини" —
> спершу перевір: чи всі поля форми РЕАЛЬНО є в серіалізаторі, і чи
> `makemigrations --check --dry-run` не показує розбіжність моделі й
> БД.

Аналогічно `src/api/drivers.ts` має повний CRUD (не тільки читання):

```typescript
// src/api/drivers.ts
export interface DriverPayload {
  nameDriver: string;
  phoneDriver?: string;
  driversLicense?: string;
  idCar: number | null;
  isActive: boolean;
}

function toDriverPayload(data: DriverPayload) {
  return {
    name_driver: data.nameDriver,
    phone: data.phoneDriver,
    drivers_license: data.driversLicense,
    car: data.idCar,
    is_active: data.isActive,
  };
}

export async function fetchDriver(id: number): Promise<Driver> {
  const raw = await apiFetch<RawDriver>(`/drivers/${id}/`);
  return mapDriver(raw);
}

export async function createDriver(data: DriverPayload): Promise<Driver> {
  const raw = await apiFetch<RawDriver>("/drivers/", { method: "POST", json: toDriverPayload(data) });
  return mapDriver(raw);
}

export async function updateDriver(id: number, data: DriverPayload): Promise<Driver> {
  const raw = await apiFetch<RawDriver>(`/drivers/${id}/`, { method: "PATCH", json: toDriverPayload(data) });
  return mapDriver(raw);
}

export async function deleteDriver(id: number): Promise<void> {
  await apiFetch<void>(`/drivers/${id}/`, { method: "DELETE" });
}
```

> `idCar` — це "яке авто закріплене за цим водієм" (обернений бік
> зв'язку до того, що `CarForm` показує як `<select>` "Водій"). Обидві
> форми пишуть той самий зв'язок з різних боків — деталі синхронізації
> в Кроці 16.4/16.5 нижче.

---

## Крок 16.2 — React Query хуки для запису

`src/hocks/useCars.ts` — мутації поруч із наявними `useCars`/`useCar`,
плюс окремий хук під швидку зміну статусу:

```typescript
// src/hocks/useCars.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCar, updateCar, deleteCar, changeCarStatus } from "../api/cars.ts";
import type { CarPayload } from "../api/cars.ts";
import type { CarStatus } from "../types";

export function useCreateCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CarPayload) => createCar(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });
}

export function useUpdateCar(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CarPayload) => updateCar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["cars", id] });
    },
  });
}

export function useDeleteCar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCar(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cars"] }),
  });
}

// Швидка зміна статусу просто зі списку (FleetList), без відкриття
// CarForm — окремий ендпоінт change_status пише запис в CarStatusLog
export function useChangeCarStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: number; status: CarStatus; reason?: string }) =>
      changeCarStatus(id, status, reason),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["cars"] });
      queryClient.invalidateQueries({ queryKey: ["cars", id] });
    },
  });
}
```

`src/hocks/useDrivers.ts` — аналогічно, плюс `useDriver(id)` для
картки водія (Крок 16.5):

```typescript
// src/hocks/useDrivers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchDrivers, fetchDriver, fetchCurrentDriver, createDriver, updateDriver } from "../api/drivers";
import type { DriverPayload } from "../api/drivers";

export function useDrivers() {
  return useQuery({ queryKey: ["drivers"], queryFn: fetchDrivers });
}

// Один водій по id — картка водія (аналогічно useCar)
export function useDriver(id: number) {
  return useQuery({
    queryKey: ["drivers", id],
    queryFn: () => fetchDriver(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: DriverPayload) => createDriver(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

// id окремо від хуку (не в аргументах хуку) — потрібно оновлювати то
// одного, то іншого водія (стара/нова прив'язка до авто) в межах
// одного handleSubmit (див. CarForm/DriverForm нижче)
export function useUpdateDriver() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: DriverPayload }) => updateDriver(id, data),
    onSuccess: (_result, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      queryClient.invalidateQueries({ queryKey: ["drivers", id] });
    },
  });
}
```

---

## Крок 16.3 — CarStatus: два додаткові статуси

`Car.Status` (бекенд) і `CarStatus` (фронтенд-тип) мають 5 значень, не
3 — крім `active`/`repair`/`inactive` додано:
- `pause` ("Пауза") — вимушений простій через тахограф/чіп-регулювання
  часу роботи водія й авто;
- `driver_downtime` ("Простій (водій)") — загальний простій через
  недоступність водія (лікарняний, відпустка, сімейні обставини), не
  повʼязаний з технічним станом авто.

```typescript
// src/types/index.ts
export type CarStatus = "active" | "repair" | "inactive" | "pause" | "driver_downtime";
```

Бекенд: `apps/cars/models.py::Car.Status` TextChoices + ручна міграція
`0005_car_status_pause_downtime.py` (`AlterField` лише на `status_car`,
а не auto-generated — `makemigrations` на цей момент тягнув ще ~80
непов'язаних історичних дрейфів по всій апці, які не мали відношення
до цієї зміни).

---

## Крок 16.4 — FleetList

Таблиця авто з інтерактивними колонками "Статус" (перемикач одразу зі
списку) і "Водій" (клікабельне ім'я → картка водія):

```typescript
// src/pages/fleet/FleetList.tsx
import { Link } from "react-router-dom";
import { useCars, useChangeCarStatus } from "../../hocks/useCars";
import { useDrivers } from "../../hocks/useDrivers";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { CarStatus } from "../../types";

const trackingModeLabel = { daily: "Щоденний", full: "Повний" } as const;
const carStatusLabel: Record<CarStatus, string> = {
  active: "Активне",
  repair: "Ремонт",
  inactive: "Неактивне",
  pause: "Пауза",
  driver_downtime: "Простій (водій)",
};

export function FleetList() {
  const { data: cars, isLoading, isError, refetch } = useCars();
  const { data: drivers } = useDrivers();
  const changeStatus = useChangeCarStatus();

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Автопарк</h1>
        <Link to="/fleet/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
          + Додати авто
        </Link>
      </div>

      {isLoading && <Spinner size="lg" label="Завантаження автопарку..." />}
      {isError && !isLoading && <ErrorBanner message="Не вдалось завантажити автопарк" onRetry={refetch} />}
      {!isLoading && !isError && cars?.length === 0 && (
        <EmptyState title="Авто ще немає" subtitle="Натисніть «Додати авто», щоб завести перше" />
      )}

      {!isLoading && !isError && cars && cars.length > 0 && (
        <table className="w-full text-sm">
          <thead className="text-left text-white/50 border-b border-white/10">
            <tr>
              <th className="py-2">Номер</th>
              <th className="py-2">Назва</th>
              <th className="py-2">Статус</th>
              <th className="py-2">Режим</th>
              <th className="py-2">Водій</th>
            </tr>
          </thead>
          <tbody>
            {cars.map((car) => {
              const driver = drivers?.find((d) => d.idCar === car.idCar);
              return (
                <tr key={car.idCar} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-2">
                    <Link to={`/fleet/${car.idCar}`} className="text-violet-300 hover:underline">
                      {car.numberCar}
                    </Link>
                  </td>
                  <td className="py-2">{car.nameCar}</td>
                  <td className="py-2">
                    <select
                      value={car.statusCar}
                      disabled={changeStatus.isPending}
                      onChange={(e) => changeStatus.mutate({ id: car.idCar, status: e.target.value as CarStatus })}
                      className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 [&>option]:bg-slate-900 [&>option]:text-white"
                    >
                      {Object.entries(carStatusLabel).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 text-white/70">{trackingModeLabel[car.defaultTrackingMode ?? "daily"]}</td>
                  <td className="py-2">
                    {driver ? (
                      <Link to={`/fleet/drivers/${driver.idDriver}`} className="text-violet-300 hover:underline">
                        {driver.nameDriver}
                      </Link>
                    ) : (
                      <span className="text-white/40">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {changeStatus.isError && (
        <ErrorBanner message={`Не вдалось змінити статус: ${(changeStatus.error as Error).message}`} />
      )}
    </div>
  );
}
```

> "Водій" шукається як `drivers?.find(d => d.idCar === car.idCar)` —
> НЕ поле на `Car` (бекенд не денормалізує зворотний зв'язок туди), а
> окремий запит `useDrivers()` і пошук по списку. `car.defaultTrackingMode`
> опційне — `?? "daily"` тут обов'язковий: без цього fallback'у
> `trackingModeLabel[undefined]` не ловиться `npx tsc --noEmit`, але
> ловиться реальним білдом (`tsc -b` в `npm run build`) — три деплої
> поспіль зламались саме на цьому, поки не було виявлено різницю між
> ад-хок тайпчеком і `tsc -b`. **Завжди перевіряй `npm run build`, а не
> лише `tsc --noEmit`, перед пушем.**

---

## Крок 16.5 — CarForm: створення, редагування, причіп, водій, блокування полів

Одна форма на обидва випадки (`create` без `carId` в URL, `edit` з
ним). Три `<select>` (режим обліку, статус, водій) завжди інтерактивні
— решта текстових/числових полів для ІСНУЮЧОГО авто заблокована, поки
логіст явно не натисне "✏️ Редагувати" (дані авто змінюються рідко,
блокування — проти випадкових правок):

```typescript
// src/pages/fleet/CarForm.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Driver, TrackingMode, CarStatus } from "../../types";
import { useCar, useCreateCar, useUpdateCar } from "../../hocks/useCars";
import { useDrivers, useUpdateDriver } from "../../hocks/useDrivers";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { CarPayload } from "../../api/cars";
import type { DriverPayload } from "../../api/drivers";

// Формуємо повний DriverPayload з уже завантаженого водія, змінюючи
// лише прив'язку до авто — updateDriver очікує весь об'єкт (не тільки idCar)
function driverPayloadWithCar(driver: Driver, idCar: number | null): DriverPayload {
  return {
    nameDriver: driver.nameDriver,
    phoneDriver: driver.phoneDriver,
    driversLicense: driver.driversLicense,
    isActive: driver.isActive,
    idCar,
  };
}

export function CarForm() {
  const { carId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!carId;
  const { data: existing } = useCar(isEdit ? Number(carId) : 0);
  const { data: drivers } = useDrivers();

  const [nameCar, setNameCar] = useState(existing?.nameCar ?? "");
  const [numberCar, setNumberCar] = useState(existing?.numberCar ?? "");
  const [fuelCardNumber, setFuelCardNumber] = useState(String(existing?.fuelCardNumber ?? ""));
  const [amountCar, setAmountCar] = useState(String(existing?.amountCar ?? ""));
  const [defaultTrackingMode, setDefaultTrackingMode] = useState<TrackingMode>(existing?.defaultTrackingMode ?? "daily");
  const [statusCar, setStatusCar] = useState<CarStatus>(existing?.statusCar ?? "active");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);

  // CarSpecs
  const [vinCode, setVinCode] = useState(existing?.specs?.vinCode ?? "");
  const [yearManufactured, setYearManufactured] = useState(String(existing?.specs?.yearManufactured ?? ""));
  const [weightKg, setWeightKg] = useState(String(existing?.specs?.weightKg ?? ""));
  const [payloadKg, setPayloadKg] = useState(String(existing?.specs?.payloadKg ?? ""));
  const [lengthCm, setLengthCm] = useState(String(existing?.specs?.lengthCm ?? ""));
  const [widthCm, setWidthCm] = useState(String(existing?.specs?.widthCm ?? ""));
  const [heightCm, setHeightCm] = useState(String(existing?.specs?.heightCm ?? ""));
  const [hasTailLift, setHasTailLift] = useState(existing?.specs?.hasTailLift ?? false);
  const [hasTrailer, setHasTrailer] = useState(existing?.specs?.hasTrailer ?? false);

  // Trailer — умовний блок, як у EventForm для різних event_type: рендериться
  // лише коли hasTrailer=true, а не приховується стилями
  const [trailerVinCode, setTrailerVinCode] = useState(existing?.trailer?.vinCode ?? "");
  const [trailerYear, setTrailerYear] = useState(String(existing?.trailer?.yearManufactured ?? ""));
  const [trailerName, setTrailerName] = useState(existing?.trailer?.nameTrailer ?? "");
  const [trailerNumber, setTrailerNumber] = useState(existing?.trailer?.numberTrailer ?? "");
  const [trailerIsActive, setTrailerIsActive] = useState(existing?.trailer?.isActive ?? true);

  // Дані авто змінюються рідко — за замовчуванням (тільки для вже
  // існуючого авто) текстові/числові поля заблоковані від випадкового
  // редагування, доступні лише випадаючі списки (режим/статус/водій).
  // Кнопка "Редагувати" розблоковує решту. Для НОВОГО авто (isEdit=false)
  // блокування не має сенсу — все одразу редаговане.
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const detailsLocked = isEdit && !isEditingDetails;

  // Призначення водія: якого водія id вважати "закріпленим" за цим авто —
  // шукаємо серед усіх водіїв того, чий idCar збігається з поточним авто
  const currentDriverId = drivers?.find((d) => existing && d.idCar === existing.idCar)?.idDriver ?? null;
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">(currentDriverId ?? "");

  const createCar = useCreateCar();
  const updateCar = useUpdateCar(Number(carId));
  const updateDriverAssignment = useUpdateDriver();
  const mutation = isEdit ? updateCar : createCar;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: CarPayload = {
      nameCar,
      numberCar,
      fuelCardNumber: fuelCardNumber ? Number(fuelCardNumber) : undefined,
      amountCar: Number(amountCar),
      defaultTrackingMode,
      statusCar,
      isActive,
      specs: {
        vinCode: vinCode || undefined,
        yearManufactured: yearManufactured ? Number(yearManufactured) : undefined,
        weightKg: weightKg ? Number(weightKg) : undefined,
        payloadKg: payloadKg ? Number(payloadKg) : undefined,
        lengthCm: lengthCm ? Number(lengthCm) : undefined,
        widthCm: widthCm ? Number(widthCm) : undefined,
        heightCm: heightCm ? Number(heightCm) : undefined,
        hasTailLift,
        hasTrailer,
      },
      trailer: hasTrailer
        ? {
            vinCode: trailerVinCode || undefined,
            yearManufactured: trailerYear ? Number(trailerYear) : undefined,
            nameTrailer: trailerName,
            numberTrailer: trailerNumber,
            isActive: trailerIsActive,
          }
        : undefined,
    };

    const savedCar = await mutation.mutateAsync(payload);

    // Водій, що раніше був закріплений за цим авто, але тепер знятий/змінений — відв'язуємо
    const previousDriver = drivers?.find((d) => d.idCar === savedCar.idCar && d.idDriver !== selectedDriverId);
    if (previousDriver) {
      await updateDriverAssignment.mutateAsync({
        id: previousDriver.idDriver,
        data: driverPayloadWithCar(previousDriver, null),
      });
    }
    // Новий обраний водій — прив'язуємо до цього авто
    if (selectedDriverId !== "") {
      const driver = drivers?.find((d) => d.idDriver === selectedDriverId);
      if (driver) {
        await updateDriverAssignment.mutateAsync({
          id: driver.idDriver,
          data: driverPayloadWithCar(driver, savedCar.idCar),
        });
      }
    }

    navigate("/fleet");
  }

  return (
    <div className="p-6">
    <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">{isEdit ? "Картка авто" : "Нове авто"}</h1>
        {isEdit && !isEditingDetails && (
          <Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
            ✏️ Редагувати
          </Button>
        )}
      </div>
      {detailsLocked && (
        <p className="text-xs text-white/40 -mt-2">
          Дані авто змінюються рідко — щоб уникнути випадкових правок, поля нижче заблоковані.
          Доступні: режим обліку, статус, водій. Натисніть "Редагувати", щоб змінити решту.
        </p>
      )}

      <Input label="Назва (модель)" value={nameCar} onChange={(e) => setNameCar(e.target.value)} required disabled={detailsLocked} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Держ. номер" value={numberCar} onChange={(e) => setNumberCar(e.target.value)} required disabled={detailsLocked} />
        <Input label="Номер паливної картки" type="number" value={fuelCardNumber} onChange={(e) => setFuelCardNumber(e.target.value)} disabled={detailsLocked} />
      </div>
      <Input label="Місячна амортизація (грн)" type="number" value={amountCar} onChange={(e) => setAmountCar(e.target.value)} required disabled={detailsLocked} />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-white/70">Режим обліку за замовчуванням</label>
        <select
          value={defaultTrackingMode}
          onChange={(e) => setDefaultTrackingMode(e.target.value as TrackingMode)}
          className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
        >
          <option value="daily">Daily (без стадій)</option>
          <option value="full">Full (склад / точки)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-white/70">Статус авто</label>
        <select
          value={statusCar}
          onChange={(e) => setStatusCar(e.target.value as CarStatus)}
          className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
        >
          <option value="active">Активне</option>
          <option value="repair">Ремонт</option>
          <option value="inactive">Неактивне</option>
          <option value="pause">Пауза</option>
          <option value="driver_downtime">Простій (водій)</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} disabled={detailsLocked} />
        Авто активне (в експлуатації)
      </label>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-white/70">Водій</label>
        <select
          value={selectedDriverId}
          onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : "")}
          className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
        >
          <option value="">— не призначено —</option>
          {drivers?.map((d) => (
            <option key={d.idDriver} value={d.idDriver}>
              {d.nameDriver}
            </option>
          ))}
        </select>
      </div>

      <h2 className="text-lg font-semibold text-white pt-2">Технічні характеристики</h2>
      <Input label="VIN" value={vinCode} onChange={(e) => setVinCode(e.target.value)} disabled={detailsLocked} />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Рік випуску" type="number" value={yearManufactured} onChange={(e) => setYearManufactured(e.target.value)} disabled={detailsLocked} />
        <Input label="Вага (кг)" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} disabled={detailsLocked} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Вантажопідйомність (кг)" type="number" value={payloadKg} onChange={(e) => setPayloadKg(e.target.value)} disabled={detailsLocked} />
        <Input label="Довжина (см)" type="number" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} disabled={detailsLocked} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Ширина (см)" type="number" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} disabled={detailsLocked} />
        <Input label="Висота (см)" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} disabled={detailsLocked} />
      </div>

      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={hasTailLift} onChange={(e) => setHasTailLift(e.target.checked)} disabled={detailsLocked} />
        Є гідроборт
      </label>
      <label className="flex items-center gap-2 text-sm text-white/70">
        <input type="checkbox" checked={hasTrailer} onChange={(e) => setHasTrailer(e.target.checked)} disabled={detailsLocked} />
        Є причіп
      </label>

      {hasTrailer && (
        <div className="space-y-4 rounded-lg border border-white/10 p-4">
          <h3 className="text-sm font-semibold text-white">Причіп</h3>
          <Input label="Назва причепа" value={trailerName} onChange={(e) => setTrailerName(e.target.value)} required disabled={detailsLocked} />
          <Input label="Держ. номер причепа" value={trailerNumber} onChange={(e) => setTrailerNumber(e.target.value)} required disabled={detailsLocked} />
          <Input label="VIN причепа" value={trailerVinCode} onChange={(e) => setTrailerVinCode(e.target.value)} disabled={detailsLocked} />
          <Input label="Рік випуску причепа" type="number" value={trailerYear} onChange={(e) => setTrailerYear(e.target.value)} disabled={detailsLocked} />
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={trailerIsActive} onChange={(e) => setTrailerIsActive(e.target.checked)} disabled={detailsLocked} />
            Причіп активний
          </label>
        </div>
      )}

      {(mutation.isError || updateDriverAssignment.isError) && (
        <ErrorBanner message={((mutation.error ?? updateDriverAssignment.error) as Error).message} />
      )}

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={() => navigate("/fleet")}>Скасувати</Button>
        <Button type="submit" isLoading={mutation.isPending || updateDriverAssignment.isPending} className="flex-1">Зберегти</Button>
      </div>
    </form>
    </div>
  );
}
```

> Причіп НЕ вкладений всередину `specs` у payload — це два окремі
> ключі верхнього рівня (`specs` і `trailer`), хоч `specs.hasTrailer`
> і визначає, чи блок причепа взагалі рендериться/надсилається.
> Призначення водія — ДВОСТОРОННІЙ update: якщо водій змінюється,
> старий водій цього авто явно відв'язується (`idCar: null`), а новий
> прив'язується — обидва через `updateDriverAssignment.mutateAsync`,
> ПІСЛЯ того як сам `Car` вже збережений (потрібен `savedCar.idCar`).
>
> ⚠️ **Резинхронізовано 2026-08-28** — на мобільному картка авто мала
> завеликий скрол (кожне поле на всю ширину). Короткі поля згруповано
> по два в рядок (`grid grid-cols-2 gap-3`): держ. номер + паливна
> картка, рік випуску + вага, вантажопідйомність + довжина, ширина +
> висота. На всю ширину лишились лише "Назва (модель)" і "VIN" (довгі
> значення).

---

## Крок 16.6 — DriverForm: картка водія

Дзеркальна сторінка до `CarForm` — відкривається кліком на ім'я водія
в `FleetList` (`/fleet/drivers/:driverId`) або "+ Додати водія"
(`/fleet/drivers/new`). Призначення авто тут — обернена сторона того ж
зв'язку, що редагується в `CarForm` через `<select>` "Водій": якщо
обране авто вже має ІНШОГО водія, той явно відв'язується, щоб не
лишалось двох водіїв формально закріплених за одним авто.

```typescript
// src/pages/fleet/DriverForm.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDriver, useDrivers, useCreateDriver, useUpdateDriver } from "../../hocks/useDrivers";
import { useCars } from "../../hocks/useCars";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { DriverPayload } from "../../api/drivers";

export function DriverForm() {
  const { driverId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!driverId;
  const { data: existing } = useDriver(isEdit ? Number(driverId) : 0);
  const { data: cars } = useCars();
  const { data: drivers } = useDrivers();

  const [nameDriver, setNameDriver] = useState(existing?.nameDriver ?? "");
  const [phoneDriver, setPhoneDriver] = useState(existing?.phoneDriver ?? "");
  const [driversLicense, setDriversLicense] = useState(existing?.driversLicense ?? "");
  const [isActive, setIsActive] = useState(existing?.isActive ?? true);
  const [selectedCarId, setSelectedCarId] = useState<number | "">(existing?.idCar ?? "");

  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const mutation = isEdit
    ? { mutateAsync: (data: DriverPayload) => updateDriver.mutateAsync({ id: Number(driverId), data }), isPending: updateDriver.isPending, isError: updateDriver.isError, error: updateDriver.error }
    : createDriver;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: DriverPayload = {
      nameDriver,
      phoneDriver: phoneDriver || undefined,
      driversLicense: driversLicense || undefined,
      idCar: selectedCarId === "" ? null : selectedCarId,
      isActive,
    };

    const savedDriver = await mutation.mutateAsync(payload);

    // Авто, обране для цього водія, могло вже мати ІНШОГО водія — знімаємо
    // його з того авто, інакше два водії формально закріплені за одним авто
    if (selectedCarId !== "") {
      const conflicting = drivers?.find(
        (d) => d.idCar === selectedCarId && d.idDriver !== savedDriver.idDriver
      );
      if (conflicting) {
        await updateDriver.mutateAsync({
          id: conflicting.idDriver,
          data: {
            nameDriver: conflicting.nameDriver,
            phoneDriver: conflicting.phoneDriver,
            driversLicense: conflicting.driversLicense,
            isActive: conflicting.isActive,
            idCar: null,
          },
        });
      }
    }

    navigate("/fleet");
  }

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
        <h1 className="text-xl font-bold text-white">{isEdit ? "Картка водія" : "Новий водій"}</h1>

        <Input label="ПІБ" value={nameDriver} onChange={(e) => setNameDriver(e.target.value)} required />
        <Input label="Телефон" value={phoneDriver} onChange={(e) => setPhoneDriver(e.target.value)} />
        <Input label="Посвідчення водія" value={driversLicense} onChange={(e) => setDriversLicense(e.target.value)} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-white/70">Закріплене авто</label>
          <select
            value={selectedCarId}
            onChange={(e) => setSelectedCarId(e.target.value ? Number(e.target.value) : "")}
            className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
          >
            <option value="">— не призначено —</option>
            {cars?.map((c) => (
              <option key={c.idCar} value={c.idCar}>
                {c.numberCar} — {c.nameCar}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-white/70">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Водій активний
        </label>

        {mutation.isError && (
          <ErrorBanner message={(mutation.error as Error).message} />
        )}

        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate("/fleet")}>Скасувати</Button>
          <Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
        </div>
      </form>
    </div>
  );
}
```

---

## Крок 16.7 — Підключення в App.tsx

```typescript
// src/App.tsx — фрагмент /fleet
<Route
  path="/fleet"
  element={
    <RequireRole roles={["logist", "manager", "head"]}>
      <MainLayout />
    </RequireRole>
  }
>
  <Route index element={<FleetList />} />
  <Route path="new" element={<CarForm />} />
  <Route path="drivers/new" element={<DriverForm />} />
  <Route path="drivers/:driverId" element={<DriverForm />} />
  <Route path=":carId" element={<CarForm />} />
</Route>
```

> `drivers/new` і `drivers/:driverId` мають бути оголошені ДО
> `:carId` було б неважливо тут (різні префікси, React Router матчить
> за точним сегментом `drivers`), але тримай усі `/fleet/drivers/*`
> маршрути разом — легше побачити, що вони існують окремим блоком від
> `:carId`.

## Крок 16.8 — Перевірка

1. Залогинься користувачем з `role="logist"` (або `manager`/`head`).
2. `/fleet` → таблиця авто з колонками Номер/Назва/Статус/Режим/Водій,
   кнопка "+ Додати авто".
3. Зміни статус авто прямо зі `<select>` в таблиці → перевір у Django
   Admin, що в `CarStatusLog` з'явився новий запис.
4. Заповни `CarForm` (з причепом і без), збережи → редирект на
   `/fleet`, нове авто в таблиці.
5. Клік по номеру авто → `CarForm` у режимі редагування, текстові поля
   заблоковані; натисни "✏️ Редагувати" — розблокувались; три
   `<select>` були інтерактивні одразу.
6. Клік по імені водія в колонці "Водій" → `DriverForm`, зміни
   зберігаються через `PATCH`.
7. Признач іншого водія тому самому авто в `CarForm` (або інше авто
   тому самому водію в `DriverForm`) → попередній зв'язок коректно
   знімається (в іншого водія/авто `idCar`/водій стає порожнім).
8. Перевір у Django Admin (`/admin/cars/car/`, `/admin/cars/driver/`)
   — записи реально з'явились/оновились в БД.
9. **Перед пушем — обов'язково `npm run build`** (не лише
   `npx tsc --noEmit`), і після деплою перевір статус GitHub Actions +
   `curl` на реальний ендпоінт продакшена, а не просто вважай "запушив
   → значить задеплоїлось".

> ⚠️ **Відомий відкритий баг (станом на 2026-08-28):** створення НОВОГО
> авто інколи все ще повертає "Request failed: 400." навіть після
> всіх виправлень вище (trailer schema drift, atomic create, кращий
> `extractErrorMessage`). Причина не встановлена — детально
> задокументовано в пам'яті сесії
> (`session-2026-08-28-fleet-work-and-open-400.md`), включно з
> гіпотезами для наступної сесії (stale PWA-кеш, "осиротілі" рядки авто
> з ДО atomic-фікса при повторному вводі того самого номера, ще не
> перевірене поле/edge case). Наступний крок розслідування — точний
> текст помилки в банері ЗАРАЗ і Response body з Network tab.

---

# ═══════════════════════════════════════════════════════════
# ФАЗА 17 — ДЕШБОРД ВОДІЯ: КОМПАКТНІ ПЛИТКИ, ВИДАЛЕННЯ/ГРУПУВАННЯ ПОДІЙ
# ═══════════════════════════════════════════════════════════

> Навіщо: на мобільному `/driver` мав завеликий скрол (тайли "Нова
> подія" — іконка над текстом, кожна на всю висоту `py-5`), перемикач
> режиму обліку висів окремим блоком під карткою авто, а список "Події
> сьогодні" внизу дублював `DriverHistory` (Фаза 15). Головне — водій
> не мав способу виправити помилку сканування: зайву накладну не можна
> було видалити, а якщо на одній точці кілька накладних — не було
> екрана, що показав би їх РАЗОМ.

## Крок 17.1 — DayModeSwitch: компактний варіант

`components/driver/DayModeSwitch.tsx` (Крок 13.3) отримує пропс
`compact` — той самий компонент, менший розмір кнопок, щоб влізти
праворуч у картці авто:

```typescript
// src/components/driver/DayModeSwitch.tsx
interface Props {
  mode: TrackingMode;
  onChange: (mode: TrackingMode) => void;
  isOverridden: boolean;
  compact?: boolean; // менший розмір — поруч з карткою авто на дашборді
}

export function DayModeSwitch({ mode, onChange, isOverridden, compact = false }: Props) {
  return (
    <div>
      <div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1">
        {(["daily", "full"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onChange(m)}
            className={`rounded-full font-semibold transition-all ${compact ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"} ${
              mode === m
                ? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/25"
                : "text-white/50 hover:text-white/80"
            }`}
          >
            {m === "daily" ? "Щоденний" : "Повний"}
          </button>
        ))}
      </div>
      {isOverridden && <p className="mt-2 text-xs text-amber-300/80">⚡ Змінено вручну на сьогодні</p>}
    </div>
  );
}
```

---

## Крок 17.2 — DriverDashboard: перемикач у картці, компактні тайли, без дубля списку

Три зміни в `pages/driver/DriverDashboard.tsx` (Кроки 13.4, 15.6-15.7):

1. Картка авто (Крок 13.4) і `<DayModeSwitch>` (раніше окремим блоком
   нижче) тепер один `flex items-center justify-between` — авто
   зліва, перемикач (`compact`) праворуч:

```typescript
<div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
  <div className="flex items-center justify-between gap-3 flex-wrap">
    <div className="flex items-center gap-3">
      <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl shrink-0">🚐</div>
      <div>
        <h2 className="text-lg font-bold text-white">{car.nameCar}</h2>
        <p className="text-sm text-white/50">{car.numberCar}</p>
      </div>
    </div>
    <DayModeSwitch mode={dayMode} onChange={setDayMode} isOverridden={isOverridden} compact />
  </div>
  {lastOdometer != null && (
    <p className="mt-3 text-xs text-white/40">Останній одометр: <span className="text-white/70">{formatKm(lastOdometer)}</span></p>
  )}
</div>
```

2. Тайли "Нова подія" — іконка й текст в один рядок (`flex
   items-center`, не `flex-col`), іконка тепер скруглений квадрат
   (`rounded-lg`), не коло (`rounded-full`):

```typescript
<button
  type="button"
  disabled={isLockedDepotStart}
  onClick={() => !isLockedDepotStart && navigate(`/driver/event/new?${query}`)}
  className={`group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm transition-all ${
    isLockedDepotStart ? "opacity-40 cursor-not-allowed" : "hover:bg-white/10 hover:border-white/20 active:scale-[0.97]"
  }`}
>
  <div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${eventTypeGradient(type)} flex items-center justify-center text-lg shadow-lg transition-transform ${!isLockedDepotStart && "group-hover:scale-105"}`}>
    {eventTypeIcon(type)}
  </div>
  <span className="text-xs font-medium text-white/80 text-left leading-tight">
    {eventTypeLabel(type, dayMode, stage)}
    {isLockedDepotStart && " ✓"}
  </span>
</button>
```

3. Блок "Події сьогодні" (список `<ul>` внизу дашборду) — **видалено
   повністю**. `useTodayEvents` лишається в компоненті (потрібен для
   `hasDepotStartToday`), просто без відповідного JSX. Водій бачить
   усі свої події (включно з сьогоднішніми, вони найновіші) в
   `DriverHistory` (Фаза 15) — тримати той самий список у двох місцях
   сенсу не було.

---

## Крок 17.3 — Групування накладних однієї точки (без зміни схеми БД)

> Проблема: коли на одній точці/складі сканують кілька накладних
> підряд (Крок 15.6-15.8), кожна лягає ОКРЕМИМ `RouteEvent` — немає
> жодного поля-групи в БД (свідоме рішення ще з Кроку 15.6 — суто
> frontend-хак). Щоб відкрити подію і побачити "усі накладні цієї
> точки" разом, групу треба вирахувати заднім числом.

> ⚠️ **Резинхронізовано 2026-08-28, того ж дня** — перша версія цього
> кроку групувала ЧАСОВОЮ евристикою (усі `delivery`-події без розриву
> довше 10 хв). Живе тестування одразу показало хибу: якщо водій
> сканує кілька окремих, самостійних накладних "по одній" (кожну через
> свій прохід EventForm, БЕЗ "+ Ще одна накладна") швидко одна за
> одною, вони теж потрапляли у вікно 10 хв і хибно об'єднувались в
> одну "точку", хоча це не мало жодного стосунку до реального фізичного
> місця розвантаження. Замінено на явний маркер.

Додаткова накладна (створена через "+ Ще одна накладна" в `EventForm`,
Крок 15.6, чи "Ще одна накладна цієї точки" в `EventDetail`, Крок 17.6)
несе в `notes` префікс `[stop:<id основної події>]` — без цього
маркера подія завжди сама собі група, незалежно від того, наскільки
близько за часом вона до інших:

```typescript
// src/utils/eventHelpers.ts
const STOP_TAG_RE = /^\[stop:(\d+)\]\s*/;

// group-id події: маркер "[stop:N]" в notes → N (id основної події
// групи), інакше подія сама собі група (її власний id)
function groupRootId(e: RouteEvent): number {
  const match = e.notes?.match(STOP_TAG_RE);
  return match ? Number(match[1]) : e.id;
}

export function stripStopTag(notes: string | undefined): string | undefined {
  if (!notes) return notes;
  return notes.replace(STOP_TAG_RE, "") || undefined;
}

export function withStopTag(rootId: number): string {
  return `[stop:${rootId}]`;
}

export function findEventGroup(events: RouteEvent[], target: RouteEvent): RouteEvent[] {
  if (target.eventType !== "delivery") return [target];
  const rootId = groupRootId(target);
  return events.filter(e => e.eventType === "delivery" && groupRootId(e) === rootId);
}

// Для "ще однієї накладної" незалежно від того, на яку саме подію
// групи зараз дивиться водій — завжди веде до того самого кореня
export function groupRootIdOf(e: RouteEvent): number {
  return groupRootId(e);
}
```

`eventComment()` тепер пропускає `notes` через `stripStopTag()`, щоб
службовий маркер не показувався у "💬 {коментар}" в списках. `EventForm.tsx`
(Крок 15.6, цикл по `additionalWaybills`) ставить тег ПІСЛЯ створення
основної події, коли вже відомий її `id`:

```typescript
// src/pages/driver/EventForm.tsx
const mainEvent = await createEvent.mutateAsync(data);
for (const w of additionalWaybills) {
  await createEvent.mutateAsync({
    ...,
    notes: withStopTag(mainEvent.id),
  });
}
```

`EventDetail.tsx` (Крок 17.6, "📷 Ще одна накладна цієї точки") ставить
тег на корінь ІСНУЮЧОЇ групи через `groupRootIdOf(target)` — а не на
`target.id` напряму, інакше додавання ще однієї накладної, дивлячись
на вже додаткову (не основну) подію групи, створило б ланцюжок
посилань замість спільного кореня.

> Компроміс: старі (до цього фікса) записи, згруповані виключно
> часовою евристикою, після деплою розпадуться на окремі — у них немає
> маркера `[stop:N]`. Прийнято свідомо: фіча нова, реальних
> продакшн-груп на момент фікса було мало, а хибне групування
> шкідливіше за втрату старого групування заднім числом.

---

## Крок 17.4 — Видалення події: API, хук, danger-кнопка

Бекенд (`vehicle_tracker_api`, `apps/cars/views.py::RouteEventViewSet`)
змін не потребував — `get_permissions()` там не перевизначено, тож діє
дефолтний `IsAuthenticated` на всі дії включно з `destroy`, а
`get_queryset()` і так обмежує водія його ж подіями. DELETE вже працює
на бекенді, бракувало лише виклику з фронтенду:

```typescript
// src/api/routeEvents.ts
export async function deleteRouteEvent(id: number): Promise<void> {
  if (USE_MOCK) {
    await mockDelay(300);
    return;
  }
  await apiFetch<void>(`/route-events/${id}/`, { method: "DELETE" });
}
```

```typescript
// src/hocks/useRouteEvents.ts
export function useDeleteRouteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: number; carId: number }) => deleteRouteEvent(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["route-events", variables.carId] });
      queryClient.invalidateQueries({ queryKey: ["lastOdometer", variables.carId] });
    },
  });
}
```

`carId` передається окремо у змінних мутації, бо DELETE не повертає
видалений об'єкт — інвалідувати кеш нема з чого, якби брали його з
відповіді.

`components/driver/ui.tsx` (Крок 13.2) — третій варіант кнопки поруч з
`primary`/`ghost`:

```typescript
const variantClasses = {
  primary: "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 active:scale-[0.98]",
  ghost: "text-white/70 hover:bg-white/5 hover:text-white active:scale-[0.98]",
  danger: "bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20 active:scale-[0.98]",
};
```

---

## Крок 17.5 — DriverHistory: клікабельні рядки

Дивись резинхронізований блок у Кроці 15.3 вище (`onClick` на `<li>` →
`navigate(`/driver/event/${e.id}`)`, третій аргумент `inferDeliveryStage(e)`
доданий до `eventTypeLabel`).

---

## Крок 17.6 — Нова сторінка pages/driver/EventDetail.tsx

Відкривається кліком на подію в `DriverHistory`. Для `delivery` зі
`findEventGroup().length > 1` показує список накладних точки з
видаленням кожної окремо і кнопкою досканувати ще одну; для решти —
картку деталей з однією кнопкою видалення. Підтвердження видалення —
"у два дотики" (перший клік → кнопка на 3 сек стає "Точно?", другий
клік у цьому вікні виконує `deleteEvent.mutate`), а не нативний
`window.confirm()` — зручніше на телефоні і не блокує інтерфейс:

```typescript
// src/pages/driver/EventDetail.tsx
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useTodayEvents, useCreateRouteEvent, useDeleteRouteEvent } from "../../hocks/useRouteEvents";
import {
  eventTypeLabel,
  eventTypeIcon,
  eventTypeGradient,
  inferDeliveryStage,
  findEventGroup,
  groupRootIdOf,
  withStopTag,
  stripStopTag,
} from "../../utils/eventHelpers";
import { formatDateTime, formatKm } from "../../utils/formatters";
import { Button, Spinner, ErrorBanner, EmptyState } from "../../components/driver/ui";
import { QRScanner } from "../../components/driver/QRScanner";
import { parseQRCode } from "../../utils/parseQR";

export function EventDetail() {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const targetId = Number(eventId);

  const { data: driver, isLoading: driverLoading } = useCurrentDriver();
  const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
  const { data: events, isLoading: eventsLoading } = useTodayEvents(car?.idCar ?? 0);
  const deleteEvent = useDeleteRouteEvent();
  const createEvent = useCreateRouteEvent();

  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  if (driverLoading || carLoading || eventsLoading) return <Spinner label="Завантаження..." />;
  if (!driver || !car) return <ErrorBanner message="Немає закріпленого авто" />;

  const target = events?.find(e => e.id === targetId);
  if (!target) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState title="Подію не знайдено" subtitle="Можливо, її вже видалено" />
        <Button variant="ghost" onClick={() => navigate("/driver/history")}>← До історії</Button>
      </div>
    );
  }

  const group = findEventGroup(events ?? [], target).sort((a, b) => a.eventTs.localeCompare(b.eventTs));
  const isMultiWaybill = target.eventType === "delivery" && group.length > 1;

  function askDelete(id: number) {
    if (confirmId === id) {
      setConfirmId(null);
      deleteEvent.mutate(
        { id, carId: car!.idCar },
        {
          onSuccess: () => {
            // Видалили саме той запис, на який зайшли — до історії;
            // видалили сусідню накладну з групи — лишаємось на місці
            if (id === target!.id) navigate("/driver/history");
          },
        }
      );
    } else {
      setConfirmId(id);
      setTimeout(() => setConfirmId(curr => (curr === id ? null : curr)), 3000);
    }
  }

  function handleScan(raw: string) {
    const parsed = parseQRCode(raw);
    if (!parsed) return;
    const alreadyScanned = events?.some(e => e.waybillNumber === parsed.waybillNumber);
    if (alreadyScanned) {
      setScanError(`Накладну №${parsed.waybillNumber} вже додано — спробуйте іншу`);
      return;
    }
    setScanError(null);
    setScannerOpen(false);
    createEvent.mutate({
      carId: car!.idCar,
      driverId: target!.driverId,
      trackingMode: target!.trackingMode,
      eventType: "delivery",
      eventTs: new Date().toISOString(),
      waybillNumber: parsed.waybillNumber,
      waybillDate: parsed.waybillDate,
      customerName: target!.customerName,
      // groupRootIdOf(target), не target.id напряму — якщо target сам є
      // додатковою накладною чужого кореня, нова має йти до ТОГО Ж кореня
      notes: withStopTag(groupRootIdOf(target!)),
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${eventTypeGradient(target.eventType)} flex items-center justify-center text-xl shadow-lg shrink-0`}>
          {eventTypeIcon(target.eventType)}
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            {eventTypeLabel(target.eventType, target.trackingMode, inferDeliveryStage(target))}
          </h2>
          <p className="text-xs text-white/40">{formatDateTime(target.eventTs)}</p>
        </div>
      </div>

      {isMultiWaybill ? (
        <>
          <h3 className="text-sm font-semibold text-white/60 tracking-wide uppercase">
            Накладні цієї точки ({group.length})
          </h3>
          <div className="flex flex-col gap-2">
            {group.map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white/90">№ {e.waybillNumber}</p>
                  <p className="text-xs text-white/40 truncate">
                    {e.customerName || "—"}
                    {e.odometerKm != null && ` · ${formatKm(e.odometerKm)}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant={confirmId === e.id ? "danger" : "ghost"}
                  onClick={() => askDelete(e.id)}
                  isLoading={deleteEvent.isPending && deleteEvent.variables?.id === e.id}
                  className="shrink-0 px-3 py-2"
                >
                  {confirmId === e.id ? "Точно?" : "🗑"}
                </Button>
              </div>
            ))}
          </div>

          {scanError && <ErrorBanner message={scanError} />}
          <Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
            📷 Ще одна накладна цієї точки
          </Button>
        </>
      ) : (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2 text-sm">
          {target.waybillNumber && <Row label="Накладна" value={`№ ${target.waybillNumber}${target.waybillDate ? `, ${target.waybillDate}` : ""}`} />}
          {target.customerName && <Row label="Клієнт" value={target.customerName} />}
          {target.odometerKm != null && <Row label="Одометр" value={formatKm(target.odometerKm)} />}
          {target.palletsCount != null && <Row label="Палети" value={String(target.palletsCount)} />}
          {target.fuelLiters != null && <Row label="Пального" value={`${target.fuelLiters} л`} />}
          {target.fuelCostUah != null && <Row label="Сума" value={`${target.fuelCostUah} грн`} />}
          {target.otherCostUah != null && <Row label="Сума" value={`${target.otherCostUah} грн`} />}
          {target.otherCostComment && <Row label="Коментар" value={target.otherCostComment} />}
          {target.returnClientWaybill && <Row label="Накладна клієнта" value={target.returnClientWaybill} />}
          {target.extraFrom && <Row label="Звідки" value={target.extraFrom} />}
          {target.extraTo && <Row label="Куди" value={target.extraTo} />}
          {target.extraWeightKg != null && <Row label="Вага" value={`${target.extraWeightKg} кг`} />}
          {stripStopTag(target.notes) && <Row label="Нотатки" value={stripStopTag(target.notes)!} />}

          {scanError && <ErrorBanner message={scanError} />}

          <Button
            type="button"
            variant={confirmId === target.id ? "danger" : "ghost"}
            onClick={() => askDelete(target.id)}
            isLoading={deleteEvent.isPending && deleteEvent.variables?.id === target.id}
            className="mt-2"
          >
            {confirmId === target.id ? "Точно видалити?" : "🗑 Видалити подію"}
          </Button>
        </div>
      )}

      {scannerOpen && <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} notice={scanError} />}
      {deleteEvent.isError && <ErrorBanner message={(deleteEvent.error as Error).message} />}

      <Button variant="ghost" onClick={() => navigate("/driver/history")}>← До історії</Button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/40">{label}</span>
      <span className="text-white/90 text-right">{value}</span>
    </div>
  );
}
```

> `deleteEvent.variables?.id` — TanStack Query зберігає останні
> передані в `mutate()` змінні на самому об'єкті мутації; так кнопка
> знає, яку саме з кількох накладних зараз видаляють, і показує
> спінер лише на ній, а не на всіх одразу.

---

## Крок 17.7 — Підключення в App.tsx

```typescript
import { EventDetail } from "./pages/driver/EventDetail";
// ...
<Route path="event/new" element={<EventForm />} />
<Route path="event/:eventId" element={<EventDetail />} />
<Route path="history" element={<DriverHistory />} />
```

Порядок оголошення `event/new` і `event/:eventId` ролі не грає — React
Router v6 ранжує маршрути за специфічністю сегмента незалежно від
порядку в JSX, статичний `new` завжди переможе динамічний `:eventId`.

---

## Крок 17.8 — Перевірка

1. `/driver` на вузькому екрані (390px) — перемикач режиму праворуч у
   картці авто, тайли "Нова подія" компактні (іконка+текст в рядок,
   квадратна іконка), списку "Події сьогодні" внизу немає.
2. `/driver/history` → клік на будь-яку подію → відкривається
   `/driver/event/:id`.
3. Відскануй 2-3 накладні підряд на одній точці (Кроки 15.6-15.8) →
   відкрий будь-яку з них з історії → всі мають зʼявитись РАЗОМ під
   "Накладні цієї точки (N)".
4. Видали одну накладну з групи (два кліки: 🗑 → "Точно?") — зникає з
   групи, залишаєшся на сторінці; видали ту, на яку заходив — редирект
   на `/driver/history`.
5. "📷 Ще одна накладна цієї точки" — скан додає ще один запис у ту ж
   групу без одометра/палет.
6. Одиночна подія (заправка, інші витрати тощо) — картка з полями і
   однією кнопкою "🗑 Видалити подію".
7. **Перед пушем — `npm run build`** (не лише `tsc --noEmit`), бекенд
   змін не потребує (DELETE вже дозволений `IsAuthenticated` +
   `get_queryset()` водія).

---

## Крок 17.9 — Виправлення живого тестування (той самий день)

Реальне тестування Кроків 17.1-17.8 одразу показало чотири проблеми:

**1. Компактний перемикач режиму все ще розширював картку авто** —
`compact` (Крок 17.1) лишав кнопки в рядок (`inline-flex`), просто
менші. На вузькому екрані картка авто ставала ширшою за контейнер.
Виправлення — компактний варіант тепер вертикальний стек:

```typescript
// src/components/driver/DayModeSwitch.tsx
<div className={compact ? "flex flex-col items-end" : undefined}>
  <div className={`inline-flex bg-white/5 border border-white/10 p-1 ${compact ? "flex-col gap-0.5 rounded-xl" : "rounded-full"}`}>
    {(["daily", "full"] as const).map((m) => (
      <button
        key={m}
        type="button"
        onClick={() => onChange(m)}
        className={`font-semibold transition-all ${compact ? "px-3 py-1 text-xs rounded-lg" : "px-5 py-2 text-sm rounded-full"} ${...}`}
      >
        {m === "daily" ? "Щоденний" : "Повний"}
      </button>
    ))}
  </div>
  {isOverridden && <p className={`mt-2 text-xs text-amber-300/80 ${compact ? "text-right" : ""}`}>⚡ Змінено вручну</p>}
</div>
```

**2. `DriverHistory`/`EventDetail` показували вчорашні події замість
сьогоднішніх.** Причина не в сортуванні — `fetchDriverEvents` (усі
події) сортує коректно; причина в тому, що Крок 17.2 прибрав список
"Події сьогодні" з дашборду в розрахунку на те, що водій бачитиме
сьогоднішні події в `DriverHistory`, а той тягнув **усю** історію
(`useDriverEvents`), тож найновіші вчорашні події природно опинялись
зверху, поки за сьогодні ще нічого не відскановано — але це не те, що
водій очікував побачити на екрані під назвою "події сьогодні".
Виправлення — обидві сторінки тепер тягнуть `useTodayEvents`, не
`useDriverEvents`:

```typescript
// src/pages/driver/DriverHistory.tsx і src/pages/driver/EventDetail.tsx
import { useTodayEvents } from "../../hocks/useRouteEvents";
// ...
const { data: events, isLoading, isError } = useTodayEvents(car?.idCar ?? 0);
```

Заразом виправлено реальний бag у `fetchTodayEvents` (`api/routeEvents.ts`,
mock-гілка, Фаза 13): "сьогодні" рахувалось як
`new Date().toISOString().slice(0, 10)` — це UTC-дата, не локальна. З
21:00 до півночі за Києвом (UTC+3) UTC-дата вже "завтра", тож щойно
відскановані накладні переставали вважатись сьогоднішніми ввечері —
рівно та поведінка, яку побачив водій. Виправлення — рахувати дату з
локальних гетерів (`getFullYear`/`getMonth`/`getDate`), і заразом
відсортувати результат так само, як `fetchDriverEvents` (найновіші
зверху):

```typescript
// src/api/routeEvents.ts
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
return (mockEvents as RouteEvent[])
  .filter(e => e.carId === carId && e.eventTs.startsWith(today))
  .sort((a, b) => b.eventTs.localeCompare(a.eventTs));
```

Реальний бекенд-запит (`?date=today`) цій хворобі не піддається — там
"сьогодні" рахує Django (`timezone.localdate()`, `TIME_ZONE="Europe/Kyiv"`)
на сервері, а не браузер клієнта.

**3. Повторне сканування тієї самої накладної інколи НЕ блокувалось.**
Дублікат-гард (`EventForm.tsx`, Крок 15.6) звіряє нову накладну проти
`useTodayEvents()` — але `useCreateRouteEvent` (Крок 7.4) інвалідував
кеш у `onSuccess` **без `return`**, тобто `mutateAsync()` резолвився
одразу після POST, не чекаючи, поки `todayEvents` реально
перезавантажиться. Якщо водій одразу після збереження відкривав
наступний скан (до завершення фонового refetch), дублікат-гард ще
бачив СТАРИЙ список без щойно доданої накладної — вікно гонки, вузьке,
але реальне. Виправлення — `onSuccess` тепер повертає `Promise.all(...)`,
і `useMutation` чекає на нього перед тим, як резолвити `mutateAsync`:

```typescript
// src/hocks/useRouteEvents.ts
onSuccess: (newEvent) => {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: ["route-events", newEvent.carId] }),
    queryClient.invalidateQueries({ queryKey: ["lastOdometer", newEvent.carId] }),
  ]);
},
```

Той самий фікс застосовано і в `useDeleteRouteEvent` (Крок 17.4) — для
консистентності, не через окремо зловлений баг.

**4. `CarForm`: "Режим обліку", "Статус авто", "Водій" — в один ряд.**
Три окремі блоки `flex flex-col gap-1` (Крок 16.5) об'єднано в
`grid grid-cols-3 gap-2`; чекбокс "Авто активне" (раніше стояв між
"Статус авто" і "Водій") переїхав під сітку — три `<select>` мають
бути поруч без розриву. Підписи скорочено ("Режим обліку" без "за
замовчуванням"), текст усередині `<select>` зменшено до `text-xs`,
щоб влізло в третину ширини на 390px:

```typescript
// src/pages/fleet/CarForm.tsx
<div className="grid grid-cols-3 gap-2">
  <div className="flex flex-col gap-1">
    <label className="text-sm font-medium text-white/70">Режим обліку</label>
    <select className="... px-2 py-2 text-xs ...">
      <option value="daily">Daily</option>
      <option value="full">Full</option>
    </select>
  </div>
  {/* Статус авто, Водій — той самий патерн */}
</div>
<label className="flex items-center gap-2 text-sm text-white/70">
  <input type="checkbox" checked={isActive} onChange={...} disabled={detailsLocked} />
  Авто активне (в експлуатації)
</label>
```

> Усі чотири — фронтенд-only, бекенд не чіпали. `npm run build`
> пройшов чисто після кожного.

---

## Крок 17.10 — Ще два фікси того ж дня: кнопка "Назад" у CarForm, точніше групування

**1. `CarForm`: немає способу просто закрити картку без збереження.**
У заблокованому перегляді (`detailsLocked`, Крок 16.5) кнопка "Скасувати"
робила ТЕ САМЕ, що й мало б робити "закрити" (`navigate("/fleet")`, без
жодного запиту на збереження) — але напис "Скасувати" звучав так, ніби
щось редагувалось, хоча в locked-режимі це не так. Підпис тепер
залежить від режиму (сам `onClick` не змінився):

```typescript
// src/pages/fleet/CarForm.tsx
<Button type="button" variant="ghost" onClick={() => navigate("/fleet")}>
  {detailsLocked ? "← Назад" : "Скасувати"}
</Button>
<Button type="submit" isLoading={mutation.isPending || updateDriverAssignment.isPending} className="flex-1">Зберегти</Button>
```

"Зберегти" лишається доступним і в locked-режимі — три `<select>`
(режим/статус/водій, Крок 16.5) редаговані навіть без "Редагувати",
і саме ця кнопка їх зберігає.

**2. Групування накладних однієї точки хибно спрацьовувало для окремих,
самостійно відсканованих накладних** — детально задокументовано вище
в резинхронізованому Кроці 17.3 (часова евристика замінена на явний
маркер `[stop:<id>]` у `notes`). Живий тест: водій відсканував кілька
накладних "по одній" (кожну — окремим заходом в `EventForm`, без
"+ Ще одна накладна"); попередня версія `findEventGroup` все одно
об'єднувала їх в одну "точку", бо вони випадково потрапили в 10-хвилинне
вікно.

---

# ═══════════════════════════════════════════════════════════
<a id="shcho-dali"></a>
# ЩО ДАЛІ
# ═══════════════════════════════════════════════════════════

## Наступні кроки (в такому порядку):

### Крок 11 — WaybillDetail (деталі накладної)
- Виводимо всі рядки однієї накладної
- Кнопка "← Назад"
- Підсумки: сума, вага, об'єм

> ⚠️ **Оновлено 2026-08-28 (перевірено напряму проти коду):**
> Фаза 14 (`RequireRole`/`RoleRedirect`, PR #11, `b3a8378`), Фаза 15
> (`QRScanner`, `DriverHistory`, PR #12, `eb46c5a` + Крок 15.5-15.9) і
> Фаза 16 (`FleetList`/`CarForm`/`DriverForm`, `faza_16
> logostic_driver_car` + суттєве доопрацювання 2026-08-28: статуси
> `pause`/`driver_downtime`, швидкий перемикач статусу, картка водія,
> блокування полів у `CarForm`) — **усі три реально набрані, змержені в
> `main` і задеплоєні.** Стара версія цього запису (від 2026-08-16/27)
> казала, що Фаза 16 не набрана — це вже неправда, дивись Фазу 16 вище
> (повністю резинхронізовано з реальним кодом).
>
> **Відомий відкритий баг у Фазі 16:** створення НОВОГО авто інколи все
> ще повертає "Request failed: 400." — причина не встановлена, детально
> задокументовано в пам'яті сесії
> (`session-2026-08-28-fleet-work-and-open-400.md`). Дивись примітку в
> кінці Кроку 16.8.
>
> **Фаза 17** (компактна `CarForm` на мобільному — резинхронізовано в
> Кроці 16.5, компактний дашборд водія, видалення/групування подій —
> нова сторінка `EventDetail`) — так само реально набрана й задеплоєна
> тим самим днем 2026-08-28.
>
> Далі логічно продовжувати з Кроку 12/13 нижче (найманий
> транспорт/служби доставки) — але ті залежать від бекендової
> `apps/logistics` (`DJANGO_CODING_GUIDE.md` Фаза 11); перевір
> `obsidian/STATE.md` цього репо на актуальний статус змержування перед
> стартом.

### Крок 12 — HiredTripForm (найманий транспорт)
### Крок 13 — CarrierShipmentForm (служби доставки)
### Крок 14 — Аналітика і графіки (Recharts)

### Крок 15 — Адмін: підтвердження реєстрацій користувачів
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
  - Permission-клас: тільки `Profile.role == HEAD` (НЕ Django
    `is_superuser` — це різні речі: `is_superuser` керує доступом до
    Django Admin, `Profile.role` — доступом до цього екрана застосунку)
- **Frontend** (цей репозиторій): ⚠️ перевірено 2026-08-27 — маршрут
  `/panel` у `App.tsx` **фактично НЕ існує**, попередня версія цього
  запису це стверджувала помилково. Реально заведено лише пункт меню
  "Адмін" у `TopNav.tsx` (`<Link to="/panel">`), і він уже правильно
  гейтується (`user?.profile?.role === 'head'`) — але веде в нікуди,
  бо сам `<Route path="/panel">` у `App.tsx` ще не додано. Цей крок:
  (1) додати `<Route path="/panel" element={<RequireRole roles={["head"]}><AdminPanel /></RequireRole>} />`
  в `App.tsx` (той самий `RequireRole` з Фази 14, а не саморобний гейт
  на кшталт "показати заглушку"), (2) написати `AdminPanel` — таблицю
  заявок із кнопками "Підтвердити"/"Відхилити" (React Query hook на
  кшталт `usePendingUsers()`).
  **Чому НЕ `/admin`:** на проді nginx проксіює `/admin/` напряму на
  Django admin (`nginx.conf`, Крок 4.3); фронтенд-роут `/admin` (без
  слеша) перекривав би справжню адмінку заглушкою через SPA-fallback —
  звідси вибір `/panel`.
- Клієнтський гейт — лише UX (сховати посилання/показати "немає
  доступу"), НЕ заміна реального захисту: справжня перевірка завжди на
  боці бекенду (`permission_classes` вище) — фронтенд-перевірку легко
  обійти через DevTools
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
