import { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomers } from "../../hocks/useCustomers";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Input } from "../../components/ui/Input";

export function CustomerList() {
	const [search, setSearch] = useState("");
	const { data: customers, isLoading, isError, refetch } = useCustomers(search);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Клієнти</h1>
				<Link to="/panel/customers/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Клієнт
				</Link>
			</div>

			<Input placeholder="Пошук за назвою..." value={search} onChange={(e) => setSearch(e.target.value)} />

			{isLoading && <Spinner size="lg" label="Завантаження клієнтів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити клієнтів" onRetry={refetch} />}
			{!isLoading && !isError && customers?.length === 0 && (
				<EmptyState title="Клієнтів не знайдено" subtitle="Натисніть «+ Клієнт», щоб завести першого" />
			)}

			{!isLoading && !isError && customers && customers.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<th className="py-2">ID (1С)</th>
							<th className="py-2">Назва</th>
							<th className="py-2">Напрямок</th>
							<th className="py-2">Магазинів</th>
							<th className="py-2">Статус</th>
						</tr>
					</thead>
					<tbody>
						{customers.map((c) => (
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
									{c.isActive ? (
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
