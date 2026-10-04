import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { bulkImportCarrierShipments } from "../../api/carrierShipments";
import type { CarrierShipmentImportResult } from "../../api/carrierShipments";
import { parseNovaPoshtaRegistry } from "../../utils/parseNovaPoshtaRegistry";
import type { NovaPoshtaRegistryParseResult } from "../../utils/parseNovaPoshtaRegistry";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

// Скільки ТТН в одному запиті bulk_import (ліміт бекенду — 500)
const CHUNK_SIZE = 200;

// Імпорт відправлень з реєстру Нової Пошти: ТТН + дата + номери накладних
// ("Номер замовлення клієнта"). Зворотна доставка документів — окрема ТТН
// з тими самими номерами накладних, імпортується так само: одна накладна
// може бути в кількох ТТН.
export function CarrierShipmentImport() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const [parsed, setParsed] = useState<NovaPoshtaRegistryParseResult | null>(null);
	const [isImporting, setIsImporting] = useState(false);
	const [progress, setProgress] = useState(0);
	const [result, setResult] = useState<CarrierShipmentImportResult | null>(null);
	const [requestError, setRequestError] = useState<string | null>(null);

	async function handleFile(file: File) {
		setResult(null);
		setRequestError(null);
		setParsed(await parseNovaPoshtaRegistry(file));
	}

	async function handleImport() {
		if (!parsed) return;
		setIsImporting(true);
		setProgress(0);
		setRequestError(null);
		const total: CarrierShipmentImportResult = {
			createdShipments: 0,
			existingShipments: 0,
			attachedWaybills: 0,
			skippedWaybills: 0,
			errors: [],
		};
		try {
			for (let i = 0; i < parsed.items.length; i += CHUNK_SIZE) {
				const chunk = await bulkImportCarrierShipments("nova_poshta", parsed.items.slice(i, i + CHUNK_SIZE));
				total.createdShipments += chunk.createdShipments;
				total.existingShipments += chunk.existingShipments;
				total.attachedWaybills += chunk.attachedWaybills;
				total.skippedWaybills += chunk.skippedWaybills;
				total.errors.push(...chunk.errors);
				setProgress(Math.min(i + CHUNK_SIZE, parsed.items.length));
			}
		} catch (err) {
			// Обірвалось посеред файлу — вже залите лишається; повторний
			// імпорт того самого файлу безпечний (бекенд ідемпотентний)
			setRequestError(`${(err as Error).message}. Можна запустити імпорт ще раз — дублів не буде.`);
		}
		await queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] });
		setResult(total);
		setIsImporting(false);
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<h1 className="text-xl font-bold text-white">Імпорт відправлень Нової Пошти</h1>
			<p className="text-sm text-white/50">
				Реєстр НП (.xlsx) з колонками «Номер Е/Н», «Дата Е/Н», «Номер замовлення клієнта» — підходить і
				повний звіт з кабінету, і урізаний. Кілька накладних в одній ТТН — через кому.
			</p>

			<input
				type="file"
				accept=".xlsx,.xls"
				onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
				disabled={isImporting}
				className="text-sm text-white/70 file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-violet-600 file:text-white file:text-sm hover:file:bg-violet-500"
			/>

			{parsed?.error && <ErrorBanner message={parsed.error} />}

			{parsed && !parsed.error && (
				<div className="rounded-lg border border-white/10 p-4 space-y-1 text-sm">
					<p className="text-white">
						ТТН: {parsed.items.length}, накладних у них: {parsed.waybillCount}
					</p>
					{parsed.rowsWithoutWaybills > 0 && (
						<p className="text-white/50">Пропущено рядків без номера накладної: {parsed.rowsWithoutWaybills}</p>
					)}
					{parsed.ignoredTokens.length > 0 && (
						<p className="text-amber-300">Не схоже на номер накладної, ігнорується: {parsed.ignoredTokens.join(", ")}</p>
					)}
				</div>
			)}

			{isImporting && parsed && (
				<p className="text-sm text-white/70">Імпортовано {progress} з {parsed.items.length} ТТН…</p>
			)}

			{requestError && <ErrorBanner message={requestError} />}

			{result && (
				<div className="rounded-lg border border-white/10 p-4 space-y-1 text-sm">
					<p className="text-emerald-300">
						Нових ТТН: {result.createdShipments}, вже були: {result.existingShipments}
					</p>
					<p className="text-white">
						Прикріплено накладних: {result.attachedWaybills}, вже були прикріплені: {result.skippedWaybills}
					</p>
					{result.errors.map((err, i) => (
						<p key={i} className="text-red-400">
							ТТН {err.ttn || "—"}{err.waybillNumber ? `, № ${err.waybillNumber}` : ""}: {err.message}
						</p>
					))}
				</div>
			)}

			<div className="flex gap-3">
				<Button type="button" variant="ghost" onClick={() => navigate("/carriers")}>← Назад</Button>
				<Button
					type="button"
					onClick={handleImport}
					isLoading={isImporting}
					disabled={!parsed || !!parsed.error || parsed.items.length === 0}
					className="flex-1"
				>
					Імпортувати ({parsed?.items.length ?? 0})
				</Button>
			</div>
		</div>
	);
}
