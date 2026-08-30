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
		mutation.mutate(payload, { onSuccess: () => navigate("/admin/monthly-costs") });
	}

	return (
		<form onSubmit={handleSubmit} className="p-6 max-w-lg space-y-4">
			<h1 className="text-xl font-bold text-white">{isEdit ? "Редагувати витрати" : "Нові місячні витрати"}</h1>

			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium text-white/70">Авто</label>
				<select
					value={carId}
					onChange={(e) => setCarId(e.target.value ? Number(e.target.value) : "")}
					className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
					required
				>
					<option value="">— оберіть авто —</option>
					{cars?.map((c) => (
						<option key={c.idCar} value={c.idCar}>{c.numberCar} — {c.nameCar}</option>
					))}
				</select>
			</div>

			<Input label="Місяць" type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
			<Input label="ЗП водія (грн)" type="number" value={salaryUah} onChange={(e) => setSalaryUah(e.target.value)} required />
			<Input label="Податки із ЗП (грн)" type="number" value={taxesUah} onChange={(e) => setTaxesUah(e.target.value)} required />
			<Input label="Амортизація (грн)" type="number" value={depreciationUah} onChange={(e) => setDepreciationUah(e.target.value)} required />
			<Input
				label="Ремонт — фактично (грн, необов'язково)"
				type="number"
				value={repairActualUah}
				onChange={(e) => setRepairActualUah(e.target.value)}
				helpText="Якщо заповнено — переважає над розрахунком за ставкою"
			/>
			<Input label="Ставка ремонту (грн/км)" type="number" step="0.01" value={repairRateUahKm} onChange={(e) => setRepairRateUahKm(e.target.value)} required />
			<Input label="Інші витрати (грн)" type="number" value={otherCostUah} onChange={(e) => setOtherCostUah(e.target.value)} />
			<Input label="Коментар до інших витрат" value={otherCostComment} onChange={(e) => setOtherCostComment(e.target.value)} />

			{isEdit && existing && (
				<p className="text-xs text-white/40">
					Розраховано бекендом: ремонт {existing.repairCostUah.toFixed(2)} грн, разом {existing.totalCostUah.toFixed(2)} грн
				</p>
			)}

			{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

			<div className="flex gap-3">
				<Button type="button" variant="ghost" onClick={() => navigate("/admin/monthly-costs")}>Скасувати</Button>
				<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
			</div>
		</form>
	);
}
