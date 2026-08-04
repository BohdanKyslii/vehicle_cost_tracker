import { apiFetch} from "./config";

export interface UserProfile {
	role: 'driver' | 'logist' | 'manager' | 'head';
	phone: string;
	telegram_id: number | null;
	driver: number | null;
}

export interface CurrentUser {
	id: number;
	username: string;
	email: string;
	is_active: boolean;
	profile: UserProfile | null;
}

// Проставляє csrftoken cookie в браузері — викликається один раз
// при старті застосунку, ДО першого логіну/реєстрації
export function fetchCsrf() {
	return apiFetch<{ csrfToken: string }>("/auth/csrf/");
}

export function fetchCurrentUser() {
	return apiFetch<{ user: CurrentUser | null }>("/auth/me/");
}

export function login(username: string, password: string) {
	return apiFetch<CurrentUser>("/auth/login/", {
		method: "POST",
		json: { username, password },
	});
}

export interface RegisterResult {
	message: string;
}

// Реєстрація НЕ логінить одразу — акаунт неактивний, поки адміністратор
// не підтвердить його вручну в Django admin. Бекенд повертає лише повідомлення.
export function register(username: string, email: string, password: string, role: string) {
	return apiFetch<RegisterResult>("/auth/register/", {
		method: "POST",
		json: { username, email, password, role },
	});
}

export function logout() {
	return apiFetch<void>("/auth/logout/", {
		method: "POST"
		});
}
