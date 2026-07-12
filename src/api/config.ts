export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

// Читає значення cookie за іменем — Django кладе CSRF-токен
// у cookie "csrftoken", яку JS може прочитати напряму
function getCookie(name: string):string | null {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}

interface FetchOptions extends RequestInit {
	json?: unknown;
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
		throw new Error(body.error ?? `Request failed: ${res.status}.`);
	}

	// 204 No Content (logout) - немає тіла для парсингу
	if (res.status === 204) return undefined as T;
	return res.json();
}
