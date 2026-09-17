import { Link } from "react-router-dom";
import { useWaybills } from "../../hocks/useWaybills";
import { useWaybillFilters } from "../../hocks/useWaybillFilters";
import { UnassignedFiltersBar } from "./UnassignedFiltersBar";
import { WaybillTable } from "./WaybillTable";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorBanner } from "../ui/ErrorBanner";
import { Pagination } from "../ui/Pagination";
import type { SortField } from "../../types";

const PAGE_SIZE = 10;

// Та сама аргегація/пагінація, що й повний реєстр (useWaybills), лише
// deliveryChannel завжди "unassigned" — сторінка для обробки накладних,
// яким ще не призначено канал доставки (з посилання "⚠️ Не призначені"
// на WaybillList).
export function UnassignedWaybills() {
	const { filters, sort, page, setFilter, setSort, setPage } = useWaybillFilters();
	const effectiveFilters = { ...filters, deliveryChannel: "unassigned" as const };

	const { data, isLoading, isError, refetch } = useWaybills(
		effectiveFilters,
		sort,
		{ page, pageSize: PAGE_SIZE },
	);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<Link to="/waybills" className="text-sm text-white/50 hover:text-white/80">← До реєстру</Link>
					<h1 className="text-xl font-bold text-white mt-1">⚠️ Не призначені накладні</h1>
				</div>
			</div>

			<UnassignedFiltersBar filters={filters} onChange={setFilter} />

			{isLoading && (
				<div className="py-12">
					<Spinner size="lg" label="Завантаження накладних..." />
				</div>
			)}

			{isError && !isLoading && (
				<ErrorBanner message="Не вдалось завантажити накладні" onRetry={refetch} />
			)}

			{!isLoading && !isError && data?.items.length === 0 && (
				<EmptyState
					title="Усі накладні призначено"
					subtitle="За цими фільтрами непризначених накладних не знайдено"
				/>
			)}

			{!isLoading && !isError && data && data.items.length > 0 && (
				<>
					<p className="text-sm text-white/50">
						Знайдено: {data.total} непризначених накладних — клікніть на номер, щоб призначити канал
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
