import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCustomers, useUpdateCustomerById } from "../../hocks/useCustomers";
import { usePagination } from "../../hocks/usePagination";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Input } from "../../components/ui/Input";
import { FilterableHeader } from "../../components/ui/FilterableHeader";
import { PageSizeSelect } from "../../components/ui/PageSizeSelect";
import { Pagination } from "../../components/ui/Pagination";
import type { Customer } from "../../types";

export function CustomerList() {
	const [search, setSearch] = useState("");
	const { data: customers, isLoading, isError, refetch } = useCustomers(search);
	const updateCustomer = useUpdateCustomerById();

	const [idFilter, setIdFilter] = useState("");
	const [networkFilter, setNetworkFilter] = useState("");

	const networkOptions = useMemo(() => {
		const names = new Set((customers ?? []).map((c) => c.networkCustomer).filter((n): n is string => !!n));
		return [...names].sort((a, b) => a.localeCompare(b, "uk"));
	}, [customers]);

	const filtered = useMemo(() => {
		return (customers ?? []).filter((c) => {
			if (idFilter && !String(c.idCustomer).includes(idFilter.trim())) return false;
			if (networkFilter && c.networkCustomer !== networkFilter) return false;
			return true;
		});
	}, [customers, idFilter, networkFilter]);

	const { page, setPage, pageSize, setPageSize } = usePagination(filtered.length);
	const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

	function toggleStatus(c: Customer) {
		updateCustomer.mutate({
			id: c.idCustomer,
			data: { nameCustomer: c.nameCustomer, networkCustomer: c.networkCustomer, isActive: !c.isActive },
		});
	}

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Клієнти</h1>
				<div className="flex gap-2">
					<Link to="/panel/customers/import" className="px-3 py-2 text-sm rounded-lg border border-white/10 text-white/70 hover:bg-white/5">
						⬇️ Імпорт з Excel
					</Link>
					<Link to="/panel/customers/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
						+ Клієнт
					</Link>
				</div>
			</div>

			<div className="flex items-center justify-between gap-3 flex-wrap">
				<div className="flex-1 min-w-[240px]">
					<Input placeholder="Пошук за назвою..." value={search} onChange={(e) => setSearch(e.target.value)} />
				</div>
				<PageSizeSelect value={pageSize} onChange={setPageSize} />
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження клієнтів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити клієнтів" onRetry={refetch} />}
			{!isLoading && !isError && filtered.length === 0 && (
				<EmptyState title="Клієнтів не знайдено" subtitle="Натисніть «+ Клієнт», щоб завести першого, або змініть фільтр" />
			)}

			{!isLoading && !isError && filtered.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<FilterableHeader label="ID (1С)" value={idFilter} onChange={setIdFilter} placeholder="Пошук за ID..." />
							<th className="py-2">Назва</th>
							<FilterableHeader label="Напрямок" value={networkFilter} onChange={setNetworkFilter} options={networkOptions} />
							<th className="py-2">Магазинів</th>
							<th className="py-2">Статус</th>
						</tr>
					</thead>
					<tbody>
						{pageRows.map((c) => (
							<tr key={c.idCustomer} className="border-b border-white/5 hover:bg-white/5">
								<td className="py-2">
									<Link to={`/panel/customers/${c.idCustomer}`} className="text-violet-300 hover:underline">
										{c.idCustomer}
									</Link>
								</td>
								<td className="py-2">{c.nameCustomer}</td>
								<td className="py-2 text-white/70">{c.networkCustomer ?? "—"}</td>
								<td className="py-2 text-white/70">{c.storesCount ?? 0}</td>
								<td className="py-2">
									<select
										value={c.isActive ? "active" : "inactive"}
										disabled={updateCustomer.isPending}
										onChange={() => toggleStatus(c)}
										className={`rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 [&>option]:bg-slate-900 [&>option]:text-white ${c.isActive ? "text-emerald-400" : "text-white/40"}`}
									>
										<option value="active">Активний</option>
										<option value="inactive">Неактивний</option>
									</select>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			{!isLoading && !isError && filtered.length > 0 && (
				<Pagination total={filtered.length} page={page} pageSize={pageSize} onChange={setPage} />
			)}

			{updateCustomer.isError && (
				<ErrorBanner message={`Не вдалось змінити статус: ${(updateCustomer.error as Error).message}`} />
			)}
		</div>
	);
}
