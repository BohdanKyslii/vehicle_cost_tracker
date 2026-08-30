import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	useHiredTrip,
	useCreateHiredTrip,
	useUpdateHiredTrip,
	useAttachWaybillToHiredTrip,
} from "../../hocks/useHiredTrips";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { QRScanner } from "../../components/QRScanner";
import { parseQRCode } from "../../utils/parseQR";
import { formatCarNumber } from "../../utils/carNumber";
import type { HiredTripPayload } from "../../api/hiredTrips";

export function HiredTripForm() {
	const { tripId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!tripId;
	const { data: existing } = useHiredTrip(isEdit ? Number(tripId) : 0);

	const [carNumber, setCarNumber] = useState(existing?.carNumber ?? "");
	const [routeName, setRouteName] = useState(existing?.routeName ?? "");
	const [tripDate, setTripDate] = useState(existing?.tripDate ?? "");
	const [palletsCount, setPalletsCount] = useState(String(existing?.palletsCount ?? ""));
	const [costUah, setCostUah] = useState(String(existing?.costUah ?? ""));
	const [comment, setComment] = useState(existing?.comment ?? "");
	const [scannerOpen, setScannerOpen] = useState(false);
	const [scanError, setScanError] = useState<string | null>(null);

	// Той самий патерн, що й CarForm (Фаза 16.5) — тепер стандарт для всіх
	// карток запису (див. [[decision_locked_edit_form_pattern]]): відкрита
	// картка заблокована, "Редагувати" розблоковує поля. Для нового рейсу
	// (isEdit=false) блокування не має сенсу.
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	const createTrip = useCreateHiredTrip();
	const updateTrip = useUpdateHiredTrip(Number(tripId));
	const attachWaybill = useAttachWaybillToHiredTrip();
	const mutation = isEdit ? updateTrip : createTrip;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const payload: HiredTripPayload = {
			carNumber,
			routeName,
			tripDate,
			palletsCount: palletsCount ? Number(palletsCount) : undefined,
			costUah: Number(costUah),
			comment: comment || undefined,
		};
		mutation.mutate(payload, {
			onSuccess: (saved) => navigate(isEdit ? "/hired" : `/hired/${saved.id}`),
		});
	}

	// Сканує камерою фізичний QR накладної — та сама логіка, що в EventForm
	// (Фаза 15), лише waybillNumber йде в attach_waybill; waybillDate з
	// parseQRCode тут нема куди класти — HiredTripWaybill дату не зберігає
	function handleScan(raw: string) {
		const parsed = parseQRCode(raw);
		if (!parsed) {
			setScanError("Не вдалось розпізнати QR — спробуй ще раз");
			return;
		}
		setScanError(null);
		setScannerOpen(false);
		if (!existing) return;
		attachWaybill.mutate(
			{ id: existing.id, waybillNumber: parsed.waybillNumber },
			{ onError: (err) => setScanError((err as Error).message) },
		);
	}

	return (
		<div className="p-6 max-w-lg mx-auto space-y-6">
			<form onSubmit={handleSubmit} className="space-y-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6">
				<div className="flex items-center justify-between">
					<h1 className="text-xl font-bold text-white">{isEdit ? "Рейс найманого транспорту" : "Новий рейс найманого транспорту"}</h1>
					{isEdit && !isEditingDetails && (
						<Button type="button" variant="ghost" onClick={() => setIsEditingDetails(true)}>
							✏️ Редагувати
						</Button>
					)}
				</div>
				{detailsLocked && (
					<p className="text-xs text-white/40 -mt-2">
						Дані заблоковані від випадкової правки. Натисніть "Редагувати", щоб змінити.
					</p>
				)}

				<div className="grid grid-cols-2 gap-3">
					<Input label="Дата рейсу" type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} required disabled={detailsLocked} />
					<Input
						label="Номер авто"
						value={carNumber}
						onChange={(e) => setCarNumber(formatCarNumber(e.target.value))}
						maxLength={8}
						required
						disabled={detailsLocked}
					/>
				</div>
				<Input label="Назва маршруту" value={routeName} onChange={(e) => setRouteName(e.target.value)} required disabled={detailsLocked} />
				<div className="grid grid-cols-2 gap-3">
					<Input label="Кількість палет" type="number" value={palletsCount} onChange={(e) => setPalletsCount(e.target.value)} disabled={detailsLocked} />
					<Input label="Вартість рейсу (грн)" type="number" step="0.01" value={costUah} onChange={(e) => setCostUah(e.target.value)} required disabled={detailsLocked} />
				</div>
				<Input label="Коментар" value={comment} onChange={(e) => setComment(e.target.value)} disabled={detailsLocked} />

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/hired")}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>

			{isEdit && existing && (
				<div className="space-y-2 rounded-lg border border-white/10 p-4">
					<h2 className="text-sm font-semibold text-white">Накладні рейсу</h2>
					{existing.waybills && existing.waybills.length > 0 ? (
						<ul className="space-y-1 text-sm text-white/70">
							{existing.waybills.map((w) => <li key={w.id}>№ {w.waybillNumber}</li>)}
						</ul>
					) : (
						<p className="text-sm text-white/40">Ще нічого не прикріплено</p>
					)}
					<Button type="button" variant="ghost" onClick={() => setScannerOpen(true)} isLoading={attachWaybill.isPending}>
						📷 Сканувати накладну
					</Button>
					{scanError && <ErrorBanner message={scanError} />}
					{scannerOpen && (
						<QRScanner onScan={handleScan} onClose={() => setScannerOpen(false)} notice={scanError} />
					)}
				</div>
			)}
		</div>
	);
}
