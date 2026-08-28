import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useTodayEvents, useCreateRouteEvent, useDeleteRouteEvent } from "../../hocks/useRouteEvents";
import {
	eventTypeLabel,
	eventTypeIcon,
	eventTypeGradient,
	inferDeliveryStage,
	findEventGroup,
	groupRootIdOf,
	withStopTag,
	stripStopTag,
} from "../../utils/eventHelpers";
import { formatDateTime, formatKm } from "../../utils/formatters";
import { Button, Spinner, ErrorBanner, EmptyState } from "../../components/driver/ui";
import { QRScanner } from "../../components/driver/QRScanner";
import { parseQRCode } from "../../utils/parseQR";

export function EventDetail() {
	const navigate = useNavigate();
	const { eventId } = useParams();
	const targetId = Number(eventId);

	const { data: driver, isLoading: driverLoading } = useCurrentDriver();
	const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
	const { data: events, isLoading: eventsLoading } = useTodayEvents(car?.idCar ?? 0);
	const deleteEvent = useDeleteRouteEvent();
	const createEvent = useCreateRouteEvent();

	// Підтвердження видалення "у два дотики" замість нативного confirm() —
	// зручніше на телефоні і не блокує інтерфейс
	const [confirmId, setConfirmId] = useState<number | null>(null);
	const [scannerOpen, setScannerOpen] = useState(false);
	const [scanError, setScanError] = useState<string | null>(null);

	if (driverLoading || carLoading || eventsLoading) return <Spinner label="Завантаження..." />;
	if (!driver || !car) return <ErrorBanner message="Немає закріпленого авто" />;

	const target = events?.find(e => e.id === targetId);
	if (!target) {
		return (
			<div className="flex flex-col gap-4">
				<EmptyState title="Подію не знайдено" subtitle="Можливо, її вже видалено" />
				<Button variant="ghost" onClick={() => navigate("/driver/history")}>← До історії</Button>
			</div>
		);
	}

	const group = findEventGroup(events ?? [], target).sort((a, b) => a.eventTs.localeCompare(b.eventTs));
	const isMultiWaybill = target.eventType === "delivery" && group.length > 1;

	function askDelete(id: number) {
		if (confirmId === id) {
			setConfirmId(null);
			deleteEvent.mutate(
				{ id, carId: car!.idCar },
				{
					onSuccess: () => {
						// Якщо видалили саме той запис, на який зайшли — повертаємось
						// до історії; якщо видалили сусідню накладну — лишаємось,
						// список у групі оновиться сам через інвалідацію кешу
						if (id === target!.id) navigate("/driver/history");
					},
				}
			);
		} else {
			setConfirmId(id);
			setTimeout(() => setConfirmId(curr => (curr === id ? null : curr)), 3000);
		}
	}

	function handleScan(raw: string) {
		const parsed = parseQRCode(raw);
		if (!parsed) return;
		const alreadyScanned = events?.some(e => e.waybillNumber === parsed.waybillNumber);
		if (alreadyScanned) {
			setScanError(`Накладну №${parsed.waybillNumber} вже додано — спробуйте іншу`);
			return;
		}
		setScanError(null);
		setScannerOpen(false);
		createEvent.mutate({
			carId: car!.idCar,
			driverId: target!.driverId,
			trackingMode: target!.trackingMode,
			eventType: "delivery",
			eventTs: new Date().toISOString(),
			waybillNumber: parsed.waybillNumber,
			waybillDate: parsed.waybillDate,
			customerName: target!.customerName,
			// Прив'язуємо до кореня ІСНУЮЧОЇ групи (не до самого target,
			// якщо target уже сам є "додатковою" накладною чужого кореня)
			notes: withStopTag(groupRootIdOf(target!)),
		});
	}

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center gap-3">
				<div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${eventTypeGradient(target.eventType)} flex items-center justify-center text-xl shadow-lg shrink-0`}>
					{eventTypeIcon(target.eventType)}
				</div>
				<div>
					<h2 className="text-lg font-bold text-white">
						{eventTypeLabel(target.eventType, target.trackingMode, inferDeliveryStage(target))}
					</h2>
					<p className="text-xs text-white/40">{formatDateTime(target.eventTs)}</p>
				</div>
			</div>

			{isMultiWaybill ? (
				<>
					<h3 className="text-sm font-semibold text-white/60 tracking-wide uppercase">
						Накладні цієї точки ({group.length})
					</h3>
					<div className="flex flex-col gap-2">
						{group.map((e) => (
							<div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
								<div className="min-w-0">
									<p className="text-sm font-medium text-white/90">№ {e.waybillNumber}</p>
									<p className="text-xs text-white/40 truncate">
										{e.customerName || "—"}
										{e.odometerKm != null && ` · ${formatKm(e.odometerKm)}`}
									</p>
								</div>
								<Button
									type="button"
									variant={confirmId === e.id ? "danger" : "ghost"}
									onClick={() => askDelete(e.id)}
									isLoading={deleteEvent.isPending && deleteEvent.variables?.id === e.id}
									className="shrink-0 px-3 py-2"
								>
									{confirmId === e.id ? "Точно?" : "🗑"}
								</Button>
							</div>
						))}
					</div>

					{scanError && <ErrorBanner message={scanError} />}
					<Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
						📷 Ще одна накладна цієї точки
					</Button>
				</>
			) : (
				<div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2 text-sm">
					{target.waybillNumber && (
						<Row label="Накладна" value={`№ ${target.waybillNumber}${target.waybillDate ? `, ${target.waybillDate}` : ""}`} />
					)}
					{target.customerName && <Row label="Клієнт" value={target.customerName} />}
					{target.odometerKm != null && <Row label="Одометр" value={formatKm(target.odometerKm)} />}
					{target.palletsCount != null && <Row label="Палети" value={String(target.palletsCount)} />}
					{target.fuelLiters != null && <Row label="Пального" value={`${target.fuelLiters} л`} />}
					{target.fuelCostUah != null && <Row label="Сума" value={`${target.fuelCostUah} грн`} />}
					{target.otherCostUah != null && <Row label="Сума" value={`${target.otherCostUah} грн`} />}
					{target.otherCostComment && <Row label="Коментар" value={target.otherCostComment} />}
					{target.returnClientWaybill && <Row label="Накладна клієнта" value={target.returnClientWaybill} />}
					{target.extraFrom && <Row label="Звідки" value={target.extraFrom} />}
					{target.extraTo && <Row label="Куди" value={target.extraTo} />}
					{target.extraWeightKg != null && <Row label="Вага" value={`${target.extraWeightKg} кг`} />}
					{stripStopTag(target.notes) && <Row label="Нотатки" value={stripStopTag(target.notes)!} />}

					{scanError && <ErrorBanner message={scanError} />}

					<Button
						type="button"
						variant={confirmId === target.id ? "danger" : "ghost"}
						onClick={() => askDelete(target.id)}
						isLoading={deleteEvent.isPending && deleteEvent.variables?.id === target.id}
						className="mt-2"
					>
						{confirmId === target.id ? "Точно видалити?" : "🗑 Видалити подію"}
					</Button>
				</div>
			)}

			{scannerOpen && (
				<QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} notice={scanError} />
			)}

			{deleteEvent.isError && <ErrorBanner message={(deleteEvent.error as Error).message} />}

			<Button variant="ghost" onClick={() => navigate("/driver/history")}>← До історії</Button>
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="text-white/40">{label}</span>
			<span className="text-white/90 text-right">{value}</span>
		</div>
	);
}
