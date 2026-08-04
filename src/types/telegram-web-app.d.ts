export {};

interface TelegramWebAppUser {
	id: number;
	first_name: string;
	last_name?: string;
	username?: string;
}

interface TelegramWebApp {
	initData: string;
	initDataUnsafe: {
		user?: TelegramWebAppUser;
		auth_date?: number;
		hash?: string;
	};
	ready: () => void;
	expand: () => void;
	close: () => void;
	colorScheme: "light" | "dark";
}

declare global {
	interface Window {
		Telegram?: { WebApp: TelegramWebApp };
	}
}
