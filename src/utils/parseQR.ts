// src/utils/parseQR.ts

export interface QRResult {
  waybillNumber: string;
  waybillDate: string; // завжди ISO "YYYY-MM-DD" — так само як waybillDate по всьому застосунку
}

// Перетворює дату з QR "ДД.ММ.РР" (РР — 2 цифри року) у ISO "20РР-ММ-ДД".
// Джерела віддають рік двома цифрами, тому припускаємо 2000+ (актуально для waybill-ів).
function normalizeQrDate(raw: string): string | null {
  const match = raw.trim().match(/^(\d{2})\.(\d{2})\.(\d{2})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `20${year}-${month}-${day}`;
}

// Парсить рядок QR-коду у об'єкт { waybillNumber, waybillDate }
// Реальний формат з ESP, OPT та Rubin: "номер:ДД.ММ.РР"
//   ESP/OPT: "0000391877:06.07.26"
//   Rubin:   "7908:03.08.26"        (номер коротший, без провідних нулів)
// Довжина номера різна між джерелами, тому вона не валідується.
export function parseQRCode(raw: string): QRResult | null {
  if (!raw || raw.trim() === "") return null;
  const trimmed = raw.trim();

  // Спроба 1: JSON формат — про запас, якщо колись з'явиться інше джерело
  // try-catch ловить помилку якщо JSON.parse не вдається
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed.number && parsed.date) {
      return {
        waybillNumber: String(parsed.number).trim(),
        waybillDate: String(parsed.date).trim(),
      };
    }
  } catch {
    // Не JSON — пробуємо формат "номер:дата"
  }

  // Спроба 2: "номер:ДД.ММ.РР" — формат ESP, OPT, Rubin
  // lastIndexOf(":") — на випадок якщо в номері документу теж трапиться ":"
  const sepIndex = trimmed.lastIndexOf(":");
  if (sepIndex > 0 && sepIndex < trimmed.length - 1) {
    const number = trimmed.slice(0, sepIndex).trim();
    const isoDate = normalizeQrDate(trimmed.slice(sepIndex + 1));
    if (number && isoDate) {
      return { waybillNumber: number, waybillDate: isoDate };
    }
  }

  return null;  // Невідомий формат
}
