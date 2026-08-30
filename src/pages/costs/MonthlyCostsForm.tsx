import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCars } from "../../hocks/useCars";
import { useMonthlyCost, useCreateMonthlyCost, useUpdateMonthlyCost } from "../../hocks/useMonthlyCosts";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { MonthlyCostsPayload } from "../../api/monthlyCosts";

export function MonthlyCostsForm() {
	const { costId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!costId;
	const { data: existing } = useMonthlyCost(isEdit ? Number(costId) : 0);
	const { data: cars } = useCars();

	const [carId, setCarId] = useState<number | "">(existing?.carId ?? "");
	// <input type="month"> дає "2026-08" — API очікує перше число місяця "2026-08-01"
	const [month, setMonth] = useState(existing?.month.slice(0, 7) ?? "");
	const [salaryUah, setSalaryUah] = useState(String(existing?.salaryUah ?? ""));
	const [taxesUah, setTaxesUah] = useState(String(existing?.taxesUah ?? ""));
	const [depreciationUah, setDepreciationUah] = useState(String(existing?.depreciationUah ?? ""));
	const [repairActualUah, setRepairActualUah] = useState(String(existing?.repairActualUah ?? ""));
	const [repairRateUahKm, setRepairRateUahKm] = useState(String(existing?.repairRateUahKm ?? "2.00"));
	const [otherCostUah, setOtherCostUah] = useState(String(existing?.otherCostUah ?? ""));
	const [otherCostComment, setOtherCostComment] = useState(existing?.otherCostComment ?? "");

	// Той самий патерн, що й CarForm (Фаза 16.5): запис витрат за місяць
	// теж не хочеться правити випадково — відкриваєш картку заблокованою,
	// "Редагувати" розблоковує поля. Для нового запису (isEdit=false)
	// блокування не має сенсу.
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	const createCost = useCreateMonthlyCost();
	const updateCost = useUpdateMonthlyCost(Number(costId));
	const mutation = isEdit ? updateCost : createCost;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const payload: MonthlyCostsPayload = {
			carId: Number(carId),
			month: `${month}-01`,
			salaryUah: Number(salaryUah),
			taxesUah: Number(taxesUah),
			depreciationUah: Number(depreciationUah),
			repairActualUah: repairActualUah ? Number(repairActualUah) : undefined,
			repairRateUahKm: Number(repairRateUahKm),
			otherCostUah: Number(otherCostUah || 0),
			otherCostComment: otherCostComment || undefined,
		};
		mutation.mutate(payload, { onSuccess: () => navigate("/costs") });
	}

	return (
		<div className="p-6">
			<form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-white">{isEdit ? "Місячні витрати" : "Нові місячні витрати"}</h1>
					{isEdit && !isEditingDetails && (
						<Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
							✏️ Редагувати
						</Button>
					)}
				</div>
				{detailsLocked && (
					<p className="text-xs text-white/40 -mt-2">
						Дані заблоковані від випадкової правки. Натисніть "Редагувати", щоб змінити.
					</p>
				)}

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Авто</label>
					<select
						value={carId}
						onChange={(e) => setCarId(e.target.value ? Number(e.target.value) : "")}
						disabled={detailsLocked}
						className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
						required
					>
						<option value="">— оберіть авто —</option>
						{cars?.map((c) => (
							<option key={c.idCar} value={c.idCar}>{c.numberCar} — {c.nameCar}</option>
						))}
					</select>
				</div>

				<Input label="Місяць" type="month" value={month} onChange={(e) => setMonth(e.target.value)} required disabled={detailsLocked} />
				<div className="grid grid-cols-2 gap-3">
					<Input label="ЗП водія (грн)" type="number" value={salaryUah} onChange={(e) => setSalaryUah(e.target.value)} required disabled={detailsLocked} />
					<Input label="Податки із ЗП (грн)" type="number" value={taxesUah} onChange={(e) => setTaxesUah(e.target.value)} required disabled={detailsLocked} />
				</div>
				<div className="grid grid-cols-2 gap-3">
					<Input label="Амортизація (грн)" type="number" value={depreciationUah} onChange={(e) => setDepreciationUah(e.target.value)} required disabled={detailsLocked} />
					<Input
						label="Ремонт — фактично (грн, необов'язково)"
						type="number"
						value={repairActualUah}
						onChange={(e) => setRepairActualUah(e.target.value)}
						helpText="Переважає над розрахунком за ставкою"
						disabled={detailsLocked}
					/>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<Input label="Інші витрати (грн)" type="number" value={otherCostUah} onChange={(e) => setOtherCostUah(e.target.value)} disabled={detailsLocked} />
					<Input label="Ставка ремонту (грн/км)" type="number" step="0.01" value={repairRateUahKm} onChange={(e) => setRepairRateUahKm(e.target.value)} required disabled={detailsLocked} />
				</div>
				<Input label="Коментар до інших витрат" value={otherCostComment} onChange={(e) => setOtherCostComment(e.target.value)} disabled={detailsLocked} />

				{isEdit && existing && (
					<p className="text-xs text-white/40">
						Розраховано бекендом: ремонт {existing.repairCostUah.toFixed(2)} грн, разом {existing.totalCostUah.toFixed(2)} грн
					</p>
				)}

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/costs")}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>
		</div>
	);
}
