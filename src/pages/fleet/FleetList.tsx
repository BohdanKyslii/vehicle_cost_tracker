import { Link } from "react-router-dom";
import { useCars } from "../../hocks/useCars";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { CarStatusBadge } from "../../components/ui/Badge";

export function FleetList() {
	const { data: cars, isLoading, isError, refetch } = useCars();
	
	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Автопарк</h1>
				<Link to="/fleet/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Додати авто
				</Link>
			</div>
			
			{isLoading && <Spinner size="lg" label="Завантаження автопарку..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити автопарк" onRetry={refetch} />}
			{!isLoading && !isError && cars?.length === 0 && (
				<EmptyState title="Авто ще немає" subtitle="Натисніть «Додати авто», щоб завести перше" />
			)}
			
			{!isLoading && !isError && cars && cars.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
					<tr>
						<th className="py-2">Номер</th>
						<th className="py-2">Назва</th>
						<th className="py-2">Статус</th>
						<th className="py-2">Водій</th>
					</tr>
					</thead>
					<tbody>
					{cars.map((car) => (
						<tr key={car.idCar} className="border-b border-white/5 hover:bg-white/5">
							<td className="py-2">
								<Link to={`/fleet/${car.idCar}`} className="text-violet-300 hover:underline">
									{car.numberCar}
								</Link>
							</td>
							<td className="py-2">{car.nameCar}</td>
							<td className="py-2"><CarStatusBadge status={car.statusCar} /></td>
							<td className="py-2">{car.trailer ? "—" : "—"}</td>
						</tr>
					))}
					</tbody>
				</table>
			)}
		</div>
	);
}
