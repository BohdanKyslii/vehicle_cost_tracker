import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RouteEventType, RouteEventCreate } from "../../types";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useDayMode } from "../../hocks/useDayMode";
import { useCreateRouteEvent, useLastOdometer } from "../../hocks/useRouteEvents";
import { requiresOdometer, requiresWaybill, requiresPallets, eventTypeLabel, eventTypeIcon, eventTypeGradient } from "../../utils/eventHelpers";
import { Input, Button, ErrorBanner, Spinner } from "../../components/driver/ui";
import { QRScanner } from "../../components/driver/QRScanner";
import { parseQRCode } from "../../utils/parseQR";

export function EventForm() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const type = (searchParams.get("type") ?? "other_cost") as RouteEventType;
	
	const { data: driver, isLoading: driverLoading } = useCurrentDriver();
	const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
	const { dayMode } = useDayMode(car?.defaultTrackingMode ?? "daily");
	const { data: lastOdometer } = useLastOdometer(car?.idCar ?? 0);
	const createEvent = useCreateRouteEvent();
	
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
	const [notes, setNotes] = useState("");
	const [scannerOpen, setScannerOpen] = useState(false);
	
	if (driverLoading || carLoading) return <Spinner label="Завантаження..." />;
	if (!driver || !car) return <ErrorBanner message="Немає закріпленого авто" />;
	
	const needsOdometer = requiresOdometer(type);
	const needsWaybill = requiresWaybill(type);
	const needsPallets = requiresPallets(type, dayMode);
	
	function handleScan(raw: string) {
		const parsed = parseQRCode(raw);
		if (parsed) {
			setWaybillNumber(parsed.waybillNumber);
			setWaybillDate(parsed.waybillDate);
		}
		setScannerOpen(false);
	}
	
	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		
		const data: RouteEventCreate = {
			carId: car!.idCar,
			driverId: driver!.idDriver,
			trackingMode: dayMode,
			eventType: type,
			eventTs: new Date().toISOString(),
			odometerKm: needsOdometer && odometerKm ? Number(odometerKm) : undefined,
			palletsCount: needsPallets && palletsCount ? Number(palletsCount) : undefined,
			waybillNumber: needsWaybill ? waybillNumber : undefined,
			waybillDate: needsWaybill ? waybillDate : undefined,
			customerName: needsWaybill ? customerName : undefined,
			fuelLiters: type === "refuel" && fuelLiters ? Number(fuelLiters) : undefined,
			fuelCostUah: type === "refuel" && fuelCostUah ? Number(fuelCostUah) : undefined,
			otherCostUah: type === "other_cost" && otherCostUah ? Number(otherCostUah) : undefined,
			otherCostComment: type === "other_cost" ? otherCostComment : undefined,
			returnClientWaybill: type === "return_goods" ? returnClientWaybill : undefined,
			extraFrom: type === "extra_cargo" ? extraFrom : undefined,
			extraTo: type === "extra_cargo" ? extraTo : undefined,
			extraWeightKg: type === "extra_cargo" && extraWeightKg ? Number(extraWeightKg) : undefined,
			notes: notes || undefined,
		};
		
		await createEvent.mutateAsync(data);
		navigate("/driver");
	}
	
	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex items-center gap-3 mb-1">
				<div className={`h-12 w-12 rounded-full bg-gradient-to-br ${eventTypeGradient(type)} flex items-center justify-center text-2xl shadow-lg`}>
					{eventTypeIcon(type)}
				</div>
				<h2 className="text-lg font-bold text-white">{eventTypeLabel(type)}</h2>
			</div>
			
			{needsOdometer && (
				<Input
					label="Одометр (км)"
					type="number"
					value={odometerKm}
					onChange={(e) => setOdometerKm(e.target.value)}
					helpText={lastOdometer != null ? `Останній: ${lastOdometer} км` : undefined}
					required
				/>
			)}
			
			{needsPallets && (
				<Input label="Кількість палет" type="number" value={palletsCount} onChange={(e) => setPalletsCount(e.target.value)} />
			)}
			
			{needsWaybill && (
				<>
					<Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
						📷 Сканувати QR накладної
					</Button>
					<Input label="Номер накладної" value={waybillNumber} onChange={(e) => setWaybillNumber(e.target.value)} required />
					<Input label="Клієнт" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
				</>
			)}

			{scannerOpen && <QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} />}

			{type === "refuel" && (
				<>
					<Input label="Літрів" type="number" step="0.1" value={fuelLiters} onChange={(e) => setFuelLiters(e.target.value)} required />
					<Input label="Сума (грн)" type="number" step="0.01" value={fuelCostUah} onChange={(e) => setFuelCostUah(e.target.value)} required />
				</>
			)}
			
			{type === "other_cost" && (
				<>
					<Input label="Сума (грн)" type="number" step="0.01" value={otherCostUah} onChange={(e) => setOtherCostUah(e.target.value)} required />
					<Input label="Коментар" value={otherCostComment} onChange={(e) => setOtherCostComment(e.target.value)} />
				</>
			)}
			
			{type === "return_goods" && (
				<Input label="Накладна клієнта (повернення)" value={returnClientWaybill} onChange={(e) => setReturnClientWaybill(e.target.value)} />
			)}
			
			{type === "extra_cargo" && (
				<>
					<Input label="Звідки" value={extraFrom} onChange={(e) => setExtraFrom(e.target.value)} />
					<Input label="Куди" value={extraTo} onChange={(e) => setExtraTo(e.target.value)} />
					<Input label="Вага (кг)" type="number" value={extraWeightKg} onChange={(e) => setExtraWeightKg(e.target.value)} />
				</>
			)}
			
			<Input label="Нотатки" value={notes} onChange={(e) => setNotes(e.target.value)} />
			
			{createEvent.isError && <ErrorBanner message={(createEvent.error as Error).message} />}
			
			<div className="flex gap-3 mt-2">
				<Button type="button" variant="ghost" onClick={() => navigate("/driver")}>
					Скасувати
				</Button>
				<Button type="submit" isLoading={createEvent.isPending} className="flex-1">
					Зберегти
				</Button>
			</div>
		</form>
	);
}
