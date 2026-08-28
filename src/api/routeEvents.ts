import type {
    RouteEvent,
    RouteEventCreate,
    RouteEventType,
    TrackingMode,
} from "../types";
import {
    USE_MOCK,
    mockDelay,
    apiFetch,
} from "./config.ts";
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
        rejection: raw.rejection_full != null && raw.rejection_full !== undefined ? {
            isFull: raw.rejection_full,
            productId: raw.rejection_product_id ? Number(raw.rejection_product_id) : undefined,
            quantity: raw.rejection_qty != null ? Number(raw.rejection_qty) : undefined,
            comment: raw.rejection_comment || undefined,
        } : undefined,
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
        extraWeightKg: raw.extra_weight_kg != null ?Number(raw.extra_weight_kg) : undefined,
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
        const today = new Date().toISOString().slice(0, 10);    // "2026-06-29"
        return (mockEvents as RouteEvent[]).filter(
            e => e.carId === carId && e.eventTs.startsWith(today)
        );
    }
    const  data = await apiFetch<Paginated<RawRouteEvent>>(`/route-events/?car_id=${carId}&date=today`)
    return data.results.map(mapRouteEvent);
}

// Дістати усі події водія
export async function fetchDriverEvents(carId: number): Promise<RouteEvent[]> {
    if (USE_MOCK) {
        await mockDelay(200);
        return (mockEvents as RouteEvent[])
            .filter(e => e.carId === carId)
            .sort((a, b) => b.eventTs.localeCompare(a.eventTs));    // нові зверху
    }
    const data = await apiFetch<Paginated<RawRouteEvent>>(`/route-events/?car_id=${carId}`);
    return data.results.map(mapRouteEvent).sort((a, b) => b.eventTs.localeCompare(a.eventTs));
}

// Останній одометр авто (для розрахунку пробігу daily режиму)
export async function fetchLastOdometer(carId: number): Promise<number | null> {
    if (USE_MOCK) {
        await mockDelay(100);
        const  events = (mockEvents as RouteEvent[])
            .filter(e => e.carId === carId &&e.odometerKm !== undefined)
            .sort((a, b) => b.eventTs.localeCompare(a.eventTs));    // спадання по часу
        return events[0]?.odometerKm ?? null;
    }
    const data = await apiFetch<{ odometer_km: number | null }>(
        `/route-events/last_odometer/?car_id=${carId}`,
    );
    return data.odometer_km;
}

// Видалення помилково відсканованої/зайвої події (напр. зайва накладна)
export async function deleteRouteEvent(id: number): Promise<void> {
    if (USE_MOCK) {
        await mockDelay(300);
        return;
    }
    await apiFetch<void>(`/route-events/${id}/`, { method: "DELETE" });
}

// Створення нової події (POST запит)
export async function createRouteEvent(data: RouteEventCreate): Promise<RouteEvent> {
    if (USE_MOCK) {
        await mockDelay(500);
        // В mock режимі просто повертаємо об'єкт з фіктивним id
        const newEvent: RouteEvent = {
            ...data,
            id: Date.now(), // Date.now() — кількість мс від 1970-01-01, завжди унікальний
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
