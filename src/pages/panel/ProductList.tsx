import { useState } from "react";
import { Link } from "react-router-dom";
import { useProducts } from "../../hocks/useProducts";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Input } from "../../components/ui/Input";

export function ProductList() {
	const [search, setSearch] = useState("");
	const { data: products, isLoading, isError, refetch } = useProducts(search);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Товари</h1>
				<Link to="/panel/products/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Товар
				</Link>
			</div>

			<Input placeholder="Пошук за назвою або артикулом..." value={search} onChange={(e) => setSearch(e.target.value)} />

			{isLoading && <Spinner size="lg" label="Завантаження товарів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити товари" onRetry={refetch} />}
			{!isLoading && !isError && products?.length === 0 && (
				<EmptyState title="Товарів не знайдено" subtitle="Натисніть «+ Товар», щоб завести перший" />
			)}

			{!isLoading && !isError && products && products.length > 0 && (
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
						{products.map((p) => (
							<tr key={p.idProduct} className="border-b border-white/5 hover:bg-white/5">
								<td className="py-2">
									<Link to={`/panel/products/${p.idProduct}`} className="text-violet-300 hover:underline">
										{p.idProduct}
									</Link>
								</td>
								<td className="py-2">{p.nameProduct}</td>
								<td className="py-2 text-white/70">{p.categoryName ?? "—"}</td>
								<td className="py-2">
									{p.isActive ? (
										<span className="text-emerald-400">Активний</span>
									) : (
										<span className="text-white/40">Неактивний</span>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
