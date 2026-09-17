// src/pages/waybills/WaybillDetail.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useWaybillDetail, useAssignWaybillChannel } from "../../hocks/useWaybills";
import { useCars } from "../../hocks/useCars";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { ChannelBadge, LegalEntityBadge } from "../../components/ui/Badge";
import { formatDate, formatUah } from "../../utils/formatters";
import { formatCarNumber } from "../../utils/carNumber";
import type { DeliveryChannel } from "../../types";

export function WaybillDetail() {
	const { waybillNumber } = useParams();
	const navigate = useNavigate();
	const number = waybillNumber ?? "";

	const { data: lines, isLoading, isError, refetch } = useWaybillDetail(number);
	const { data: cars } = useCars();
	const assign = useAssignWaybillChannel(number);

	const [channel, setChannel] = useState<DeliveryChannel | "">("");
	const [assignedCarId, setAssignedCarId] = useState("");
	const [hiredCarNumber, setHiredCarNumber] = useState("");
	const [carrierTtn, setCarrierTtn] = useState("");

	if (isLoading) {
		return (
			<div className="p-6">
				<Spinner size="lg" label="Завантаження накладної..." />
			</div>
		);
	}

	if (isError || !lines || lines.length === 0) {
		return (
			<div className="p-6 space-y-4">
				<ErrorBanner message="Не вдалось завантажити накладну" onRetry={refetch} />
				<Button variant="ghost" onClick={() => navigate("/waybills")}>← Назад до реєстру</Button>
			</div>
		);
	}

	const first = lines[0];
	const totalUah = lines.filter(l => l.quantity > 0).reduce((s, l) => s + l.totalUah, 0);
	const returnsUah = lines.filter(l => l.quantity < 0).reduce((s, l) => s + l.totalUah, 0);
	const activeCars = (cars ?? []).filter(c => c.isActive);

	function handleSubmit(e: FormEvent) {
		e.preventDefault();
		if (!channel) return;
		assign.mutate({
			deliveryChannel: channel,
			assignedCarId: channel === "own" ? Number(assignedCarId) || undefined : undefined,
			hiredCarNumber: channel === "hired" ? hiredCarNumber : undefined,
			carrierTtn: channel === "carrier" ? carrierTtn : undefined,
		});
	}

	return (
		<div className="p-6 max-w-3xl mx-auto space-y-4">
			<div className="flex items-center justify-between">
				<div>
					<Link to="/waybills" className="text-sm text-white/50 hover:text-white/80">← До реєстру</Link>
					<h1 className="text-xl font-bold text-white mt-1">Накладна № {first.waybillNumber}</h1>
				</div>
				<LegalEntityBadge entity={first.legalEntity} />
			</div>

			{/* Загальна інформація */}
			<div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 space-y-2">
				<div className="grid grid-cols-2 gap-3 text-sm">
					<div>
						<div className="text-white/40">Дата</div>
						<div className="text-white">{formatDate(first.waybillDate)}</div>
					</div>
					<div>
						<div className="text-white/40">Клієнт / точка</div>
						<div className="text-white">{first.customerName}</div>
					</div>
					<div>
						<div className="text-white/40">Сума відвантажень</div>
						<div className="text-white font-medium">{formatUah(totalUah)}</div>
					</div>
					{returnsUah < 0 && (
						<div>
							<div className="text-white/40">Сума повернень</div>
							<div className="text-red-400 font-medium">{formatUah(returnsUah)}</div>
						</div>
					)}
				</div>
			</div>

			{/* Товарні позиції */}
			<div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden">
				<table className="w-full text-sm">
					<thead className="bg-white/5 border-b border-white/10">
						<tr>
							<th className="px-4 py-2 text-left text-xs font-medium text-white/50 uppercase">Товар</th>
							<th className="px-4 py-2 text-right text-xs font-medium text-white/50 uppercase">К-сть</th>
							<th className="px-4 py-2 text-right text-xs font-medium text-white/50 uppercase">Ціна</th>
							<th className="px-4 py-2 text-right text-xs font-medium text-white/50 uppercase">Сума</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-white/10">
						{lines.map(l => (
							<tr key={l.id} className={l.quantity < 0 ? "text-red-400" : "text-white/80"}>
								<td className="px-4 py-2">{l.productName}</td>
								<td className="px-4 py-2 text-right whitespace-nowrap">{l.quantity}</td>
								<td className="px-4 py-2 text-right whitespace-nowrap">{formatUah(l.priceUah)}</td>
								<td className="px-4 py-2 text-right whitespace-nowrap">{formatUah(l.totalUah)}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Канал доставки */}
			<div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-6 space-y-4">
				<h2 className="text-sm font-semibold text-white">Канал доставки</h2>

				{first.deliveryChannel ? (
					<div className="flex items-center gap-3">
						<ChannelBadge channel={first.deliveryChannel} />
						{first.deliveryChannel === "own" && first.assignedCarNumber && (
							<span className="text-sm text-white/70">Авто: {first.assignedCarNumber}</span>
						)}
						{first.deliveryChannel === "hired" && first.hiredCarNumber && (
							<span className="text-sm text-white/70">Авто: {first.hiredCarNumber}</span>
						)}
						{first.deliveryChannel === "carrier" && first.carrierTtn && (
							<span className="text-sm text-white/70">ТТН: {first.carrierTtn}</span>
						)}
					</div>
				) : (
					<form onSubmit={handleSubmit} className="space-y-3">
						<div className="flex flex-col gap-1">
							<label className="text-sm font-medium text-white/70">Канал</label>
							<select
								value={channel}
								onChange={e => setChannel(e.target.value as DeliveryChannel)}
								className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
								required
							>
								<option value="">— оберіть —</option>
								<option value="own">Власне авто</option>
								<option value="hired">Найманий транспорт</option>
								<option value="carrier">Служба доставки</option>
							</select>
						</div>

						{channel === "own" && (
							<div className="flex flex-col gap-1">
								<label className="text-sm font-medium text-white/70">Авто</label>
								<select
									value={assignedCarId}
									onChange={e => setAssignedCarId(e.target.value)}
									className="w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
									required
								>
									<option value="">— оберіть авто —</option>
									{activeCars.map(c => (
										<option key={c.idCar} value={c.idCar}>{c.nameCar} ({c.numberCar})</option>
									))}
								</select>
							</div>
						)}

						{channel === "hired" && (
							<Input
								label="Номер авто"
								value={hiredCarNumber}
								onChange={e => setHiredCarNumber(formatCarNumber(e.target.value))}
								maxLength={8}
								required
							/>
						)}

						{channel === "carrier" && (
							<Input
								label="Номер ТТН"
								value={carrierTtn}
								onChange={e => setCarrierTtn(e.target.value)}
								required
							/>
						)}

						{assign.isError && <ErrorBanner message={(assign.error as Error).message} />}

						<Button type="submit" isLoading={assign.isPending} disabled={!channel}>
							Призначити канал
						</Button>
					</form>
				)}
			</div>
		</div>
	);
}
