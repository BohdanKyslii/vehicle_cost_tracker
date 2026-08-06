// Форматування числа у гривнях
// Intl.NumberFormat — вбудований браузерний форматер
// "uk-UA" — локаль (тисячники через пробіл, кома як розділювач)
export function formatUah(value: number): string {
  return new Intl.NumberFormat("uk-UA", {
	style: "currency",
	currency: "UAH",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
  }).format(value);
}
// formatUah(12345.67) → "12 345,67 ₴"

// Форматування кілометрів
export function formatKm(value: number): string {
	return `${new Intl.NumberFormat("uk-UA").format(value)} км`;
}
// formatKm(87523) → "87 523 км"

// Форматування літрів
export function formatLiters(value: number): string {
	return `${value.toFixed(2).replace('.', ',')} л`;
}
// formatLiters(123.45) → "123,45 л"

// Форматування кілограмів
export function formatKg(value: number): string {
	return `${value.toFixed(2).replace('.', ',')} кг`;
}
// formatKg(123.45) → "123,45 кг"

// Форматування кубічних метрів
export function formatCbm(value: number): string {
	return `${value.toFixed(3).replace('.', ',')} м³`;
}
// formatCbm(123.456) → "123,456 м³"

// Форматування відсотків
export function formatPct(value: number): string {
	return `${value.toFixed(2).replace('.', ',')} %`;
}
// formatPct(123.456) → "123,46 %"

// Форматування дати з ISO рядка
// new Date("2026-06-29") → об'єкт Date
// toLocaleDateString з uk-UA локаллю → "29.06.2026"
export function formatDate(value: string): string {
	return new Date(value).toLocaleDateString("uk-UA", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	});
}
// formatDate("2026-06-29") → "29.06.2026"


// Форматування дати + часу
export function formatDateTime(iso: string): string {
	return new Date(iso).toLocaleString("uk-UA", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}
// formatDateTime("2026-06-29T08:15:00+03:00") → "29.06.2026, 08:15"

// Форматування місяця
export function formatMonth(iso: string): string {
	return new Date(iso).toLocaleString("uk-UA", {
		month: "long",
		year: "numeric",
	});
}
// formatMonth("2026-06-01") → "червень 2026"

// Юридична особа → людська назва
export function formatLegalEntity(entity: "ESP" | "OPT" | "Rubin"): string {
	const labels = {
		ESP: "Євро Смарт Пауер",
		OPT: "Оіл Прайм Трейд",
		Rubin: "ТД Рубін"
	};
	return labels[entity] ?? entity;
}

// Канал доставки → українська назва
export function channelLabel(channel: "own" | "hired" | "carrier" | null | undefined): string {
	if (!channel) return "Не призначено";
	const labels = {
		own: "Власне авто",
		hired: "Найманий транспорт",
		carrier: "Служба доставки",
	};
	return labels[channel];
}
