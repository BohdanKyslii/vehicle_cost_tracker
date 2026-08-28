import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDriver, useDrivers, useCreateDriver, useUpdateDriver } from "../../hocks/useDrivers";
import { useCars } from "../../hocks/useCars";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import type { DriverPayload } from "../../api/drivers";

// Картка водія — те саме, що CarForm, але для драйвера: ім'я/телефон/
// посвідчення/активність + призначення авто (обернений бік того самого
// зв'язку, що редагується в CarForm через select "Водій")
export function DriverForm() {
	const { driverId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!driverId;
	const { data: existing } = useDriver(isEdit ? Number(driverId) : 0);
	const { data: cars } = useCars();
	const { data: drivers } = useDrivers();

	const [nameDriver, setNameDriver] = useState(existing?.nameDriver ?? "");
	const [phoneDriver, setPhoneDriver] = useState(existing?.phoneDriver ?? "");
	const [driversLicense, setDriversLicense] = useState(existing?.driversLicense ?? "");
	const [isActive, setIsActive] = useState(existing?.isActive ?? true);
	const [selectedCarId, setSelectedCarId] = useState<number | "">(existing?.idCar ?? "");

	const createDriver = useCreateDriver();
	const updateDriver = useUpdateDriver();
	const mutation = isEdit ? { mutateAsync: (data: DriverPayload) => updateDriver.mutateAsync({ id: Number(driverId), data }), isPending: updateDriver.isPending, isError: updateDriver.isError, error: updateDriver.error }
		: createDriver;

	async function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const payload: DriverPayload = {
			nameDriver,
			phoneDriver: phoneDriver || undefined,
			driversLicense: driversLicense || undefined,
			idCar: selectedCarId === "" ? null : selectedCarId,
			isActive,
		};

		const savedDriver = await mutation.mutateAsync(payload);

		// Авто, обране для цього водія, могло вже мати ІНШОГО водія — знімаємо
		// його з того авто, інакше два водії формально закріплені за одним авто
		if (selectedCarId !== "") {
			const conflicting = drivers?.find(
				(d) => d.idCar === selectedCarId && d.idDriver !== savedDriver.idDriver
			);
			if (conflicting) {
				await updateDriver.mutateAsync({
					id: conflicting.idDriver,
					data: {
						nameDriver: conflicting.nameDriver,
						phoneDriver: conflicting.phoneDriver,
						driversLicense: conflicting.driversLicense,
						isActive: conflicting.isActive,
						idCar: null,
					},
				});
			}
		}

		navigate("/fleet");
	}

	return (
		<div className="p-6">
			<form onSubmit={handleSubmit} className="max-w-lg mx-auto p-6 space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
				<h1 className="text-xl font-bold text-white">{isEdit ? "Картка водія" : "Новий водій"}</h1>

				<Input label="ПІБ" value={nameDriver} onChange={(e) => setNameDriver(e.target.value)} required />
				<Input label="Телефон" value={phoneDriver} onChange={(e) => setPhoneDriver(e.target.value)} />
				<Input label="Посвідчення водія" value={driversLicense} onChange={(e) => setDriversLicense(e.target.value)} />

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Закріплене авто</label>
					<select
						value={selectedCarId}
						onChange={(e) => setSelectedCarId(e.target.value ? Number(e.target.value) : "")}
						className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">— не призначено —</option>
						{cars?.map((c) => (
							<option key={c.idCar} value={c.idCar}>
								{c.numberCar} — {c.nameCar}
							</option>
						))}
					</select>
				</div>

				<label className="flex items-center gap-2 text-sm text-white/70">
					<input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
					Водій активний
				</label>

				{mutation.isError && (
					<ErrorBanner message={(mutation.error as Error).message} />
				)}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/fleet")}>Скасувати</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>
		</div>
	);
}
