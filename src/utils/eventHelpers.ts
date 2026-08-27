import type { RouteEventType,TrackingMode } from "../types";

// Повертає масив доступних типів подій для поточного режиму
// daily: 6 типів. "delivery" тут — лише скан накладних поточного дня
// (без одометра/палет на кожну — це вже зафіксовано одним записом depot_start)
// full: всі 8 типів, "delivery" — повноцінна подія на кожній точці (одометр+палети+скан)
export function getAvailableEventTypes(mode: TrackingMode): RouteEventType[] {
	if (mode === "daily") {
		return [
			"depot_start",
			"delivery",
			"refuel",
			"other_cost",
			"return_goods",
			"extra_cargo"
		];
	}
	return [
		"depot_start",
		"delivery",
		"refuel",
		"other_cost",
		"return_goods",
		"extra_cargo",
		"parking_end",
		"depot_return"
	];
}

// Чи потрібне поле одометра для цього типу події?
// daily delivery = скан накладної без одометра (одометр вже є в depot_start);
// full delivery = одометр обов'язково (пробіг/час між точками)
export function requiresOdometer(type: RouteEventType, mode: TrackingMode): boolean {
	if ([
		"refuel",
		"other_cost",
		"return_goods",
		"extra_cargo",
	].includes(type)) return false;

	if (type === "delivery") return mode === "full";

	return true;
}

// Чи потрібне сканування накладної?
export function requiresWaybill(type: RouteEventType): boolean {
	return type === "delivery";
}

// Чи потрібне поле кількості палет?
// daily depot_start = завжди (загальна к-сть на день)
// full delivery = завжди (к-сть на точку)
export function requiresPallets(type: RouteEventType, mode: TrackingMode): boolean {
	if (type === "depot_start" && mode === "daily") return true;
	if (type === "delivery" && mode === "full") return true;
	return false;
}

// Українська назва типу події для відображення у UI
// daily-режим: "delivery" — це лише скан накладної (без прив'язки до фізичної
// точки вивантаження), тому назва інша, ніж у full-режимі
export function eventTypeLabel(type: RouteEventType, mode?: TrackingMode): string {
	if (type === "delivery" && mode === "daily") return "Скан накладної";

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
