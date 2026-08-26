# Vehicle Cost Tracker — Mock дані

> ✅ Резинхронізовано 2026-08-24. З ~15 файлів, запланованих
> в оригінальному дизайні, реально існують лише **чотири**:
> `cars.json`, `drivers.json`, `route-events.json`, `waybills.json` —
> всі в `src/mocks/`, з реальними даними компанії (справжні держ. номери,
> ПІБ водіїв, номери накладних з 1С — не вигадані приклади). Решта
> файлів нижче — досі лише план, позначено ⏳.

---

## ✅ `cars.json` — реалізовано

Реальні 4 авто (не 3, як в оригінальному плані):

```json
[
  {
    "idCar": 1, "nameCar": "Citroen Jumpy", "numberCar": "KA0458MХ",
    "amountCar": 24987, "defaultTrackingMode": "full", "statusCar": "active", "isActive": true
  },
  {
    "idCar": 2, "nameCar": "Renault Trafic", "numberCar": "АІ8822СІ",
    "amountCar": 15000, "defaultTrackingMode": "full", "statusCar": "active", "isActive": true
  },
  {
    "idCar": 3, "nameCar": "DAF XF 460", "numberCar": "КА2579НС",
    "amountCar": 29400, "defaultTrackingMode": "daily", "statusCar": "active", "isActive": true
  },
  {
    "idCar": 4, "nameCar": "MAN TGL 12.220", "numberCar": "KA8634MO",
    "amountCar": 40600, "defaultTrackingMode": "daily", "statusCar": "active", "isActive": true
  }
]
```

⏳ Немає жодного авто зі `statusCar: "repair"` в mock-даних (усі `active`) —
якщо потрібно перевірити UI для стану "у ремонті", доведеться додати вручну.

---

## ✅ `drivers.json` — реалізовано

Реальні 4 водії, прив'язані 1-до-1 до `cars.json`:

```json
[
  { "idDriver": 1, "nameDriver": "Акулов Олександр", "phoneDriver": "+380980122469", "idCar": 1, "isActive": true },
  { "idDriver": 2, "nameDriver": "Піндюр Валентин", "phoneDriver": "+380963990001", "idCar": 2, "isActive": true },
  { "idDriver": 3, "nameDriver": "Стужнєв Ігор Вікторович", "phoneDriver": "+380676206282", "idCar": 3, "isActive": true },
  { "idDriver": 4, "nameDriver": "Гусєв Андрій Анатолійович", "phoneDriver": "+380675071743", "idCar": 4, "isActive": true }
]
```

> ⚠️ Поле — `phoneDriver`, не `phone` як в оригінальному плані (звіряй з
> `03_TYPESCRIPT_TYPES.md` / `src/types/index.ts::Driver`).

---

## ✅ `route-events.json` — реалізовано

Реальні дати (липень 2026), реальні номери накладних і клієнтів:

```json
[
  {
    "id": 1, "carId": 1, "driverId": 1, "trackingMode": "full",
    "eventType": "depot_start", "eventTs": "2026-07-09T08:00:00+03:00",
    "odometerKm": 132450, "createdAt": "2026-07-09T08:00:05+03:00"
  },
  {
    "id": 2, "carId": 1, "driverId": 1, "trackingMode": "full",
    "eventType": "delivery", "eventTs": "2026-07-09T08:31:00+03:00",
    "odometerKm": 132506, "palletsCount": 1,
    "waybillNumber": "РБН00007016", "waybillDate": "2026-07-09",
    "customerName": "Альянс Холдинг ТОВ", "createdAt": "2026-07-09T08:31:10+03:00"
  }
]
```

⚠️ Всі записи в цьому файлі — `trackingMode: "full"` (авто 1). Якщо
потрібно перевірити `daily`-сценарій (авто 3/4) — своїх подій у mock-файлі
для них немає, доведеться додати вручну.

---

## ✅ `waybills.json` — реалізовано

Реальний вигляд рядків із 1С (юр. особа Rubin, реальні артикули й клієнти):

