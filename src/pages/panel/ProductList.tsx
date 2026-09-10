import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProducts, useUpdateProductById, useDeleteProduct } from "../../hocks/useProducts";
import { usePagination } from "../../hocks/usePagination";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ConfirmDelete } from "../../components/ui/ConfirmDelete";
import { FilterableHeader } from "../../components/ui/FilterableHeader";
import { PageSizeSelect } from "../../components/ui/PageSizeSelect";
import { Pagination } from "../../components/ui/Pagination";
import type { Product } from "../../types";

export function ProductList() {
	const [search, setSearch] = useState("");
	const { data: products, isLoading, isError, refetch } = useProducts(search);
	const updateProduct = useUpdateProductById();
	const deleteProduct = useDeleteProduct();
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	const [articleFilter, setArticleFilter] = useState("");
	const [categoryFilter, setCategoryFilter] = useState("");

	const categoryOptions = useMemo(() => {
		const names = new Set((products ?? []).map((p) => p.categoryName).filter((n): n is string => !!n));
		return [...names].sort((a, b) => a.localeCompare(b, "uk"));
	}, [products]);

	const filtered = useMemo(() => {
		return (products ?? []).filter((p) => {
			if (articleFilter && !String(p.idProduct).includes(articleFilter.trim())) return false;
			if (categoryFilter && p.categoryName !== categoryFilter) return false;
			return true;
		});
	}, [products, articleFilter, categoryFilter]);

	const { page, setPage, pageSize, setPageSize } = usePagination(filtered.length);
	const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

	function toggleStatus(p: Product) {
		updateProduct.mutate({
			id: p.idProduct,
			data: {
				nameProduct: p.nameProduct,
				category: p.category,
				description: p.description,
				isActive: !p.isActive,
				logistics: p.logistics,
			},
		});
	}

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Товари</h1>
				<div className="flex gap-2">
					<Link to="/panel/products/import" className="px-3 py-2 text-sm rounded-lg border border-white/10 text-white/70 hover:bg-white/5">
						⬇️ Імпорт з Excel
					</Link>
					<Link to="/panel/products/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
						+ Товар
					</Link>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex-1 min-w-[240px]">
					<Input placeholder="Пошук за назвою або артикулом..." value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<PageSizeSelect value={pageSize} onChange={setPageSize} />
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження товарів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити товари" onRetry={refetch} />}
			{!isLoading && !isError && filtered.length === 0 && (
				<EmptyState title="Товарів не знайдено" subtitle="Натисніть «+ Товар», щоб завести перший, або змініть фільтр" />
			)}

			{!isLoading && !isError && filtered.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<FilterableHeader label="Артикул" value={articleFilter} onChange={setArticleFilter} placeholder="Пошук за артикулом..." />
							<th className="py-2">Назва</th>
							<FilterableHeader label="Категорія" value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
							<th className="py-2">Статус</th>
							<th className="py-2"></th>
						</tr>
					</thead>
					<tbody>
						{pageRows.map((p) => {
							if (confirmDeleteId === p.idProduct) {
								return (
									<tr key={p.idProduct} className="border-b border-white/5">
										<td colSpan={5} className="py-2">
											<ConfirmDelete
												message={`Видалити товар "${p.nameProduct}" (арт. ${p.idProduct})?`}
												pending={deleteProduct.isPending && deleteProduct.variables === p.idProduct}
												onCancel={() => setConfirmDeleteId(null)}
												onConfirm={() => deleteProduct.mutate(p.idProduct, { onSuccess: () => setConfirmDeleteId(null) })}
											/>
										</td>
									</tr>
								);
							}
							return (
								<tr key={p.idProduct} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-2">
										<Link to={`/panel/products/${p.idProduct}`} className="text-violet-300 hover:underline">
											{p.idProduct}
										</Link>
									</td>
									<td className="py-2">{p.nameProduct}</td>
									<td className="py-2 text-white/70">{p.categoryName ?? "—"}</td>
									<td className="py-2">
										<select
											value={p.isActive ? "active" : "inactive"}
											disabled={updateProduct.isPending}
											onChange={() => toggleStatus(p)}
											className={`rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 [&>option]:bg-slate-900 [&>option]:text-white ${p.isActive ? "text-emerald-400" : "text-white/40"}`}
										>
											<option value="active">Активний</option>
											<option value="inactive">Неактивний</option>
										</select>
									</td>
									<td className="py-2 text-right">
										<Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDeleteId(p.idProduct)}>
											🗑
										</Button>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}

			{!isLoading && !isError && filtered.length > 0 && (
				<Pagination total={filtered.length} page={page} pageSize={pageSize} onChange={setPage} />
			)}

			{updateProduct.isError && (
				<ErrorBanner message={`Не вдалось змінити статус: ${(updateProduct.error as Error).message}`} />
			)}
			{deleteProduct.isError && (
				<ErrorBanner message={`Не вдалось видалити товар: ${(deleteProduct.error as Error).message}`} />
			)}
		</div>
	);
}
