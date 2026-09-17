import type {
    WaybillRecord,
    WaybillSummary,
    WaybillFilters,
    SortParams,
    SortField,
    PaginationParams,
    PaginatedResponse,
    DeliveryChannel,
} from "../types";
import {
    USE_MOCK,
    apiFetch,
    mockDelay,
} from "./config.ts";
import mockWaybills from "../mocks/waybills.json";
import {
    filterWaybills,
    sortItems,
    paginate,
} from "../utils/clientFilter.ts";

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
            status: first.status ?? "pending",
        });
    });

    return summaries;
}

// Форма одного РЯДКА агрегованого реєстру (GET .../summary/,
// одна накладна = один рядок відповіді) — snake_case, як і скрізь у
// бекенді. shipped_uah/returned_uah/weight_kg_sum рахуються Django
// aggregate-ами (Sum) над сирими рядками — приходять простими числами
// (не рядком, на відміну від звичайних DecimalField у серіалізаторах).
interface RawWaybillSummaryRow {
    waybill_number: string;
    waybill_date: string;
    legal_entity: WaybillSummary["legalEntity"];
    customer: number | null;
    customer_name: string;
    store: number | null;
    delivery_channel: DeliveryChannel | null;
    assigned_car: number | null;
    assigned_car__number_car: string | null;
    hired_car_number: string;
    carrier_ttn: string;
    lines_count: number;
    shipped_uah: number;
    returned_uah: number;
    weight_kg_sum: number | null;
}

// Один товарний рядок накладної, як його віддає WaybillRecordSerializer
// (list/, by-number/<number>/) — тут decimal-поля таки рядки (звичайна
// поведінка ModelSerializer.DecimalField).
interface RawWaybillLine {
    id: number;
    legal_entity: WaybillSummary["legalEntity"];
    waybill_number: string;
    waybill_date: string;
    line_position: number;
    customer: number | null;
    customer_name: string;
    store: number | null;
    product: number | null;
    product_name: string;
    quantity: string;
    price_uah: string;
    total_uah: string;
    comment: string;
    total_weight_kg: string | null;
    total_volume_cbm: string | null;
    volumetric_weight_kg: string | null;
    delivery_channel: DeliveryChannel | null;
    assigned_car: number | null;
    assigned_car_number: string | null;
    hired_car_number: string;
    carrier_ttn: string;
    is_return: boolean;
    imported_at: string;
    import_batch_id: string;
}

interface RawPaginated<T> {
    count: number;
    results: T[];
}

// "Яке авто везе" — для own це реальне авто з парку, для hired це
// вільний текстовий номер (найманий транспорт не веде довідник Car).
// Показуємо в одному полі UI (WaybillSummary.carNumber) — лише один із
// двох колись заповнений (ексклюзивність каналу гарантує бекенд).
function mapSummaryRow(raw: RawWaybillSummaryRow): WaybillSummary {
    return {
        legalEntity: raw.legal_entity,
        waybillNumber: raw.waybill_number,
        waybillDate: raw.waybill_date,
        customerId: raw.customer != null ? String(raw.customer) : "",
        customerName: raw.customer_name,
        storeId: raw.store != null ? String(raw.store) : undefined,
        linesCount: raw.lines_count,
        totalUah: raw.shipped_uah,
        returnsUah: raw.returned_uah,
        totalWeightKg: raw.weight_kg_sum ?? undefined,
        deliveryChannel: raw.delivery_channel,
        carId: raw.assigned_car ?? undefined,
        carNumber: raw.assigned_car__number_car ?? raw.hired_car_number ?? undefined,
        carrierTtn: raw.carrier_ttn || undefined,
        // Реального "status" на бекенді нема — тільки delivery_channel.
        // "delivered"/"cancelled" нічим підкріпити зараз (немає жодних
        // даних про фактичну доставку), тому єдине, що можна чесно
        // показати — призначено канал чи ні.
        status: raw.delivery_channel ? "scanned" : "pending",
    };
}

function mapLineToRecord(raw: RawWaybillLine): WaybillRecord {
    return {
        id: raw.id,
        legalEntity: raw.legal_entity,
        waybillNumber: raw.waybill_number,
        waybillDate: raw.waybill_date,
        linePosition: raw.line_position,
        customerId: raw.customer != null ? String(raw.customer) : "",
        customerName: raw.customer_name,
        storeId: raw.store != null ? String(raw.store) : undefined,
        productId: raw.product ?? 0,
        productName: raw.product_name,
        quantity: Number(raw.quantity),
        priceUah: Number(raw.price_uah),
        totalUah: Number(raw.total_uah),
        comment: raw.comment || undefined,
        totalWeightKg: raw.total_weight_kg ? Number(raw.total_weight_kg) : undefined,
        totalVolumeCbm: raw.total_volume_cbm ? Number(raw.total_volume_cbm) : undefined,
        volumetricWeightKg: raw.volumetric_weight_kg ? Number(raw.volumetric_weight_kg) : undefined,
        deliveryChannel: raw.delivery_channel,
        status: raw.delivery_channel ? "scanned" : "pending",
        assignedCarId: raw.assigned_car ?? undefined,
        assignedCarNumber: raw.assigned_car_number ?? undefined,
        hiredCarNumber: raw.hired_car_number || undefined,
        carrierTtn: raw.carrier_ttn || undefined,
        importedAt: raw.imported_at,
        importBatchId: raw.import_batch_id || undefined,
    };
}

