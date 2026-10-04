import { parseQRCode } from "./parseQR";

// Розбиває введений вручну текст на номери накладних: роздільник —
// новий рядок, кома, крапка з комою або пробіл. Якщо вставили повний
// рядок з QR ("0000391877:06.07.26") — беремо з нього тільки номер.
export function parseWaybillNumbers(text: string): string[] {
	const numbers = text
		.split(/[\s,;]+/)
		.map((part) => part.trim())
		.filter(Boolean)
		.map((part) => parseQRCode(part)?.waybillNumber ?? part);
	return [...new Set(numbers)];
}
