import { Link } from "react-router-dom";
import { useMonthlyCostsList } from "../../hocks/useMonthlyCosts";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

export function MonthlyCostsList() {
	const { data: records, isLoading, isError, refetch } = useMonthlyCostsList();

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Місячні витрати по авто</h1>
				<Link to="/costs/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Додати запис
				</Link>
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити витрати" onRetry={refetch} />}
			{!isLoading && !isError && records?.length === 0 && (
				<EmptyState title="Записів ще немає" subtitle="Натисніть «Додати запис», щоб внести перший місяць" />
			)}

			{!isLoading && !isError && records && records.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<th className="py-2">Авто</th>
							<th className="py-2">Місяць</th>
							<th className="py-2">Разом (грн)</th>
						</tr>
					</thead>
					<tbody>
						{records.map((r) => (
							<tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
								<td className="py-2">
									<Link to={`/costs/${r.id}`} className="text-violet-300 hover:underline">
										{r.carNumber}
									</Link>
								</td>
								<td className="py-2">{r.month.slice(0, 7)}</td>
								<td className="py-2">{r.totalCostUah.toFixed(2)}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
