import { useState} from "react";
import type { TrackingMode} from "../types";

// Зберігає вибір режиму водія у localStorage
// localStorage — сховище браузера яке зберігається між сесіями
// (як cookies але для JS)
export function useDayMode(carDefaultMode: TrackingMode) {
    const today = new Date().toISOString().slice(0, 10);
    // Ключ включає дату — щодня режим скидається до дефолту
    const storageKey = `dayMode:${today}`;

    // Зберігаємо лише ЯВНИЙ вибір водія — немає override → беремо дефолт авто
    const [override, setOverride] = useState<TrackingMode | null>(() => {
       const stored = localStorage.getItem(storageKey);
       return stored === "daily" || stored === "full" ? stored : null;
    });

    // Похідне значення: якщо carDefaultMode зміниться (логіст поміняв авто),
    // а override немає — dayMode підхопить новий дефолт сам, без ефекту
    const dayMode = override ?? carDefaultMode;

    const setDayMode = (mode: TrackingMode) => {
        localStorage.setItem(storageKey, mode);
        setOverride(mode);
    };

    // isOverridden = true якщо водій вибрав інший режим ніж дефолт
    const isOverridden = override !== null && override !== carDefaultMode;

    return { dayMode, setDayMode, isOverridden };
}
