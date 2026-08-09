import { useWaybills } from "../../hocks/useWaybills";
import { useWaybillFilters } from "../../hocks/useWaybillFilters";
import { WaybillFiltersBar } from "../../components/waybills/WaybillFiltersBar";
import { WaybillTable } from "../../components/waybills/WaybillTable";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Pagination } from "../../components/ui/Pagination";
import { Link } from "react-router-dom";
import type { SortField } from "../../types";

const PAGE_SIZE = 10;

export function WaybillList() {
	// Всі фільтри, сортування і сторінка — в URL (зручно для шерингу посилань)
	const { filters, sort, page, setFilter, setSort, setPage } = useWaybillFilters();
	
	const { data, isLoading, isError, refetch } = useWaybills(
		filters,
		sort,
		{ page, pageSize: PAGE_SIZE },
	);
	
	return (
		<div className="p-6 space-y-4">
			{/* Заголовок і кнопка імпорту */}
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Реєстр накладних</h1>
				<div className="flex gap-2">
					<Link
						to="/waybills/unassigned"
						className="px-3 py-2 text-sm rounded-lg bg-orange-500/10 text-orange-300 hover:bg-orange-500/20"
					>
						⚠️ Не призначені
					</Link>
					<Link
						to="/waybills/import"
						className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500"
					>
						Імпорт із 1С
					</Link>
				</div>
			</div>
			
			{/* Панель фільтрів */}
			<WaybillFiltersBar filters={filters} onChange={setFilter} />
			
			{/* ── Стани ───────────────────────────────────────── */}
			
			{/* Loading — показуємо тільки при першому завантаженні */}
			{isLoading && (
				<div className="py-12">
					<Spinner size="lg" label="Завантаження накладних..." />
				</div>
			)}
			
			{/* Error */}
			{isError && !isLoading && (
				<ErrorBanner
					message="Не вдалось завантажити накладні"
					onRetry={refetch}
				/>
			)}
			
			{/* Empty */}
			{!isLoading && !isError && data?.items.length === 0 && (
				<EmptyState
					title="Накладних не знайдено"
					subtitle="Спробуйте змінити або скинути фільтри"
				/>
			)}
			
			{/* Таблиця (показуємо коли є дані) */}
			{!isLoading && !isError && data && data.items.length > 0 && (
				<>
					{/* Лічильник результатів */}
					<p className="text-sm text-white/50">
						Знайдено: {data.total} накладних
					</p>
					
					<WaybillTable
						items={data.items}
						sort={sort}
						onSort={(field: SortField) => setSort(field)}
					/>
					
					<Pagination
						total={data.total}
						page={page}
						pageSize={PAGE_SIZE}
						onChange={setPage}
					/>
				</>
			)}
		</div>
	);
}
