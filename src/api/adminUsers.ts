import type { AdminUser, UserRole } from "../types";
import { apiFetch } from "./config.ts";

interface Paginated<T> {
	results: T[];
}

interface RawAdminUser {
	id: number;
	username: string;
	email: string;
	is_active: boolean;
	date_joined: string;
	role: UserRole;
	phone: string;
	telegram_id: number | null;
	driver_id: number | null;
	driver_name: string | null;
}

function mapAdminUser(raw: RawAdminUser): AdminUser {
	return {
		id: raw.id,
		username: raw.username,
		email: raw.email,
		isActive: raw.is_active,
		dateJoined: raw.date_joined,
		role: raw.role,
		phone: raw.phone || undefined,
		telegramId: raw.telegram_id,
		driverId: raw.driver_id,
		driverName: raw.driver_name,
	};
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
	const data = await apiFetch<Paginated<RawAdminUser>>("/users/");
	return data.results.map(mapAdminUser);
}

// PATCH — і підтвердження заявки (isActive: true, разом з обраною роллю),
// і звичайна зміна ролі вже активного користувача; бекенд приймає обидва
// поля в одному запиті (apps.accounts.views.AdminUserViewSet)
export interface AdminUserPatch {
	role?: UserRole;
	isActive?: boolean;
}

function toAdminUserPatch(data: AdminUserPatch) {
	return {
		...(data.role !== undefined && { role: data.role }),
		...(data.isActive !== undefined && { is_active: data.isActive }),
	};
}

export async function updateAdminUser(id: number, data: AdminUserPatch): Promise<AdminUser> {
	const raw = await apiFetch<RawAdminUser>(`/users/${id}/`, { method: "PATCH", json: toAdminUserPatch(data) });
	return mapAdminUser(raw);
}

// Відхилити непідтверджену заявку (видаляє акаунт назавжди — той самий
// принцип, що кнопка "❌ Відхилити" в Telegram-боті)
export async function rejectAdminUser(id: number): Promise<void> {
	await apiFetch<void>(`/users/${id}/`, { method: "DELETE" });
}

// Переносить telegramId з непідтвердженої Telegram-заявки (sourceUserId)
// на вже наявний email-акаунт (id) — apps.accounts.views.AdminUserViewSet.link_telegram
export async function linkTelegramUser(id: number, sourceUserId: number): Promise<AdminUser> {
	const raw = await apiFetch<RawAdminUser>(`/users/${id}/link-telegram/`, {
		method: "POST",
		json: { source_user_id: sourceUserId },
	});
	return mapAdminUser(raw);
}
