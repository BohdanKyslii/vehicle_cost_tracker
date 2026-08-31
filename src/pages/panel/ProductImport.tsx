import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateProduct } from "../../hocks/useProducts";
import { useBulkImport } from "../../hocks/useBulkImport";
import { parseExcelFile, downloadExcelTemplate, parseImportBool, parseImportNumber } from "../../utils/excelImport";
import type { BulkImportResult } from "../../hocks/useBulkImport";
import type { ProductPayload } from "../../api/products";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

const HEADERS = [
	"ID товару (1С)*", "Назва*", "ID категорії", "Опис", "Активний (так/ні)",
	"Вага од., кг", "Довжина од., см", "Ширина од., см", "Висота од., см", "Штук в коробці",
	"Вага коробки, кг", "Довжина коробки, см", "Ширина коробки, см", "Висота коробки, см",
];
const EXAMPLE = ["10023", "Вино Каберне 0.75л", "", "", "так", "1.2", "8", "8", "30", "12", "16", "25", "25", "32"];

function rowToPayload(row: Record<string, string>): ProductPayload {
	const logisticsFields = {
		unitWeightKg: parseImportNumber(row["Вага од., кг"] ?? ""),
		unitLengthCm: parseImportNumber(row["Довжина од., см"] ?? ""),
		unitWidthCm: parseImportNumber(row["Ширина од., см"] ?? ""),
		unitHeightCm: parseImportNumber(row["Висота од., см"] ?? ""),
		unitsPerBox: parseImportNumber(row["Штук в коробці"] ?? ""),
		boxWeightKg: parseImportNumber(row["Вага коробки, кг"] ?? ""),
		boxLengthCm: parseImportNumber(row["Довжина коробки, см"] ?? ""),
		boxWidthCm: parseImportNumber(row["Ширина коробки, см"] ?? ""),
		boxHeightCm: parseImportNumber(row["Висота коробки, см"] ?? ""),
	};
	const hasLogistics = Object.values(logisticsFields).some((v) => v !== undefined);
	return {
		idProduct: Number(row["ID товару (1С)*"]),
		nameProduct: row["Назва*"] ?? "",
		category: parseImportNumber(row["ID категорії"] ?? "") ?? null,
		description: row["Опис"] || undefined,
		isActive: parseImportBool(row["Активний (так/ні)"] ?? ""),
		logistics: hasLogistics ? logisticsFields : undefined,
	};
}

// Масовий імпорт товарів з Excel — парсинг на фронтенді (SheetJS), без
// змін бекенду: id_product/name_product/category приймаються звичайним
// POST /products/ так само, як з ProductForm.tsx, лише в циклі по рядках
// (useBulkImport, той самий підхід, що BulkMonthlyCostsForm.tsx).
// Категорія — за замовчуванням null (бекенд підставить дефолтну), масовий
// імпорт категорій — поза обсягом цієї сторінки.
export function ProductImport() {
	const navigate = useNavigate();
	const [rows, setRows] = useState<Record<string, string>[]>([]);
	const [fileName, setFileName] = useState("");
	const [result, setResult] = useState<BulkImportResult | null>(null);
	const createProduct = useCreateProduct();
	const bulkImport = useBulkImport((row: ProductPayload) => createProduct.mutateAsync(row), ["products"]);

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
				<h1 className="text-xl font-bold text-white">Імпорт товарів з Excel</h1>
				<Button type="button" variant="ghost" onClick={() => navigate("/panel/products")}>← Назад</Button>
			</div>

			<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
				<Button type="button" variant="secondary" onClick={() => downloadExcelTemplate("шаблон-товари.xlsx", HEADERS, EXAMPLE)}>
					⬇️ Завантажити шаблон
				</Button>

				<div>
					<input type="file" accept=".xlsx,.xls" onChange={handleFile} className="text-sm text-white/70" />
					{fileName && <p className="text-xs text-white/40 mt-1">Файл: {fileName}, розпізнано рядків: {rows.length}</p>}
				</div>

				<p className="text-xs text-white/40">
					Категорія (ID) — опційна, порожня клітинка = дефолтна категорія.
					Логістичні колонки — опційні, заповнюються лише за наявності даних.
				</p>

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
