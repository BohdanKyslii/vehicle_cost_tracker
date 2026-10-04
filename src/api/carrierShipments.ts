import type { CarrierShipment, CarrierWaybill, CarrierCode } from "../types";
import { apiFetch, fetchAllPages } from "./config.ts";

interface RawCarrierShipmentWaybill {
	id: number;
	waybill_number: string;
}

interface RawCarrierShipment {
	id: number;
	carrier: string;
	ttn: string;
	shipment_date: string;
	waybills: RawCarrierShipmentWaybill[];
	created_at: string;
}

function mapCarrierShipment(raw: RawCarrierShipment): CarrierShipment {
	return {
		id: raw.id,
		carrier: raw.carrier as CarrierCode,
		ttn: raw.ttn,
		shipmentDate: raw.shipment_date,
		createdAt: raw.created_at,
		waybills: raw.waybills.map((w): CarrierWaybill => ({
			id: w.id,
			shipmentId: raw.id,
			waybillNumber: w.waybill_number,
		})),
	};
}

export async function fetchCarrierShipments(): Promise<CarrierShipment[]> {
	const raw = await fetchAllPages<RawCarrierShipment>("/carrier-shipments/");
	return raw.map(mapCarrierShipment);
}

export async function fetchCarrierShipment(id: number): Promise<CarrierShipment> {
	const raw = await apiFetch<RawCarrierShipment>(`/carrier-shipments/${id}/`);
	return mapCarrierShipment(raw);
}

export interface CarrierShipmentPayload {
	carrier: CarrierCode;
	ttn: string;
	shipmentDate: string;
}

function toCarrierShipmentPayload(data: CarrierShipmentPayload) {
	return {
		carrier: data.carrier,
		ttn: data.ttn,
		shipment_date: data.shipmentDate,
	};
}

export async function createCarrierShipment(data: CarrierShipmentPayload): Promise<CarrierShipment> {
	const raw = await apiFetch<RawCarrierShipment>("/carrier-shipments/", { method: "POST", json: toCarrierShipmentPayload(data) });
	return mapCarrierShipment(raw);
}

export async function updateCarrierShipment(id: number, data: CarrierShipmentPayload): Promise<CarrierShipment> {
	const raw = await apiFetch<RawCarrierShipment>(`/carrier-shipments/${id}/`, { method: "PATCH", json: toCarrierShipmentPayload(data) });
	return mapCarrierShipment(raw);
}

export async function deleteCarrierShipment(id: number): Promise<void> {
	await apiFetch<void>(`/carrier-shipments/${id}/`, { method: "DELETE" });
}

// POST /carrier-shipments/{id}/attach_waybill/ — той самий принцип, що
// attachWaybillToHiredTrip
export async function attachWaybillToCarrierShipment(id: number, waybillNumber: string): Promise<CarrierShipment> {
	const raw = await apiFetch<RawCarrierShipment>(`/carrier-shipments/${id}/attach_waybill/`, {
		method: "POST",
		json: { waybill_number: waybillNumber },
	});
	return mapCarrierShipment(raw);
}

export interface CarrierShipmentImportItem {
	ttn: string;
	shipmentDate: string;
	waybills: string[];
}

export interface CarrierShipmentImportResult {
	createdShipments: number;
	existingShipments: number;
	attachedWaybills: number;
	skippedWaybills: number;
	errors: { ttn: string; waybillNumber?: string; message: string }[];
}

interface RawCarrierShipmentImportResult {
	created_shipments: number;
	existing_shipments: number;
	attached_waybills: number;
	skipped_waybills: number;
	errors: { ttn: string; waybill_number?: string; message: string }[];
}

// POST /carrier-shipments/bulk_import/ — реєстр служби доставки пачкою
// (бекенд приймає до 500 ТТН за запит). Ідемпотентний: повторна заливка
// того самого файлу нічого не дублює.
export async function bulkImportCarrierShipments(
	carrier: CarrierCode,
	items: CarrierShipmentImportItem[],
): Promise<CarrierShipmentImportResult> {
	const raw = await apiFetch<RawCarrierShipmentImportResult>("/carrier-shipments/bulk_import/", {
		method: "POST",
		json: {
			carrier,
			shipments: items.map((i) => ({ ttn: i.ttn, shipment_date: i.shipmentDate, waybills: i.waybills })),
		},
	});
	return {
		createdShipments: raw.created_shipments,
		existingShipments: raw.existing_shipments,
		attachedWaybills: raw.attached_waybills,
		skippedWaybills: raw.skipped_waybills,
		errors: raw.errors.map((e) => ({ ttn: e.ttn, waybillNumber: e.waybill_number, message: e.message })),
	};
}

// POST /carrier-shipments/{id}/detach_waybill/ — бекенд знімає канал
// "carrier" з накладної, якщо вона більше не в жодній ТТН
export async function detachWaybillFromCarrierShipment(id: number, waybillNumber: string): Promise<CarrierShipment> {
	const raw = await apiFetch<RawCarrierShipment>(`/carrier-shipments/${id}/detach_waybill/`, {
		method: "POST",
		json: { waybill_number: waybillNumber },
	});
	return mapCarrierShipment(raw);
}

// ── Звірка (/analytics/carriers) ────────────────────────────

export interface CarrierReviewWaybill {
	id: number;
	waybillNumber: string;
	found: boolean;                // є в імпорті накладних з 1С (WaybillRecord)
	legalEntities: string[];       // >1 — той самий номер у різних юросіб
	customerName: string | null;
	waybillDate: string | null;
	totalUah: number;
	deliveryChannel: string | null;
	carNumber: string | null;
	otherTtns: string[];           // інші ТТН з цією накладною (зазвичай — зворотна доставка документів)
}

export interface CarrierReviewShipment {
	id: number;
	carrier: CarrierCode;
	ttn: string;
	shipmentDate: string;
	costUah: number | null;
	costWeightKg: number | null;
	costsCount: number;
	waybills: CarrierReviewWaybill[];
}

interface RawCarrierReviewShipment {
	id: number;
	carrier: string;
	ttn: string;
	shipment_date: string;
	cost_uah: string | null;
	cost_weight_kg: string | null;
	costs_count: number;
	waybills: {
		id: number;
		waybill_number: string;
		found: boolean;
		legal_entities: string[];
		customer_name: string | null;
		waybill_date: string | null;
		total_uah: string | number;
		delivery_channel: string | null;
		car_number: string | null;
		other_ttns: string[];
	}[];
}

// GET /carrier-shipments/review/ — без пагінації, весь набір одним запитом
export async function fetchCarrierShipmentReview(carrier?: CarrierCode): Promise<CarrierReviewShipment[]> {
	const query = carrier ? `?carrier=${carrier}` : "";
	const raw = await apiFetch<RawCarrierReviewShipment[]>(`/carrier-shipments/review/${query}`);
	return raw.map((s) => ({
		id: s.id,
		carrier: s.carrier as CarrierCode,
		ttn: s.ttn,
		shipmentDate: s.shipment_date,
		costUah: s.cost_uah != null ? Number(s.cost_uah) : null,
		costWeightKg: s.cost_weight_kg != null ? Number(s.cost_weight_kg) : null,
		costsCount: s.costs_count,
		waybills: s.waybills.map((w) => ({
			id: w.id,
			waybillNumber: w.waybill_number,
			found: w.found,
			legalEntities: w.legal_entities,
			customerName: w.customer_name,
			waybillDate: w.waybill_date,
			totalUah: Number(w.total_uah),
			deliveryChannel: w.delivery_channel,
			carNumber: w.car_number,
			otherTtns: w.other_ttns,
		})),
	}));
}
