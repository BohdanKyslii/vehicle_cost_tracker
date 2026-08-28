import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Driver, TrackingMode, CarStatus } from "../../types";
import { useCar, useCreateCar, useUpdateCar } from "../../hocks/useCars";
import { useDrivers, useUpdateDriver } from "../../hocks/useDrivers";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { CarPayload } from "../../api/cars";
import type { DriverPayload } from "../../api/drivers";

// Формуємо повний DriverPayload з уже завантаженого водія, змінюючи лише
// прив'язку до авто — updateDriver очікує весь об'єкт (не тільки idCar)
function driverPayloadWithCar(driver: Driver, idCar: number | null): DriverPayload {
	return {
		nameDriver: driver.nameDriver,
		phoneDriver: driver.phoneDriver,
		driversLicense: driver.driversLicense,
		isActive: driver.isActive,
		idCar,
	};
}

export function CarForm() {
	const { carId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!carId;
	const { data: existing } = useCar(isEdit ? Number(carId) : 0);
	const { data: drivers } = useDrivers();

	const [nameCar, setNameCar] = useState(existing?.nameCar ?? "");
	const [numberCar, setNumberCar] = useState(existing?.numberCar ?? "");
	const [fuelCardNumber, setFuelCardNumber] = useState(String(existing?.fuelCardNumber ?? ""));
	const [amountCar, setAmountCar] = useState(String(existing?.amountCar ?? ""));
	const [defaultTrackingMode, setDefaultTrackingMode] = useState<TrackingMode>(existing?.defaultTrackingMode ?? "daily");
	const [statusCar, setStatusCar] = useState<CarStatus>(existing?.statusCar ?? "active");
	const [isActive, setIsActive] = useState(existing?.isActive ?? true);

	// CarSpecs
	const [vinCode, setVinCode] = useState(existing?.specs?.vinCode ?? "");
	const [yearManufactured, setYearManufactured] = useState(String(existing?.specs?.yearManufactured ?? ""));
	const [weightKg, setWeightKg] = useState(String(existing?.specs?.weightKg ?? ""));
	const [payloadKg, setPayloadKg] = useState(String(existing?.specs?.payloadKg ?? ""));
	const [lengthCm, setLengthCm] = useState(String(existing?.specs?.lengthCm ?? ""));
	const [widthCm, setWidthCm] = useState(String(existing?.specs?.widthCm ?? ""));
	const [heightCm, setHeightCm] = useState(String(existing?.specs?.heightCm ?? ""));
	const [hasTailLift, setHasTailLift] = useState(existing?.specs?.hasTailLift ?? false);
	const [hasTrailer, setHasTrailer] = useState(existing?.specs?.hasTrailer ?? false);

	// Trailer — умовний блок, як у EventForm для різних event_type: рендериться
	// лише коли hasTrailer=true, а не приховується стилями
	const [trailerVinCode, setTrailerVinCode] = useState(existing?.trailer?.vinCode ?? "");
	const [trailerYear, setTrailerYear] = useState(String(existing?.trailer?.yearManufactured ?? ""));
	const [trailerName, setTrailerName] = useState(existing?.trailer?.nameTrailer ?? "");
	const [trailerModel, setTrailerModel] = useState(existing?.trailer?.model ?? "");
	const [trailerNumber, setTrailerNumber] = useState(existing?.trailer?.numberTrailer ?? "");
	const [trailerIsActive, setTrailerIsActive] = useState(existing?.trailer?.isActive ?? true);

	// Призначення водія: якого водія id вважати "закріпленим" за цим авто —
	// шукаємо серед усіх водіїв того, чий idCar збігається з поточним авто
	const currentDriverId = drivers?.find((d) => existing && d.idCar === existing.idCar)?.idDriver ?? null;
	const [selectedDriverId, setSelectedDriverId] = useState<number | "">(currentDriverId ?? "");

	const createCar = useCreateCar();
	const updateCar = useUpdateCar(Number(carId));
	const updateDriverAssignment = useUpdateDriver();
	const mutation = isEdit ? updateCar : createCar;

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const payload: CarPayload = {
			nameCar,
			numberCar,
			fuelCardNumber: fuelCardNumber ? Number(fuelCardNumber) : undefined,
			amountCar: Number(amountCar),
			defaultTrackingMode,
			statusCar,
			isActive,
			specs: {
				vinCode: vinCode || undefined,
				yearManufactured: yearManufactured ? Number(yearManufactured) : undefined,
				weightKg: weightKg ? Number(weightKg) : undefined,
				payloadKg: payloadKg ? Number(payloadKg) : undefined,
				lengthCm: lengthCm ? Number(lengthCm) : undefined,
				widthCm: widthCm ? Number(widthCm) : undefined,
				heightCm: heightCm ? Number(heightCm) : undefined,
				hasTailLift,
				hasTrailer,
			},
			trailer: hasTrailer
				? {
					vinCode: trailerVinCode || undefined,
					yearManufactured: trailerYear ? Number(trailerYear) : undefined,
					nameTrailer: trailerName,
					model: trailerModel,
					numberTrailer: trailerNumber,
					isActive: trailerIsActive,
				}
				: undefined,
		};

		const savedCar = await mutation.mutateAsync(payload);

		// Водій, що раніше був закріплений за цим авто, але тепер знятий/змінений — відв'язуємо
		const previousDriver = drivers?.find((d) => d.idCar === savedCar.idCar && d.idDriver !== selectedDriverId);
		if (previousDriver) {
			await updateDriverAssignment.mutateAsync({
				id: previousDriver.idDriver,
				data: driverPayloadWithCar(previousDriver, null),
			});
		}
		// Новий обраний водій — прив'язуємо до цього авто
		if (selectedDriverId !== "") {
			const driver = drivers?.find((d) => d.idDriver === selectedDriverId);
			if (driver) {
				await updateDriverAssignment.mutateAsync({
					id: driver.idDriver,
					data: driverPayloadWithCar(driver, savedCar.idCar),
				});
			}
		}

		navigate("/fleet");
	}

	return (
		<div className="p-6">
		<form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
			<h1 className="text-xl font-bold text-white">{isEdit ? "Редагувати авто" : "Нове авто"}</h1>

			<Input label="Назва (модель)" value={nameCar} onChange={(e) => setNameCar(e.target.value)} required />
			<Input label="Держ. номер" value={numberCar} onChange={(e) => setNumberCar(e.target.value)} required />
			<Input label="Номер паливної картки" type="number" value={fuelCardNumber} onChange={(e) => setFuelCardNumber(e.target.value)} />
			<Input label="Місячна амортизація (грн)" type="number" value={amountCar} onChange={(e) => setAmountCar(e.target.value)} required />

			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium text-white/70">Режим обліку за замовчуванням</label>
				<select
					value={defaultTrackingMode}
					onChange={(e) => setDefaultTrackingMode(e.target.value as TrackingMode)}
					className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="daily">Daily (без стадій)</option>
					<option value="full">Full (склад / точки)</option>
				</select>
			</div>

			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium text-white/70">Статус авто</label>
				<select
					value={statusCar}
					onChange={(e) => setStatusCar(e.target.value as CarStatus)}
					className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="active">Активне</option>
					<option value="repair">Ремонт</option>
					<option value="inactive">Неактивне</option>
				</select>
			</div>

			<label className="flex items-center gap-2 text-sm text-white/70">
				<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
				Авто активне (в експлуатації)
			</label>

			<div className="flex flex-col gap-1">
				<label className="text-sm font-medium text-white/70">Водій</label>
				<select
					value={selectedDriverId}
					onChange={(e) => setSelectedDriverId(e.target.value ? Number(e.target.value) : "")}
					className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="">— не призначено —</option>
					{drivers?.map((d) => (
						<option key={d.idDriver} value={d.idDriver}>
							{d.nameDriver}
						</option>
					))}
				</select>
			</div>

			<h2 className="text-lg font-semibold text-white pt-2">Технічні характеристики</h2>
			<Input label="VIN" value={vinCode} onChange={(e) => setVinCode(e.target.value)} />
			<Input label="Рік випуску" type="number" value={yearManufactured} onChange={(e) => setYearManufactured(e.target.value)} />
			<Input label="Вага (кг)" type="number" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
			<Input label="Вантажопідйомність (кг)" type="number" value={payloadKg} onChange={(e) => setPayloadKg(e.target.value)} />
			<Input label="Довжина (см)" type="number" value={lengthCm} onChange={(e) => setLengthCm(e.target.value)} />
			<Input label="Ширина (см)" type="number" value={widthCm} onChange={(e) => setWidthCm(e.target.value)} />
			<Input label="Висота (см)" type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />

			<label className="flex items-center gap-2 text-sm text-white/70">
				<input type="checkbox" checked={hasTailLift} onChange={(e) => setHasTailLift(e.target.checked)} />
				Є гідроборт
			</label>
			<label className="flex items-center gap-2 text-sm text-white/70">
				<input type="checkbox" checked={hasTrailer} onChange={(e) => setHasTrailer(e.target.checked)} />
				Є причіп
			</label>

			{hasTrailer && (
				<div className="space-y-4 rounded-lg border border-white/10 p-4">
					<h3 className="text-sm font-semibold text-white">Причіп</h3>
					<Input label="Назва причепа" value={trailerName} onChange={(e) => setTrailerName(e.target.value)} required />
					<Input label="Модель" value={trailerModel} onChange={(e) => setTrailerModel(e.target.value)} required />
					<Input label="Держ. номер причепа" value={trailerNumber} onChange={(e) => setTrailerNumber(e.target.value)} required />
					<Input label="VIN причепа" value={trailerVinCode} onChange={(e) => setTrailerVinCode(e.target.value)} />
					<Input label="Рік випуску причепа" type="number" value={trailerYear} onChange={(e) => setTrailerYear(e.target.value)} />
					<label className="flex items-center gap-2 text-sm text-white/70">
						<input type="checkbox" checked={trailerIsActive} onChange={(e) => setTrailerIsActive(e.target.checked)} />
						Причіп активний
					</label>
				</div>
			)}

			{(mutation.isError || updateDriverAssignment.isError) && (
				<ErrorBanner message={((mutation.error ?? updateDriverAssignment.error) as Error).message} />
			)}

			<div className="flex gap-3">
				<Button type="button" variant="ghost" onClick={() => navigate("/fleet")}>Скасувати</Button>
				<Button type="submit" isLoading={mutation.isPending || updateDriverAssignment.isPending} className="flex-1">Зберегти</Button>
			</div>
		</form>
		</div>
	);
}
