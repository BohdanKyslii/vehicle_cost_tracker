import { useState } from "react";
import { Link } from "react-router-dom";
import { useStores } from "../../hocks/useCustomers";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Input } from "../../components/ui/Input";

export function StoreList() {
	const [search, setSearch] = useState("");
	const { data: stores, isLoading, isError, refetch } = useStores(search);

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Магазини</h1>
				<Link to="/panel/stores/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Магазин
				</Link>
			</div>

			<Input placeholder="Пошук за назвою або адресою..." value={search} onChange={(e) => setSearch(e.target.value)} />

			{isLoading && <Spinner size="lg" label="Завантаження магазинів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити магазини" onRetry={refetch} />}
			{!isLoading && !isError && stores?.length === 0 && (
				<EmptyState title="Магазинів не знайдено" subtitle="Натисніть «+ Магазин», щоб завести перший" />
			)}

			{!isLoading && !isError && stores && stores.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<th className="py-2">ID (1С)</th>
							<th className="py-2">Назва</th>
							<th className="py-2">Клієнт</th>
							<th className="py-2">Адреса</th>
							<th className="py-2">Статус</th>
						</tr>
					</thead>
					<tbody>
						{stores.map((s) => (
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
									{s.isActive ? (
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
