import type { CarrierShipment, CarrierWaybill, CarrierCode } from "../types";
import { apiFetch } from "./config.ts";

interface Paginated<T> {
	results: T[];
}

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
	const data = await apiFetch<Paginated<RawCarrierShipment>>("/carrier-shipments/");
	return data.results.map(mapCarrierShipment);
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
