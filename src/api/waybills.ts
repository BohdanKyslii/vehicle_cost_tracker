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