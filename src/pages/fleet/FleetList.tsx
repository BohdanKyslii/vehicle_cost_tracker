import { Link } from "react-router-dom";
import { useCars, useChangeCarStatus } from "../../hocks/useCars";
import { useDrivers } from "../../hocks/useDrivers";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { CarStatus } from "../../types";

const trackingModeLabel = { daily: "Щоденний", full: "Повний" } as const;
const carStatusLabel: Record<CarStatus, string> = {
	active: "Активне",
	repair: "Ремонт",
	inactive: "Неактивне",
	pause: "Пауза",
	driver_downtime: "Простій (водій)",
};

export function FleetList() {
	const { data: cars, isLoading, isError, refetch } = useCars();
	const { data: drivers } = useDrivers();
	const changeStatus = useChangeCarStatus();

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
						<th className="py-2">Режим</th>
						<th className="py-2">Водій</th>
					</tr>
					</thead>
					<tbody>
					{cars.map((car) => {
						const driver = drivers?.find((d) => d.idCar === car.idCar);
						return (
							<tr key={car.idCar} className="border-b border-white/5 hover:bg-white/5">
								<td className="py-2">
									<Link to={`/fleet/${car.idCar}`} className="text-violet-300 hover:underline">
										{car.numberCar}
									</Link>
								</td>
								<td className="py-2">{car.nameCar}</td>
								<td className="py-2">
									<select
										value={car.statusCar}
										disabled={changeStatus.isPending}
										onChange={(e) => changeStatus.mutate({ id: car.idCar, status: e.target.value as CarStatus })}
										className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 [&>option]:bg-slate-900 [&>option]:text-white"
									>
										{Object.entries(carStatusLabel).map(([value, label]) => (
											<option key={value} value={value}>{label}</option>
										))}
									</select>
								</td>
								<td className="py-2 text-white/70">{trackingModeLabel[car.defaultTrackingMode ?? "daily"]}</td>
								<td className="py-2">
									{driver ? (
										<Link to={`/fleet/drivers/${driver.idDriver}`} className="text-violet-300 hover:underline">
											{driver.nameDriver}
										</Link>
									) : (
										<span className="text-white/40">—</span>
									)}
								</td>
							</tr>
						);
					})}
					</tbody>
				</table>
			)}

			{changeStatus.isError && (
				<ErrorBanner message={`Не вдалось змінити статус: ${(changeStatus.error as Error).message}`} />
			)}
		</div>
	);
}
