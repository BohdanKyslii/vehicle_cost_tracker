// Нормалізує номер авто під час вводу: перші два й останні два символи —
// у верхній регістр (як у номерного знаку "АА1234ВВ"), середина — як є,
// обрізає до 8 символів. Застосовується на onChange у формах, де номер
// вводить людина вручну (найманий транспорт — carNumber вільний текст,
// не з довідника авто).
export function formatCarNumber(raw: string): string {
	const value = raw.slice(0, 8);
	if (value.length <= 4) return value.toUpperCase();
	return value.slice(0, 2).toUpperCase() + value.slice(2, -2) + value.slice(-2).toUpperCase();
}
