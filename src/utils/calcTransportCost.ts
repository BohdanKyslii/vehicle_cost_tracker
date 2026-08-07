import type {
	MonthlyCosts,
	MonthlyCostsSummary,
	TransportCostPerWaybill,
	HiredTransportTrip, WaybillSummary,
} from "../types";

// Розраховує вартість ремонту:
// якщо логіст вніс фактичні витрати — беремо їх,
// інакше рахуємо: ставка × пробіг
export function calcRepairCost(costs: MonthlyCosts, totalKm: number): number {
	if (costs.repairActualUah !== undefined && costs.repairActualUah !== null) {
		return costs.repairActualUah;
	} else {
		return costs.repairRateUahKm * totalKm;
	}
}

// Загальна сума місячних витрат по авто
export function calcTotalMonthlyCost(costs: MonthlyCosts, totalKm: number): number {
	return (
		costs.salaryUah +
		costs.taxesUah +
		costs.depreciationUah +
		calcRepairCost(costs, totalKm) +
		costs.otherCostUah
	);
}

// Розподіляє місячні витрати по накладних
// Метод: пропорційно до суми продажу (більша накладна — більша частка витрат)
// Формула: витрати_i = загальні_витрати × (сума_i / Σ_всіх_сум)
export function allocateMonthlyCosts(
	waybills: WaybillSummary[],
	costs: MonthlyCostsSummary,
	carNumber: string,
): TransportCostPerWaybill[] {
	// Тільки відвантаження (quantity > 0), тільки власний автопарк
	const shipments = waybills.filter(w => w.totalUah > 0 && w.deliveryChannel === "own");
	
	// Загальна сума продажів через це авто за місяць
	const totalSales = shipments.reduce((sum, w) => sum + w.totalUah, 0);
	
	if (totalSales === 0) return [];
	
	return shipments.map(w => {
		const allocatedCostUah = costs.totalCostUah * (w.totalUah / totalSales);
		const costPctOfSale = (allocatedCostUah / w.totalUah) * 100;
		
		return {
			legalEntity: w.legalEntity,
			waybillNumber: w.waybillNumber,
			waybillDate: w.waybillDate,
			customerId: w.customerId,
			customerName: w.customerName,
			storeId: w.storeId,
			carId: w.carId ?? 0,
			carNumber,
			saleUah: w.totalUah,
			totalWeightKg: w.totalWeightKg,
			totalVolumeCbm: w.totalVolumeCbm,
			allocatedCostUah: Math.round(allocatedCostUah *100) / 100,
			costPctOfSale: Math.round(costPctOfSale * 100) / 100
		};
	});
}

// Розподіляє вартість рейсу найманого транспорту рівномірно по накладних
// (проста рівна частка — без ваги/об'єму)
export function allocateHiredTripCost(
	trip: HiredTransportTrip,
): { waybillNumber: string; costUah: number }[] {
	const waybills = trip.waybills ?? [];
	if (waybills.length === 0) return [];
	
	const costPerWaybill = trip.costUah / waybills.length;
	
	return waybills.map(w => ({
		waybillNumber: w.waybillNumber,
		costUah: Math.round(costPerWaybill * 100) / 100,
	}));
}
