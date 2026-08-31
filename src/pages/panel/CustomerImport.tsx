import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateCustomer } from "../../hocks/useCustomers";
import { useBulkImport } from "../../hocks/useBulkImport";
import { parseExcelFile, downloadExcelTemplate, parseImportBool } from "../../utils/excelImport";
import type { BulkImportResult } from "../../hocks/useBulkImport";
import type { CustomerPayload } from "../../api/customers";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

const HEADERS = ["ID клієнта (1С)*", "Назва*", "Напрямок діяльності", "Активний (так/ні)"];
const EXAMPLE = ["500123", "ТОВ Ромашка", "Роздріб", "так"];

function rowToPayload(row: Record<string, string>): CustomerPayload {
	return {
		idCustomer: Number(row["ID клієнта (1С)*"]),
		nameCustomer: row["Назва*"] ?? "",
		networkCustomer: row["Напрямок діяльності"] || undefined,
		isActive: parseImportBool(row["Активний (так/ні)"] ?? ""),
	};
}

// Масовий імпорт клієнтів з Excel — див. ProductImport.tsx для загального
// підходу (парсинг на фронтенді, послідовний POST /customers/ по рядку).
// Імпортувати КЛІЄНТІВ перед Магазинами — StoreImport посилається на
// idCustomer, який має вже існувати (customer — обов'язковий FK на Store).
export function CustomerImport() {
	const navigate = useNavigate();
	const [rows, setRows] = useState<Record<string, string>[]>([]);
	const [fileName, setFileName] = useState("");
	const [result, setResult] = useState<BulkImportResult | null>(null);
	const createCustomer = useCreateCustomer();
	const bulkImport = useBulkImport((row: CustomerPayload) => createCustomer.mutateAsync(row), ["customers"]);

	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		setResult(null);
		setRows(await parseExcelFile(file));
	}

	async function handleImport() {
		const payloads = rows.map(rowToPayload);
		setResult(await bulkImport.run(payloads));
	}

	return (
		<div className="p-6 max-w-2xl mx-auto space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Імпорт клієнтів з Excel</h1>
				<Button type="button" variant="ghost" onClick={() => navigate("/panel/customers")}>← Назад</Button>
			</div>

			<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
				<Button type="button" variant="secondary" onClick={() => downloadExcelTemplate("шаблон-клієнти.xlsx", HEADERS, EXAMPLE)}>
					⬇️ Завантажити шаблон
				</Button>

				<div>
					<input type="file" accept=".xlsx,.xls" onChange={handleFile} className="text-sm text-white/70" />
					{fileName && <p className="text-xs text-white/40 mt-1">Файл: {fileName}, розпізнано рядків: {rows.length}</p>}
				</div>

				<Button type="button" onClick={handleImport} isLoading={bulkImport.isRunning} disabled={rows.length === 0}>
					Імпортувати {rows.length > 0 ? `(${rows.length})` : ""}
				</Button>
			</div>

			{result && (
				<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
					<p className="text-sm text-white">
						Імпортовано {result.success} з {result.success + result.errors.length}
					</p>
					{result.errors.length > 0 && (
						<div className="space-y-1">
							{result.errors.map((err) => (
								<ErrorBanner key={err.row} message={`Рядок ${err.row}: ${err.message}`} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
