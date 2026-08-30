import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCars } from "../../hocks/useCars";
import { useMonthlyCostsList, useSaveMonthlyCost } from "../../hocks/useMonthlyCosts";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Spinner } from "../../components/ui/Spinner";
import type { MonthlyCostsPayload } from "../../api/monthlyCosts";

type FieldKey =
	| "salaryUah"
	| "taxesUah"
	| "depreciationUah"
	| "repairActualUah"
	| "repairRateUahKm"
	| "otherCostUah";

type Row = Record<FieldKey, string>;

const FIELDS: { key: FieldKey; label: string }[] = [
	{ key: "salaryUah", label: "ЗП водія (грн)" },
	{ key: "taxesUah", label: "Податки із ЗП (грн)" },
	{ key: "depreciationUah", label: "Амортизація (грн)" },
	{ key: "repairActualUah", label: "Ремонт — фактично (грн)" },
	{ key: "repairRateUahKm", label: "Ставка ремонту (грн/км)" },
	{ key: "otherCostUah", label: "Інші витрати (грн)" },
];

const cellClass =
	"w-24 rounded border border-white/10 bg-white/5 text-white text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400";

export function BulkMonthlyCostsForm() {
	const navigate = useNavigate();
	const { data: cars, isLoading: carsLoading } = useCars();
	// Без carId — усі записи всіх авто одразу: звідси й беремо (1) чи вже є
	// запис на обраний місяць для цього авто (create vs update), і (2)
	// останню відому амортизацію ДО обраного місяця для автопідстановки
	const { data: allCosts, isLoading: costsLoading } = useMonthlyCostsList();
	const saveMonthlyCost = useSaveMonthlyCost();

	const [month, setMonth] = useState("");
	const [rows, setRows] = useState<Record<number, Row>>({});
	// Зберігаємо тільки авто, які реально чіпали на цій сторінці — інакше
	// автопідстановка амортизації (нижче) позначила б УСІ авто як готові
	// до збереження, навіть ті, по яких цього місяця нічого не вносили
	const [touchedCars, setTouchedCars] = useState<Set<number>>(new Set());
	const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!month || !cars || !allCosts) return;
		const monthISO = `${month}-01`;
		const next: Record<number, Row> = {};
		for (const car of cars) {
			const existing = allCosts.find((c) => c.carId === car.idCar && c.month === monthISO);
			if (existing) {
				next[car.idCar] = {
					salaryUah: String(existing.salaryUah),
					taxesUah: String(existing.taxesUah),
					depreciationUah: String(existing.depreciationUah),
					repairActualUah: existing.repairActualUah != null ? String(existing.repairActualUah) : "",
					repairRateUahKm: String(existing.repairRateUahKm),
					otherCostUah: String(existing.otherCostUah),
				};
			} else {
				// Немає запису на обраний місяць — амортизація підтягується
				// з останнього попереднього місяця (вона майже стала, міняється
				// раз на рік); решта полів — з чистого аркуша
				const prevDepreciation = allCosts
					.filter((c) => c.carId === car.idCar && c.month < monthISO)
					.sort((a, b) => b.month.localeCompare(a.month))[0]?.depreciationUah;
				next[car.idCar] = {
					salaryUah: "",
					taxesUah: "",
					depreciationUah: prevDepreciation != null ? String(prevDepreciation) : "",
					repairActualUah: "",
					repairRateUahKm: "2.00",
					otherCostUah: "",
				};
			}
		}
		setRows(next);
		setTouchedCars(new Set());
		setSaveErrors({});
	}, [month, cars, allCosts]);

	function setCell(carId: number, key: FieldKey, value: string) {
		setRows((prev) => ({ ...prev, [carId]: { ...prev[carId], [key]: value } }));
		setTouchedCars((prev) => new Set(prev).add(carId));
	}

	async function handleSave() {
		if (!month || touchedCars.size === 0) return;
		setIsSaving(true);
		const monthISO = `${month}-01`;
		const errors: Record<number, string> = {};

		for (const carId of touchedCars) {
			const row = rows[carId];
			if (!row) continue;
			const existing = allCosts?.find((c) => c.carId === carId && c.month === monthISO);
			const payload: MonthlyCostsPayload = {
				carId,
				month: monthISO,
				salaryUah: Number(row.salaryUah || 0),
				taxesUah: Number(row.taxesUah || 0),
				depreciationUah: Number(row.depreciationUah || 0),
				repairActualUah: row.repairActualUah ? Number(row.repairActualUah) : undefined,
				repairRateUahKm: Number(row.repairRateUahKm || 2),
				otherCostUah: Number(row.otherCostUah || 0),
			};
			try {
				await saveMonthlyCost.mutateAsync({ id: existing?.id, data: payload });
			} catch (err) {
				errors[carId] = (err as Error).message;
			}
		}

		setIsSaving(false);
		setSaveErrors(errors);
		if (Object.keys(errors).length === 0) navigate("/costs");
	}

	const isLoading = carsLoading || costsLoading;

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Масове введення витрат</h1>
				<Button type="button" variant="ghost" onClick={() => navigate("/costs")}>← Назад</Button>
			</div>

			<div className="max-w-xs">
				<Input label="Місяць" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження..." />}

			{!isLoading && !month && (
				<p className="text-sm text-white/40">Обери місяць, щоб побачити таблицю по всіх авто.</p>
			)}

			{!isLoading && month && cars && cars.length > 0 && (
				<>
					<p className="text-xs text-white/40">
						Амортизація підставляється з останнього відомого місяця автоматично — зміни, якщо треба.
						Зберігаються лише авто, у яких щось змінено на цій сторінці.
					</p>
					<div className="overflow-x-auto rounded-xl border border-white/10">
						<table className="text-sm">
							<thead className="bg-white/5">
								<tr>
									<th className="sticky left-0 bg-[#0f1724] text-left text-white/60 font-medium px-3 py-2 whitespace-nowrap">
										Стаття витрат
									</th>
									{cars.map((car) => (
										<th key={car.idCar} className="text-left text-white/60 font-medium px-2 py-2 whitespace-nowrap">
											{car.numberCar}
											{touchedCars.has(car.idCar) && <span className="ml-1 text-violet-300">●</span>}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{FIELDS.map(({ key, label }) => (
									<tr key={key} className="border-t border-white/5">
										<td className="sticky left-0 bg-[#0f1724] text-white/70 px-3 py-2 whitespace-nowrap">{label}</td>
										{cars.map((car) => (
											<td key={car.idCar} className="px-2 py-1.5">
												<input
													type="number"
													step={key === "repairRateUahKm" ? "0.01" : undefined}
													value={rows[car.idCar]?.[key] ?? ""}
													onChange={(e) => setCell(car.idCar, key, e.target.value)}
													className={cellClass}
												/>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className="flex gap-3">
						<Button type="button" variant="ghost" onClick={() => navigate("/costs")}>Скасувати</Button>
						<Button type="button" onClick={handleSave} isLoading={isSaving} disabled={touchedCars.size === 0}>
							Зберегти {touchedCars.size > 0 ? `(${touchedCars.size})` : ""}
						</Button>
					</div>

					{Object.keys(saveErrors).length > 0 && (
						<div className="space-y-1">
							{Object.entries(saveErrors).map(([carId, message]) => {
								const car = cars.find((c) => c.idCar === Number(carId));
								return (
									<ErrorBanner
										key={carId}
										message={`${car?.numberCar ?? `Авто #${carId}`}: ${message}`}
									/>
								);
							})}
						</div>
					)}
				</>
			)}

			{!isLoading && month && cars && cars.length === 0 && (
				<p className="text-sm text-white/40">Немає жодного авто в автопарку.</p>
			)}
		</div>
	);
}
