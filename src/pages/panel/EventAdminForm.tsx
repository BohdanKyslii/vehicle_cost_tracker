import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCars } from "../../hocks/useCars";
import { useDrivers } from "../../hocks/useDrivers";
import { useRouteEvent, useAllRouteEvents, useCreateRouteEvent, useUpdateRouteEvent, useDeleteRouteEvent } from "../../hocks/useRouteEvents";
import { requiresOdometer, requiresWaybill, requiresPallets, eventTypeLabel, findEventGroup, groupRootIdOf, withStopTag, stripStopTag } from "../../utils/eventHelpers";
import type { RouteEventType, RouteEventCreate, RouteEvent, TrackingMode } from "../../types";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Spinner } from "../../components/ui/Spinner";
import { ConfirmDelete } from "../../components/ui/ConfirmDelete";

const EVENT_TYPES: RouteEventType[] = [
	"depot_start", "delivery", "parking_end", "depot_return",
	"refuel", "other_cost", "return_goods", "extra_cargo",
];

const TRACKING_MODE_LABELS: Record<TrackingMode, string> = {
	daily: "Щоденний",
	full: "Повний",
};

// Datetime-local input working на "YYYY-MM-DDTHH:mm" в ЛОКАЛЬНОМУ часі —
// toISOString() дає UTC, тому конвертація вручну (той самий гачок, що й
// локальна дата в routeEvents.ts::fetchTodayEvents, mock-гілка)
function toDatetimeLocal(iso: string): string {
	const d = new Date(iso);
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Повний адмінський редактор події водія (/panel/events) — на відміну
// від driver/EventForm.tsx, тут: авто/водій/час обираються вручну (не
// беруться з сесії поточного водія), немає QR-сканера (адмін вводить
// дані вручну, часто заднім числом), можна редагувати вже існуючу подію
// цілком (driver/EventDetail.tsx дозволяє лише вузький PATCH 5 полів).
//
// Локед-режим перегляду — той самий принцип, що CarForm/ProductForm/...
// ([[locked-edit-form-pattern-required]]): відкрита на редагування
// подія за замовчуванням заблокована, "✏️ Редагувати" розблоковує,
// "← Назад" ніколи не зберігає.
export function EventAdminForm() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!eventId;
	const { data: existing, isLoading: existingLoading } = useRouteEvent(isEdit ? Number(eventId) : 0);
	const { data: cars, isLoading: carsLoading } = useCars();
	const { data: drivers, isLoading: driversLoading } = useDrivers();
	const createEvent = useCreateRouteEvent();
	const updateEvent = useUpdateRouteEvent();
	const deleteEvent = useDeleteRouteEvent();

	const [carId, setCarId] = useState<number | "">("");
	const [driverId, setDriverId] = useState<number | "">("");
	const [trackingMode, setTrackingMode] = useState<TrackingMode>("daily");
	const [eventType, setEventType] = useState<RouteEventType>("delivery");
	const [eventTs, setEventTs] = useState(toDatetimeLocal(new Date().toISOString()));
	const [odometerKm, setOdometerKm] = useState("");
	const [palletsCount, setPalletsCount] = useState("");
	const [waybillNumber, setWaybillNumber] = useState("");
	const [waybillDate, setWaybillDate] = useState("");
	const [customerName, setCustomerName] = useState("");
	const [fuelLiters, setFuelLiters] = useState("");
	const [fuelCostUah, setFuelCostUah] = useState("");
	const [otherCostUah, setOtherCostUah] = useState("");
	const [otherCostComment, setOtherCostComment] = useState("");
	const [returnClientWaybill, setReturnClientWaybill] = useState("");
	const [extraFrom, setExtraFrom] = useState("");
	const [extraTo, setExtraTo] = useState("");
	const [extraWeightKg, setExtraWeightKg] = useState("");
	const [extraWaybill, setExtraWaybill] = useState("");
	const [notes, setNotes] = useState("");

	// Дані події змінюються рідко звідси — за замовчуванням заблоковані
	// від випадкового редагування (isEdit=true), "Редагувати" розблоковує.
	// Для НОВОЇ події (isEdit=false) блокування не має сенсу.
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	// Інші накладні цієї ж точки (стоп-групи, [stop:N]) — той самий
	// принцип групування, що driver/EventDetail.tsx. Запит вмикається
	// лише для delivery-подій, що вже редагуються — не для create/інших типів.
	const groupQueryEnabled = isEdit && !!existing && existing.eventType === "delivery";
	const { data: dayEvents } = useAllRouteEvents(
		{ date: existing?.eventTs.slice(0, 10), carId: existing?.carId },
		{ enabled: groupQueryEnabled },
	);
	const group: RouteEvent[] = groupQueryEnabled && existing && dayEvents ? findEventGroup(dayEvents, existing) : [];
	// Інші delivery-події цього ж авто того ж дня, які ще НЕ в цій групі —
	// кандидати для "приєднати" (водій відсканував їх окремими заходами,
	// хоча фізично це та сама точка вивантаження). НЕ "+ Ще одна
	// накладна" — та кнопка створює НОВУ подію і для вже відсканованих
	// водієм накладних дає дублікат, саме це й сталось при живому
	// тестуванні 2026-08-31.
	const attachable: RouteEvent[] = groupQueryEnabled && existing && dayEvents
		? dayEvents.filter((e) => e.eventType === "delivery" && groupRootIdOf(e) !== groupRootIdOf(existing))
		: [];
	const [addingWaybill, setAddingWaybill] = useState(false);
	const [newWaybillNumber, setNewWaybillNumber] = useState("");
	const [newWaybillDate, setNewWaybillDate] = useState("");
	const [confirmDeleteSiblingId, setConfirmDeleteSiblingId] = useState<number | null>(null);
	const [attachingId, setAttachingId] = useState<number | "">("");

	// Підвантажені дані існуючої події заповнюють форму — окремим
	// ефектом, бо useRouteEvent(id) резолвиться асинхронно вже ПІСЛЯ
	// першого рендеру форми (initial useState не бачить existing)
	useEffect(() => {
		if (!existing) return;
		setCarId(existing.carId);
		setDriverId(existing.driverId);
		setTrackingMode(existing.trackingMode ?? "daily");
		setEventType(existing.eventType);
		setEventTs(toDatetimeLocal(existing.eventTs));
		setOdometerKm(existing.odometerKm != null ? String(existing.odometerKm) : "");
		setPalletsCount(existing.palletsCount != null ? String(existing.palletsCount) : "");
		setWaybillNumber(existing.waybillNumber ?? "");
		setWaybillDate(existing.waybillDate ?? "");
		setCustomerName(existing.customerName ?? "");
		setFuelLiters(existing.fuelLiters != null ? String(existing.fuelLiters) : "");
		setFuelCostUah(existing.fuelCostUah != null ? String(existing.fuelCostUah) : "");
		setOtherCostUah(existing.otherCostUah != null ? String(existing.otherCostUah) : "");
		setOtherCostComment(existing.otherCostComment ?? "");
		setReturnClientWaybill(existing.returnClientWaybill ?? "");
		setExtraFrom(existing.extraFrom ?? "");
		setExtraTo(existing.extraTo ?? "");
		setExtraWeightKg(existing.extraWeightKg != null ? String(existing.extraWeightKg) : "");
		setExtraWaybill(existing.extraWaybill ?? "");
		setNotes(existing.notes ?? "");
	}, [existing]);

	if (isEdit && existingLoading) return <Spinner size="lg" label="Завантаження події..." />;
	if (carsLoading || driversLoading) return <Spinner size="lg" label="Завантаження..." />;

	const needsOdometer = requiresOdometer(eventType, trackingMode);
	const needsPallets = requiresPallets(eventType, trackingMode);
	const needsWaybill = requiresWaybill(eventType);
	const mutation = isEdit ? updateEvent : createEvent;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (carId === "" || driverId === "") return;

		const data: RouteEventCreate = {
			carId,
			driverId,
			trackingMode,
			eventType,
			eventTs: new Date(eventTs).toISOString(),
			odometerKm: needsOdometer && odometerKm ? Number(odometerKm) : undefined,
			palletsCount: needsPallets && palletsCount ? Number(palletsCount) : undefined,
			waybillNumber: needsWaybill ? waybillNumber : undefined,
			waybillDate: needsWaybill && waybillDate ? waybillDate : undefined,
			customerName: needsWaybill ? customerName : undefined,
			fuelLiters: eventType === "refuel" && fuelLiters ? Number(fuelLiters) : undefined,
			fuelCostUah: eventType === "refuel" && fuelCostUah ? Number(fuelCostUah) : undefined,
			otherCostUah: eventType === "other_cost" && otherCostUah ? Number(otherCostUah) : undefined,
			otherCostComment: eventType === "other_cost" ? otherCostComment : undefined,
			returnClientWaybill: eventType === "return_goods" ? returnClientWaybill : undefined,
			extraFrom: eventType === "extra_cargo" ? extraFrom : undefined,
			extraTo: eventType === "extra_cargo" ? extraTo : undefined,
			extraWeightKg: eventType === "extra_cargo" && extraWeightKg ? Number(extraWeightKg) : undefined,
			extraWaybill: eventType === "extra_cargo" && extraWaybill ? extraWaybill : undefined,
			notes: notes || undefined,
		};

		if (isEdit) {
			updateEvent.mutate(
				{ id: Number(eventId), carId, patch: data },
				{ onSuccess: () => navigate(-1) },
			);
		} else {
			createEvent.mutate(data, { onSuccess: () => navigate(-1) });
		}
	}

	function handleAddWaybill() {
		if (!existing || !newWaybillNumber) return;
		createEvent.mutate(
			{
				carId: existing.carId,
				driverId: existing.driverId,
				trackingMode: existing.trackingMode ?? "daily",
				eventType: "delivery",
				// Той самий час, що основна подія точки, НЕ "зараз" — інакше
				// додаткова накладна лягає під СЬОГОДНІШНЬОЮ датою (реальний
				// час збереження), випадає з фільтра "дата" адмінського
				// списку/групи (обидва фільтрують за датою ОСНОВНОЇ події) і
				// виглядає як самостійна нова подія, а не частина цієї точки.
				eventTs: existing.eventTs,
				waybillNumber: newWaybillNumber,
				waybillDate: newWaybillDate || undefined,
				customerName: customerName || undefined,
				notes: withStopTag(groupRootIdOf(existing)),
			},
			{
				onSuccess: () => {
					setNewWaybillNumber("");
					setNewWaybillDate("");
					setAddingWaybill(false);
				},
			},
		);
	}

	function handleDeleteSibling(id: number) {
		if (!existing) return;
		deleteEvent.mutate({ id, carId: existing.carId }, { onSuccess: () => setConfirmDeleteSiblingId(null) });
	}

	// Приєднує вже існуючу окрему подію до групи цієї точки — PATCH її
	// notes міткою [stop:rootId], зберігаючи решту тексту notes, якщо
	// там уже щось було (не перезаписує). Нової події НЕ створює.
	function handleAttachExisting() {
		if (!existing || attachingId === "") return;
		const target = attachable.find((e) => e.id === attachingId);
		if (!target) return;
		const rootId = groupRootIdOf(existing);
		const preservedNotes = stripStopTag(target.notes);
		updateEvent.mutate(
			{
				id: target.id,
				carId: target.carId,
				patch: { notes: preservedNotes ? `${withStopTag(rootId)} ${preservedNotes}` : withStopTag(rootId) },
			},
			{ onSuccess: () => setAttachingId("") },
		);
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-white">
						{isEdit ? `Подія — ${eventTypeLabel(eventType, trackingMode)}` : "Нова подія"}
					</h1>
					{isEdit && !isEditingDetails && (
						<Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
							✏️ Редагувати
						</Button>
					)}
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-white/70">Авто</label>
						<select
							value={carId}
							onChange={(e) => setCarId(e.target.value ? Number(e.target.value) : "")}
							required
							disabled={detailsLocked}
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white disabled:opacity-50"
						>
							<option value="">— обрати —</option>
							{cars?.map((c) => (
								<option key={c.idCar} value={c.idCar}>{c.numberCar} · {c.nameCar}</option>
							))}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-white/70">Водій</label>
						<select
							value={driverId}
							onChange={(e) => setDriverId(e.target.value ? Number(e.target.value) : "")}
							required
							disabled={detailsLocked}
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white disabled:opacity-50"
						>
							<option value="">— обрати —</option>
							{drivers?.map((d) => (
								<option key={d.idDriver} value={d.idDriver}>{d.nameDriver}</option>
							))}
						</select>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-white/70">Тип події</label>
						<select
							value={eventType}
							onChange={(e) => setEventType(e.target.value as RouteEventType)}
							disabled={detailsLocked}
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white disabled:opacity-50"
						>
							{EVENT_TYPES.map((t) => (
								<option key={t} value={t}>{eventTypeLabel(t, trackingMode)}</option>
							))}
						</select>
					</div>
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-white/70">Режим обліку</label>
						<select
							value={trackingMode}
							onChange={(e) => setTrackingMode(e.target.value as TrackingMode)}
							disabled={detailsLocked}
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white disabled:opacity-50"
						>
							{(Object.keys(TRACKING_MODE_LABELS) as TrackingMode[]).map((m) => (
								<option key={m} value={m}>{TRACKING_MODE_LABELS[m]}</option>
							))}
						</select>
					</div>
				</div>

				<Input label="Дата й час" type="datetime-local" value={eventTs} onChange={(e) => setEventTs(e.target.value)} required disabled={detailsLocked} />

				{needsOdometer && (
					<Input label="Одометр (км)" type="number" value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} disabled={detailsLocked} />
				)}
				{needsPallets && (
					<Input label="Кількість палет" type="number" value={palletsCount} onChange={(e) => setPalletsCount(e.target.value)} disabled={detailsLocked} />
				)}

				{needsWaybill && (
					<>
						<Input label="Номер накладної" value={waybillNumber} onChange={(e) => setWaybillNumber(e.target.value)} required disabled={detailsLocked} />
						<Input label="Дата накладної" type="date" value={waybillDate} onChange={(e) => setWaybillDate(e.target.value)} disabled={detailsLocked} />
						<Input label="Клієнт" value={customerName} onChange={(e) => setCustomerName(e.target.value)} disabled={detailsLocked} />
					</>
				)}

				{eventType === "refuel" && (
					<>
						<Input label="Літрів" type="number" step="0.1" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} disabled={detailsLocked} />
						<Input label="Сума (грн)" type="number" step="0.01" value={fuelCostUah} onChange={(e) => setFuelCostUah(e.target.value)} disabled={detailsLocked} />
					</>
				)}

				{eventType === "other_cost" && (
					<>
						<Input label="Сума (грн)" type="number" step="0.01" value={otherCostUah} onChange={(e) => setOtherCostUah(e.target.value)} disabled={detailsLocked} />
						<Input label="Коментар" value={otherCostComment} onChange={(e) => setOtherCostComment(e.target.value)} disabled={detailsLocked} />
					</>
				)}

				{eventType === "return_goods" && (
					<Input label="Накладна клієнта (повернення)" value={returnClientWaybill} onChange={(e) => setReturnClientWaybill(e.target.value)} disabled={detailsLocked} />
				)}

				{eventType === "extra_cargo" && (
					<>
						<Input label="Накладна (опційно)" value={extraWaybill} onChange={(e) => setExtraWaybill(e.target.value)} disabled={detailsLocked} />
						<Input label="Звідки" value={extraFrom} onChange={(e) => setExtraFrom(e.target.value)} disabled={detailsLocked} />
						<Input label="Куди" value={extraTo} onChange={(e) => setExtraTo(e.target.value)} disabled={detailsLocked} />
						<Input label="Вага (кг)" type="number" value={extraWeightKg} onChange={(e) => setExtraWeightKg(e.target.value)} disabled={detailsLocked} />
					</>
				)}

				<Input label="Нотатки" value={notes} onChange={(e) => setNotes(e.target.value)} disabled={detailsLocked} />

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate(-1)}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1" disabled={detailsLocked}>Зберегти</Button>
				</div>
			</form>

			{/* Інші накладні цієї ж точки — доступно лише в режимі
			    редагування (той самий "Редагувати", що й вище), той самий
			    маркер [stop:N], що driver/EventDetail.tsx */}
			{isEditingDetails && groupQueryEnabled && (
				<div className="rounded-2xl bg-white/5 border border-white/10 p-6 space-y-3">
					<h2 className="text-sm font-semibold text-white/60 tracking-wide uppercase">
						Накладні цієї точки {group.length > 1 ? `(${group.length})` : ""}
					</h2>
					<div className="flex flex-col gap-2">
						{group.map((g) => {
							if (confirmDeleteSiblingId === g.id) {
								return (
									<ConfirmDelete
										key={g.id}
										message={`Видалити накладну №${g.waybillNumber}?`}
										pending={deleteEvent.isPending && deleteEvent.variables?.id === g.id}
										onCancel={() => setConfirmDeleteSiblingId(null)}
										onConfirm={() => handleDeleteSibling(g.id)}
									/>
								);
							}
							return (
								<div key={g.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm">
									<span className="text-white/80">
										№ {g.waybillNumber}{g.id === existing?.id && <span className="text-white/40"> (ця подія)</span>}
									</span>
									{g.id !== existing?.id && (
										<Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDeleteSiblingId(g.id)}>🗑</Button>
									)}
								</div>
							);
						})}
					</div>

					{/* Приєднати вже відскановану водієм ОКРЕМУ накладну до цієї
					    точки — не створює нову подію, лише позначає наявну
					    міткою [stop:N]. Саме це потрібно, коли водій
					    відсканував кожну накладну точки окремим заходом
					    (типовий випадок), а НЕ "+ Ще одна накладна" нижче
					    (та створює нову подію — дублікат, якщо накладна вже
					    існує окремим записом). */}
					{attachable.length > 0 && (
						<div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
							<label className="text-xs text-white/50">
								Приєднати вже відскановану накладну цього ж авто/дня
							</label>
							<div className="flex gap-2">
								<select
									value={attachingId}
									onChange={(e) => setAttachingId(e.target.value ? Number(e.target.value) : "")}
									className="flex-1 rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
								>
									<option value="">— обрати накладну —</option>
									{attachable.map((e) => (
										<option key={e.id} value={e.id}>
											№ {e.waybillNumber} · {e.customerName || "—"} · {toDatetimeLocal(e.eventTs).slice(11)}
										</option>
									))}
								</select>
								<Button
									type="button"
									size="sm"
									onClick={handleAttachExisting}
									isLoading={updateEvent.isPending}
									disabled={attachingId === ""}
								>
									Приєднати
								</Button>
							</div>
						</div>
					)}

					{addingWaybill ? (
						<div className="flex flex-col gap-2 rounded-lg border border-violet-400/30 bg-white/5 p-3">
							<Input label="Номер накладної" value={newWaybillNumber} onChange={(e) => setNewWaybillNumber(e.target.value)} />
							<Input label="Дата накладної" type="date" value={newWaybillDate} onChange={(e) => setNewWaybillDate(e.target.value)} />
							<div className="flex gap-2">
								<Button type="button" variant="ghost" size="sm" onClick={() => setAddingWaybill(false)} className="flex-1">Скасувати</Button>
								<Button type="button" size="sm" onClick={handleAddWaybill} isLoading={createEvent.isPending} className="flex-1">Додати</Button>
							</div>
						</div>
					) : (
						<Button type="button" variant="ghost" onClick={() => setAddingWaybill(true)}>
							+ Нова накладна цієї точки (якщо водій ще не сканував)
						</Button>
					)}
				</div>
			)}
		</div>
	);
}
