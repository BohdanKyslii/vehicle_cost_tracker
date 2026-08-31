import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { RouteEvent } from "../../types";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useTodayEvents, useCreateRouteEvent, useDeleteRouteEvent, useUpdateRouteEvent } from "../../hocks/useRouteEvents";
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
import { Button, Input, Spinner, ErrorBanner, EmptyState } from "../../components/driver/ui";
import { QRScanner } from "../../components/QRScanner";
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
	const updateEvent = useUpdateRouteEvent();

	// Підтвердження видалення — явне повідомлення з кнопками "Так,
	// видалити"/"Скасувати" замість нативного confirm() (блокує весь
	// інтерфейс, чужорідний на телефоні) і замість попереднього "два
	// дотики по тій самій кнопці" (текст, що міняється на кнопці, не
	// читався як окреме підтвердження)
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editWaybillNumber, setEditWaybillNumber] = useState("");
	const [editWaybillDate, setEditWaybillDate] = useState("");
	const [editCustomerName, setEditCustomerName] = useState("");
	const [editOdometerKm, setEditOdometerKm] = useState("");
	const [editPalletsCount, setEditPalletsCount] = useState("");
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

	const isDelivery = target.eventType === "delivery";
	// Для delivery завжди показуємо груповий список (навіть з 1 запису) —
	// так "поправити накладну"/"додати ще одну" доступні однаково і для
	// одиночного скану, і для вже кількох накладних на одну точку
	const group = isDelivery
		? findEventGroup(events ?? [], target).sort((a, b) => a.eventTs.localeCompare(b.eventTs))
		: [target];

	function handleDeleteConfirmed(id: number) {
		deleteEvent.mutate(
			{ id, carId: car!.idCar },
			{
				onSuccess: () => {
					setConfirmDeleteId(null);
					// Видалили саме той запис, на який зайшли — до історії;
					// видалили сусідню накладну з групи — лишаємось на місці
					if (id === target!.id) navigate("/driver/history");
				},
			}
		);
	}

	function startEdit(e: RouteEvent) {
		setConfirmDeleteId(null);
		setEditingId(e.id);
		setEditWaybillNumber(e.waybillNumber ?? "");
		setEditWaybillDate(e.waybillDate ?? "");
		setEditCustomerName(e.customerName ?? "");
		setEditOdometerKm(e.odometerKm != null ? String(e.odometerKm) : "");
		setEditPalletsCount(e.palletsCount != null ? String(e.palletsCount) : "");
	}

	function saveEdit(e: RouteEvent) {
		updateEvent.mutate(
			{
				id: e.id,
				carId: car!.idCar,
				patch: {
					waybillNumber: editWaybillNumber,
					waybillDate: editWaybillDate,
					customerName: editCustomerName,
					odometerKm: e.odometerKm != null && editOdometerKm ? Number(editOdometerKm) : undefined,
					palletsCount: e.palletsCount != null && editPalletsCount ? Number(editPalletsCount) : undefined,
				},
			},
			{ onSuccess: () => setEditingId(null) }
		);
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

			{isDelivery ? (
				<>
					<h3 className="text-sm font-semibold text-white/60 tracking-wide uppercase">
						{group.length > 1 ? `Накладні цієї точки (${group.length})` : "Накладна цієї точки"}
					</h3>
					<div className="flex flex-col gap-2">
						{group.map((e) => {
							if (confirmDeleteId === e.id) {
								return (
									<ConfirmDeleteMessage
										key={e.id}
										waybillNumber={e.waybillNumber}
										pending={deleteEvent.isPending && deleteEvent.variables?.id === e.id}
										onCancel={() => setConfirmDeleteId(null)}
										onConfirm={() => handleDeleteConfirmed(e.id)}
									/>
								);
							}
							if (editingId === e.id) {
								return (
									<div key={e.id} className="rounded-xl border border-violet-400/30 bg-white/5 px-4 py-3 flex flex-col gap-2">
										<Input label="Номер накладної" value={editWaybillNumber} onChange={(ev) => setEditWaybillNumber(ev.target.value)} />
										<Input label="Дата накладної" type="date" value={editWaybillDate} onChange={(ev) => setEditWaybillDate(ev.target.value)} />
										<Input label="Клієнт" value={editCustomerName} onChange={(ev) => setEditCustomerName(ev.target.value)} />
										{e.odometerKm != null && (
											<Input label="Одометр (км)" type="number" value={editOdometerKm} onChange={(ev) => setEditOdometerKm(ev.target.value)} />
										)}
										{e.palletsCount != null && (
											<Input label="Палети" type="number" value={editPalletsCount} onChange={(ev) => setEditPalletsCount(ev.target.value)} />
										)}
										<div className="flex gap-2 mt-1">
											<Button type="button" variant="ghost" onClick={() => setEditingId(null)} className="flex-1">Скасувати</Button>
											<Button
												type="button"
												isLoading={updateEvent.isPending && updateEvent.variables?.id === e.id}
												className="flex-1"
												onClick={() => saveEdit(e)}
											>
												Зберегти
											</Button>
										</div>
									</div>
								);
							}
							return (
								<div key={e.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
									<button
										type="button"
										onClick={() => setConfirmDeleteId(e.id)}
										aria-label="Видалити накладну"
										className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-rose-300/80 hover:bg-rose-500/10 hover:text-rose-300 active:scale-95 transition-colors"
									>
										🗑
									</button>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-medium text-white/90">№ {e.waybillNumber}</p>
										<p className="text-xs text-white/40 truncate">
											{e.customerName || "—"}
											{e.odometerKm != null && ` · ${formatKm(e.odometerKm)}`}
										</p>
									</div>
									<button
										type="button"
										onClick={() => startEdit(e)}
										aria-label="Редагувати накладну"
										className="shrink-0 h-9 w-9 rounded-lg flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white active:scale-95 transition-colors"
									>
										✏️
									</button>
								</div>
							);
						})}
					</div>

					{scanError && <ErrorBanner message={scanError} />}
					<Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
						📷 Ще одна накладна {group.length > 1 ? "цієї точки" : "(якщо на цей магазин їде кілька накладних)"}
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

					{confirmDeleteId === target.id ? (
						<ConfirmDeleteMessage
							pending={deleteEvent.isPending}
							onCancel={() => setConfirmDeleteId(null)}
							onConfirm={() => handleDeleteConfirmed(target.id)}
						/>
					) : (
						<Button type="button" variant="ghost" onClick={() => setConfirmDeleteId(target.id)} className="mt-2">
							🗑 Видалити подію
						</Button>
					)}
				</div>
			)}

			{scannerOpen && (
				<QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} notice={scanError} />
			)}

			{(deleteEvent.isError || updateEvent.isError) && (
				<ErrorBanner message={((deleteEvent.error ?? updateEvent.error) as Error).message} />
			)}

			<Button variant="ghost" onClick={() => navigate("/driver/history")}>← До історії</Button>
		</div>
	);
}

// Явне повідомлення-підтвердження замість нативного confirm() і замість
// "натисни ще раз ту саму кнопку" — читається як окремий крок, не як
// підказка дрібним текстом на кнопці
function ConfirmDeleteMessage({
	waybillNumber,
	pending,
	onCancel,
	onConfirm,
}: {
	waybillNumber?: string;
	pending: boolean;
	onCancel: () => void;
	onConfirm: () => void;
}) {
	return (
		<div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 flex flex-col gap-2">
			<p className="text-sm text-rose-200">
				{waybillNumber ? `Видалити накладну №${waybillNumber}?` : "Видалити цю подію?"}
			</p>
			<div className="flex gap-2">
				<Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Скасувати</Button>
				<Button type="button" variant="danger" onClick={onConfirm} isLoading={pending} className="flex-1">Так, видалити</Button>
			</div>
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
