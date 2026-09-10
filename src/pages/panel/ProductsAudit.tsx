import { useEffect, useState } from "react";
import { fetchProducts } from "../../api/products";
import type { Product } from "../../types";
import knownIds from "./__known_product_ids.json";

// ОДНОРАЗОВИЙ read-only аудит (2026-09-10) — видалити (разом із
// __known_product_ids.json) після використання, з маршрутом
// /panel/products/audit. Показує товари з БД, чий артикул НЕ
// зустрічається ні в шаблон-товари.xlsx, ні в переміщенні (АЗС) — тобто
// джерело їхнього імпорту невідоме.
const KNOWN_IDS = new Set<string>(knownIds as string[]);

export function ProductsAudit() {
	const [products, setProducts] = useState<Product[] | null>(null);
	useEffect(() => {
		fetchProducts().then(setProducts);
	}, []);

	if (!products) return <div className="p-6 text-white">Завантаження...</div>;

	const unknown = products.filter((p) => !KNOWN_IDS.has(String(p.idProduct)));

	return (
		<div className="p-6 space-y-4 text-white">
			<h1 className="text-xl font-bold">Товари з невідомого джерела: {unknown.length}</h1>
			<table className="w-full text-sm">
				<thead className="text-left text-white/50 border-b border-white/10">
					<tr>
						<th className="py-2">Артикул</th>
						<th className="py-2">Назва</th>
						<th className="py-2">Категорія</th>
						<th className="py-2">Статус</th>
					</tr>
				</thead>
				<tbody>
					{unknown.map((p) => (
						<tr key={p.idProduct} className="border-b border-white/5">
							<td className="py-2">{p.idProduct}</td>
							<td className="py-2">{p.nameProduct}</td>
							<td className="py-2 text-white/70">{p.categoryName ?? "—"}</td>
							<td className="py-2 text-white/70">{p.isActive ? "Активний" : "Неактивний"}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
