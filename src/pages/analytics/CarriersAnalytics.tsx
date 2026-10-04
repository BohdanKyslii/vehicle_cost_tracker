import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
	useCarrierShipmentReview,
	useDeleteCarrierShipment,
	useDetachWaybillFromCarrierShipment,
	useUpdateCarrierShipment,
} from "../../hocks/useCarrierShipments";
import { attachWaybillToCarrierShipment } from "../../api/carrierShipments";
import type { CarrierReviewShipment, CarrierReviewWaybill } from "../../api/carrierShipments";
import { parseWaybillNumbers } from "../../utils/parseWaybillNumbers";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { formatCarrier, formatDate, formatMonth, formatUah } from "../../utils/formatters";
import type { CarrierCode } from "../../types";

// Звірка відправлень служб доставки (2026-10-04): після імпорту реєстру НП
// треба побачити, що з ним не так, і виправити на місці — ТТН без
// накладних, накладні, яких нема в імпорті з 1С, накладні, вже призначені
// власному авто/найманому транспорту, ТТН без вартості. Одна накладна в
// кількох ТТН — норма (посилка + зворотна доставка документів), тому це
// лише інформаційна позначка, не проблема.

type IssueFilter = "all" | "noWaybills" | "notFound" | "channelConflict" | "noCost" | "multiTtn";

const ISSUE_LABELS: Record<IssueFilter, string> = {
	all: "Усі",
	noWaybills: "Без накладних",
	notFound: "Накладна не знайдена в 1С",
	channelConflict: "Накладна в іншому каналі",
	noCost: "Без вартості",
	multiTtn: "Накладна в кількох ТТН",
};

const isChannelConflict = (w: CarrierReviewWaybill) => !!w.deliveryChannel && w.deliveryChannel !== "carrier";

function matchesIssue(s: CarrierReviewShipment, issue: IssueFilter): boolean {
	switch (issue) {
		case "all": return true;
		case "noWaybills": return s.waybills.length === 0;
		case "notFound": return s.waybills.some((w) => !w.found);
		case "channelConflict": return s.waybills.some(isChannelConflict);
		case "noCost": return s.costsCount === 0;
		case "multiTtn": return s.waybills.some((w) => w.otherTtns.length > 0);
	}
}

const CHANNEL_LABELS: Record<string, string> = { own: "власне авто", hired: "найманий транспорт", carrier: "служба доставки" };

// Скільки рядків рендеримо одразу — за місяць НП це ~500 ТТН
const PAGE_SIZE = 200;

