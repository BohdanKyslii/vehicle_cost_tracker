import { useNavigate } from "react-router-dom";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useTodayEvents, useLastOdometer } from "../../hocks/useRouteEvents";
import { useDayMode } from "../../hocks/useDayMode";
import { getAvailableEventTypes, eventTypeLabel, eventTypeIcon, eventTypeGradient } from "../../utils/eventHelpers";
import { formatKm } from "../../utils/formatters";
import { Spinner, ErrorBanner, EmptyState } from "../../components/driver/ui";
import { DayModeSwitch } from "../../components/driver/DayModeSwitch";

export function DriverDashboard() {
	const navigate = useNavigate();
	const { data: driver, isLoading: driverLoading, error: driverError } = useCurrentDriver();
	const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
	const { dayMode, setDayMode, isOverridden } = useDayMode(car?.idCar ?? 0, car?.defaultTrackingMode ?? "daily");
	const { data: events } = useTodayEvents(car?.idCar ?? 0);
	const { data: lastOdometer } = useLastOdometer(car?.idCar ?? 0);
	
	if (driverLoading || carLoading) return <Spinner label="Завантаження даних водія..." />;
	if (driverError) return <ErrorBanner message="Не вдалось завантажити дані водія" />;
	if (!driver || !car) {
		return <EmptyState title="Авто не закріплене" subtitle="Зверніться до диспетчера, щоб прив'язати вас до авто" />;
	}
	
	const availableTypes = getAvailableEventTypes(dayMode);
	const hasDepotStartToday = events?.some(e => e.eventType === "depot_start") ?? false;

	return (
		<div className="flex flex-col gap-6">
			{/* Картка авто — glass-панель у стилі лендінгу; режим обліку праворуч у тій самій картці */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
				<div className="flex items-center justify-between gap-3 flex-wrap">
					<div className="flex items-center gap-3">
						<div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl shrink-0">
							🚐
						</div>
						<div>
							<h2 className="text-lg font-bold text-white">{car.nameCar}</h2>
							<p className="text-sm text-white/50">{car.numberCar}</p>
						</div>
					</div>
					<DayModeSwitch mode={dayMode} onChange={setDayMode} isOverridden={isOverridden} compact />
				</div>
				{lastOdometer != null && (
					<p className="mt-3 text-xs text-white/40">
						Останній одометр: <span className="text-white/70">{formatKm(lastOdometer)}</span>
					</p>
				)}
			</div>

			<div>
				<h3 className="text-sm font-semibold text-white/60 mb-3 tracking-wide uppercase">Нова подія</h3>
				<div className="grid grid-cols-2 gap-3">
					{availableTypes.map(({ type, stage }) => {
						const isLockedDepotStart = type === "depot_start" && hasDepotStartToday;
						const query = stage ? `type=${type}&stage=${stage}` : `type=${type}`;
						return (
							<button
								key={stage ? `${type}-${stage}` : type}
								type="button"
								disabled={isLockedDepotStart}
								onClick={() => !isLockedDepotStart && navigate(`/driver/event/new?${query}`)}
								className={`group flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm transition-all ${
									isLockedDepotStart
										? "opacity-40 cursor-not-allowed"
										: "hover:bg-white/10 hover:border-white/20 active:scale-[0.97]"
								}`}
							>
								<div className={`h-9 w-9 shrink-0 rounded-lg bg-gradient-to-br ${eventTypeGradient(type)} flex items-center justify-center text-lg shadow-lg transition-transform ${!isLockedDepotStart && "group-hover:scale-105"}`}>
									{eventTypeIcon(type)}
								</div>
								<span className="text-xs font-medium text-white/80 text-left leading-tight">
									{eventTypeLabel(type, dayMode, stage)}
									{isLockedDepotStart && " ✓"}
								</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
