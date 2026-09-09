export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// Читає значення cookie за іменем — Django кладе CSRF-токен
// у cookie "csrftoken", яку JS може прочитати напряму
function getCookie(name: string):string | null {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}

interface FetchOptions extends RequestInit {
	json?: unknown;
}

// DRF повертає помилки в РІЗНИХ формах залежно від джерела:
// - кастомні view (login/register): {"error": "..."}
// - permission/404: {"detail": "..."}
// - ModelSerializer-валідація (найчастіше на create/update): {"field": ["msg", ...], ...}
// Без цього apiFetch бачив лише перший варіант, і будь-яка помилка
// валідації серіалізатора (напр. дублікат унікального поля) губилась —
// користувач бачив голе "Request failed: 400." без причини.
function extractErrorMessage(body: unknown): string | undefined {
	if (!body || typeof body !== "object") return undefined;
	const b = body as Record<string, unknown>;

	if (typeof b.error === "string") return b.error;
	if (typeof b.detail === "string") return b.detail;

	const parts: string[] = [];
	for (const [field, value] of Object.entries(b)) {
		if (!Array.isArray(value)) continue;
		const messages = value.filter((v): v is string => typeof v === "string");
		if (messages.length === 0) continue;
		parts.push(field === "non_field_errors" ? messages.join(" ") : `${field}: ${messages.join(" ")}`);
	}
	return parts.length > 0 ? parts.join("; ") : undefined;
}

// Обгортка над fetch: credentials + CSRF header + JSON body/parse в одному місці
export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
	const { json, headers, ...rest} = options;
	
	const res = await fetch(`${API_BASE}${path}`, {
		...rest,
		credentials: 'include',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': getCookie('csrftoken') ?? '',
			...headers,
		},
		body: json !== undefined ? JSON.stringify(json) : rest.body,
	});
	
	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(extractErrorMessage(body) ?? `Request failed: ${res.status}.`);
	}

	// 204 No Content (logout) - немає тіла для парсингу
	if (res.status === 204) return undefined as T;
	return res.json();
}

export interface Paginated<T> {
	results: T[];
	next: string | null;
}

// DRF пагінує ВСІ list-ендпоінти по PAGE_SIZE=10 (config/settings.py
// бекенду). Кожен fetch*-у списку в src/api/*.ts раніше читав лише
// data.results з першої сторінки — при >10 записах (типовий випадок для
// customers/products/route-events і т.д., особливо для даних, імпортованих
// з 1С) решта мовчки губилась. Загальний хелпер тут — щоб кожен виклик
// ішов по data.next, доки він не null, і щоб фікс подвоєння шляху нижче
// був в одному місці, а не копіювався в кожен api/*.ts файл.
//
// API_BASE сам містить шлях (напр. "https://warehouse.mom/api" або
// "http://localhost:8000/api"), а apiFetch() приліплює його спереду до
// будь-якого path. data.next — АБСОЛЮТНИЙ URL від DRF, який теж вже
// містить цей шлях (".../api/route-events/?...page=2") — якщо просто
// взяти url.pathname і віддати в apiFetch як є, шлях API_BASE
// подвоюється ("/api/api/route-events/...") і бекенд віддає 404 (це
// сталось у першій версії цього хелпера, живцем на проді 2026-09-09).
// Тому прибираємо префікс шляху з API_BASE перед тим, як повернути next.
const API_BASE_PATH = new URL(API_BASE).pathname.replace(/\/$/, "");

export async function fetchAllPages<T>(path: string): Promise<T[]> {
	const results: T[] = [];
	let next: string | null = path;
	while (next) {
		const data: Paginated<T> = await apiFetch<Paginated<T>>(next);
		results.push(...data.results);
		if (!data.next) {
			next = null;
		} else {
			const url: URL = new URL(data.next, API_BASE);
			const pathname = API_BASE_PATH && url.pathname.startsWith(API_BASE_PATH)
				? url.pathname.slice(API_BASE_PATH.length)
				: url.pathname;
			next = `${pathname}${url.search}`;
		}
	}
	return results;
}

// Окрема обгортка для файлів: apiFetch жорстко ставить Content-Type:
// application/json і робить JSON.stringify — для multipart/form-data
// це ламає запит, браузер сам мусить виставити свій Content-Type з boundary
export async function apiFetchMultipart<T>(path: string, formData: FormData): Promise<T> {
	const res = await fetch(`${API_BASE}${path}`, {
		method: "POST",
		credentials: "include",
		headers: {
			"X-CSRFToken": getCookie("csrftoken") ?? "",
		},
		body: formData,
	});

	if (!res.ok) {
		const body = await res.json().catch(() => ({}));
		throw new Error(extractErrorMessage(body) ?? `Request failed: ${res.status}.`);
	}
	return res.json();
}

// Допоміжна функція: імітує мережеву затримку у mock режимі
// Без неї компоненти не встигають показати loading стан
export function mockDelay(ms = 300): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