export function CarriersAnalytics() {
	const [carrier, setCarrier] = useState<CarrierCode>("nova_poshta");
	const [month, setMonth] = useState<string>(""); // "" — останній місяць з даними
	const [issue, setIssue] = useState<IssueFilter>("all");
	const [search, setSearch] = useState("");
	const [visible, setVisible] = useState(PAGE_SIZE);
	// ТТН з відкритим редактором лишаються в списку, навіть коли після
	// правки перестали підпадати під фільтр (додали накладну в "Без
	// накладних") — інакше рядок зникав посеред роботи разом з помилками
	const [editingIds, setEditingIds] = useState<Set<number>>(new Set());

	function setRowEditing(id: number, editing: boolean) {
		setEditingIds((prev) => {
			const next = new Set(prev);
			if (editing) next.add(id);
			else next.delete(id);
			return next;
		});
	}

	const { data, isLoading, isError, refetch } = useCarrierShipmentReview(carrier);

	const months = useMemo(
		() => [...new Set((data ?? []).map((s) => s.shipmentDate.slice(0, 7)))].sort().reverse(),
		[data],
	);
	const activeMonth = month || months[0] || "all";

	const inMonth = useMemo(
		() => (data ?? []).filter((s) => activeMonth === "all" || s.shipmentDate.startsWith(activeMonth)),
		[data, activeMonth],
	);

	const issueCounts = useMemo(() => {
		const counts = {} as Record<IssueFilter, number>;
		for (const key of Object.keys(ISSUE_LABELS) as IssueFilter[]) {
			counts[key] = inMonth.filter((s) => matchesIssue(s, key)).length;
		}
		return counts;
	}, [inMonth]);

	const stats = useMemo(() => {
		const waybills = inMonth.flatMap((s) => s.waybills);
		return {
			shipments: inMonth.length,
			waybills: waybills.length,
			found: waybills.filter((w) => w.found).length,
			costUah: inMonth.reduce((sum, s) => sum + (s.costUah ?? 0), 0),
			withCost: inMonth.filter((s) => s.costsCount > 0).length,
		};
	}, [inMonth]);

	const rows = useMemo(() => {
		const q = search.trim().toLowerCase();
		return inMonth
			.filter((s) => editingIds.has(s.id) || matchesIssue(s, issue))
			.filter((s) =>
				!q ||
				s.ttn.includes(q) ||
				s.waybills.some((w) => w.waybillNumber.includes(q) || w.customerName?.toLowerCase().includes(q)),
			)
			.sort((a, b) => b.shipmentDate.localeCompare(a.shipmentDate) || a.ttn.localeCompare(b.ttn));
	}, [inMonth, issue, search, editingIds]);

	// Зміна фільтра скидає "показати ще" — у тих самих обробниках, не в useEffect
	function resetPaging() {
		setVisible(PAGE_SIZE);
	}

	return (
		<div className="p-6 space-y-4">
			<div className="flex flex-wrap items-end justify-between gap-3">
				<div>
					<Link to="/analytics" className="text-sm text-white/50 hover:text-white/80">← До аналітики</Link>
					<h1 className="text-xl font-bold text-white mt-1">Служби доставки — звірка відправлень</h1>
				</div>
				<div className="flex flex-wrap gap-2">
					<select
						value={carrier}
						onChange={(e) => { setCarrier(e.target.value as CarrierCode); setMonth(""); resetPaging(); }}
						className="rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900"
					>
						<option value="nova_poshta">Нова Пошта</option>
						<option value="mist_express">Міст Експрес</option>
						<option value="other">Інша служба</option>
					</select>
					<select
						value={activeMonth}
						onChange={(e) => { setMonth(e.target.value); resetPaging(); }}
						className="rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900"
					>
						{months.map((m) => <option key={m} value={m}>{formatMonth(`${m}-01`)}</option>)}
						<option value="all">Увесь період</option>
					</select>
				</div>
			</div>

			{isLoading && <div className="py-12"><Spinner size="lg" label="Завантаження..." /></div>}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити відправлення" onRetry={refetch} />}

			{!isLoading && !isError && data && (
				<>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
						<StatTile label="ТТН" value={String(stats.shipments)} />
						<StatTile label="Накладних у ТТН" value={String(stats.waybills)} />
						<StatTile
							label="Знайдено в 1С"
							value={`${stats.found} з ${stats.waybills}`}
							hint={stats.waybills > 0 ? `${Math.round((stats.found / stats.waybills) * 100)}%` : undefined}
						/>
						<StatTile
							label="Вартість доставки"
							value={stats.withCost > 0 ? formatUah(stats.costUah) : "—"}
							hint={`з вартістю ${stats.withCost} з ${stats.shipments} ТТН`}
						/>
					</div>

					<div className="flex flex-wrap gap-2">
						{(Object.keys(ISSUE_LABELS) as IssueFilter[]).map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => { setIssue(key); resetPaging(); }}
								className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
									issue === key
										? "bg-violet-600 border-violet-500 text-white"
										: "border-white/10 text-white/70 hover:bg-white/5"
								}`}
							>
								{ISSUE_LABELS[key]} <span className="opacity-60">{issueCounts[key]}</span>
							</button>
						))}
					</div>

					<input
						type="search"
						value={search}
						onChange={(e) => { setSearch(e.target.value); resetPaging(); }}
						placeholder="Пошук: ТТН, № накладної або клієнт"
						className="w-full md:w-96 rounded-lg border border-white/10 bg-white/5 text-white px-3 py-2 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400"
					/>

					<p className="text-xs text-white/40">
						<span className="text-emerald-300">Зелена</span> накладна — знайдена в імпорті з 1С,{" "}
						<span className="text-amber-300">жовта</span> — не знайдена (ще не імпортована або помилка в номері),{" "}
						<span className="text-rose-300">червона</span> — вже призначена власному авто чи найманому транспорту.
						«+ТТН» — та сама накладна є ще в іншій ТТН (зазвичай зворотна доставка документів).
					</p>

					{rows.length === 0 ? (
						<EmptyState title="Нічого не знайдено" subtitle="Змініть фільтр, місяць або пошук" />
					) : (
						<div className="bg-white/5 rounded-lg border border-white/10 overflow-x-auto">
							<table className="w-full text-sm">
								<thead className="bg-white/5 border-b border-white/10">
									<tr>
										<th className="px-3 py-2 text-left text-xs font-medium text-white/50 uppercase">Дата</th>
										<th className="px-3 py-2 text-left text-xs font-medium text-white/50 uppercase">ТТН</th>
										<th className="px-3 py-2 text-left text-xs font-medium text-white/50 uppercase">Накладні</th>
										<th className="px-3 py-2 text-left text-xs font-medium text-white/50 uppercase">Клієнт</th>
										<th className="px-3 py-2 text-right text-xs font-medium text-white/50 uppercase">Сума продажу</th>
										<th className="px-3 py-2 text-right text-xs font-medium text-white/50 uppercase">Доставка</th>
										<th className="px-3 py-2" />
									</tr>
								</thead>
								<tbody className="divide-y divide-white/10">
									{rows.slice(0, visible).map((s) => (
										<ReviewRow
											key={s.id}
											shipment={s}
											editing={editingIds.has(s.id)}
											onEditingChange={(editing) => setRowEditing(s.id, editing)}
										/>
									))}
								</tbody>
							</table>
						</div>
					)}

					{rows.length > visible && (
						<Button type="button" variant="ghost" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
							Показати ще ({rows.length - visible})
						</Button>
					)}
				</>
			)}
		</div>
	);
}

function StatTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
	return (
		<div className="rounded-lg border border-white/10 bg-white/5 p-3">
			<div className="text-xs text-white/50">{label}</div>
			<div className="text-lg font-semibold text-white mt-1">{value}</div>
			{hint && <div className="text-xs text-white/40 mt-0.5">{hint}</div>}
		</div>
	);
}

function waybillTitle(w: CarrierReviewWaybill): string {
	const parts = [`№ ${w.waybillNumber}`];
	if (!w.found) parts.push("не знайдена в імпорті з 1С");
	if (w.legalEntities.length > 1) parts.push(`номер є в кількох юрособах: ${w.legalEntities.join(", ")}`);
	if (w.waybillDate) parts.push(`дата накладної ${formatDate(w.waybillDate)}`);
	if (isChannelConflict(w)) {
		parts.push(`канал: ${CHANNEL_LABELS[w.deliveryChannel!] ?? w.deliveryChannel}${w.carNumber ? ` (${w.carNumber})` : ""}`);
	}
	if (w.otherTtns.length > 0) parts.push(`також у ТТН ${w.otherTtns.join(", ")}`);
	return parts.join("\n");
}

function WaybillChip({ waybill, onRemove }: { waybill: CarrierReviewWaybill; onRemove?: () => void }) {
	const color = isChannelConflict(waybill)
		? "border-rose-400/40 bg-rose-500/10 text-rose-200"
		: waybill.found
			? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
			: "border-amber-400/40 bg-amber-500/10 text-amber-200";
	return (
		<span title={waybillTitle(waybill)} className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap ${color}`}>
			{waybill.waybillNumber}
			{waybill.otherTtns.length > 0 && <span className="opacity-60">+ТТН</span>}
			{onRemove && (
				<button type="button" onClick={onRemove} className="ml-0.5 opacity-70 hover:opacity-100" aria-label={`Відкріпити ${waybill.waybillNumber}`}>
					×
				</button>
			)}
		</span>
	);
}

