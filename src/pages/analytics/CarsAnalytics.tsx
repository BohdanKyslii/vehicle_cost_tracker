import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCars } from "../../hocks/useCars";
import { useMonthlyCostsList } from "../../hocks/useMonthlyCosts";
import { useAllOwnWaybillSummaries } from "../../hocks/useWaybills";
import { allocateMonthlyCosts } from "../../utils/calcTransportCost";
import { Spinner } from "../../components/ui/Spinner";
import { formatUah, formatPct, formatKg, formatCbm } from "../../utils/formatters";
import type { MonthlyCostsSummary } from "../../types";

function currentMonthIso(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// "2026-08" -> ["2026-08-01", "2026-08-31"]
function monthRange(monthIso: string): [string, string] {
	const [y, m] = monthIso.split("-").map(Number);
	const from = `${monthIso}-01`;
	const lastDay = new Date(y, m, 0).getDate();
	const to = `${monthIso}-${String(lastDay).padStart(2, "0")}`;
	return [from, to];
}

interface CarRow {
	carId: number;
	carNumber: string;
	carName: string;
	monthlyCostUah: number | null;
	waybillsCount: number;
	saleUah: number;
	quantity: number;
	weightKg: number;
	volumeCbm: number;
	costPctOfSale: number | null;
	costPerWaybill: number | null;
	costPerKg: number | null;
	costPerCbm: number | null;
}

// Перший повноцінний розріз аналітики (2026-09-17) — вартість власного
// авто за місяць (MonthlyCosts), розподілена по його накладних
// пропорційно сумі продажу (allocateMonthlyCosts — вже існувала в коді,
// просто ніколи не була підключена).
// Вага/об'єм (2026-09-18) рахуються бекендом "на льоту" з кількості ×
// ProductLogistics (weight_kg_sum/volume_cbm_sum на .../summary/) —
// WaybillRecord.total_weight_kg сам по собі завжди null, тому це
// підмінна, а не пряма агрегація поля. Рядки товарів без заповненої
// ваги/габаритів дають 0 — доки довідник не заповнений повністю
// (135 товарів надіслано Excel-файлом 2026-09-17), ці колонки — це
// НИЖНЯ межа реальної ваги/об'єму, не точне значення.
export function CarsAnalytics() {
	const [month, setMonth] = useState(currentMonthIso());
	const [dateFrom, dateTo] = monthRange(month);

	const { data: cars, isLoading: carsLoading } = useCars();
	const { data: monthlyCosts, isLoading: costsLoading } = useMonthlyCostsList();
	const { data: waybills, isLoading: waybillsLoading } = useAllOwnWaybillSummaries(dateFrom, dateTo);

	const isLoading = carsLoading || costsLoading || waybillsLoading;

	const rows: CarRow[] = useMemo(() => {
		if (!cars) return [];
		return cars.map(car => {
			const costRecord = monthlyCosts?.find(
				c => c.carId === car.idCar && c.month.slice(0, 7) === month,
			);
			const carWaybills = (waybills ?? []).filter(w => w.carId === car.idCar);

			const saleUah = carWaybills.reduce((s, w) => s + w.totalUah, 0);
			const quantity = carWaybills.reduce((s, w) => s + (w.totalQuantity ?? 0), 0);
			const weightKg = carWaybills.reduce((s, w) => s + (w.totalWeightKg ?? 0), 0);
			const volumeCbm = carWaybills.reduce((s, w) => s + (w.totalVolumeCbm ?? 0), 0);

			if (!costRecord || carWaybills.length === 0) {
				return {
					carId: car.idCar,
					carNumber: car.numberCar,
					carName: car.nameCar,
					monthlyCostUah: costRecord?.totalCostUah ?? null,
					waybillsCount: carWaybills.length,
					saleUah,
					quantity,
					weightKg,
					volumeCbm,
					costPctOfSale: null,
					costPerWaybill: null,
					costPerKg: null,
					costPerCbm: null,
				};
			}

			const costsSummary: MonthlyCostsSummary = { ...costRecord, totalKm: 0 };
			const allocated = allocateMonthlyCosts(carWaybills, costsSummary, car.numberCar);

			return {
				carId: car.idCar,
				carNumber: car.numberCar,
				carName: car.nameCar,
				monthlyCostUah: costRecord.totalCostUah,
				waybillsCount: allocated.length,
				saleUah,
				quantity,
				weightKg,
				volumeCbm,
				costPctOfSale: saleUah > 0 ? (costRecord.totalCostUah / saleUah) * 100 : null,
				costPerWaybill: allocated.length > 0 ? costRecord.totalCostUah / allocated.length : null,
				costPerKg: weightKg > 0 ? costRecord.totalCostUah / weightKg : null,
				costPerCbm: volumeCbm > 0 ? costRecord.totalCostUah / volumeCbm : null,
			};
		});
	}, [cars, monthlyCosts, waybills, month]);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<Link to="/analytics" className="text-sm text-white/50 hover:text-white/80">← До аналітики</Link>
					<h1 className="text-xl font-bold text-white mt-1">Вартість доставки — Авто</h1>
				</div>
				<input
					type="month"
					value={month}
					onChange={e => setMonth(e.target.value)}
					className="rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [color-scheme:dark]"
				/>
			</div>

			<p className="text-xs text-white/40">
				Розподіл місячної вартості авто по накладних — пропорційно сумі продажу. Вага/об'єм рахуються
				лише по товарах із заповненою вагою/габаритами в довіднику — поки заповнено не все (див.
				надісланий Excel), ці колонки й "вартість/кг", "вартість/м³" — нижня межа, реальні числа вищі.
			</p>

			{isLoading && (
				<div className="py-12">
					<Spinner size="lg" label="Рахуємо..." />
				</div>
			)}

			{!isLoading && (
				<div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden overflow-x-auto">
					<table className="w-full text-sm">
						<thead className="bg-white/5 border-b border-white/10">
							<tr>
								<th className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase">Авто</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Місячна вартість</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Накладних</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Сума продажу</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">К-сть, од.</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Вага, кг</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Об'єм, м³</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">% від суми продажу</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">На 1 накладну</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Вартість/кг</th>
								<th className="px-4 py-3 text-right text-xs font-medium text-white/50 uppercase">Вартість/м³</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-white/10">
							{rows.map(r => (
								<tr key={r.carId} className="hover:bg-white/5">
									<td className="px-4 py-3">
										<div className="text-white font-medium">{r.carName}</div>
										<div className="text-xs text-white/40">{r.carNumber}</div>
									</td>
									<td className="px-4 py-3 text-right text-white whitespace-nowrap">
										{r.monthlyCostUah != null ? formatUah(r.monthlyCostUah) : "—"}
									</td>
									<td className="px-4 py-3 text-right text-white/70">{r.waybillsCount || "—"}</td>
									<td className="px-4 py-3 text-right text-white whitespace-nowrap">
										{r.saleUah > 0 ? formatUah(r.saleUah) : "—"}
									</td>
									<td className="px-4 py-3 text-right text-white/70">{r.quantity || "—"}</td>
									<td className="px-4 py-3 text-right text-white/70 whitespace-nowrap">
										{r.weightKg > 0 ? formatKg(r.weightKg) : "—"}
									</td>
									<td className="px-4 py-3 text-right text-white/70 whitespace-nowrap">
										{r.volumeCbm > 0 ? formatCbm(r.volumeCbm) : "—"}
									</td>
									<td className="px-4 py-3 text-right text-white/70">
										{r.costPctOfSale != null ? formatPct(r.costPctOfSale) : "—"}
									</td>
									<td className="px-4 py-3 text-right text-white/70 whitespace-nowrap">
										{r.costPerWaybill != null ? formatUah(r.costPerWaybill) : "—"}
									</td>
									<td className="px-4 py-3 text-right text-white/70 whitespace-nowrap">
										{r.costPerKg != null ? `${formatUah(r.costPerKg)}/кг` : "—"}
									</td>
									<td className="px-4 py-3 text-right text-white/70 whitespace-nowrap">
										{r.costPerCbm != null ? `${formatUah(r.costPerCbm)}/м³` : "—"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
