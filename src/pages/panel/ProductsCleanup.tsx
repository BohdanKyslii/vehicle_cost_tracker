import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDeleteProduct } from "../../hocks/useProducts";
import { fetchProducts } from "../../api/products";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { Product } from "../../types";
import knownIds from "./__known_product_ids.json";

// ОДНОРАЗОВИЙ інструмент (2026-09-10) — видалити (разом із
// __known_product_ids.json) після використання, з маршрутом
// /panel/products/cleanup. Видаляє товари з БД, чий артикул НЕ
// зустрічається ні в шаблон-товари.xlsx, ні в переміщенні (АЗС) —
// підтверджено тестові/seed-дані (усі Неактивні, лише 2 випадкові
// категорії на всі 134, "круглі" тестові артикули на кшталт 44444/55555).
//
// products вантажиться ОДНОразово через fetchProducts() напряму (не
// useProducts()) — інакше кожен DELETE нижче інвалідував би реактивний
// запит і перезапускав повне довантаження всіх ~1253 товарів (126
// сторінок) на КОЖНЕ видалення (див. [[bulk-mutation-avoid-reactive-list-hook]]).
const KNOWN_IDS = new Set<string>(knownIds as string[]);

export function ProductsCleanup() {
	const navigate = useNavigate();
	const [products, setProducts] = useState<Product[] | null>(null);
	useEffect(() => {
		fetchProducts().then(setProducts);
	}, []);

	const deleteProduct = useDeleteProduct();
	const [isRunning, setIsRunning] = useState(false);
	const [result, setResult] = useState<{ deleted: number; errors: { id: number; message: string }[] } | null>(null);

	const toDelete = products?.filter((p) => !KNOWN_IDS.has(String(p.idProduct))) ?? null;

	async function handleRun() {
		if (!toDelete) return;
		setIsRunning(true);
		const errors: { id: number; message: string }[] = [];
		let deleted = 0;
		for (const p of toDelete) {
			try {
				await deleteProduct.mutateAsync(p.idProduct);
				deleted++;
			} catch (err) {
				errors.push({ id: p.idProduct, message: (err as Error).message });
			}
		}
		setIsRunning(false);
		setResult({ deleted, errors });
	}

	return (
		<div className="p-6 max-w-2xl mx-auto space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Очистити тестові товари (одноразово)</h1>
				<Button type="button" variant="ghost" onClick={() => navigate("/panel/products")}>← Назад</Button>
			</div>

			<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-4">
				{toDelete === null ? (
					<p className="text-sm text-white/50">Завантаження товарів...</p>
				) : (
					<p className="text-sm text-white">
						Знайдено {toDelete.length} товарів, яких немає ні в шаблон-товари.xlsx, ні в переміщенні (АЗС).
					</p>
				)}
				<Button type="button" variant="danger" onClick={handleRun} isLoading={isRunning} disabled={!toDelete || toDelete.length === 0}>
					Видалити {toDelete ? `(${toDelete.length})` : ""}
				</Button>
			</div>

			{result && (
				<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
					<p className="text-sm text-white">
						Видалено: {result.deleted} з {result.deleted + result.errors.length}
					</p>
					{result.errors.length > 0 && (
						<div className="space-y-1">
							{result.errors.map((err, i) => (
								<ErrorBanner key={i} message={`Артикул ${err.id}: ${err.message}`} />
							))}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
