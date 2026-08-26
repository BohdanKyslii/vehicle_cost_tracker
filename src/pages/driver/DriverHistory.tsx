import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useDriverEvents } from "../../hocks/useRouteEvents";
import { eventTypeLabel, eventTypeIcon, eventTypeGradient } from "../../utils/eventHelpers";
import { formatKm, formatDateTime } from "../../utils/formatters";
import { Spinner, EmptyState, ErrorBanner } from "../../components/driver/ui";

export function DriverHistory() {
	const { data: driver, isLoading: driverLoading } = useCurrentDriver();
	const { data: car } = useCar(driver?.idCar ?? 0);
	const { data: events, isLoading, isError } = useDriverEvents(car?.idCar ?? 0);
	
	if (driverLoading || isLoading) return <Spinner label="Завантаження історії..." />;
	if (isError) return <ErrorBanner message="Не вдалось завантажити історію" />;
	if (!events || events.length === 0) {
		return <EmptyState title="Подій ще немає" subtitle="Зареєстровані події з'являться тут" />;
	}
	
	return (
		<ul className="flex flex-col gap-2">
			{events.map((e) => (
				<li key={e.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
					<div className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${eventTypeGradient(e.eventType)} flex items-center justify-center text-base`}>
						{eventTypeIcon(e.eventType)}
					</div>
					<div className="flex-1 min-w-0">
						<p className="text-sm font-medium text-white/90">{eventTypeLabel(e.eventType)}</p>
						<p className="text-xs text-white/40">{formatDateTime(e.eventTs)}</p>
					</div>
					{e.odometerKm != null && <span className="text-xs text-white/50 shrink-0">{formatKm(e.odometerKm)}</span>}
				</li>
			))}
		</ul>
	);
}
