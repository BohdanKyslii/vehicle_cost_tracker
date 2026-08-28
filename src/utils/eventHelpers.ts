import type { RouteEvent, RouteEventType, TrackingMode, DeliveryStage } from "../types";
import { formatKm, formatLiters, formatKg, formatUah } from "./formatters";

// Один тайл на дашборді водія: type — реальний RouteEventType (те, що
// летить у БД), stage — лише UI-різниця для "delivery" у full-режимі
// (у daily стадії немає — там завжди просто скан)
export interface EventTile {
	type: RouteEventType;
	stage?: DeliveryStage;
}

// Повертає тайли доступних подій для поточного режиму
// daily: "delivery" — лише скан накладних поточного дня (без одометра/палет
// — вони вже зафіксовані одним записом depot_start)
// full: "delivery" — ДВА тайли: "Скан накладної" (load, на складі, без
// одометра — авто ще не рухалось) і "Вивантаження" (unload, на точці,
// одометр+палети обов'язкові)
export function getAvailableEventTypes(mode: TrackingMode): EventTile[] {
	if (mode === "daily") {
		return [
			{ type: "depot_start" },
			{ type: "delivery" },
			{ type: "refuel" },
			{ type: "other_cost" },
			{ type: "return_goods" },
			{ type: "extra_cargo" },
		];
	}
	return [
		{ type: "depot_start" },
		{ type: "delivery", stage: "load" },
		{ type: "delivery", stage: "unload" },
		{ type: "refuel" },
		{ type: "other_cost" },
		{ type: "return_goods" },
		{ type: "extra_cargo" },
		{ type: "parking_end" },
		{ type: "depot_return" },
	];
}

// Чи потрібне поле одометра для цього типу події?
// daily delivery = скан накладної без одометра (одометр вже є в depot_start);
// full delivery: load (склад, до виїзду) — без одометра; unload (точка) — обов'язково
export function requiresOdometer(type: RouteEventType, mode: TrackingMode, stage?: DeliveryStage): boolean {
	if ([
		"refuel",
		"other_cost",
		"return_goods",
		"extra_cargo",
	].includes(type)) return false;

	if (type === "delivery") {
		if (mode === "daily") return false;
		return stage === "unload";
	}

	return true;
}

// Чи потрібне сканування накладної?
export function requiresWaybill(type: RouteEventType): boolean {
	return type === "delivery";
}

// Чи потрібне поле кількості палет?
// depot_start = завжди (daily — на весь день; full — загальна к-сть на весь маршрут)
// full delivery = завжди, і на load (к-сть за весь захід сканування на складі),
// і на unload (к-сть саме на цій точці) — обидва числа окремі, у сумі
// (calcSummary.ts) рахується лише unload (за наявністю одометра)
export function requiresPallets(type: RouteEventType, mode: TrackingMode): boolean {
	if (type === "depot_start") return true;
	if (type === "delivery" && mode === "full") return true;
	return false;
}

// Для вже збережених подій stage ніде не зберігається (немає такого поля
// в БД) — визначаємо його заднім числом з наявності одометра: якщо
// одометр є, це підтверджена точка (unload), якщо нема — просто скан
// на складі (load) чи додаткова накладна тієї ж точки
export function inferDeliveryStage(e: RouteEvent): DeliveryStage | undefined {
	if (e.eventType !== "delivery" || e.trackingMode !== "full") return undefined;
	return e.odometerKm != null ? "unload" : "load";
}

// Немає поля-групи в БД (рішення: multi-waybill на точці — суто
// frontend-хак, без зміни схеми) — попередня версія групувала заднім
// числом по часовому вікну (усі delivery-події без розриву довше N
// хвилин), але це хибно об'єднувало й окремі, самостійні накладні,
// якщо водій просто відсканував їх одну за одною (окремими заходами в
// EventForm) швидко — саме так, а не через "+ Ще одна накладна".
// Замінено на явний маркер: додаткова накладна (створена через
// "+ Ще одна накладна" в EventForm чи "Ще одна накладна цієї точки" в
// EventDetail) несе в `notes` префікс "[stop:<id основної події>]" —
// без цього маркера подія завжди сама собі група, незалежно від того,
// як близько за часом вона до інших.
const STOP_TAG_RE = /^\[stop:(\d+)\]\s*/;

// group-id події: якщо в notes є маркер "[stop:N]" — N (id основної
// події групи), інакше подія сама собі група (її власний id)
function groupRootId(e: RouteEvent): number {
	const match = e.notes?.match(STOP_TAG_RE);
	return match ? Number(match[1]) : e.id;
}

