import type {
	WaybillSummary,
	WaybillFilters,
	SortParams,
	PaginationParams,
	PaginatedResponse,
} from "../types";

// Фільтрує масив накладних за критеріями
// Кожен критерій — додаткова умова (AND логіка)
export function filterWaybills(
	items: WaybillSummary[],
	filters: WaybillFilters,
): WaybillSummary[] {
	return items.filter(item => {
		// Пошук по тексту: клієнт або номер накладної
		// toLowerCase → порівнюємо без урахування регістру
		if (filters.search) {
			const q = filters.search.toLowerCase();
			const matchCustomer = item.customerName.toLowerCase().includes(q);
			const matchNumber = item.waybillNumber.toLowerCase().includes(q);
			if (!matchCustomer && !matchNumber) return false;
		}
		
		// Фільтр по статусу
		if (filters.status && item.status !== filters.status) return false;
		
		// Фільтр по каналу доставки
		if (filters.deliveryChannel && filters.deliveryChannel !== "all") {
			if (filters.deliveryChannel === "unassigned") {
				if (item.deliveryChannel !== null && item.deliveryChannel !== undefined) return false;
			} else {
				if (item.deliveryChannel !== filters.deliveryChannel) return false;
			}
		}
		
		// Фільтр по юридичній особі
		if (filters.legalEntity && item.legalEntity !== filters.legalEntity) return false;
		
		// Фільтр відвантаження/повернення
		if (filters.lineType && filters.lineType !== "all") {
			if (filters.lineType === "shipment" && item.totalUah <= 0) return false;
			if (filters.lineType === "return" && item.returnsUah >= 0) return false;
		}
		
		// Фільтр по магазину
		if (filters.storeId && item.storeId !== filters.storeId) return false;
		
		// Фільтр по даті "від"
		if (filters.dateFrom && item.waybillDate < filters.dateFrom) return false;
		
		// Фільтр по даті "до"
		if (filters.dateTo && item.waybillDate > filters.dateTo) return false;
		
		return true;  // Всі умови виконані — залишаємо
	});
}

// Сортує масив за вказаним полем і напрямком
// Generics <T> — функція працює з будь-яким типом
export function sortItems<T>(items: T[], sort: SortParams): T[] {
	return [...items].sort((a, b) => {
		// Отримуємо значення поля за ключем
		// Record<string, unknown> — динамічний доступ без any (спрощення)
		const aVal = (a as Record<string, unknown>)[sort.field] ?? "";
		const bVal = (b as Record<string, unknown>)[sort.field] ?? "";

		let result: number;
		if (typeof aVal === "string") {
			// localeCompare — порівняння рядків з урахуванням мови
			result = aVal.localeCompare(bVal as string, "uk");
		} else {
			result = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
		}
		
		// asc = за зростанням, desc = за спаданням
		return sort.direction === "asc" ? result : -result;
	});
}

// Розбиває масив на сторінки і повертає поточну сторінку
export function paginate<T>(
	items: T[],
	{ page, pageSize }: PaginationParams,
): PaginatedResponse<T> {
	const total = items.length;
	const totalPages = Math.ceil(total / pageSize);
	// slice(start, end) — вирізає частину масиву
	// (page-1)*pageSize = індекс першого елементу сторінки
	const start = (page - 1) * pageSize;
	const pageItems = items.slice(start, start + pageSize);
	
	return { items: pageItems, total, page, pageSize, totalPages };
}
