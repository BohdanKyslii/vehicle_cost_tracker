import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUpdateProductById } from "../../hocks/useProducts";
import { fetchProducts } from "../../api/products";
import { parseExcelFile } from "../../utils/excelImport";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { Product } from "../../types";

// ОДНОРАЗОВИЙ коригувальний інструмент (2026-09-10) — видалити після
// використання разом з маршрутом /panel/products/fix-categories.
//
// Контекст: хтось раніше залив сирий шаблон-товари.xlsx напряму, де
// "ID категорії" — це стара нумерація рядків із шаблон-категорії.xlsx
// (1..~147), а НЕ реальний ID категорії в БД. Оскільки реальні
// категорії теж отримали автоінкрементні ID з 1, старі номери випадково
// "влучили" у валідні (але геть ІНШІ) реальні категорії — напр. старий
// id=16 означав "Без ТМ" (Китай), а реальний id=16 — "Sgarzi Luigi srl"
// (Вино). 1088 товарів отримали валідний, але НЕПРАВИЛЬНИЙ category_id.
//
// Це виправляє ЛИШЕ поле "категорія" (PATCH), звіряючись із поточними
// даними товару з бекенду (не чіпає назву/опис/статус/логістику).
const HEADERS_NOTE = "Той самий файл, що й при звичайному імпорті товарів (шаблон-товари.xlsx) — беремо з нього лише зіставлення Артикул → ID категорії.";

export function FixProductCategories() {
	const navigate = useNavigate();
	// Пряме, ОДНОРАЗОВЕ завантаження (не useProducts()) — навмисно: якби
	// компонент підписався на реактивний запит ["products"], кожен PATCH
	// нижче інвалідував би його й перезапускав повне довантаження всіх
	// ~1253 товарів (126 сторінок) — для ~950 виправлень це рознесло б
	// кілька запитів у десятки тисяч. Знято живцем (2026-09-10): перші
	// ж ~5 виправлень уже дали 550 запитів через це.
	const [products, setProducts] = useState<Product[] | null>(null);
	useEffect(() => {
		fetchProducts().then(setProducts);
	}, []);
	const updateProduct = useUpdateProductById();

	const [fileRows, setFileRows] = useState<Record<string, string>[]>([]);
	const [fileName, setFileName] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [result, setResult] = useState<{ checked: number; fixed: number; unresolved: number; errors: { row: number; message: string }[] } | null>(null);

	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		setResult(null);
		setFileRows(await parseExcelFile(file));
	}

	async function handleRun() {
		if (!products) return;
		setIsRunning(true);

		// Стара нумерація категорій (з файлу шаблон-категорії.xlsx, який
		// водночас містить "ID категорії" (старий) + "Назва") — тут не
		// доступний напряму, тож використовуємо готову мапу старий ID →
		// назва → реальний ID, зашиту нижче (взято з живого /panel/categories
		// станом на 2026-09-10, і зі старого шаблон-категорії.xlsx).
		const oldIdToRealId: Record<string, number> = {
			"1": 10, "2": 11, "3": 12, "4": 13, "5": 14, "6": 15, "7": 16, "8": 17,
			"9": 18, "10": 19, "11": 20, "12": 21, "13": 22, "14": 23, "15": 24,
			"16": 25, "17": 26, "18": 27, "19": 28, "20": 29, "21": 30, "22": 31,
			"23": 32, "24": 33, "25": 34, "26": 35, "27": 36, "28": 37, "29": 38,
		};

		const productById = new Map(products.map((p) => [p.idProduct, p]));
		const errors: { row: number; message: string }[] = [];
		let checked = 0;
		let fixed = 0;
		let unresolved = 0;

		for (let i = 0; i < fileRows.length; i++) {
			const row = fileRows[i];
			const idProduct = Number(row["ID товару (1С)*"]);
			const oldCatId = String(row["ID категорії"] ?? "").trim();
			if (!idProduct || !oldCatId) continue;

			const correctId = oldIdToRealId[oldCatId];
			if (correctId == null) {
				unresolved++;
				continue;
			}

			const product = productById.get(idProduct);
			if (!product) continue; // товару ще нема в БД — не ця сторінка це виправляє
			checked++;
			if (product.category === correctId) continue; // вже правильно

			try {
				await updateProduct.mutateAsync({
					id: idProduct,
					data: {
						nameProduct: product.nameProduct,
						category: correctId,
						description: product.description,
						isActive: product.isActive,
						logistics: product.logistics,
					},
				});
				fixed++;
			} catch (err) {
				errors.push({ row: i + 1, message: (err as Error).message });
			}
		}

		setIsRunning(false);
		setResult({ checked, fixed, unresolved, errors });
	}

	return (
		<div className="p-6 max-w-2xl mx-auto space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Виправити категорії товарів (одноразово)</h1>
				<Button type="button" variant="ghost" onClick={() => navigate("/panel/products")}>← Назад</Button>
			</div>

			<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
				<p className="text-xs text-white/40">{HEADERS_NOTE}</p>
				<div>
					<input type="file" accept=".xlsx,.xls" onChange={handleFile} className="text-sm text-white/70" />
					{fileName && <p className="text-xs text-white/40 mt-1">Файл: {fileName}, рядків: {fileRows.length}</p>}
				</div>
				<Button type="button" onClick={handleRun} isLoading={isRunning} disabled={fileRows.length === 0 || !products}>
					Перевірити й виправити {fileRows.length > 0 ? `(${fileRows.length})` : ""}
				</Button>
			</div>

			{result && (
				<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
					<p className="text-sm text-white">
						Перевірено (знайдено в БД): {result.checked}, виправлено: {result.fixed}, без відповідної категорії: {result.unresolved}
					</p>
					{result.errors.length > 0 && (
						<div className="space-y-1">
							{result.errors.map((err, i) => (
								<ErrorBanner key={i} message={`Рядок ${err.row}: ${err.message}`} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