```json
[
  {
    "id": 1, "legalEntity": "Rubin",
    "waybillNumber": "РБН00006975", "waybillDate": "2026-07-08", "linePosition": 1,
    "customerId": "C001", "customerName": "Альянс Холдинг ТОВ",
    "productId": 46567, "productName": "Автомобільний тримач для телефону Remzona PHM-13BK",
    "quantity": 5, "priceUah": 259.98, "totalUah": 1299.9,
    "deliveryChannel": "own", "status": "delivered",
    "importedAt": "2026-07-08T20:00:00+03:00", "importBatchId": "1c-2026-07-08"
  }
]
```

> ⚠️ `productId` тут — `number` (46567), не `string` як в оригінальному
> плані (звіряй з `03_TYPESCRIPT_TYPES.md`). `storeId`/`totalWeightKg`/
> `totalVolumeCbm` в реальних записах здебільшого відсутні — довідники
> товарів/магазинів ще не існують (нема з чого порахувати логістику при
> імпорті).

---

## ⏳ Заплановано, файлів ще не існує

Оригінальний дизайн-план для решти mock-файлів (лишено як орієнтир на
майбутнє — жоден з прикладів нижче не перевірявся проти реального коду):

```
src/mocks/
├── product-categories.json    5 категорій
├── products.json               20 товарів
├── product-logistics.json      20 записів
├── customers.json              10 клієнтів
├── stores.json                 20 магазинів (2 на клієнта)
├── store-delivery-addresses.json  40 адрес (2 на магазин)
├── monthly-costs.json          2 місяці × N авто
├── hired-trips.json            рейси найманого транспорту
├── hired-trip-waybills.json    прив'язані накладні
├── carrier-shipments.json      відправлення (НП + Міст Експрес)
├── carrier-waybills.json       прив'язані накладні
└── carrier-costs.json          реєстр витрат
```

### Приклад `customers.json` (план)

```json
[
  { "idCustomer": "C001", "nameCustomer": "ТОВ Сонячна торгівля",   "networkCustomer": "Роздріб", "isActive": true },
  { "idCustomer": "C002", "nameCustomer": "ФОП Петренко В.М.",       "networkCustomer": "Роздріб", "isActive": true }
]
```

> ⚠️ У плані `idCustomer` — `string` ("C001"), але реальний
> `src/types/index.ts::Customer.idCustomer` вже типізований як `number`
> — якщо колись дійде до створення цього mock-файлу, звіряй з поточними
> типами, не з прикладом тут.

### Приклад `hired-trips.json` (план)

```json
[
  {
    "id": 1, "carNumber": "ВВ1111АА", "routeName": "Пирятин, Полтава, Харків",
    "tripDate": "2026-06-27", "palletsCount": 8, "costUah": 4500.00,
    "comment": "Перевізник ТОВ Транслог", "createdAt": "2026-06-27T09:00:00+03:00"
  }
]
```

### Приклад `carrier-shipments.json` (план)

```json
[
  {
    "id": 1, "carrierName": "Нова Пошта", "ttn": "59001234567890",
    "shipmentDate": "2026-06-28", "comment": null, "createdAt": "2026-06-28T11:00:00+03:00"
  }
]
```

---

## Маппінг колонок CSV 1С → система (план, парсер ще не написаний)

| CSV | Поле | Примітка |
|-----|------|---------|
| `юридична особа` | `legalEntity` | ESP / OPT / Rubin |
| `дата` | `waybillDate` | DD.MM.YYYY |
| `номер` | `waybillNumber` | |
| `клієнт id` | `customerId` | |
| `торгова точка id` | `storeId` | |
| `артикул` | `productId` | |
| `кількість` | `quantity` | < 0 = повернення |
| `ціна` | `priceUah` | |
| `сума` | `totalUah` | |
| `позиція` | `linePosition` | |
| `коментар` | `comment` | для повернень = накладна клієнта |

## Маппінг реєстру НП / Міст Експрес → `carrier_costs` (план)

| CSV | Поле |
|-----|------|
| `ТТН` або `№ відправлення` | `ttn` |
| `Дата` | `costDate` |
| `Вага` | `weightKg` |
| `Вартість` | `costUah` |

> ⏳ `utils/parseCsv.ts` не існує — ні `parseCsvToWaybills`, ні
> `parseCsvToCarrierCosts` ще не написані.
