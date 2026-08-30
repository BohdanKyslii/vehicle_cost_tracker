import { Link } from "react-router-dom";
import { useHiredTrips } from "../../hocks/useHiredTrips";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";

export function HiredTripList() {
	const { data: trips, isLoading, isError, refetch } = useHiredTrips();

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Найманий транспорт</h1>
				<Link to="/hired/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Новий рейс
				</Link>
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження рейсів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити рейси" onRetry={refetch} />}
			{!isLoading && !isError && trips?.length === 0 && (
				<EmptyState title="Рейсів ще немає" subtitle="Натисніть «Новий рейс», щоб внести перший" />
			)}

			{!isLoading && !isError && trips && trips.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<th className="py-2">Дата</th>
							<th className="py-2">Авто</th>
							<th className="py-2">Маршрут</th>
							<th className="py-2">Сума (грн)</th>
							<th className="py-2">Накладних</th>
						</tr>
					</thead>
					<tbody>
						{trips.map((t) => (
							<tr key={t.id} className="border-b border-white/5 hover:bg-white/5">
								<td className="py-2">{t.tripDate}</td>
								<td className="py-2">
									<Link to={`/hired/${t.id}`} className="text-violet-300 hover:underline">{t.carNumber}</Link>
								</td>
								<td className="py-2">{t.routeName}</td>
								<td className="py-2">{t.costUah.toFixed(2)}</td>
								<td className="py-2">{t.waybills?.length ?? 0}</td>
							</tr>
						))}
					</tbody>
				</table>
			)}
		</div>
	);
}
