import type { RouteEventType,TrackingMode } from "../types";

// Повертає масив доступних типів подій для поточного режиму
// daily: тільки 5 типів (без точок маршруту)
// full: всі 8 типів
export function getAvailableEventTypes(mode: TrackingMode): RouteEventType[] {
	if (mode === "daily") {
		return [
			"depot_start",
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
export function requiresOdometer(type: RouteEventType): boolean {
	
	return ![
		"refuel",
		"other_cost",
		"return_goods",
		"extra_cargo",
	].includes(type);
}

// Чи потрібне сканування накладної?
export function requiredWaybill(type: RouteEventType): boolean {
	return type === "delivery";
}

// Чи потрібне поле кількості палет?
// daily depot_start = завжди (загальна к-сть на день)
// full delivery = завжди (к-сть на точку)
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