// field у SortParams → ordering-параметр, який розуміє .../summary/
// ("vehicle" нічим не підкріплений на бекенді — просто ігнорується,
// падає на дефолтне сортування за датою)
const ORDERING_PARAM: Partial<Record<SortField, string>> = {
    date: "date",
    total: "total",
    customer: "customer",
    weight: "weight",
};

// Отримати список накладних з фільтрами, сортуванням і пагінацією —
// РЕАЛЬНО агрегований по накладній (GET .../summary/), не по товарних
// позиціях: один рядок таблиці = вся накладна, linesCount/суми вважає
// бекенд (Django Sum/Count), не клієнт.
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

    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.legalEntity) params.set("legal_entity", filters.legalEntity);
    if (filters.deliveryChannel && filters.deliveryChannel !== "all") {
        params.set("delivery_channel", filters.deliveryChannel);
    }
    if (filters.lineType && filters.lineType !== "all") params.set("line_type", filters.lineType);
    if (filters.status) params.set("status", filters.status);
    if (filters.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters.dateTo) params.set("date_to", filters.dateTo);

    const orderingKey = ORDERING_PARAM[sort.field];
    if (orderingKey) params.set("ordering", sort.direction === "asc" ? orderingKey : `-${orderingKey}`);

    params.set("page", String(pagination.page));
    params.set("page_size", String(pagination.pageSize));

    const data = await apiFetch<RawPaginated<RawWaybillSummaryRow>>(`/waybill-records/summary/?${params}`);
    return {
        items: data.results.map(mapSummaryRow),
        total: data.count,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages: Math.ceil(data.count / pagination.pageSize),
    };
}

// Деталі накладної — всі товарні рядки
export async function fetchWaybillDetail(number: string): Promise<WaybillRecord[]> {
    if (USE_MOCK) {
        await mockDelay();
        return (mockWaybills as WaybillRecord[]).filter(w => w.waybillNumber === number);
    }
    const raw = await apiFetch<RawWaybillLine[]>(`/waybill-records/by-number/${number}/`);
    return raw.map(mapLineToRecord);
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
    const raw = await apiFetch<RawWaybillLine[]>(`/waybill-records/by-number/${number}/`);
    return { waybillNumber: number, deliveryChannel: raw[0]?.delivery_channel ?? null };
}

// Не призначені накладні (для сторінки UnassignedWaybills)
export async function fetchUnassignedWaybills(): Promise<WaybillSummary[]> {
    if (USE_MOCK) {
        await mockDelay();
        const records = mockWaybills as WaybillRecord[];
        const summaries = aggregateToSummaries(records);
        return summaries.filter(w => !w.deliveryChannel);
    }
    const data = await apiFetch<RawPaginated<RawWaybillSummaryRow>>(
        `/waybill-records/summary/?delivery_channel=unassigned`,
    );
    return data.results.map(mapSummaryRow);
}

export interface AssignChannelPayload {
    deliveryChannel: DeliveryChannel;
    assignedCarId?: number;
    hiredCarNumber?: string;
    carrierTtn?: string;
}

// Призначити канал доставки одразу всій накладній (усім її товарних
// рядкам) + деталь каналу (авто власного парку / номер найманого авто /
// ТТН — залежно від каналу). Ексклюзивно: бекенд відмовить, якщо канал
// уже призначений.
export async function assignWaybillChannel(
    waybillNumber: string,
    payload: AssignChannelPayload,
): Promise<WaybillRecord[]> {
    const body: Record<string, unknown> = { delivery_channel: payload.deliveryChannel };
    if (payload.assignedCarId != null) body.assigned_car = payload.assignedCarId;
    if (payload.hiredCarNumber) body.hired_car_number = payload.hiredCarNumber;
    if (payload.carrierTtn) body.carrier_ttn = payload.carrierTtn;

    const raw = await apiFetch<RawWaybillLine[]>(
        `/waybill-records/by-number/${waybillNumber}/assign-channel/`,
        { method: "POST", json: body },
    );
    return raw.map(mapLineToRecord);
}