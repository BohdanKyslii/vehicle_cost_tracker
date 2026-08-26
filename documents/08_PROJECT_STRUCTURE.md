# Vehicle Cost Tracker — Структура файлів проєкту

> ✅ Резинхронізовано 2026-08-24 напряму з `find src -type f` — це
> РЕАЛЬНЕ дерево, не план (на відміну від попередньої версії "v3" цього
> файлу, яка була написана до старту кодингу й описувала майбутній
> вигляд). Реальна тека хуків називається **`hocks/`**, не `hooks/` —
> лишено як є свідомо, це не помилка в документі.

---

## Реальне дерево `src/` (збудовано)

```
src/
│
├── types/
│   ├── index.ts                 # всі TS-інтерфейси (03_TYPESCRIPT_TYPES.md)
│   └── telegram-web-app.d.ts    # типи window.Telegram.WebApp (НОВЕ — Mini App)
│
├── mocks/                       # лише 4 файли, не ~15 як планувалось (07_MOCK_DATA.md)
│   ├── cars.json
│   ├── drivers.json
│   ├── route-events.json
│   └── waybills.json
│
├── api/
│   ├── config.ts                 # apiFetch (fetch + credentials + CSRF), USE_MOCK/API_BASE
│   ├── auth.ts                   # НОВЕ — login/register/logout/loginWithTelegram
│   ├── cars.ts                   # fetchCars/fetchCar (без create/update/delete — Фаза 16)
│   ├── drivers.ts                # fetchDrivers/fetchCurrentDriver
│   ├── routeEvents.ts            # fetchTodayEvents/fetchLastOdometer/createRouteEvent
│   └── waybills.ts               # fetchWaybills/fetchWaybillDetail/checkWaybillChannel/fetchUnassignedWaybills
│
├── hocks/                        # ⚠️ реальна назва теки, не "hooks"
│   ├── useAuthModal.ts           # НОВЕ
│   ├── useCurrentUser.ts         # НОВЕ
│   ├── useCars.ts
│   ├── useDrivers.ts             # лише useCurrentDriver()
│   ├── useRouteEvents.ts
│   ├── useDayMode.ts
│   ├── useWaybills.ts
│   └── useWaybillFilters.ts
│
├── utils/
│   ├── formatters.ts
│   ├── eventHelpers.ts           # + eventTypeGradient() понад план
│   ├── calcSummary.ts
│   ├── calcTransportCost.ts
│   ├── calcProduct.ts            # ⏳ порожній, лише закоментований TODO
│   ├── clientFilter.ts
│   └── parseQR.ts                # реальний формат "номер:ДД.ММ.РР", не JSON
│
├── components/
│   │
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Badge.tsx              # StatusBadge + ChannelBadge + LegalEntityBadge + CarStatusBadge, все в одному файлі
│   │   ├── Spinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBanner.tsx        # + onRetry
│   │   ├── Pagination.tsx
│   │   ├── SortHeader.tsx
│   │   ├── Input.tsx
│   │   └── ui.tsx                 # ⚠️ дублює Button/Input/Spinner/EmptyState/ErrorBanner (див. 05_COMPONENTS_HOOKS_UTILS.md)
│   │
│   ├── layouts/
│   │   ├── DriverLayout.tsx       # glass-хедер + bottom nav
│   │   ├── MainLayout.tsx         # sidebar
│   │   └── TopNav.tsx             # НОВЕ — верхнє меню лендінгу (⚠️ орфан, див. нижче)
│   │
│   ├── auth/
│   │   └── AuthModal.tsx          # НОВЕ — вхід/реєстрація, 4 панелі, Telegram deep-link
│   │
│   ├── driver/
│   │   ├── DayModeSwitch.tsx
│   │   └── ui.tsx                 # ⚠️ дублікат components/ui/ui.tsx
│   │
│   ├── waybills/
│   │   ├── WaybillFiltersBar.tsx
│   │   ├── WaybillTable.tsx
│   │   └── WaybillList.tsx        # ⚠️ сама СТОРІНКА живе тут, не в pages/waybills/
│   │
│   ├── hired/                     # ⏳ порожня
│   ├── carriers/                  # ⏳ порожня
│   ├── fleet/                     # ⏳ порожня
│   └── analystics/                # ⏳ порожня, ⚠️ назва з друкарською помилкою ("analystics")
│
├── pages/
│   ├── DriverMiniApp.tsx          # НОВЕ — Telegram Mini App, /driver-app
│   ├── LandingPage.tsx            # ⚠️ збудовано, але НЕ підключено в App.tsx
│   ├── UnderConstruction.tsx      # ⚠️ збудовано, але НЕ підключено в App.tsx
│   ├── PlaceholderPage.tsx        # заглушка, реально використовується в App.tsx
│   └── driver/
│       ├── DriverDashboard.tsx
│       └── EventForm.tsx
│   # ⏳ порожньо: pages/fleet/, pages/waybills/ (WaybillList — в components/),
│   #    pages/hired/, pages/carriers/, pages/analytics/, pages/admin/
│
├── assets/
│   └── logo.png
│
├── styles/
│   └── landing.css                # для LandingPage/UnderConstruction
│
├── App.tsx
├── main.tsx
├── index.css
└── version.ts                     # НОВЕ — APP_VERSION, показується у футері лендінгу
│
├── .env
├── .env.production
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── vite.config.ts
```

---

## ⏳ Заплановано, ще НЕ існує

