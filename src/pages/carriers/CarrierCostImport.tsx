import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCarrierCost } from "../../hocks/useCarrierCosts";
import { parseCarrierCostsCsv } from "../../utils/parseCarrierCostsCsv";
import type { ParsedCarrierCostRow } from "../../utils/parseCarrierCostsCsv";
import { Button } from "../../components/ui/Button";
import type { CarrierCode, ImportError, CarrierCostImportResult } from "../../types";

export function CarrierCostImport() {
	const navigate = useNavigate();
	const createCost = useCreateCarrierCost();

	const [carrier, setCarrier] = useState<CarrierCode>("nova_poshta");
	const [csvText, setCsvText] = useState("");
	const [rows, setRows] = useState<ParsedCarrierCostRow[]>([]);
	const [parseErrors, setParseErrors] = useState<ImportError[]>([]);
	const [result, setResult] = useState<CarrierCostImportResult | null>(null);
	const [isImporting, setIsImporting] = useState(false);

	async function handleFile(file: File) {
		const text = await file.text();
		setCsvText(text);
		const parsed = parseCarrierCostsCsv(text, carrier);
		setRows(parsed.rows);
		setParseErrors(parsed.errors);
		setResult(null);
	}

	// Позначаємо (не блокуємо) рядки з однаковим ТТН у ЦЬОМУ файлі —
	// типова помилка "залили той самий реєстр двічі"; звірку з уже
	// імпортованим у БД свідомо не робимо
	const duplicateTtns = new Set(
		rows.map((r) => r.ttn).filter((ttn, i, arr) => arr.indexOf(ttn) !== i),
	);

	async function handleImport() {
		setIsImporting(true);
		let imported = 0;
		const errors: ImportError[] = [...parseErrors];

		for (const [i, row] of rows.entries()) {
			try {
				await createCost.mutateAsync({
					ttn: row.ttn,
					weightKg: row.weightKg,
					costUah: row.costUah,
					costDate: row.costDate,
				});
				imported++;
			} catch (err) {
				errors.push({ row: i + 2, field: "ttn", message: (err as Error).message });
			}
		}

		setIsImporting(false);
		setResult({ imported, skipped: errors.length, errors });
		if (errors.length === 0) navigate("/carriers");
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<h1 className="text-xl font-bold text-white">Реєстр витрат служби доставки</h1>

			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium text-white/70">Служба доставки</label>
				<select
					value={carrier}
					onChange={(e) => setCarrier(e.target.value as CarrierCode)}
					className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="nova_poshta">Нова Пошта</option>
					<option value="mist_express">Міст Експрес</option>
					<option value="other">Інша служба</option>
				</select>
			</div>

			<input
				type="file"
				accept=".csv"
				onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
				className="text-sm text-white/70 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:text-sm hover:file:bg-violet-500"
			/>

			{csvText && (
				<div className="rounded-lg border border-white/10 p-4 space-y-2 text-sm">
					<p className="text-white">Розпізнано {rows.length} рядків, помилок парсингу: {parseErrors.length}.</p>
					{duplicateTtns.size > 0 && (
						<p className="text-amber-300">Можливі дублі ТТН у файлі: {[...duplicateTtns].join(", ")}</p>
					)}
					{parseErrors.map((err, i) => (
						<p key={i} className="text-white/50">Рядок {err.row}, {err.field}: {err.message}</p>
					))}
				</div>
			)}

			{result && (
				<div className="rounded-lg border border-white/10 p-4 space-y-1 text-sm">
					<p className="text-white">Імпортовано: {result.imported}, з помилками: {result.skipped}.</p>
					{result.errors.map((err, i) => (
						<p key={i} className="text-red-400">Рядок {err.row}: {err.message}</p>
					))}
				</div>
			)}

			<div className="flex gap-3">
				<Button type="button" variant="ghost" onClick={() => navigate("/carriers")}>← Назад</Button>
				<Button type="button" onClick={handleImport} isLoading={isImporting} disabled={rows.length === 0} className="flex-1">
					Імпортувати ({rows.length})
				</Button>
			</div>
		</div>
	);
}
