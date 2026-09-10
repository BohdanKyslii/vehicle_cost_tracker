import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useStores, useUpdateStoreById, useDeleteStore } from "../../hocks/useCustomers";
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
import type { Store } from "../../types";

export function StoreList() {
	const [search, setSearch] = useState("");
	const { data: stores, isLoading, isError, refetch } = useStores(search);
	const updateStore = useUpdateStoreById();
	const deleteStore = useDeleteStore();
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	const [idFilter, setIdFilter] = useState("");
	const [customerFilter, setCustomerFilter] = useState("");

	const filtered = useMemo(() => {
		return (stores ?? []).filter((s) => {
			if (idFilter && !String(s.idStore).includes(idFilter.trim())) return false;
			if (customerFilter && !(s.customerName ?? "").toLowerCase().includes(customerFilter.trim().toLowerCase())) return false;
			return true;
		});
	}, [stores, idFilter, customerFilter]);

	const { page, setPage, pageSize, setPageSize } = usePagination(filtered.length);
	const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

	function toggleStatus(s: Store) {
		updateStore.mutate({
			id: s.idStore,
			data: { customer: s.customer, nameStore: s.nameStore, storeAddress: s.storeAddress, isActive: !s.isActive },
		});
	}

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Магазини</h1>
				<div className="flex gap-2">
					<Link to="/panel/stores/import" className="px-3 py-2 text-sm rounded-lg border border-white/10 text-white/70 hover:bg-white/5">
						⬇️ Імпорт з Excel
					</Link>
					<Link to="/panel/stores/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
						+ Магазин
					</Link>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex-1 min-w-[240px]">
					<Input placeholder="Пошук за назвою або адресою..." value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<PageSizeSelect value={pageSize} onChange={setPageSize} />
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження магазинів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити магазини" onRetry={refetch} />}
			{!isLoading && !isError && filtered.length === 0 && (
				<EmptyState title="Магазинів не знайдено" subtitle="Натисніть «+ Магазин», щоб завести перший, або змініть фільтр" />
			)}

			{!isLoading && !isError && filtered.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<FilterableHeader label="ID (1С)" value={idFilter} onChange={setIdFilter} placeholder="Пошук за ID..." />
							<th className="py-2">Назва</th>
							<FilterableHeader label="Клієнт" value={customerFilter} onChange={setCustomerFilter} placeholder="Пошук за клієнтом..." />
							<th className="py-2">Адреса</th>
							<th className="py-2">Статус</th>
							<th className="py-2"></th>
						</tr>
					</thead>
					<tbody>
						{pageRows.map((s) => {
							if (confirmDeleteId === s.idStore) {
								return (
									<tr key={s.idStore} className="border-b border-white/5">
										<td colSpan={6} className="py-2">
											<ConfirmDelete
												message={`Видалити магазин "${s.nameStore}"?`}
												pending={deleteStore.isPending && deleteStore.variables === s.idStore}
												onCancel={() => setConfirmDeleteId(null)}
												onConfirm={() => deleteStore.mutate(s.idStore, { onSuccess: () => setConfirmDeleteId(null) })}
											/>
										</td>
									</tr>
								);
							}
							return (
								<tr key={s.idStore} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-2">
										<Link to={`/panel/stores/${s.idStore}`} className="text-violet-300 hover:underline">
											{s.idStore}
										</Link>
									</td>
									<td className="py-2">{s.nameStore}</td>
									<td className="py-2 text-white/70">{s.customerName ?? "—"}</td>
									<td className="py-2 text-white/70">{s.storeAddress ?? "—"}</td>
									<td className="py-2">
										<select
											value={s.isActive ? "active" : "inactive"}
											disabled={updateStore.isPending}
											onChange={() => toggleStatus(s)}
											className={`rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 [&>option]:bg-slate-900 [&>option]:text-white ${s.isActive ? "text-emerald-400" : "text-white/40"}`}
										>
											<option value="active">Активний</option>
											<option value="inactive">Неактивний</option>
										</select>
									</td>
									<td className="py-2 text-right">
										<Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDeleteId(s.idStore)}>
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

			{updateStore.isError && (
				<ErrorBanner message={`Не вдалось змінити статус: ${(updateStore.error as Error).message}`} />
			)}
			{deleteStore.isError && (
				<ErrorBanner message={`Не вдалось видалити магазин: ${(deleteStore.error as Error).message}`} />
			)}
		</div>
	);
}
