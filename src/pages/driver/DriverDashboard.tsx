import { useNavigate } from "react-router-dom";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useTodayEvents, useLastOdometer } from "../../hocks/useRouteEvents";
import { useDayMode } from "../../hocks/useDayMode";
import { getAvailableEventTypes, eventTypeLabel, eventTypeIcon, eventTypeGradient, eventSummaryBadges, eventComment } from "../../utils/eventHelpers";
import { formatKm, formatDateTime } from "../../utils/formatters";
import { Spinner, ErrorBanner, EmptyState } from "../../components/driver/ui";
import { DayModeSwitch } from "../../components/driver/DayModeSwitch";

export function DriverDashboard() {
	const navigate = useNavigate();
	const { data: driver, isLoading: driverLoading, error: driverError } = useCurrentDriver();
	const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
	const { dayMode, setDayMode, isOverridden } = useDayMode(car?.defaultTrackingMode ?? "daily");
	const { data: events, isLoading: eventsLoading } = useTodayEvents(car?.idCar ?? 0);
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
			{/* Картка авто — glass-панель у стилі лендінгу */}
			<div className="rounded-2xl bg-white/5 border border-white/10 p-5 backdrop-blur-sm">
				<div className="flex items-center gap-3">
					<div className="h-11 w-11 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl shrink-0">
						🚐
					</div>
					<div>
						<h2 className="text-lg font-bold text-white">{car.nameCar}</h2>
						<p className="text-sm text-white/50">{car.numberCar}</p>
					</div>
				</div>
				{lastOdometer != null && (
					<p className="mt-3 text-xs text-white/40">
						Останній одометр: <span className="text-white/70">{formatKm(lastOdometer)}</span>
					</p>
				)}
			</div>
			
			<DayModeSwitch mode={dayMode} onChange={setDayMode} isOverridden={isOverridden} />
			
			<div>
				<h3 className="text-sm font-semibold text-white/60 mb-3 tracking-wide uppercase">Нова подія</h3>
				<div className="grid grid-cols-2 gap-3">
					{availableTypes.map((type) => {
						const isLockedDepotStart = type === "depot_start" && hasDepotStartToday;
						return (
							<button
								key={type}
								type="button"
								disabled={isLockedDepotStart}
								onClick={() => !isLockedDepotStart && navigate(`/driver/event/new?type=${type}`)}
								className={`group flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-5 backdrop-blur-sm transition-all ${
									isLockedDepotStart
										? "opacity-40 cursor-not-allowed"
										: "hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5 active:scale-[0.97]"
								}`}
							>
								<div className={`h-11 w-11 rounded-full bg-gradient-to-br ${eventTypeGradient(type)} flex items-center justify-center text-xl shadow-lg transition-transform ${!isLockedDepotStart && "group-hover:scale-110"}`}>
									{eventTypeIcon(type)}
								</div>
								<span className="text-xs font-medium text-white/80 text-center px-1">
									{eventTypeLabel(type, dayMode)}
									{isLockedDepotStart && " ✓"}
								</span>
							</button>
						);
					})}
				</div>
			</div>
			
			<div>
				<h3 className="text-sm font-semibold text-white/60 mb-3 tracking-wide uppercase">Події сьогодні</h3>
				{eventsLoading ? (
					<Spinner size="sm" label="" />
				) : !events || events.length === 0 ? (
					<EmptyState title="Ще немає подій" subtitle="Натисніть кнопку вище, щоб додати першу" />
				) : (
					<ul className="flex flex-col gap-2">
						{events.map((e) => {
							const badges = eventSummaryBadges(e);
							const comment = eventComment(e);
							return (
								<li key={e.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
									<div className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${eventTypeGradient(e.eventType)} flex items-center justify-center text-base`}>
										{eventTypeIcon(e.eventType)}
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-white/90">{eventTypeLabel(e.eventType, e.trackingMode)}</p>
										{comment && <p className="text-xs text-white/40 truncate">💬 {comment}</p>}
										<p className="text-xs text-white/40">{formatDateTime(e.eventTs)}</p>
									</div>
									{badges.length > 0 && (
										<div className="flex flex-col items-end gap-0.5 shrink-0">
											{badges.map((b, i) => (
												<span key={i} className="text-xs text-white/50">{b}</span>
											))}
										</div>
									)}
								</li>
							);
						})}
					</ul>
				)}
			</div>
		</div>
	);
}
