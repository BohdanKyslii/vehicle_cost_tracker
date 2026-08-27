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
	return e.notes || e.otherCostComment || undefined;
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
