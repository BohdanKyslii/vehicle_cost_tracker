import * as XLSX from "xlsx";

// Спільна пара утиліт для масового імпорту довідників (Товари/Клієнти/
// Магазини, /panel) з Excel —xlsx (SheetJS), не papaparse: papaparse
// читає лише CSV, а формат обміну тут .xlsx (звична 1С-таблиця).

// Читає перший аркуш файлу, повертає рядки як об'єкти
// { заголовок: текстове значення } — сирі рядки, конвертація в
// числа/булеві значення лишається на боці конкретної *Import.tsx
// сторінки (там же дефолти для порожніх клітинок).
export async function parseExcelFile(file: File): Promise<Record<string, string>[]> {
	const buffer = await file.arrayBuffer();
	const workbook = XLSX.read(buffer, { type: "array" });
	const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
	return XLSX.utils.sheet_to_json<Record<string, string>>(firstSheet, { defval: "", raw: false });
}

// Порожня клітинка → дефолт true (більшість рядків активні); лише явне
// "ні"/"false"/"0" вимикає — не вимагаємо від людини, що заповнює Excel,
// заповнювати цю колонку для кожного рядка окремо
export function parseImportBool(value: string, defaultValue = true): boolean {
	const v = value.trim().toLowerCase();
	if (!v) return defaultValue;
	return !["ні", "false", "0", "no"].includes(v);
}

// Порожня клітинка → undefined (не 0) — 0 як число мало б інший сенс
// для більшості полів товару/логістики, ніж "не заповнено"
export function parseImportNumber(value: string): number | undefined {
	const v = value.trim();
	return v ? Number(v) : undefined;
}

// Генерує шаблон .xlsx "на льоту" — заголовки завжди синхронні з кодом
// (мапінгом колонок у конкретній *Import.tsx сторінці), без окремого
// статичного файлу в репозиторії.
export function downloadExcelTemplate(filename: string, headers: string[], example?: string[]) {
	const rows = example ? [headers, example] : [headers];
	const sheet = XLSX.utils.aoa_to_sheet(rows);
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, sheet, "Шаблон");
	XLSX.writeFile(workbook, filename);
}
