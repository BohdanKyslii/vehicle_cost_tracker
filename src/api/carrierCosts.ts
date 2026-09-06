import type { CarrierCost } from "../types";
import { apiFetch } from "./config.ts";

interface Paginated<T> {
	results: T[];
}

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
	const data = await apiFetch<Paginated<RawCarrierCost>>("/carrier-costs/");
	return data.results.map(mapCarrierCost);
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
