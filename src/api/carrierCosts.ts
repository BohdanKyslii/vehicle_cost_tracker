import type { CarrierCost } from "../types";
import { apiFetch, fetchAllPages } from "./config.ts";

interface RawCarrierCost {
	id: number;
	shipment: number | null;
	ttn: string;
	weight_kg: string;
	cost_uah: string;
	cost_date: string;
	imported_at: string;
}

function mapCarrierCost(raw: RawCarrierCost): CarrierCost {
	return {
		id: raw.id,
		shipmentId: raw.shipment ?? undefined,
		ttn: raw.ttn,
		costDate: raw.cost_date,
		weightKg: Number(raw.weight_kg),
		costUah: Number(raw.cost_uah),
		importedAt: raw.imported_at,
	};
}

export async function fetchCarrierCosts(): Promise<CarrierCost[]> {
	const raw = await fetchAllPages<RawCarrierCost>("/carrier-costs/");
	return raw.map(mapCarrierCost);
}

export interface CarrierCostPayload {
	ttn: string;
	weightKg: number;
	costUah: number;
	costDate: string;
}

// `shipment` НЕ надсилається — бекенд сам зіставляє по ttn в
// perform_create (apps/logistics/views.py)
function toCarrierCostPayload(data: CarrierCostPayload) {
	return {
		ttn: data.ttn,
		weight_kg: data.weightKg,
		cost_uah: data.costUah,
		cost_date: data.costDate,
	};
}

export async function createCarrierCost(data: CarrierCostPayload): Promise<CarrierCost> {
	const raw = await apiFetch<RawCarrierCost>("/carrier-costs/", { method: "POST", json: toCarrierCostPayload(data) });
	return mapCarrierCost(raw);
}

export interface CarrierCostBulkItem {
	ttn: string;
	costDate: string;
	costUah: number;
	weightKg: number;
}

export interface CarrierCostBulkResult {
	created: number;
	linked: number;           // одразу зматчено з відправленням по ТТН
	skippedExisting: number;  // вартість для ТТН уже є — повторна заливка безпечна
	errors: { ttn: string; message: string }[];
}

// POST /carrier-costs/bulk_import/ — до 500 рядків за запит, ідемпотентно
export async function bulkImportCarrierCosts(items: CarrierCostBulkItem[]): Promise<CarrierCostBulkResult> {
	const raw = await apiFetch<{
		created: number;
		linked: number;
		skipped_existing: number;
		errors: { ttn: string; message: string }[];
	}>("/carrier-costs/bulk_import/", {
		method: "POST",
		json: {
			costs: items.map((i) => ({
				ttn: i.ttn,
				cost_date: i.costDate,
				cost_uah: i.costUah.toFixed(2),
				weight_kg: i.weightKg.toFixed(2),
			})),
		},
	});
	return { created: raw.created, linked: raw.linked, skippedExisting: raw.skipped_existing, errors: raw.errors };
}
