import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProductCategories, useCreateProductCategory } from "../../hocks/useProducts";
import { parseExcelFile, downloadExcelTemplate } from "../../utils/excelImport";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

const HEADERS = ["ID категорії", "Назва", "ID батьківської категорії", "Батьківська категорія"];
const EXAMPLE = ["1", "Fattoria Viticcio", "", "Вино"];

interface ImportRow {
	name: string;
	parentName: string | null;
}

interface ImportError {
	row: number; // 0 — помилка на кроці створення батьківської категорії, не рядка файлу
	message: string;
}

// Масовий імпорт категорій товару з Excel.
//
// На відміну від Товарів/Клієнтів/Магазинів, ProductCategory.id в БД —
// звичайний автоінкремент (не 1С-ID, який клієнт міг би задати сам —
// див. ProductCategoryPayload у api/products.ts, там немає поля id).
// Тому "ID категорії"/"ID батьківської категорії" з файлу напряму ні на
// що не мапляться. Гірше — на реальному шаблон-категорії.xlsx
// (2026-09-09) ця нумерація в самому файлі ненадійна: перший рядок має
// "ID батьківської категорії" = 1, що збігається з "ID категорії" ПЕРШОГО
// Ж дочірнього рядка, а не з окремим рядком-коренем — тобто корені
// ("Вино", "Китай" і, за рішенням користувача, ще 7 умовних "коренів" із
// прізвищами замість назв категорії) у файлі не мають власних рядків
// узагалі, лише згадуються через колонку "Батьківська категорія".
//
// Тому імпорт іде за НАЗВОЮ (унікальне поле на бекенді,
// ProductCategory.name_category, unique=True):
// 1. Збираємо всі унікальні значення "Батьківська категорія" з файлу.
// 2. Для кожної, якої ще нема серед уже наявних категорій — створюємо як
//    кореневу (parent: null), запам'ятовуємо повернений бекендом id.
// 3. Для кожного рядка файлу створюємо дочірню категорію з parent =
//    реальний id щойно/раніше створеного батька (за назвою).
export function CategoryImport() {
	const navigate = useNavigate();
	const [rows, setRows] = useState<ImportRow[]>([]);
	const [fileName, setFileName] = useState("");
	const [isRunning, setIsRunning] = useState(false);
	const [result, setResult] = useState<{ success: number; errors: ImportError[] } | null>(null);
	const { data: existingCategories, isLoading: categoriesLoading } = useProductCategories();
	const createCategory = useCreateProductCategory();

	async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setFileName(file.name);
		setResult(null);
		const raw = await parseExcelFile(file);
		setRows(
			raw.map((row) => ({
				name: row["Назва"] ?? "",
				parentName: row["Батьківська категорія"]?.trim() || null,
			})),
		);
	}

	async function handleImport() {
		setIsRunning(true);
		const errors: ImportError[] = [];
		let success = 0;

		// Стартова мапа назва → id з уже наявних у БД категорій (напр.
		// "Вино"/"Китай" уже засіяні на бекенді за замовчуванням)
		const idByName = new Map<string, number>((existingCategories ?? []).map((c) => [c.nameCategory, c.id]));

		// Крок 1: батьківські категорії, яких ще нема — створюємо як кореневі
		const parentNames = [...new Set(rows.map((r) => r.parentName).filter((n): n is string => !!n))];
		for (const name of parentNames) {
			if (idByName.has(name)) continue;
			try {
				const created = await createCategory.mutateAsync({ nameCategory: name, parent: null });
				idByName.set(name, created.id);
			} catch (err) {
				errors.push({ row: 0, message: `Батьківська категорія "${name}": ${(err as Error).message}` });
			}
		}

		// Крок 2: дочірні категорії з файлу
		for (let i = 0; i < rows.length; i++) {
			const row = rows[i];
			if (!row.name) continue;
			const parentId = row.parentName ? (idByName.get(row.parentName) ?? null) : null;
			try {
				await createCategory.mutateAsync({ nameCategory: row.name, parent: parentId });
				success++;
			} catch (err) {
				errors.push({ row: i + 1, message: (err as Error).message });
			}
		}

		setIsRunning(false);
		setResult({ success, errors });
	}

	return (
		<div className="p-6 max-w-2xl mx-auto space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Імпорт категорій з Excel</h1>
				<Button type="button" variant="ghost" onClick={() => navigate("/panel/products")}>
					← Назад
				</Button>
			</div>

			<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
				<Button type="button" variant="secondary" onClick={() => downloadExcelTemplate("шаблон-категорії.xlsx", HEADERS, EXAMPLE)}>
					⬇️ Завантажити шаблон
				</Button>

				<div>
					<input type="file" accept=".xlsx,.xls" onChange={handleFile} className="text-sm text-white/70" />
					{fileName && (
						<p className="text-xs text-white/40 mt-1">
							Файл: {fileName}, розпізнано рядків: {rows.length}
						</p>
					)}
				</div>

				<p className="text-xs text-white/40">
					Колонки "ID категорії" / "ID батьківської категорії" з файлу ігноруються — категорія в базі отримує
					власний ID, тож зіставлення батько/дочірня йде за НАЗВОЮ батьківської категорії ("Батьківська
					категорія"). Якщо такої батьківської категорії ще нема в базі — вона створиться автоматично як
					коренева.
				</p>

				<Button
					type="button"
					onClick={handleImport}
					isLoading={isRunning}
					disabled={rows.length === 0 || categoriesLoading}
				>
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
							{result.errors.map((err, idx) => (
								<ErrorBanner
									key={idx}
									message={err.row > 0 ? `Рядок ${err.row}: ${err.message}` : err.message}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
