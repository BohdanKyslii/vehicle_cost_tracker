import type { MonthlyCosts } from "../types";
import { apiFetch } from "./config.ts";

interface Paginated<T> {
	results: T[];
}

// Форма відповіді бекенду (snake_case) + два розрахункові поля
// (SerializerMethodField, лише на читання — їх немає в базовому MonthlyCosts)
interface RawMonthlyCosts {
	id: number;
	car: number;
	car_number: string;
	month: string;              // "2026-08-01" — перше число місяця
	salary_uah: string;
	taxes_uah: string;
	depreciation_uah: string;
	repair_actual_uah?: string | null;
	repair_rate_uah_km: string;
	other_costs_uah: string;
	other_costs_comment: string;
	repair_cost_uah: number;
	total_cost_uah: number;
}

export interface MonthlyCostsRecord extends MonthlyCosts {
	carNumber: string;
	repairCostUah: number;
	totalCostUah: number;
}

function mapMonthlyCosts(raw: RawMonthlyCosts): MonthlyCostsRecord {
	return {
		id: raw.id,
		carId: raw.car,
		carNumber: raw.car_number,
		month: raw.month,
		salaryUah: Number(raw.salary_uah),
		taxesUah: Number(raw.taxes_uah),
		depreciationUah: Number(raw.depreciation_uah),
		repairActualUah: raw.repair_actual_uah != null ? Number(raw.repair_actual_uah) : undefined,
		repairRateUahKm: Number(raw.repair_rate_uah_km),
		otherCostUah: Number(raw.other_costs_uah),
		otherCostComment: raw.other_costs_comment || undefined,
		repairCostUah: raw.repair_cost_uah,
		totalCostUah: raw.total_cost_uah,
	};
}

// carId — опційний фільтр (бекенд уже підтримує ?car_id=)
export async function fetchMonthlyCosts(carId?: number): Promise<MonthlyCostsRecord[]> {
	const query = carId ? `?car_id=${carId}` : "";
	const data = await apiFetch<Paginated<RawMonthlyCosts>>(`/monthly-costs/${query}`);
	return data.results.map(mapMonthlyCosts);
}

export async function fetchMonthlyCost(id: number): Promise<MonthlyCostsRecord> {
	const raw = await apiFetch<RawMonthlyCosts>(`/monthly-costs/${id}/`);
	return mapMonthlyCosts(raw);
}

export interface MonthlyCostsPayload {
	carId: number;
	month: string;              // "2026-08-01" — форма конвертує з <input type="month">
	salaryUah: number;
	taxesUah: number;
	depreciationUah: number;
	repairActualUah?: number;
	repairRateUahKm: number;
	otherCostUah: number;
	otherCostComment?: string;
}

function toMonthlyCostsPayload(data: MonthlyCostsPayload) {
	return {
		car: data.carId,
		month: data.month,
		salary_uah: data.salaryUah,
		taxes_uah: data.taxesUah,
		depreciation_uah: data.depreciationUah,
		repair_actual_uah: data.repairActualUah ?? null,
		repair_rate_uah_km: data.repairRateUahKm,
		other_costs_uah: data.otherCostUah,
		other_costs_comment: data.otherCostComment ?? "",
	};
}

export async function createMonthlyCost(data: MonthlyCostsPayload): Promise<MonthlyCostsRecord> {
	const raw = await apiFetch<RawMonthlyCosts>("/monthly-costs/", { method: "POST", json: toMonthlyCostsPayload(data) });
	return mapMonthlyCosts(raw);
}

export async function updateMonthlyCost(id: number, data: MonthlyCostsPayload): Promise<MonthlyCostsRecord> {
	const raw = await apiFetch<RawMonthlyCosts>(`/monthly-costs/${id}/`, { method: "PATCH", json: toMonthlyCostsPayload(data) });
	return mapMonthlyCosts(raw);
}

export async function deleteMonthlyCost(id: number): Promise<void> {
	await apiFetch<void>(`/monthly-costs/${id}/`, { method: "DELETE" });
}