// Рядок ТТН: за замовчуванням тільки перегляд, олівець відкриває панель
// правки під рядком (той самий локед-патерн, що в усіх формах проєкту)
function ReviewRow({
	shipment,
	editing,
	onEditingChange,
}: {
	shipment: CarrierReviewShipment;
	editing: boolean;
	onEditingChange: (editing: boolean) => void;
}) {
	const queryClient = useQueryClient();
	const [ttn, setTtn] = useState(shipment.ttn);
	const [shipmentDate, setShipmentDate] = useState(shipment.shipmentDate);
	const [addText, setAddText] = useState("");
	const [adding, setAdding] = useState(false);
	const [confirmDetach, setConfirmDetach] = useState<string | null>(null);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [errors, setErrors] = useState<string[]>([]);

	const update = useUpdateCarrierShipment(shipment.id);
	const detach = useDetachWaybillFromCarrierShipment();
	const remove = useDeleteCarrierShipment();

	const customers = [...new Set(shipment.waybills.map((w) => w.customerName).filter(Boolean))];
	const saleUah = shipment.waybills.reduce((sum, w) => sum + w.totalUah, 0);

	function openEditor() {
		setTtn(shipment.ttn);
		setShipmentDate(shipment.shipmentDate);
		setErrors([]);
		onEditingChange(true);
	}

	function closeEditor() {
		onEditingChange(false);
		setConfirmDetach(null);
		setConfirmDelete(false);
		setAddText("");
		setErrors([]);
	}

	function handleSave() {
		update.mutate(
			{ carrier: shipment.carrier, ttn: ttn.trim(), shipmentDate },
			{ onError: (err) => setErrors([(err as Error).message]) },
		);
	}

	function handleDetach(waybillNumber: string) {
		detach.mutate(
			{ id: shipment.id, waybillNumber },
			{
				onSuccess: () => setConfirmDetach(null),
				onError: (err) => setErrors([(err as Error).message]),
			},
		);
	}

	// Кілька номерів за раз — API напряму, одна інвалідація в кінці
	// (див. CarrierShipmentForm.handleManualAttach)
	async function handleAdd() {
		const attached = new Set(shipment.waybills.map((w) => w.waybillNumber));
		const numbers = parseWaybillNumbers(addText);
		if (numbers.length === 0) return;
		setAdding(true);
		const errs: string[] = [];
		const failed: string[] = [];
		for (const number of numbers) {
			if (attached.has(number)) {
				errs.push(`№ ${number}: вже в цій ТТН`);
				continue;
			}
			try {
				await attachWaybillToCarrierShipment(shipment.id, number);
			} catch (err) {
				errs.push(`№ ${number}: ${(err as Error).message}`);
				failed.push(number);
			}
		}
		await queryClient.invalidateQueries({ queryKey: ["carrier-shipments"] });
		setAddText(failed.join(" "));
		setErrors(errs);
		setAdding(false);
	}

	return (
		<>
			<tr className={`hover:bg-white/5 align-top ${editing ? "bg-white/5" : ""}`}>
				<td className="px-3 py-2 text-white/70 whitespace-nowrap">{formatDate(shipment.shipmentDate)}</td>
				<td className="px-3 py-2 whitespace-nowrap">
					<Link to={`/carriers/${shipment.id}`} className="text-violet-300 hover:underline">{shipment.ttn}</Link>
				</td>
				<td className="px-3 py-2">
					{shipment.waybills.length === 0 ? (
						<span className="text-xs text-rose-300">немає накладних</span>
					) : (
						<div className="flex flex-wrap gap-1">
							{shipment.waybills.map((w) => <WaybillChip key={w.id} waybill={w} />)}
						</div>
					)}
				</td>
				<td className="px-3 py-2 text-white/70 max-w-56 truncate" title={customers.join(", ")}>
					{customers.length > 0 ? customers.join(", ") : "—"}
				</td>
				<td className="px-3 py-2 text-right text-white/70 whitespace-nowrap">{saleUah > 0 ? formatUah(saleUah) : "—"}</td>
				<td className="px-3 py-2 text-right whitespace-nowrap">
					{shipment.costsCount > 0 ? (
						<span className="text-white">{formatUah(shipment.costUah ?? 0)}</span>
					) : (
						<span className="text-white/30">—</span>
					)}
				</td>
				<td className="px-3 py-2 text-right">
					{!editing && (
						<button type="button" onClick={openEditor} className="text-white/50 hover:text-white" aria-label="Редагувати">
							✏️
						</button>
					)}
				</td>
			</tr>

			{editing && (
				<tr className="bg-white/5">
					<td colSpan={7} className="px-3 pb-4 pt-1">
						<div className="rounded-lg border border-violet-400/30 p-3 space-y-3">
							<div className="flex flex-wrap items-end gap-3">
								<label className="flex flex-col gap-1 text-xs text-white/60">
									ТТН
									<input
										value={ttn}
										onChange={(e) => setTtn(e.target.value)}
										className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
									/>
								</label>
								<label className="flex flex-col gap-1 text-xs text-white/60">
									Дата відправлення
									<input
										type="date"
										value={shipmentDate}
										onChange={(e) => setShipmentDate(e.target.value)}
										className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [color-scheme:dark]"
									/>
								</label>
								<Button
									type="button"
									onClick={handleSave}
									isLoading={update.isPending}
									disabled={!ttn.trim() || !shipmentDate || (ttn.trim() === shipment.ttn && shipmentDate === shipment.shipmentDate)}
								>
									Зберегти
								</Button>
								<span className="text-xs text-white/40">{formatCarrier(shipment.carrier)}</span>
							</div>

							<div className="space-y-1">
								<div className="text-xs text-white/60">Накладні — × щоб відкріпити</div>
								<div className="flex flex-wrap gap-1">
									{shipment.waybills.length === 0 && <span className="text-xs text-white/40">немає</span>}
									{shipment.waybills.map((w) =>
										confirmDetach === w.waybillNumber ? (
											<span key={w.id} className="inline-flex items-center gap-2 rounded-md border border-rose-400/40 bg-rose-500/10 px-2 py-0.5 text-xs text-rose-200">
												Відкріпити № {w.waybillNumber}?
												<button type="button" onClick={() => handleDetach(w.waybillNumber)} disabled={detach.isPending} className="font-semibold hover:underline">
													Так
												</button>
												<button type="button" onClick={() => setConfirmDetach(null)} className="hover:underline">Ні</button>
											</span>
										) : (
											<WaybillChip key={w.id} waybill={w} onRemove={() => setConfirmDetach(w.waybillNumber)} />
										),
									)}
								</div>
							</div>

							<div className="flex flex-wrap items-center gap-2">
								<input
									value={addText}
									onChange={(e) => setAddText(e.target.value)}
									placeholder="Додати накладні: 7770, 7771"
									disabled={adding}
									className="flex-1 min-w-48 rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1.5 text-sm placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-400"
								/>
								<Button type="button" variant="ghost" onClick={handleAdd} isLoading={adding} disabled={parseWaybillNumbers(addText).length === 0}>
									Додати
								</Button>
							</div>

							{errors.length > 0 && <ErrorBanner message={errors.join("\n")} />}

							<div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/10">
								{confirmDelete ? (
									<span className="inline-flex items-center gap-3 text-sm text-rose-200">
										Видалити ТТН {shipment.ttn} разом з прив'язками накладних?
										<Button
											type="button"
											onClick={() =>
												remove.mutate(shipment.id, {
													onSuccess: () => onEditingChange(false),
													onError: (err) => setErrors([(err as Error).message]),
												})
											}
											isLoading={remove.isPending}
											variant="danger"
											size="sm"
										>
											Так, видалити
										</Button>
										<button type="button" onClick={() => setConfirmDelete(false)} className="text-white/60 hover:underline">Ні</button>
									</span>
								) : (
									<button type="button" onClick={() => setConfirmDelete(true)} className="text-sm text-rose-300 hover:underline">
										🗑 Видалити ТТН
									</button>
								)}
								<Button type="button" variant="ghost" onClick={closeEditor}>Готово</Button>
							</div>
						</div>
					</td>
				</tr>
			)}
		</>
	);
}
