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

// Допоміжна функція: імітує мережеву затримку у mock режимі
// Без неї компоненти не встигають показати loading стан
export function mockDelay(ms = 300): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms));
}
