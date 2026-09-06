import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
	useCarrierShipment,
	useCreateCarrierShipment,
	useUpdateCarrierShipment,
	useAttachWaybillToCarrierShipment,
} from "../../hocks/useCarrierShipments";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { QRScanner } from "../../components/QRScanner";
import { parseQRCode } from "../../utils/parseQR";
import type { CarrierCode } from "../../types";
import type { CarrierShipmentPayload } from "../../api/carrierShipments";

export function CarrierShipmentForm() {
	const { shipmentId } = useParams();
	const navigate = useNavigate();
	const isEdit = !!shipmentId;
	const { data: existing } = useCarrierShipment(isEdit ? Number(shipmentId) : 0);

	const [carrier, setCarrier] = useState<CarrierCode>(existing?.carrier ?? "nova_poshta");
	const [ttn, setTtn] = useState(existing?.ttn ?? "");
	const [shipmentDate, setShipmentDate] = useState(existing?.shipmentDate ?? "");
	const [scannerOpen, setScannerOpen] = useState(false);
	const [scanError, setScanError] = useState<string | null>(null);

	// Той самий локед-режим, що CarForm/HiredTripForm
	const [isEditingDetails, setIsEditingDetails] = useState(false);
	const detailsLocked = isEdit && !isEditingDetails;

	const createShipment = useCreateCarrierShipment();
	const updateShipment = useUpdateCarrierShipment(Number(shipmentId));
	const attachWaybill = useAttachWaybillToCarrierShipment();
	const mutation = isEdit ? updateShipment : createShipment;

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		const payload: CarrierShipmentPayload = { carrier, ttn, shipmentDate };
		mutation.mutate(payload, {
			onSuccess: (saved) => navigate(isEdit ? "/carriers" : `/carriers/${saved.id}`),
		});
	}

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
					<h1 className="text-xl font-bold text-white">{isEdit ? "Відправлення" : "Нове відправлення"}</h1>
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

				<div className="flex flex-col gap-1">
					<label className="text-sm font-medium text-white/70">Служба доставки</label>
					<select
						value={carrier}
						onChange={(e) => setCarrier(e.target.value as CarrierCode)}
						disabled={detailsLocked}
						className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="nova_poshta">Нова Пошта</option>
						<option value="mist_express">Міст Експрес</option>
						<option value="other">Інша служба</option>
					</select>
				</div>
				<Input label="ТТН" value={ttn} onChange={(e) => setTtn(e.target.value)} required disabled={detailsLocked} />
				<Input label="Дата відправлення" type="date" value={shipmentDate} onChange={(e) => setShipmentDate(e.target.value)} required disabled={detailsLocked} />

				{mutation.isError && <ErrorBanner message={(mutation.error as Error).message} />}

				<div className="flex gap-3">
					<Button type="button" variant="ghost" onClick={() => navigate("/carriers")}>
						{detailsLocked ? "← Назад" : "Скасувати"}
					</Button>
					<Button type="submit" isLoading={mutation.isPending} className="flex-1">Зберегти</Button>
				</div>
			</form>

			{isEdit && existing && (
				<div className="space-y-2 rounded-lg border border-white/10 p-4">
					<h2 className="text-sm font-semibold text-white">Накладні відправлення</h2>
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
