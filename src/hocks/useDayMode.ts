import { useState } from "react";
import type { TrackingMode } from "../types";

function readOverride(key: string): TrackingMode | null {
	const stored = localStorage.getItem(key);
	return stored === "daily" || stored === "full" ? stored : null;
}

// Зберігає вибір режиму водія у localStorage
// localStorage — сховище браузера яке зберігається між сесіями
// (як cookies але для JS)
export function useDayMode(carId: number, carDefaultMode: TrackingMode) {
	const today = new Date().toISOString().slice(0, 10);
	// Ключ включає і дату (щодня скидається до дефолту), і авто (carId) —
	// без carId ручний вибір режиму для одного авто помилково "протікав" би
	// на інше авто, якщо логіст перепризначить водія на нове авто того ж дня
	const storageKey = `dayMode:${today}:${carId}`;

	const [override, setOverride] = useState<TrackingMode | null>(() => readOverride(storageKey));
	// Відстежуємо, для якого ключа зчитано override — carId спочатку 0
	// (авто ще не завантажилось), а потім стає реальним; без цього
	// useState-ініціалізатор так і лишився б зі значенням для "хибного"
	// ключа (...:0). Пересинхронізуємось ПІД ЧАС рендеру (офіційний
	// React-патерн "adjusting state when a prop changes", не useEffect —
	// це також покриває сам випадок зміни авто протягом дня.
	const [syncedKey, setSyncedKey] = useState(storageKey);
	if (storageKey !== syncedKey) {
		setSyncedKey(storageKey);
		setOverride(readOverride(storageKey));
	}

	// Похідне значення: якщо carDefaultMode зміниться (логіст поміняв
	// дефолтний режим авто), а override немає — dayMode підхопить новий
	// дефолт сам, без ефекту
	const dayMode = override ?? carDefaultMode;

	const setDayMode = (mode: TrackingMode) => {
		localStorage.setItem(storageKey, mode);
		setOverride(mode);
	};

	// isOverridden = true якщо водій вибрав інший режим ніж дефолт
	const isOverridden = override !== null && override !== carDefaultMode;

	return { dayMode, setDayMode, isOverridden };
}
