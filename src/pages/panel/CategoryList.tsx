import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useProductCategories } from "../../hocks/useProducts";
import { usePagination } from "../../hocks/usePagination";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Input } from "../../components/ui/Input";
import { FilterableHeader } from "../../components/ui/FilterableHeader";
import { PageSizeSelect } from "../../components/ui/PageSizeSelect";
import { Pagination } from "../../components/ui/Pagination";

// Аналогічна ProductList/CustomerList/StoreList сторінка для категорій
// товару — на відміну від решти довідників тут немає "Статус" (у
// ProductCategory немає поля is_active на бекенді), тож інлайн-перемикача
// статусу тут немає.
export function CategoryList() {
	const [search, setSearch] = useState("");
	const { data: categories, isLoading, isError, refetch } = useProductCategories();

	const [parentFilter, setParentFilter] = useState("");

	const parentOptions = useMemo(() => {
		const names = new Set((categories ?? []).map((c) => c.parentName).filter((n): n is string => !!n));
		return [...names].sort((a, b) => a.localeCompare(b, "uk"));
	}, [categories]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return (categories ?? []).filter((c) => {
			if (q && !c.nameCategory.toLowerCase().includes(q)) return false;
			if (parentFilter && c.parentName !== parentFilter) return false;
			return true;
		});
	}, [categories, search, parentFilter]);

	const { page, setPage, pageSize, setPageSize } = usePagination(filtered.length);
	const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Категорії товарів</h1>
				<div className="flex gap-2">
					<Link to="/panel/categories/import" className="px-3 py-2 text-sm rounded-lg border border-white/10 text-white/70 hover:bg-white/5">
						⬇️ Імпорт з Excel
					</Link>
					<Link to="/panel/categories/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
						+ Категорія
					</Link>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex-1 min-w-[240px]">
					<Input placeholder="Пошук за назвою..." value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<PageSizeSelect value={pageSize} onChange={setPageSize} />
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження категорій..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити категорії" onRetry={refetch} />}
			{!isLoading && !isError && filtered.length === 0 && (
				<EmptyState title="Категорій не знайдено" subtitle="Натисніть «+ Категорія», щоб завести першу, або змініть фільтр" />
			)}

			{!isLoading && !isError && filtered.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<th className="py-2">ID</th>
							<th className="py-2">Назва</th>
							<FilterableHeader label="Батьківська категорія" value={parentFilter} onChange={setParentFilter} options={parentOptions} />
						</tr>
					</thead>
					<tbody>
						{pageRows.map((c) => (
							<tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
								<td className="py-2">
									<Link to={`/panel/categories/${c.id}`} className="text-violet-300 hover:underline">
										{c.id}
									</Link>
								</td>
								<td className="py-2">{c.nameCategory}</td>
								<td className="py-2 text-white/70">{c.parentName ?? "—"}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{!isLoading && !isError && filtered.length > 0 && (
				<Pagination total={filtered.length} page={page} pageSize={pageSize} onChange={setPage} />
			)}
		</div>
	);
}
