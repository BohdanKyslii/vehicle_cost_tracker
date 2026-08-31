import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCars } from "../../hocks/useCars";
import { useDrivers } from "../../hocks/useDrivers";
import { useAllRouteEvents, useDeleteRouteEvent } from "../../hocks/useRouteEvents";
import { eventTypeLabel, eventTypeIcon, eventComment, findEventGroup, groupRootIdOf } from "../../utils/eventHelpers";
import { formatDateTime } from "../../utils/formatters";
import type { RouteEvent } from "../../types";
import { Spinner } from "../../components/ui/Spinner";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { Button } from "../../components/ui/Button";
import { ConfirmDelete } from "../../components/ui/ConfirmDelete";

function todayIso(): string {
	const now = new Date();
	return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

// Адмінський перегляд/редагування подій усіх водіїв (/panel/events,
// head-only) — на етапі живого тестування дозволяє поправити чи додати
// подію за будь-кого, не чекаючи, поки водій сам це зробить у EventDetail
// (там лише вузький PATCH підмножини полів своєї ж події).
export function EventsAdminList() {
	// Фільтри живуть в URL (searchParams), не в локальному useState —
	// інакше вони скидались на дефолт при поверненні з /panel/events/:id
	// (список розмонтовується/монтується заново, useState втрачає
	// значення). Тепер "Редагувати"/"+ Подія" → "← Назад"/"Скасувати" в
	// EventAdminForm.tsx роблять navigate(-1), що повертає саме на цей
	// URL з тими самими параметрами.
	const [searchParams, setSearchParams] = useSearchParams();
	const date = searchParams.get("date") ?? todayIso();
	const carId: number | "" = searchParams.get("carId") ? Number(searchParams.get("carId")) : "";
	const driverId: number | "" = searchParams.get("driverId") ? Number(searchParams.get("driverId")) : "";
	const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

	function updateFilter(key: "date" | "carId" | "driverId", value: string) {
		const next = new URLSearchParams(searchParams);
		if (value) next.set(key, value);
		else next.delete(key);
		setSearchParams(next);
	}

	const { data: cars } = useCars();
	const { data: drivers } = useDrivers();
	const { data: events, isLoading, isError, refetch } = useAllRouteEvents({
		date: date || undefined,
		carId: carId === "" ? undefined : carId,
	});
	const deleteEvent = useDeleteRouteEvent();

	// Фільтр по водію — клієнтський: бекенд не має query-параметра
	// driver_id (лише car_id/date), обсяг подій за день для одного парку
	// малий, фільтрувати вже отриманий масив достатньо
	const filtered = driverId === "" ? events : events?.filter((e) => e.driverId === driverId);

	// Кожна накладна — окремий RouteEvent (свідоме рішення, без зміни
	// схеми — [[decisions.md]]), але ОДНА точка вивантаження з кількома
	// накладними має виглядати ОДНИМ рядком тут, так само, як driver
	// бачить це в EventDetail.tsx — інакше 3 накладні однієї точки
	// виглядають як 3 самостійні точки, що й спантеличило при живому
	// тестуванні 2026-08-31.
	const rows: RouteEvent[][] = [];
	if (filtered) {
		const seen = new Set<number>();
		for (const e of filtered) {
			if (seen.has(e.id)) continue;
			const group = e.eventType === "delivery" ? findEventGroup(filtered, e) : [e];
			group.forEach((g) => seen.add(g.id));
			rows.push(group);
		}
	}

	function carLabel(id: number): string {
		return cars?.find((c) => c.idCar === id)?.numberCar ?? `#${id}`;
	}
	function driverLabel(id: number): string {
		return drivers?.find((d) => d.idDriver === id)?.nameDriver ?? `#${id}`;
	}

	function handleDeleteConfirmed(id: number, eventCarId: number) {
		deleteEvent.mutate({ id, carId: eventCarId }, { onSuccess: () => setConfirmDeleteId(null) });
	}

	return (
		<div className="p-6 space-y-4">
			<div className="flex items-center justify-between">
				<h1 className="text-xl font-bold text-white">Події водіїв</h1>
				<Link to="/panel/events/new" className="px-3 py-2 text-sm rounded-lg bg-violet-600 text-white hover:bg-violet-500">
					+ Подія
				</Link>
			</div>

			<div className="flex flex-wrap gap-3">
				<div className="flex flex-col gap-1">
					<label className="text-xs text-white/50">Дата</label>
					<input
						type="date"
						value={date}
						onChange={(e) => updateFilter("date", e.target.value)}
						className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
					/>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs text-white/50">Авто</label>
					<select
						value={carId}
						onChange={(e) => updateFilter("carId", e.target.value)}
						className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">Усі авто</option>
						{cars?.map((c) => (
							<option key={c.idCar} value={c.idCar}>{c.numberCar}</option>
						))}
					</select>
				</div>
				<div className="flex flex-col gap-1">
					<label className="text-xs text-white/50">Водій</label>
					<select
						value={driverId}
						onChange={(e) => updateFilter("driverId", e.target.value)}
						className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">Усі водії</option>
						{drivers?.map((d) => (
							<option key={d.idDriver} value={d.idDriver}>{d.nameDriver}</option>
						))}
					</select>
				</div>
			</div>

			{isLoading && <Spinner size="lg" label="Завантаження подій..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити події" onRetry={refetch} />}
			{!isLoading && !isError && rows.length === 0 && (
				<EmptyState title="Подій не знайдено" subtitle="Змініть фільтр або додайте подію вручну" />
			)}

			{!isLoading && !isError && rows.length > 0 && (
				<table className="w-full text-sm">
					<thead className="text-left text-white/50 border-b border-white/10">
						<tr>
							<th className="py-2">Час</th>
							<th className="py-2">Авто</th>
							<th className="py-2">Водій</th>
							<th className="py-2">Тип</th>
							<th className="py-2">Деталі</th>
							<th className="py-2"></th>
						</tr>
					</thead>
					<tbody>
						{rows.map((group) => {
							const rootId = groupRootIdOf(group[0]);
							const root = group.find((g) => g.id === rootId) ?? group[0];
							const isGroup = group.length > 1;

							if (!isGroup && confirmDeleteId === root.id) {
								return (
									<tr key={root.id} className="border-b border-white/5">
										<td colSpan={6} className="py-2">
											<ConfirmDelete
												message={`Видалити подію "${eventTypeLabel(root.eventType, root.trackingMode)}"${root.waybillNumber ? ` (№ ${root.waybillNumber})` : ""}?`}
												pending={deleteEvent.isPending && deleteEvent.variables?.id === root.id}
												onCancel={() => setConfirmDeleteId(null)}
												onConfirm={() => handleDeleteConfirmed(root.id, root.carId)}
											/>
										</td>
									</tr>
								);
							}
							return (
								<tr key={rootId} className="border-b border-white/5 hover:bg-white/5">
									<td className="py-2 text-white/70 whitespace-nowrap">{formatDateTime(root.eventTs)}</td>
									<td className="py-2">{carLabel(root.carId)}</td>
									<td className="py-2">{driverLabel(root.driverId)}</td>
									<td className="py-2 whitespace-nowrap">
										{eventTypeIcon(root.eventType)} {eventTypeLabel(root.eventType, root.trackingMode)}
										{isGroup && <span className="ml-1 text-xs text-violet-300">· {group.length} накладні</span>}
									</td>
									<td className="py-2 text-white/60 truncate max-w-[20rem]">
										{[
											group.map((g) => `№ ${g.waybillNumber}`).join(", "),
											root.customerName,
											eventComment(root),
										]
											.filter(Boolean)
											.join(" · ") || "—"}
									</td>
									<td className="py-2 text-right whitespace-nowrap">
										<Link to={`/panel/events/${rootId}`} className="text-violet-300 hover:underline mr-3">
											Редагувати
										</Link>
										{/* Видалення одним кліком лишається лише для одиночних подій —
										    для групи з кількома накладними неоднозначно, яку саме
										    видаляти, туди йдуть через "Редагувати" (там є видалення
										    кожної накладної окремо) */}
										{!isGroup && (
											<Button type="button" variant="ghost" size="sm" onClick={() => setConfirmDeleteId(root.id)}>
												🗑
											</Button>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			)}
		</div>
	);
}
