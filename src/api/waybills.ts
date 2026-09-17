import type {
    WaybillRecord,
    WaybillSummary,
    WaybillFilters,
    SortParams,
    PaginationParams,
    PaginatedResponse,
    DeliveryChannel,
} from "../types";
import {
    USE_MOCK,
    API_BASE,
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

// Форма одного рядка накладної, як її реально віддає бекенд
// (WaybillRecordSerializer, snake_case) — без агрегації по накладній і
// без поля "status" (його на бекенді взагалі нема, це суто мок-концепція).
interface RawWaybillLine {
    id: number;
    legal_entity: WaybillSummary["legalEntity"];
    waybill_number: string;
    waybill_date: string;
    customer: number | null;
    customer_name: string;
    store: number | null;
    total_uah: string;
    total_weight_kg: string | null;
    total_volume_cbm: string | null;
    delivery_channel: DeliveryChannel | null;
    is_return: boolean;
}

interface RawPaginated<T> {
    count: number;
    results: T[];
}

// Тимчасове рішення (без агрегації по waybill_number — бекенд її не
// рахує): один рядок бекенду = один рядок таблиці. "Кількість позицій"
// і суми в UI показуватимуть дані по одній товарній позиції, а не по
// всій накладній, доки на бекенді не з'явиться справжня агрегація.
function mapLineToSummary(raw: RawWaybillLine): WaybillSummary {
    const totalUah = Number(raw.total_uah);
    return {
        legalEntity: raw.legal_entity,
        waybillNumber: raw.waybill_number,
        waybillDate: raw.waybill_date,
        customerId: raw.customer != null ? String(raw.customer) : "",
        customerName: raw.customer_name,
        storeId: raw.store != null ? String(raw.store) : undefined,
        linesCount: 1,
        totalUah: raw.is_return ? 0 : totalUah,
        returnsUah: raw.is_return ? totalUah : 0,
        totalWeightKg: raw.total_weight_kg ? Number(raw.total_weight_kg) : undefined,
        totalVolumeCbm: raw.total_volume_cbm ? Number(raw.total_volume_cbm) : undefined,
        deliveryChannel: raw.delivery_channel,
        status: "pending",
    };
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

    // Для реального API передаємо параметри через URL query string.
    // sort/status/channel-фільтри поки НЕ мапляться — бекенд (DRF
    // OrderingFilter/get_queryset) не має відповідних імен параметрів
    // ні "status" взагалі; лишаємо тільки те, що реально працює.
    const params = new URLSearchParams();
    if (filters.search) params.set("search", filters.search);
    if (filters.legalEntity) params.set("legal_entity", filters.legalEntity);
    params.set("page", String(pagination.page));
    params.set("page_size", String(pagination.pageSize));

    const data = await apiFetch<RawPaginated<RawWaybillLine>>(`/waybill-records/?${params}`);
    return {
        items: data.results.map(mapLineToSummary),
        total: data.count,
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalPages: Math.ceil(data.count / pagination.pageSize),
    };
}

// Деталі накладної — всі рядки
export async function fetchWaybillDetail(number: string): Promise<WaybillRecord[]> {
    if (USE_MOCK) {
        await mockDelay();
        return (mockWaybills as WaybillRecord[]).filter(w => w.waybillNumber === number);
    }
    const res = await fetch(`${API_BASE}/waybill-records/${number}/`);
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
    const res = await fetch(`${API_BASE}/waybill-records/${number}/channel/`);
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
    const res = await fetch(`${API_BASE}/waybill-records/unassigned/`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}