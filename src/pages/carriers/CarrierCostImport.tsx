import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { bulkImportCarrierCosts } from "../../api/carrierCosts";
import type { CarrierCostBulkResult } from "../../api/carrierCosts";
import { parseNovaPoshtaCosts } from "../../utils/parseNovaPoshtaRegistry";
import type { NovaPoshtaCostsParseResult } from "../../utils/parseNovaPoshtaRegistry";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { formatUah } from "../../utils/formatters";
import { useCreateCarrierCost } from "../../hocks/useCarrierCosts";
import { parseCarrierCostsCsv } from "../../utils/parseCarrierCostsCsv";
import type { ParsedCarrierCostRow } from "../../utils/parseCarrierCostsCsv";
import { Button } from "../../components/ui/Button";
import type { CarrierCode, ImportError, CarrierCostImportResult } from "../../types";

// Скільки рядків в одному запиті bulk_import (ліміт бекенду — 500)
const CHUNK_SIZE = 200;

// Два формати: повний звіт НП (.xlsx, "Звіт по клієнту" з кабінету) —
// пачками через bulk_import, ідемпотентно; і старий CSV (ТТН/Вага/
// Вартість/Дата) — по одному рядку, як і було.
export function CarrierCostImport() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const createCost = useCreateCarrierCost();

	const [npParsed, setNpParsed] = useState<NovaPoshtaCostsParseResult | null>(null);
	const [npResult, setNpResult] = useState<CarrierCostBulkResult | null>(null);
	const [npProgress, setNpProgress] = useState(0);
	const [npRequestError, setNpRequestError] = useState<string | null>(null);

	const [carrier, setCarrier] = useState<CarrierCode>("nova_poshta");
	const [csvText, setCsvText] = useState("");
	const [rows, setRows] = useState<ParsedCarrierCostRow[]>([]);
	const [parseErrors, setParseErrors] = useState<ImportError[]>([]);
	const [result, setResult] = useState<CarrierCostImportResult | null>(null);
	const [isImporting, setIsImporting] = useState(false);

	async function handleFile(file: File) {
		setResult(null);
		setNpResult(null);
		setNpRequestError(null);
		if (/\.xlsx?$/i.test(file.name)) {
			setCsvText("");
			setRows([]);
			setParseErrors([]);
			setNpParsed(await parseNovaPoshtaCosts(file));
			return;
		}
		setNpParsed(null);
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

	async function handleNpImport() {
		if (!npParsed) return;
		setIsImporting(true);
		setNpProgress(0);
		setNpRequestError(null);
		const total: CarrierCostBulkResult = { created: 0, linked: 0, skippedExisting: 0, errors: [] };
		try {
			for (let i = 0; i < npParsed.items.length; i += CHUNK_SIZE) {
				const chunk = await bulkImportCarrierCosts(npParsed.items.slice(i, i + CHUNK_SIZE));
				total.created += chunk.created;
				total.linked += chunk.linked;
				total.skippedExisting += chunk.skippedExisting;
				total.errors.push(...chunk.errors);
				setNpProgress(Math.min(i + CHUNK_SIZE, npParsed.items.length));
			}
		} catch (err) {
			setNpRequestError(`${(err as Error).message}. Можна запустити імпорт ще раз — дублів не буде.`);
		}
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: ["carrier-costs"] }),
			queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] }),
		]);
		setNpResult(total);
		setIsImporting(false);
	}

	const npReady = !!npParsed && !npParsed.error && npParsed.items.length > 0;

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<h1 className="text-xl font-bold text-white">Реєстр витрат служби доставки</h1>
			<p className="text-sm text-white/50">
				Повний звіт Нової Пошти з кабінету (.xlsx, «Звіт по клієнту») або CSV з колонками ТТН, Вага, Вартість,
				Дата. Зі звіту НП береться «Загальна вартість ЕН» і розрахункова «Вага»; рядки «НЕ ПЛАТЕЛЬЩИК»
				(доставку оплатив контрагент) пропускаються. Повторний імпорт того самого звіту дублів не створює.
			</p>

			{!npParsed && (
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
			)}

			<input
				type="file"
				accept=".csv,.xlsx,.xls"
				onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
				disabled={isImporting}
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

			{npParsed?.error && <ErrorBanner message={npParsed.error} />}

			{npParsed && !npParsed.error && (
				<div className="rounded-lg border border-white/10 p-4 space-y-1 text-sm">
					<p className="text-white">
						ТТН з вартістю: {npParsed.items.length}, разом {formatUah(npParsed.totalUah)}
					</p>
					{npParsed.notPayerCount > 0 && (
						<p className="text-white/50">
							Пропущено «НЕ ПЛАТЕЛЬЩИК»: {npParsed.notPayerCount} ({formatUah(npParsed.notPayerUah)})
						</p>
					)}
					{npParsed.duplicateTtns.length > 0 && (
						<p className="text-white/50">Дублі ТТН у файлі (взято перший рядок): {npParsed.duplicateTtns.join(", ")}</p>
					)}
					{npParsed.invalidTtns.length > 0 && (
						<p className="text-amber-300">Без коректної дати/вартості/ваги: {npParsed.invalidTtns.join(", ")}</p>
					)}
				</div>
			)}

			{isImporting && npParsed && (
				<p className="text-sm text-white/70">Імпортовано {npProgress} з {npParsed.items.length}…</p>
			)}

			{npRequestError && <ErrorBanner message={npRequestError} />}

			{npResult && (
				<div className="rounded-lg border border-white/10 p-4 space-y-1 text-sm">
					<p className="text-emerald-300">
						Додано: {npResult.created}, з них прив'язано до відправлень: {npResult.linked}
					</p>
					<p className="text-white">Вже були в системі: {npResult.skippedExisting}</p>
					{npResult.created > npResult.linked && (
						<p className="text-white/50">
							Решта прив'яжеться автоматично, коли з'явиться відправлення з такою ТТН (напр. після імпорту
							реєстру).
						</p>
					)}
					{npResult.errors.map((err, i) => (
						<p key={i} className="text-red-400">ТТН {err.ttn || "—"}: {err.message}</p>
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
				{npParsed ? (
					<Button type="button" onClick={handleNpImport} isLoading={isImporting} disabled={!npReady} className="flex-1">
						Імпортувати ({npParsed.items.length})
					</Button>
				) : (
					<Button type="button" onClick={handleImport} isLoading={isImporting} disabled={rows.length === 0} className="flex-1">
						Імпортувати ({rows.length})
					</Button>
				)}
			</div>
		</div>
	);
}