Все, що оригінальний план (нижче в цьому документі раніше) описував для
розділів, які фактично не збудовані:

```
components/
├── driver/PalletsInput.tsx, RouteTimeline.tsx, EventTypeButtons.tsx,
│          ScannedWaybillList.tsx, StoreConfirmModal.tsx, RejectionForm.tsx,
│          ReturnGoodsForm.tsx, ExtraCargoForm.tsx
├── hired/HiredTripCard.tsx, HiredWaybillList.tsx
├── carriers/CarrierShipmentCard.tsx, CarrierCostStatus.tsx
├── fleet/CarCard.tsx, CarTable.tsx, DailyCostsChart.tsx, CostBreakdownPie.tsx
├── waybills/WaybillLineTable.tsx, CsvPreview.tsx, ReturnMatchRow.tsx, UnassignedRow.tsx
├── analystics/KpiCard.tsx, MileageLineChart.tsx, TransportCostTable.tsx,
│              CustomerCostTable.tsx, ChannelComparisonChart.tsx
└── ui/Modal.tsx, Select.tsx, Textarea.tsx, DatePicker.tsx, MonthPicker.tsx,
     Toast.tsx, SkeletonRow.tsx

pages/
├── driver/QRScanner.tsx, DriverHistory.tsx   (Фаза 15)
├── fleet/FleetList.tsx, CarDetail.tsx, CarMonth.tsx, CarForm.tsx   (Фаза 16)
├── waybills/WaybillDetail.tsx, WaybillImport.tsx, ReturnMatchingList.tsx, UnassignedWaybills.tsx
├── hired/HiredTripList.tsx, HiredTripForm.tsx, HiredTripDetail.tsx
├── carriers/CarrierShipmentList.tsx, CarrierShipmentForm.tsx, CarrierShipmentDetail.tsx, CarrierCostsImport.tsx
├── analytics/AnalyticsDashboard.tsx, TransportCosts.tsx, CustomerAnalytics.tsx, ChannelComparison.tsx, CarAnalytics.tsx
└── admin/AdminDashboard.tsx, CarAdmin.tsx, DriverAdmin.tsx, ProductAdmin.tsx, CustomerAdmin.tsx, StoreAdmin.tsx, MonthlyCostsAdmin.tsx

Заплановано ще (Крок 15, CODING_GUIDE.md):
└── /panel — екран підтвердження реєстрацій для ролі head (не /admin — той шлях
    зарезервовано під nginx-проксі на Django admin, див. 04_PAGES_AND_ROUTING.md)

Заплановано (Фаза 14, CODING_GUIDE.md):
└── RequireRole.tsx — гейт маршрутів за роллю; жоден маршрут в App.tsx
    зараз не захищений на рівні UI
```

`api/`: `stores.ts`, `hiredTransport.ts`, `carriers.ts`, `monthlyCosts.ts`,
`analytics.ts` — жоден не існує.

`utils/`: `parseCsv.ts` — не існує.

`mocks/`: `product-categories.json`, `products.json`, `product-logistics.json`,
`customers.json`, `stores.json`, `store-delivery-addresses.json`,
`monthly-costs.json`, `hired-trips.json`, `hired-trip-waybills.json`,
`carrier-shipments.json`, `carrier-waybills.json`, `carrier-costs.json` —
жоден не існує (детально — `07_MOCK_DATA.md`).

---

## Архітектурні рішення — актуальний стан

| Питання | Рішення | Статус |
|---------|---------|--------|
| Ексклюзивність каналів | `deliveryChannel` в `WaybillRecord` + `checkWaybillChannel()` | ⏳ Тип і API-виклик готові, але ніщо в UI ще не викликає перевірку перед скануванням (немає QR-сканера) |
| Палети | `palletsCount` в `RouteEvent` | ✅ реалізовано (`requiresPallets`, EventForm) |
| Авторизація | Django-сесія + CSRF-cookie, ролі `driver/logist/manager/head` | ✅ реалізовано (Фаза 4.5) — не було в оригінальному плані взагалі |
| Мобільний доступ водія | Telegram Mini App (`/driver-app`), логін через `initData` | ✅ реалізовано — НЕ було в оригінальному плані (планувався прямий PWA-інсталл) |
| `cars` | Розширено `fuel_card_number` + вкладені `specs`/`trailer` | ✅ (понад оригінальний план) |
| Магазини/товари/клієнти | Окремі довідники з ID як `number` | ⏳ лише типи, без mock/API/UI |
| Служби доставки, найманий транспорт | Окремі моделі | ⏳ лише типи, без mock/API/UI |
| `StoreConfirmModal`/QR-сканування | Тільки для першого QR у daily-режимі | ⏳ не реалізовано — Фаза 15 |

---

## Правила іменування

| Категорія | Конвенція | Приклад | Примітка |
|-----------|-----------|---------|---------|
| Компоненти | PascalCase | `AuthModal.tsx`, `DayModeSwitch.tsx` | |
| Hooks | `use` + PascalCase | `useWaybillFilters.ts` | тека `hocks/`, не `hooks/` |
| Utils | camelCase | `calcTransportCost.ts` | |
| Типи | PascalCase | `HiredTransportTrip`, `CarStatus` | |
| Type aliases | PascalCase | `DeliveryChannel`, `TrackingMode` | |
| Mock файли | kebab-case | `route-events.json` | |
| Змінні оточення | `VITE_` prefix | `VITE_USE_MOCK`, `VITE_TELEGRAM_BOT_USERNAME` | остання — НОВА, для Mini App |
