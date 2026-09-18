import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useDeliveredProducts, useUpdateProductLogistics } from "../../hocks/useProducts";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import type { DeliveredProduct } from "../../types";

type FieldKey = "unitWeightKg" | "unitLengthCm" | "unitWidthCm" | "unitHeightCm" | "unitsPerBox";
type Row = Record<FieldKey, string>;

type SortKey = "name" | "linesCount" | FieldKey;
type SortDir = "asc" | "desc";

function currentMonthIso(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function emptyRow(): Row {
	return { unitWeightKg: "", unitLengthCm: "", unitWidthCm: "", unitHeightCm: "", unitsPerBox: "" };
}

// "Заповнено" — тільки вага (потрібна для вартості/кг); "повністю" —
// вага + всі три габарити (тоді рахується ще й об'єм/вартість за м³,
// див. apps/waybills/views.py _shipped_weight_kg_total/_shipped_volume_cbm_total)
function fillStatus(row: Row): "empty" | "partial" | "full" {
	if (!row.unitWeightKg) return "empty";
	if (!row.unitLengthCm || !row.unitWidthCm || !row.unitHeightCm) return "partial";
	return "full";
}

const statusStyles: Record<ReturnType<typeof fillStatus>, string> = {
	empty: "bg-red-500/10",
	partial: "bg-amber-500/10",
	full: "bg-emerald-500/10",
};

const cellClass =
	"w-20 rounded border border-white/10 bg-white/5 text-white text-xs px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-violet-400";

const COLUMNS: { key: SortKey; label: string; align: "left" | "right" }[] = [
	{ key: "name", label: "Товар", align: "left" },
	{ key: "linesCount", label: "Рядків", align: "right" },
	{ key: "unitWeightKg", label: "Вага, кг", align: "left" },
	{ key: "unitLengthCm", label: "Довж, см", align: "left" },
	{ key: "unitWidthCm", label: "Шир, см", align: "left" },
	{ key: "unitHeightCm", label: "Вис, см", align: "left" },
	{ key: "unitsPerBox", label: "Од./ящик", align: "left" },
];

// Довідник товарів наповнений одразу всіма позиціями з 1С за 2026 рік —
// заповнити вагу/габарити всім одразу нереально. Ця сторінка звужує
// задачу до "що реально доставлялось цього місяця" (будь-яким каналом,
// не лише власним авто) і показує найчастіше відвантажувані товари
// першими — так каталог дозаповнюється поступово, з найбільшим
// ефектом на аналітику від кожного заповненого рядка.
export function DeliveredProducts() {
	const [month, setMonth] = useState(currentMonthIso());
	const [categoryName, setCategoryName] = useState("");
	const { data: products, isLoading, isError, refetch } = useDeliveredProducts(month);
	const updateLogistics = useUpdateProductLogistics();

	const [rows, setRows] = useState<Record<number, Row>>({});
	const [touched, setTouched] = useState<Set<number>>(new Set());
	const [saveErrors, setSaveErrors] = useState<Record<number, string>>({});
	const [isSaving, setIsSaving] = useState(false);
	const [savedIds, setSavedIds] = useState<Set<number>>(new Set());
	const [sortKey, setSortKey] = useState<SortKey>("linesCount");
	const [sortDir, setSortDir] = useState<SortDir>("desc");

	// "Adjust state during render" (не useEffect — set-state-in-effect
	// eslint-правило проєкту), той самий патерн, що BulkMonthlyCostsForm:
	// перебудовуємо рядки, коли довантажились дані ЦЬОГО місяця.
	const syncKey = products ? month : null;
	const [syncedKey, setSyncedKey] = useState<string | null>(null);
	if (syncKey !== null && syncKey !== syncedKey) {
		setSyncedKey(syncKey);
		const next: Record<number, Row> = {};
		for (const p of products!) {
			next[p.idProduct] = {
				unitWeightKg: p.unitWeightKg != null ? String(p.unitWeightKg) : "",
				unitLengthCm: p.unitLengthCm != null ? String(p.unitLengthCm) : "",
				unitWidthCm: p.unitWidthCm != null ? String(p.unitWidthCm) : "",
				unitHeightCm: p.unitHeightCm != null ? String(p.unitHeightCm) : "",
				unitsPerBox: p.unitsPerBox != null ? String(p.unitsPerBox) : "",
			};
		}
		setRows(next);
		setTouched(new Set());
		setSaveErrors({});
		setSavedIds(new Set());
	}

	function setCell(idProduct: number, key: FieldKey, value: string) {
		setRows(prev => ({ ...prev, [idProduct]: { ...(prev[idProduct] ?? emptyRow()), [key]: value } }));
		setTouched(prev => new Set(prev).add(idProduct));
		setSavedIds(prev => {
			if (!prev.has(idProduct)) return prev;
			const next = new Set(prev);
			next.delete(idProduct);
			return next;
		});
	}

	function toggleSort(key: SortKey) {
		if (key === sortKey) {
			setSortDir(dir => (dir === "asc" ? "desc" : "asc"));
		} else {
			setSortKey(key);
			setSortDir(key === "name" ? "asc" : "desc");
		}
	}

	async function handleSaveAll() {
		if (touched.size === 0) return;
		setIsSaving(true);
		const errors: Record<number, string> = {};
		const saved = new Set<number>();

		for (const idProduct of touched) {
			const row = rows[idProduct];
			if (!row) continue;
			try {
				await updateLogistics.mutateAsync({
					id: idProduct,
					logistics: {
						unitWeightKg: row.unitWeightKg ? Number(row.unitWeightKg) : undefined,
						unitLengthCm: row.unitLengthCm ? Number(row.unitLengthCm) : undefined,
						unitWidthCm: row.unitWidthCm ? Number(row.unitWidthCm) : undefined,
						unitHeightCm: row.unitHeightCm ? Number(row.unitHeightCm) : undefined,
						unitsPerBox: row.unitsPerBox ? Number(row.unitsPerBox) : undefined,
					},
				});
				saved.add(idProduct);
			} catch (err) {
				errors[idProduct] = (err as Error).message;
			}
		}

		setIsSaving(false);
		setSaveErrors(errors);
		setSavedIds(saved);
		setTouched(new Set(Object.keys(errors).map(Number)));
	}

	// Категорії — лише ті, що реально трапляються серед доставлених
	// товарів цього місяця (не весь довідник), щоб у списку не було
	// пунктів, які однаково нічого не покажуть
	const categoryOptions = useMemo(() => {
		const names = new Set((products ?? []).map(p => p.categoryName).filter(Boolean));
		return [...names].sort((a, b) => a.localeCompare(b, "uk"));
	}, [products]);

	const visibleProducts = useMemo(() => {
		let list = products ?? [];
		if (categoryName) list = list.filter(p => p.categoryName === categoryName);

		const dir = sortDir === "asc" ? 1 : -1;
		return [...list].sort((a, b) => {
			if (sortKey === "name") return a.nameProduct.localeCompare(b.nameProduct, "uk") * dir;
			if (sortKey === "linesCount") return (a.linesCount - b.linesCount) * dir;
			const rowA = rows[a.idProduct] ?? emptyRow();
			const rowB = rows[b.idProduct] ?? emptyRow();
			return (Number(rowA[sortKey] || 0) - Number(rowB[sortKey] || 0)) * dir;
		});
	}, [products, categoryName, sortKey, sortDir, rows]);

	const filledCount = (products ?? []).filter(p => fillStatus(rows[p.idProduct] ?? emptyRow()) !== "empty").length;

	return (
		<div className="p-6 space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div>
					<Link to="/panel" className="text-sm text-white/50 hover:text-white/80">← До адміністрування</Link>
					<h1 className="text-xl font-bold text-white mt-1">Доставлені товари</h1>
				</div>
				<div className="flex items-center gap-2">
					<select
						value={categoryName}
						onChange={e => setCategoryName(e.target.value)}
						className="rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">Всі категорії</option>
						{categoryOptions.map(name => (
							<option key={name} value={name}>{name}</option>
						))}
					</select>
					<input
						type="month"
						value={month}
						onChange={e => setMonth(e.target.value)}
						className="rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [color-scheme:dark]"
					/>
				</div>
			</div>

			<p className="text-xs text-white/40">
				Товари з накладних за обраний місяць, яким уже призначено канал доставки (будь-який).
				Клікни на заголовок колонки, щоб відсортувати. 🔴 вага не вказана · 🟡 вказана вага, без габаритів
				(об'єм не порахується) · 🟢 заповнено повністю.
			</p>

			{isLoading && (
				<div className="py-12">
					<Spinner size="lg" label="Завантаження..." />
				</div>
			)}

			{isError && !isLoading && (
				<ErrorBanner message="Не вдалось завантажити товари" onRetry={refetch} />
			)}

			{!isLoading && !isError && products && products.length === 0 && (
				<EmptyState
					title="Немає доставлених товарів"
					subtitle="За цей місяць немає накладних із призначеним каналом доставки"
				/>
			)}

			{!isLoading && !isError && products && products.length > 0 && (
				<>
					<p className="text-sm text-white/50">
						Заповнено (хоча б вага): {filledCount} з {products.length}
						{categoryName && ` · показано: ${visibleProducts.length}`}
					</p>

					{/* max-h + overflow-y-auto — власний скрол-контейнер таблиці,
					    щоб "sticky" шапка чіплялась саме до нього, а не губилась
					    десь всередині overflow-auto <main> з MainLayout */}
					<div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 overflow-hidden">
						<div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
							<table className="w-full text-sm">
								<thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-md border-b border-white/10">
									<tr>
										{COLUMNS.map(col => (
											<th
												key={col.key}
												onClick={() => toggleSort(col.key)}
												className={`px-4 py-3 text-xs font-medium text-white/50 uppercase cursor-pointer select-none hover:text-white/80 ${
													col.align === "right" ? "text-right" : "text-left"
												}`}
											>
												<span className="inline-flex items-center gap-1">
													{col.label}
													<span className={sortKey === col.key ? "text-violet-300" : "text-white/20"}>
														{sortKey === col.key ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
													</span>
												</span>
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-white/10">
									{visibleProducts.map((p: DeliveredProduct) => {
										const row = rows[p.idProduct] ?? emptyRow();
										const status = fillStatus(row);
										return (
											<tr key={p.idProduct} className={statusStyles[status]}>
												<td className="px-4 py-2">
													<div className="text-white font-medium">{p.nameProduct}</div>
													<div className="text-xs text-white/40">
														{p.categoryName}
														{savedIds.has(p.idProduct) && (
															<span className="ml-2 text-emerald-300">збережено ✓</span>
														)}
													</div>
												</td>
												<td className="px-4 py-2 text-right text-white/50">{p.linesCount}</td>
												<td className="px-4 py-2">
													<input
														type="number"
														step="0.001"
														value={row.unitWeightKg}
														onChange={e => setCell(p.idProduct, "unitWeightKg", e.target.value)}
														className={cellClass}
													/>
												</td>
												<td className="px-4 py-2">
													<input
														type="number"
														step="0.1"
														value={row.unitLengthCm}
														onChange={e => setCell(p.idProduct, "unitLengthCm", e.target.value)}
														className={cellClass}
													/>
												</td>
												<td className="px-4 py-2">
													<input
														type="number"
														step="0.1"
														value={row.unitWidthCm}
														onChange={e => setCell(p.idProduct, "unitWidthCm", e.target.value)}
														className={cellClass}
													/>
												</td>
												<td className="px-4 py-2">
													<input
														type="number"
														step="0.1"
														value={row.unitHeightCm}
														onChange={e => setCell(p.idProduct, "unitHeightCm", e.target.value)}
														className={cellClass}
													/>
												</td>
												<td className="px-4 py-2">
													<input
														type="number"
														step="1"
														value={row.unitsPerBox}
														onChange={e => setCell(p.idProduct, "unitsPerBox", e.target.value)}
														className={cellClass}
													/>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Button type="button" onClick={handleSaveAll} isLoading={isSaving} disabled={touched.size === 0}>
							Зберегти {touched.size > 0 ? `(${touched.size})` : ""}
						</Button>
						{Object.keys(saveErrors).length > 0 && (
							<span className="text-xs text-red-300">
								Не збереглось: {Object.keys(saveErrors).length} — виправ і спробуй ще раз
							</span>
						)}
					</div>

					{Object.entries(saveErrors).map(([idProduct, message]) => {
						const product = products.find(p => p.idProduct === Number(idProduct));
						return (
							<ErrorBanner key={idProduct} message={`${product?.nameProduct ?? `#${idProduct}`}: ${message}`} />
						);
					})}
				</>
			)}
		</div>
	);
}
