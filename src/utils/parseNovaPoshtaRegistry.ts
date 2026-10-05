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
	// є лише в повному звіті:
	cost: "ЗагальнавартістьЕН",
	weight: "Вага",
	payer: "Платник",
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

// Рядки першого аркуша + індекси потрібних колонок за заголовком.
// Дані — рядки після заголовка з ТТН з 10+ цифр (це відсікає порожній
// рядок під заголовком і рядок нумерації колонок 1, 2, 3...).
async function readRegistry(file: File) {
	const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
	const sheet = workbook.Sheets[workbook.SheetNames[0]];
	const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "", raw: false });
	const headerIndex = rows.findIndex((r) => r.some((c) => normalizeHeader(c) === HEADERS.ttn));
	if (headerIndex === -1) return null;
	const header = rows[headerIndex].map(normalizeHeader);
	const col = Object.fromEntries(
		Object.entries(HEADERS).map(([key, title]) => [key, header.indexOf(title)]),
	) as Record<keyof typeof HEADERS, number>;
	const dataRows = rows.slice(headerIndex + 1).filter((r) => /^\d{10,}$/.test(String(r[col.ttn] ?? "").trim()));
	return { col, dataRows };
}

const NOT_NP_REGISTRY = "Не знайдено колонку «Номер Е/Н» — це не реєстр Нової Пошти?";

export async function parseNovaPoshtaRegistry(file: File): Promise<NovaPoshtaRegistryParseResult> {
	const empty: NovaPoshtaRegistryParseResult = { items: [], waybillCount: 0, rowsWithoutWaybills: 0, ignoredTokens: [] };
	const registry = await readRegistry(file);
	if (!registry) return { ...empty, error: NOT_NP_REGISTRY };
	const { col, dataRows } = registry;
	if (col.date === -1 || col.waybills === -1) {
		return { ...empty, error: "Не знайдено колонку «Дата Е/Н» або «Номер замовлення клієнта»" };
	}

	// Групуємо по ТТН — у файлі буває той самий рядок двічі
	const byTtn = new Map<string, CarrierShipmentImportItem>();
	const ignored = new Set<string>();
	let rowsWithoutWaybills = 0;
	for (const row of dataRows) {
		const ttn = String(row[col.ttn] ?? "").trim();
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

// ── Вартість доставки з повного звіту ───────────────────────

export interface NovaPoshtaCostItem {
	ttn: string;
	costDate: string;
	costUah: number;
	weightKg: number;
}

export interface NovaPoshtaCostsParseResult {
	items: NovaPoshtaCostItem[];
	totalUah: number;
	// "НЕ ПЛАТЕЛЬЩИК" — доставку оплатив контрагент, це не наша витрата
	notPayerCount: number;
	notPayerUah: number;
	duplicateTtns: string[];
	invalidTtns: string[];
	error?: string;
}

// Порожня клітинка → NaN (рядок піде в invalidTtns), а не Number("") === 0
const toNumber = (value: unknown) => {
	const text = String(value ?? "").replace(/\s/g, "").replace(",", ".");
	return text ? Number(text) : NaN;
};

// Вартість = "Загальна вартість ЕН": перевезення зі знижкою + комісія +
// додаткові послуги (зворотна доставка документів тощо) — сума, яку НП
// виставляє за ЕН (звірено з розбивкою на всіх рядках звіту 2026-08/09).
// Вага = "Вага" — розрахункова, max(фактична, об'ємна), саме за нею НП рахує.
export async function parseNovaPoshtaCosts(file: File): Promise<NovaPoshtaCostsParseResult> {
	const empty: NovaPoshtaCostsParseResult = {
		items: [], totalUah: 0, notPayerCount: 0, notPayerUah: 0, duplicateTtns: [], invalidTtns: [],
	};
	const registry = await readRegistry(file);
	if (!registry) return { ...empty, error: NOT_NP_REGISTRY };
	const { col, dataRows } = registry;
	if (col.cost === -1 || col.weight === -1 || col.date === -1) {
		return {
			...empty,
			error: "Немає колонки «Загальна вартість ЕН» / «Вага» — потрібен повний звіт з кабінету НП, а не урізаний",
		};
	}

	const byTtn = new Map<string, NovaPoshtaCostItem>();
	const result = { ...empty };
	for (const row of dataRows) {
		const ttn = String(row[col.ttn]).trim();
		const costUah = toNumber(row[col.cost]);
		if (col.payer !== -1 && String(row[col.payer]).trim().toUpperCase() === "НЕ ПЛАТЕЛЬЩИК") {
			result.notPayerCount++;
			result.notPayerUah += Number.isFinite(costUah) ? costUah : 0;
			continue;
		}
		const costDate = toIsoDate(String(row[col.date] ?? ""));
		const weightKg = toNumber(row[col.weight]);
		if (!costDate || !Number.isFinite(costUah) || !Number.isFinite(weightKg)) {
			result.invalidTtns.push(ttn);
			continue;
		}
		if (byTtn.has(ttn)) {
			result.duplicateTtns.push(ttn);
			continue;
		}
		byTtn.set(ttn, { ttn, costDate, costUah, weightKg });
	}
	result.items = [...byTtn.values()];
	result.totalUah = result.items.reduce((sum, i) => sum + i.costUah, 0);
	return result;
}
