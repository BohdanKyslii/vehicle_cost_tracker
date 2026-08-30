import type { UserProfile } from "../api/auth";

// Єдине джерело правди для того, які офісні розділи бачить/може
// відкрити кожна роль — використовується і для реального гейта маршруту
// (RequireRole у App.tsx), і для видимого списку посилань у навігації
// (MainLayout). Один список тут — без ризику, що App.tsx і MainLayout
// розійдуться (як уже сталось раніше з коментарем "та сама обгортка
// RequireRole", який довго не відповідав дійсності).
// Водій сюди не потрапляє — в нього окремий DriverLayout/DriverMiniApp.
// "/admin" НЕ використовується як власний маршрут SPA навмисно — на проді
// nginx проксіює "/admin/" напряму на Django admin (nginx.conf), тож
// клієнтський роут з такою назвою був би недосяжний (nginx перехопить
// запит раніше, ніж він дійде до index.html/SPA). Кастомний
// адмін-розділ застосунку живе на "/panel" (той самий шлях, під який
// TopNav.tsx уже давно має посилання "Адмін").
export const ROLE_ROUTES: Record<UserProfile["role"], string[]> = {
	driver: [],
	logist: ["/fleet", "/costs", "/hired", "/carriers", "/analytics"],
	manager: ["/waybills", "/hired", "/carriers", "/analytics"],
	// /panel лишається тільки для head — "суперкористувацький" розділ
	// (довідники товарів/клієнтів/магазинів, майбутнє підтвердження
	// реєстрацій), на відміну від /costs, який логісту потрібен щодня
	head: ["/fleet", "/waybills", "/costs", "/hired", "/carriers", "/analytics", "/panel"],
};

// Обертає ROLE_ROUTES навпаки — які ролі мають доступ до конкретного
// шляху; передається напряму як `roles` у <RequireRole>.
export function rolesForRoute(path: string): UserProfile["role"][] {
	return (Object.keys(ROLE_ROUTES) as UserProfile["role"][]).filter((role) =>
		ROLE_ROUTES[role].includes(path),
	);
}
