import type { HiredTransportTrip, HiredTripWaybill } from "../types";
import { apiFetch } from "./config.ts";

interface Paginated<T> {
	results: T[];
}

interface RawHiredTripWaybill {
	id: number;
	waybill_number: string;
}

interface RawHiredTransportTrip {
	id: number;
	car_number: string;
	route_name: string;
	trip_date: string;
	pallets_count?: number | null;
	cost_uah: string;
	comment: string;
	waybills: RawHiredTripWaybill[];
	created_at: string;
}

function mapHiredTrip(raw: RawHiredTransportTrip): HiredTransportTrip {
	return {
		id: raw.id,
		carNumber: raw.car_number,
		routeName: raw.route_name,
		tripDate: raw.trip_date,
		palletsCount: raw.pallets_count ?? undefined,
		costUah: Number(raw.cost_uah),
		comment: raw.comment || undefined,
		createdAt: raw.created_at,
		waybills: raw.waybills.map((w): HiredTripWaybill => ({
			id: w.id,
			tripId: raw.id,
			waybillNumber: w.waybill_number,
		})),
	};
}

export async function fetchHiredTrips(): Promise<HiredTransportTrip[]> {
	const data = await apiFetch<Paginated<RawHiredTransportTrip>>("/hired-transport-trips/");
	return data.results.map(mapHiredTrip);
}

export async function fetchHiredTrip(id: number): Promise<HiredTransportTrip> {
	const raw = await apiFetch<RawHiredTransportTrip>(`/hired-transport-trips/${id}/`);
	return mapHiredTrip(raw);
}

export interface HiredTripPayload {
	carNumber: string;
	routeName: string;
	tripDate: string;
	palletsCount?: number;
	costUah: number;
	comment?: string;
}

function toHiredTripPayload(data: HiredTripPayload) {
	return {
		car_number: data.carNumber,
		route_name: data.routeName,
		trip_date: data.tripDate,
		pallets_count: data.palletsCount ?? null,
		cost_uah: data.costUah,
		comment: data.comment ?? "",
	};
}

export async function createHiredTrip(data: HiredTripPayload): Promise<HiredTransportTrip> {
	const raw = await apiFetch<RawHiredTransportTrip>("/hired-transport-trips/", {
		method: "POST",
		json: toHiredTripPayload(data),
	});
	return mapHiredTrip(raw);
}

export async function updateHiredTrip(id: number, data: HiredTripPayload): Promise<HiredTransportTrip> {
	const raw = await apiFetch<RawHiredTransportTrip>(`/hired-transport-trips/${id}/`, {
		method: "PATCH",
		json: toHiredTripPayload(data),
	});
	return mapHiredTrip(raw);
}

export async function deleteHiredTrip(id: number): Promise<void> {
	await apiFetch<void>(`/hired-transport-trips/${id}/`, {
		method: "DELETE",
	});
}

// POST /hired-transport-trips/{id}/attach_waybill/ — прикріплює накладну
// й виставляє WaybillRecord.delivery_channel="hired"
export async function attachWaybillToHiredTrip(id: number, waybillNumber: string): Promise<HiredTransportTrip> {
	const raw = await apiFetch<RawHiredTransportTrip>(`/hired-transport-trips/${id}/attach_waybill/`, {
		method: "POST",
		json: { waybill_number: waybillNumber },
	});
	return mapHiredTrip(raw);
}
