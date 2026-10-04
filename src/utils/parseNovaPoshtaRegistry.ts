import * as XLSX from "xlsx";
import type { CarrierShipmentImportItem } from "../api/carrierShipments";

// Реєстр Нової Пошти ("Звіт по клієнту за період") — і повний звіт з
// кабінету (60+ колонок), і урізаний до 3 колонок. Колонки шукаємо за
// заголовком, а не за позицією: у повному звіті "Номер замовлення клієнта"
// аж 60-та. Заголовки містять переноси рядків ("Номер \nЕ/Н"), тому
// порівнюємо без пробілів.
const HEADERS = {
	ttn: "НомерЕ/Н",
	date: "ДатаЕ/Н",
	waybills: "Номерзамовленняклієнта",
};

export interface NovaPoshtaRegistryParseResult {
	items: CarrierShipmentImportItem[];
	waybillCount: number;
	// рядки з ТТН, але без номера накладної (у повному звіті їх багато —
	// відправки не від нас/без замовлення) — не імпортуються
	rowsWithoutWaybills: number;
	// фрагменти в колонці накладних, що не схожі на номер ("АКТ" тощо)
	ignoredTokens: string[];
	error?: string;
}

const normalizeHeader = (value: unknown) => String(value ?? "").replace(/\s+/g, "");

// "03.08.2026 17:42:00" → "2026-08-03"
function toIsoDate(value: string): string | null {
	const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})/);
	return match ? `${match[3]}-${match[2]}-${match[1]}` : null;
}

export async function parseNovaPoshtaRegistry(file: File): Promise<NovaPoshtaRegistryParseResult> {
	const empty: NovaPoshtaRegistryParseResult = { items: [], waybillCount: 0, rowsWithoutWaybills: 0, ignoredTokens: [] };
	const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });

	const headerIndex = rows.findIndex((r) => r.some((c) => normalizeHeader(c) === HEADERS.ttn));
	if (headerIndex === -1) return { ...empty, error: "Не знайдено колонку «Номер Е/Н» — це не реєстр Нової Пошти?" };
	const header = rows[headerIndex].map(normalizeHeader);
	const col = {
		ttn: header.indexOf(HEADERS.ttn),
		date: header.indexOf(HEADERS.date),
		waybills: header.indexOf(HEADERS.waybills),
	};
	if (col.date === -1 || col.waybills === -1) {
		return { ...empty, error: "Не знайдено колонку «Дата Е/Н» або «Номер замовлення клієнта»" };
	}

	// Групуємо по ТТН — у файлі буває той самий рядок двічі
	const byTtn = new Map<string, CarrierShipmentImportItem>();
	const ignored = new Set<string>();
	let rowsWithoutWaybills = 0;
	for (const row of rows.slice(headerIndex + 1)) {
		const ttn = String(row[col.ttn] ?? "").trim();
		// пропускає порожній рядок під заголовком і рядок нумерації колонок (1, 2, 3...)
		if (!/^\d{10,}$/.test(ttn)) continue;
		const shipmentDate = toIsoDate(String(row[col.date] ?? ""));
		if (!shipmentDate) continue;

		// "7423,  7870,  7872" — кілька накладних в одній ТТН
		const waybills: string[] = [];
		for (const token of String(row[col.waybills] ?? "").split(/[,;\s]+/).filter(Boolean)) {
			if (/^\d+$/.test(token)) waybills.push(token);
			else ignored.add(token);
		}
		if (waybills.length === 0) {
			rowsWithoutWaybills++;
			continue;
		}

		const existing = byTtn.get(ttn);
		if (existing) existing.waybills = [...new Set([...existing.waybills, ...waybills])];
		else byTtn.set(ttn, { ttn, shipmentDate, waybills: [...new Set(waybills)] });
	}

	const items = [...byTtn.values()];
	return {
		items,
		waybillCount: items.reduce((sum, i) => sum + i.waybills.length, 0),
		rowsWithoutWaybills,
		ignoredTokens: [...ignored],
	};
}
