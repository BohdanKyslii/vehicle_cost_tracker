import type { RouteEvent, DailySummary, RouteSegment } from "../types";

// Будує денний підсумок з масиву подій за один день.
// Ключова логіка:
// - daily: пробіг = depot_start сьогодні − lastOdometer вчора
// - full: пробіг = одометр parking_end − одометр depot_start
// - сегменти (час/відстань між точками) — тільки для full

export function buildDailySummary(
	events: RouteEvent[],
	prevDayLastOdometer: number | null,
): DailySummary {
	// Сортуємо події за часом (на випадок якщо прийшли не впорядковані)
	const sorted = [ ...events].sort(
		(a,b) => new Date(a.eventTs).getTime() - new Date(b.eventTs).getTime()
	);
	
	const mode = sorted[0]?.trackingMode ?? "daily";
	const date = sorted[0]?.eventTs.slice(0, 10) ?? "";
	
	// Підсумовуємо витрати — filter по типу, потім reduce для суми
	// filter повертає масив елементів де умова true
	// reduce(callback, початкове_значення) — по черзі проходить масив і накопичує значення
	const fuelLiters = sorted
		.filter(e => e.eventType === "refuel")
		.reduce((sum, e) => sum + (e.fuelLiters ?? 0), 0);
	
	const fuelCostUah = sorted
		.filter(e => e.eventType === "refuel")
		.reduce((sum, e) => sum + (e.fuelCostUah ?? 0), 0);
	
	const adBlueLiters = sorted
		.filter(e => e.eventType === "refuel")
		.reduce((sum, e) => sum + (e.adBlueLiters ?? 0), 0);
	
	const adBlueCostUah = sorted
		.filter(e => e.eventType === "refuel")
		.reduce((sum, e) => sum + (e.adBlueCostUah ?? 0), 0);
	
	const otherCostUah = sorted
		.filter(e => e.eventType === "other_cost")
		.reduce((sum, e) => sum + (e.otherCostUah ?? 0), 0);
	
	// Підрахунок подій по типу
	const deliveriesCount = sorted
		.filter(e => e.eventType === "delivery")
		.length;
	
	const returnCount = sorted
		.filter(e => e.eventType === "return_goods")
		.length;
	
	const extraCargoCount = sorted
		.filter(e => e.eventType === "extra_cargo")
		.length;
	
	// Всі накладні за день
	const waybillNumbers = sorted
		.filter(e => e.waybillNumber)
		.map(e => e.waybillNumber!);  // ! — non-null assertion (ми вже відфільтрували null)
	
	// Розрахунок пробігу
	const depotStart = sorted
		.find(e => e.eventType === "depot_start");
	
	const parkingEnd = sorted
		.find(e => e.eventType === "parking_end");
	
	let totalMileageKm = 0;
	let loadedMileageKm: number | null = null;
	let emptyMileageKm: number | null = null;

	if (mode === "daily") {
		// daily: одометр depot_start − одометр вчора
		if (depotStart?.odometerKm && prevDayLastOdometer) {
			totalMileageKm = depotStart.odometerKm - prevDayLastOdometer;
		}
	} else {
		// full: одометр parking_end − одометр depot_start
		if (parkingEnd?.odometerKm && depotStart?.odometerKm) {
			totalMileageKm = parkingEnd.odometerKm - depotStart.odometerKm;
		}

		// Порожній пробіг = від останнього delivery до parking_end
		const lastDelivery = [...sorted]
			.reverse()
			.find(e => e.eventType === "delivery");

		if (lastDelivery?.odometerKm && parkingEnd?.odometerKm) {
			emptyMileageKm = parkingEnd.odometerKm - lastDelivery.odometerKm;
			loadedMileageKm = totalMileageKm - emptyMileageKm;
		}
	}
	
	// Кількість палет
	let palletsCount: number | null = null;
	
	if (mode === "daily" && depotStart?.palletsCount) {
		palletsCount = depotStart?.palletsCount;
	} else if (mode === "full") {
		const total = sorted
		.filter(e => e.eventType === "delivery" && e.palletsCount)
			.reduce((sum, e) => sum + (e.palletsCount ?? 0), 0);
		if (total > 0) palletsCount = total;
	}
	
	const segments = mode === "full" ? buildRouteSegments(sorted) : [];
	
	return {
		carId: sorted[0]?.carId ?? 0,
		driverId: sorted[0]?.driverId ?? 0,
		trackingMode: mode,
		date,
		totalMileageKm,
		loadedMileageKm,
		emptyMileageKm,
		palletsCount,
		fuelLiters,
		fuelCostUah,
		adBlueLiters,
		adBlueCostUah,
		otherCostUah,
		deliveriesCount,
		returnCount,
		extraCargoCount,
		waybillNumbers,
		segments,
	};
}

// Будує масив відрізків маршруту між послідовними подіями (тільки full)
export  function buildRouteSegments(events: RouteEvent[]): RouteSegment[] {
	const segments: RouteSegment[] = [];
	// Беремо тільки події з одометром (виключаємо refuel без пробігу)
	const withOdometer = events.filter(e => e.odometerKm !== null && e.odometerKm !== undefined);
	
	for (let i = 0; i < withOdometer.length - 1; i++) {
		const curr = withOdometer[i];
		const next = withOdometer[i + 1];
		
		const distanceKm = (next.odometerKm ?? 0) - (curr.odometerKm ?? 0);
		// Час у мілісекундах → хвилини
		const  durationMin = Math.round(
			(new Date(next.eventTs).getTime() - new Date(curr.eventTs).getTime()) / 60000
		);
		
		segments.push({
			fromEvent: curr.eventType,
			toEvent: next.eventType,
			waybillNumber: next.waybillNumber,
			customerName: next.customerName,
			distanceKm: Math.max(0, distanceKm), // захист від від'ємного
			durationMin: Math.max(0, durationMin),
		});
	}
	
	return segments;
}