// Прибирає службовий маркер із notes перед показом водієві
export function stripStopTag(notes: string | undefined): string | undefined {
	if (!notes) return notes;
	const stripped = notes.replace(STOP_TAG_RE, "");
	return stripped || undefined;
}

// notes для НОВОЇ додаткової накладної тієї ж точки — прив'язує її до
// групи з коренем rootId (id основної події: своєї власної, якщо це
// перша додаткова накладна, або вже наявного корня групи — так усі
// додаткові в одній групі посилаються на ОДИН і той самий id, а не
// одна на одну ланцюжком)
export function withStopTag(rootId: number): string {
	return `[stop:${rootId}]`;
}

export function findEventGroup(events: RouteEvent[], target: RouteEvent): RouteEvent[] {
	if (target.eventType !== "delivery") return [target];
	const rootId = groupRootId(target);
	return events.filter(e => e.eventType === "delivery" && groupRootId(e) === rootId);
}

// Група (root id), до якої належить подія — для позначення НОВОЇ
// додаткової накладної тим самим коренем незалежно від того, на яку
// саме подію групи зараз дивиться водій
export function groupRootIdOf(e: RouteEvent): number {
	return groupRootId(e);
}

// Права колонка карток історії/сьогоднішніх подій — компактні бейджі.
// Будуються з наявності полів, а не switch по типу: full-режим delivery
// має одночасно і одометр, і номер накладної — обидва мають зʼявитись.
export function eventSummaryBadges(e: RouteEvent): string[] {
	const badges: string[] = [];
	if (e.odometerKm != null) badges.push(formatKm(e.odometerKm));
	if (e.waybillNumber) badges.push(`№ ${e.waybillNumber}`);
	if (e.returnClientWaybill) badges.push(`№ ${e.returnClientWaybill}`);
	if (e.fuelLiters != null) badges.push(formatLiters(e.fuelLiters));
	if (e.otherCostUah != null) badges.push(formatUah(e.otherCostUah));
	if (e.extraWeightKg != null) badges.push(formatKg(e.extraWeightKg));
	return badges;
}

// Коментар водія до події — або загальні "Нотатки", або спеціальний
// коментар "Інших витрат" (два різні поля форми, обидва — вільний текст)
export function eventComment(e: RouteEvent): string | undefined {
	return stripStopTag(e.notes) || e.otherCostComment || undefined;
}

// Українська назва типу події для відображення у UI
// daily-режим: "delivery" — це лише скан накладної (без прив'язки до фізичної
// точки вивантаження). full-режим: "load" — той самий скан на складі,
// "unload" (або stage не задано — напр. для старих подій без інференсу) —
// повноцінне вивантаження на точці
export function eventTypeLabel(type: RouteEventType, mode?: TrackingMode, stage?: DeliveryStage): string {
	if (type === "delivery") {
		if (mode === "daily" || stage === "load") return "Скан накладної";
	}

	const labels: Record<RouteEventType, string> = {
		depot_start: "Старт зі складу",
		delivery: "Вивантаження",
		parking_end: "Кінець маршруту",
		depot_return: "Повернення на склад",
		refuel: "Заправка",
		other_cost: "Інші витрати",
		return_goods: "Повернення товару",
		extra_cargo: "Додатковий вантаж",
	};
	return labels[type];
}

// Emoji іконка для типу події
export function eventTypeIcon(type: RouteEventType): string {
	const icons: Record<RouteEventType, string> = {
		depot_start: "🏭",
		delivery: "📦",
		parking_end: "🅿️",
		depot_return: "↩️",
		refuel: "⛽",
		other_cost: "💸",
		return_goods: "↪️",
		extra_cargo: "🚛",
	};
	return icons[type] || "question";
}

// Градієнт для тайла кожного типу події (Крок 13, DriverDashboard) —
// різні кольори полегшують пошук потрібної кнопки одним поглядом.
export function eventTypeGradient(type: RouteEventType): string {
	const gradients: Record<RouteEventType, string> = {
		depot_start: "from-blue-500 to-cyan-400",
		delivery: "from-violet-500 to-purple-400",
		parking_end: "from-slate-500 to-slate-400",
		depot_return: "from-indigo-500 to-blue-400",
		refuel: "from-amber-500 to-orange-400",
		other_cost: "from-pink-500 to-rose-400",
		return_goods: "from-teal-500 to-emerald-400",
		extra_cargo: "from-fuchsia-500 to-pink-400",
	};
	return gradients[type] || "question";
}
