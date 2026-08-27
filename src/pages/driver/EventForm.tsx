import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { RouteEventType, RouteEventCreate } from "../../types";
import { useCurrentDriver } from "../../hocks/useDrivers";
import { useCar } from "../../hocks/useCars";
import { useDayMode } from "../../hocks/useDayMode";
import { useCreateRouteEvent, useLastOdometer, useTodayEvents } from "../../hocks/useRouteEvents";
import { requiresOdometer, requiresWaybill, requiresPallets, eventTypeLabel, eventTypeIcon, eventTypeGradient } from "../../utils/eventHelpers";
import { Input, Button, ErrorBanner, Spinner } from "../../components/driver/ui";
import { QRScanner } from "../../components/driver/QRScanner";
import { parseQRCode } from "../../utils/parseQR";

export function EventForm() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const type = (searchParams.get("type") ?? "other_cost") as RouteEventType;
	const needsWaybill = requiresWaybill(type); // залежить лише від type — відомо одразу

	const { data: driver, isLoading: driverLoading } = useCurrentDriver();
	const { data: car, isLoading: carLoading } = useCar(driver?.idCar ?? 0);
	const { dayMode } = useDayMode(car?.defaultTrackingMode ?? "daily");
	const { data: lastOdometer } = useLastOdometer(car?.idCar ?? 0);
	const { data: todayEvents } = useTodayEvents(car?.idCar ?? 0);
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
	const [extraWaybill, setExtraWaybill] = useState("");
	const [notes, setNotes] = useState("");
	// Для типу з накладною камера відкривається одразу при вході на екран —
	// водій спершу сканує, і вже тоді бачить форму з підтягнутим номером
	const [scannerOpen, setScannerOpen] = useState(needsWaybill);
	const [scanError, setScanError] = useState<string | null>(null);
	// Точка вивантаження (full) часто має 2-4 накладних — основна несе
	// одометр/палети/клієнта, додаткові лише фіксують номер (без одометра/
	// палет, щоб не задвоїти суму на одну фізичну точку)
	const [additionalWaybills, setAdditionalWaybills] = useState<{ waybillNumber: string; waybillDate: string }[]>([]);
	const [scanningAdditional, setScanningAdditional] = useState(false);

	if (driverLoading || carLoading) return <Spinner label="Завантаження..." />;
	if (!driver || !car) return <ErrorBanner message="Немає закріпленого авто" />;

	const needsOdometer = requiresOdometer(type, dayMode);
	const needsPallets = requiresPallets(type, dayMode);
	// Кілька накладних на одну точку має сенс лише там, де точка й так має
	// одометр+палети (full-режим delivery) — у daily кожен скан вже сам собі подія
	const groupsMultipleWaybills = needsWaybill && needsPallets;
	const isRouteNameField = type === "depot_start" && dayMode === "full";

	// Та сама накладна не може бути відскановано двічі за день (і не може
	// повторитись серед ще не збережених накладних цієї ж точки)
	function isAlreadyScannedToday(num: string): boolean {
		return (
			(todayEvents?.some(e => e.waybillNumber === num) ?? false) ||
			num === waybillNumber ||
			additionalWaybills.some(w => w.waybillNumber === num)
		);
	}

	function handleScan(raw: string) {
		const parsed = parseQRCode(raw);
		if (!parsed) return;

		if (type === "return_goods") {
			setReturnClientWaybill(parsed.waybillNumber);
			setScannerOpen(false);
		} else if (type === "extra_cargo") {
			setExtraWaybill(parsed.waybillNumber);
			setScannerOpen(false);
		} else {
			// delivery — єдиний тип, якому потрібна ще й дата накладної
			if (isAlreadyScannedToday(parsed.waybillNumber)) {
				setScanError(`Накладну №${parsed.waybillNumber} вже додано — спробуйте іншу`);
				return; // не закриваємо камеру, даємо відсканувати правильну накладну
			}
			setScanError(null);
			if (scanningAdditional) {
				setAdditionalWaybills(prev => [...prev, parsed]);
				setScanningAdditional(false);
			} else {
				setWaybillNumber(parsed.waybillNumber);
				setWaybillDate(parsed.waybillDate);
			}
			setScannerOpen(false);
		}
	}

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();

		// Перевіряємо тільки збережені сьогодні події — isAlreadyScannedToday()
		// зараховує сам waybillNumber як "уже доданий", тут це не підходить
		if (needsWaybill && (todayEvents?.some(ev => ev.waybillNumber === waybillNumber) ?? false)) {
			setScanError(`Накладну №${waybillNumber} вже відскановано сьогодні — спробуйте іншу`);
			return;
		}

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
			extraWaybill: type === "extra_cargo" && extraWaybill ? extraWaybill : undefined,
			notes: notes || undefined,
		};

		await createEvent.mutateAsync(data);

		// Додаткові накладні цієї ж точки — без одометра/палет (вони вже на
		// основному записі), інакше пробіг і сума палет по точці задвоїться
		for (const w of additionalWaybills) {
			await createEvent.mutateAsync({
				carId: car!.idCar,
				driverId: driver!.idDriver,
				trackingMode: dayMode,
				eventType: type,
				eventTs: new Date().toISOString(),
				waybillNumber: w.waybillNumber,
				waybillDate: w.waybillDate,
				customerName: customerName || undefined,
			});
		}

		navigate("/driver");
	}
	
	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex items-center gap-3 mb-1">
				<div className={`h-12 w-12 rounded-full bg-gradient-to-br ${eventTypeGradient(type)} flex items-center justify-center text-2xl shadow-lg`}>
					{eventTypeIcon(type)}
				</div>
				<h2 className="text-lg font-bold text-white">{eventTypeLabel(type, dayMode)}</h2>
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
				<Input
					label={type === "depot_start" && dayMode === "full" ? "Кількість палет (загальна на маршрут)" : "Кількість палет"}
					type="number"
					value={palletsCount}
					onChange={(e) => setPalletsCount(e.target.value)}
				/>
			)}

			{needsWaybill && (
				<>
					{/* Кнопка повторного сканування прихована після успішного скану —
					    одна накладна на подію, без можливості випадково передублювати */}
					{!waybillNumber && (
						<Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
							📷 Сканувати QR накладної
						</Button>
					)}
					<Input label="Номер накладної" value={waybillNumber} onChange={(e) => setWaybillNumber(e.target.value)} required />
					<Input label="Клієнт" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
					{scanError && <ErrorBanner message={scanError} />}
				</>
			)}

			{groupsMultipleWaybills && waybillNumber && (
				<>
					{additionalWaybills.length > 0 && (
						<div className="flex flex-col gap-1.5">
							{additionalWaybills.map((w, i) => (
								<div key={w.waybillNumber} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
									<span>№ {w.waybillNumber}</span>
									<button
										type="button"
										onClick={() => setAdditionalWaybills(prev => prev.filter((_, idx) => idx !== i))}
										className="text-white/40 hover:text-white/80"
									>
										✕
									</button>
								</div>
							))}
						</div>
					)}
					<Button
						type="button"
						variant="ghost"
						onClick={() => { setScanningAdditional(true); setScannerOpen(true); }}
					>
						📷 Ще одна накладна цієї точки
					</Button>
				</>
			)}

			{scannerOpen && (
				<QRScanner
					onScan={handleScan}
					onClose={() => { setScannerOpen(false); setScanningAdditional(false); }}
					notice={scanError}
				/>
			)}

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
				<>
					<Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
						📷 Сканувати QR
					</Button>
					<Input label="Накладна клієнта (повернення)" value={returnClientWaybill} onChange={(e) => setReturnClientWaybill(e.target.value)} />
				</>
			)}

			{type === "extra_cargo" && (
				<>
					<Button type="button" variant="ghost" onClick={() => setScannerOpen(true)}>
						📷 Сканувати QR
					</Button>
					<Input label="Накладна (опційно)" value={extraWaybill} onChange={(e) => setExtraWaybill(e.target.value)} />
					<Input label="Звідки" value={extraFrom} onChange={(e) => setExtraFrom(e.target.value)} />
					<Input label="Куди" value={extraTo} onChange={(e) => setExtraTo(e.target.value)} />
					<Input label="Вага (кг)" type="number" value={extraWeightKg} onChange={(e) => setExtraWeightKg(e.target.value)} />
				</>
			)}
			
			<Input
				label={isRouteNameField ? "Назва маршруту" : "Нотатки"}
				placeholder={isRouteNameField ? "напр. Вінницька та Хмельницька обл." : undefined}
				value={notes}
				onChange={(e) => setNotes(e.target.value)}
			/>
			
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
