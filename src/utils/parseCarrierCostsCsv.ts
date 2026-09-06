// src/utils/parseCarrierCostsCsv.ts
//
// ⚠️ Тимчасовий парсер. Мапінг колонок нижче — здогадка зі старого
// чорнового ескізу (documents/06_IMPLEMENTATION_PLAN.md, Крок 4.3),
// реальних файлів-реєстрів від Нової Пошти/Міст Експрес ще не бачили.
// Той самий урок, що з 1С: чорновий ескіз рідко переживає зустріч з
// реальним файлом. Саме тому парсинг винесений в ОДНУ ізольовану чисту
// функцію без побічних ефектів (той самий принцип, що parseQR.ts).
import Papa from "papaparse";
import type { ImportError, CarrierCode } from "../types";

export interface ParsedCarrierCostRow {
	ttn: string;
	weightKg: number;
	costUah: number;
	costDate: string;
}

export interface ParseCarrierCostsResult {
	rows: ParsedCarrierCostRow[];
	errors: ImportError[];
}

// carrier поки не впливає на мапінг (той самий формат для обох служб —
// поки не бачили реальних файлів, щоб стверджувати інше); лишений у
// сигнатурі, щоб розгалуження по carrier не ламало виклик, якщо
// завтрашні файли виявляться структурно різними
export function parseCarrierCostsCsv(csvText: string, carrier: CarrierCode): ParseCarrierCostsResult {
	void carrier;
	const { data } = Papa.parse<Record<string, string>>(csvText, { header: true, skipEmptyLines: true });
	const rows: ParsedCarrierCostRow[] = [];
	const errors: ImportError[] = [];

	data.forEach((raw, i) => {
		const rowNumber = i + 2; // +1 за 0-індекс, +1 за заголовок
		const ttn = raw["ТТН"] ?? raw["ttn"];
		if (!ttn) {
			errors.push({ row: rowNumber, field: "ttn", message: "Відсутній ТТН" });
			return;
		}

		const weightKg = Number(raw["Вага"] ?? raw["weight_kg"]);
		if (!Number.isFinite(weightKg)) {
			errors.push({ row: rowNumber, field: "weightKg", message: "Не вдалось розпізнати вагу" });
			return;
		}

		const costUah = Number(raw["Вартість"] ?? raw["cost_uah"]);
		if (!Number.isFinite(costUah)) {
			errors.push({ row: rowNumber, field: "costUah", message: "Не вдалось розпізнати вартість" });
			return;
		}

		const costDate = raw["Дата"] ?? raw["date"];
		if (!costDate) {
			errors.push({ row: rowNumber, field: "costDate", message: "Відсутня дата" });
			return;
		}

		rows.push({ ttn, weightKg, costUah, costDate });
	});

	return { rows, errors };
}
