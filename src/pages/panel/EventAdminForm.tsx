import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCars } from "../../hocks/useCars";
import { useDrivers } from "../../hocks/useDrivers";
import { useRouteEvent, useCreateRouteEvent, useUpdateRouteEvent } from "../../hocks/useRouteEvents";
import { requiresOdometer, requiresWaybill, requiresPallets, eventTypeLabel } from "../../utils/eventHelpers";
import type { RouteEventType, RouteEventCreate, TrackingMode } from "../../types";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Spinner } from "../../components/ui/Spinner";

const EVENT_TYPES: RouteEventType[] = [
	"depot_start", "delivery", "parking_end", "depot_return",
	"refuel", "other_cost", "return_goods", "extra_cargo",
];

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
export function EventAdminForm() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!eventId;
	const { data: existing, isLoading: existingLoading } = useRouteEvent(isEdit ? Number(eventId) : 0);
	const { data: cars, isLoading: carsLoading } = useCars();
	const { data: drivers, isLoading: driversLoading } = useDrivers();
	const createEvent = useCreateRouteEvent();
	const updateEvent = useUpdateRouteEvent();

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
			waybillDate: needsWaybill ? waybillDate : undefined,
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
				{ onSuccess: () => navigate("/panel/events") },
			);
		} else {
			createEvent.mutate(data, { onSuccess: () => navigate("/panel/events") });
		}
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-4">
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
				<h1 className="text-xl font-bold text-white">
					{isEdit ? `Подія — ${eventTypeLabel(eventType, trackingMode)}` : "Нова подія"}
				</h1>

				<div className="grid grid-cols-2 gap-3">
					<div className="flex flex-col gap-1">
						<label className="text-sm font-medium text-white/70">Авто</label>
						<select
							value={carId}
							onChange={(e) => setCarId(e.target.value ? Number(e.target.value) : "")}
							required
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
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
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
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
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
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
							className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
						>
							<option value="daily">daily</option>
							<option value="full">full</option>
						</select>
					</div>
				</div>

				<Input label="Дата й час" type="datetime-local" value={eventTs} onChange={(e) => setEventTs(e.target.value)} required />

				{needsOdometer && (
					<Input label="Одометр (км)" type="number" value={odometerKm} onChange={(e) => setOdometerKm(e.target.value)} />
				)}
				{needsPallets && (
					<Input label="Кількість палет" type="number" value={palletsCount} onChange={(e) => setPalletsCount(e.target.value)} />
				)}

				{needsWaybill && (
					<>
						<Input label="Номер накладної" value={waybillNumber} onChange={(e) => setWaybillNumber(e.target.value)} required />
						<Input label="Дата накладної" type="date" value={waybillDate} onChange={(e) => setWaybillDate(e.target.value)} />
						<Input label="Клієнт" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
					</>
				)}

				{eventType === "refuel" && (
					<>
						<Input label="Літрів" type="number" step="0.1" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} />
						<Input label="Сума (грн)" type="number" step="0.01" value={fuelCostUah} onChange={(e) => setFuelCostUah(e.target.value)} />
					</>
				)}

				{eventType === "other_cost" && (
					<>
						<Input label="Сума (грн)" type="number" step="0.01" value={otherCostUah} onChange={(e) => setOtherCostUah(e.target.value)} />
						<Input label="Коментар" value={otherCostComment} onChange={(e) => setOtherCostComment(e.target.value)} />
					</>
				)}

				{eventType === "return_goods" && (
					<Input label="Накладна клієнта (повернення)" value={returnClientWaybill} onChange={(e) => setReturnClientWaybill(e.target.value)} />
				)}

				{eventType === "extra_cargo" && (
					<>
						<Input label="Накладна (опційно)" value={extraWaybill} onChange={(e) => setExtraWaybill(e.target.value)} />
						<Input label="Звідки" value={extraFrom} onChange={(e) => setExtraFrom(e.target.value)} />
						<Input label="Куди" value={extraTo} onChange={(e) => setExtraTo(e.target.value)} />
						<Input label="Вага (кг)" type="number" value={extraWeightKg} onChange={(e) => setExtraWeightKg(e.target.value)} />
					</>
				)}

				<Input label="Нотатки" value={notes} onChange={(e) => setNotes(e.target.value)} />

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/panel/events")}>Скасувати</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>
		</div>
	);
}
