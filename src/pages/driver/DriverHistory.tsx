import { useNavigate } from "react-router-dom";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useTodayEvents } from "../../hocks/useRouteEvents";
import { eventTypeLabel, eventTypeIcon, eventTypeGradient, eventSummaryBadges, eventComment, inferDeliveryStage } from "../../utils/eventHelpers";
import { formatDateTime } from "../../utils/formatters";
import { Spinner, EmptyState, ErrorBanner } from "../../components/driver/ui";

export function DriverHistory() {
	const navigate = useNavigate();
	const { data: driver, isLoading: driverLoading } = useCurrentDriver();
	const { data: car } = useCar(driver?.idCar ?? 0);
	const { data: events, isLoading, isError } = useTodayEvents(car?.idCar ?? 0);

	if (driverLoading || isLoading) return <Spinner label="Завантаження історії..." />;
	if (isError) return <ErrorBanner message="Не вдалось завантажити історію" />;
	if (!events || events.length === 0) {
		return <EmptyState title="Подій за сьогодні ще немає" subtitle="Зареєстровані події з'являться тут" />;
	}
	
	return (
		<ul className="flex flex-col gap-2">
			{events.map((e) => {
				const badges = eventSummaryBadges(e);
				const comment = eventComment(e);
				return (
					<li
						key={e.id}
						onClick={() => navigate(`/driver/event/${e.id}`)}
						className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm cursor-pointer transition-colors hover:bg-white/10 active:scale-[0.99]"
					>
						<div className={`h-9 w-9 shrink-0 rounded-full bg-gradient-to-br ${eventTypeGradient(e.eventType)} flex items-center justify-center text-base`}>
							{eventTypeIcon(e.eventType)}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium text-white/90">{eventTypeLabel(e.eventType, e.trackingMode, inferDeliveryStage(e))}</p>
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
	);
}
