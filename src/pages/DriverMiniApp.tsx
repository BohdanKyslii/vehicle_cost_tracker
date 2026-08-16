import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useCurrentUser } from '../hocks/useCurrentUser';
import type { UserProfile } from '../api/auth';

const BOT_USERNAME = import.meta.env.VITE_TELEGRAM_BOT_USERNAME as string | undefined;

type Status = 'loading' | 'not_registered' | 'pending_approval' | 'error' | 'ready';

// Куди веде кожна роль після логіну через Mini App. driver — єдина роль з
// повноцінним готовим екраном (DriverDashboard, Фаза 13); logist/manager/head
// ведуть на /fleet — правильний за змістом розділ (авто + водії), навіть
// поки він сам ще PlaceholderPage (Фаза 16 CODING_GUIDE.md не набрана
// руками) — головне, щоб адмін/логіст більше не потрапляв на екран водія.
const ROLE_LANDING: Record<UserProfile['role'], string> = {
	driver: '/driver',
	logist: '/fleet',
	manager: '/fleet',
	head: '/fleet',
};

// Рендериться всередині Telegram WebView (кнопка бота), не сайту — тому без TopNav/AuthModal.
export function DriverMiniApp() {
	const { loginWithTelegram } = useCurrentUser();
	// Ліниво: якщо initData відсутній уже на першому рендері (відкрито поза Telegram),
	// одразу стартуємо в error — не через синхронний setState всередині ефекту.
	const [status, setStatus] = useState<Status>(() =>
		window.Telegram?.WebApp?.initData ? 'loading' : 'error',
	);
	const [landing, setLanding] = useState('/driver');

	useEffect(() => {
		const tg = window.Telegram?.WebApp;
		tg?.ready();
		const initData = tg?.initData;

		if (!initData) return;

		loginWithTelegram(initData)
			.then((user) => {
				setLanding(user.profile ? ROLE_LANDING[user.profile.role] : '/driver');
				setStatus('ready');
			})
			.catch((err: Error) => {
				if (err.message === 'not_registered') setStatus('not_registered');
				else if (err.message === 'pending_approval') setStatus('pending_approval');
				else setStatus('error');
			});
		// Логін має спрацювати рівно один раз при відкритті Mini App, не при кожному ре-рендері.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	switch (status) {
		case 'loading':
			return <Centered>Завантаження…</Centered>;
		case 'not_registered':
			return (
				<Centered>
					Ви ще не зареєстровані.{' '}
					{BOT_USERNAME ? (
						<a href={`https://t.me/${BOT_USERNAME}`} className="underline">
							Напишіть боту @{BOT_USERNAME}
						</a>
					) : (
						'Напишіть боту реєстрації, щоб надіслати заявку.'
					)}
				</Centered>
			);
		case 'pending_approval':
			return <Centered>Заявку надіслано. Очікуйте підтвердження диспетчера.</Centered>;
		case 'error':
			return (
				<Centered>
					Сталася помилка. Спробуйте відкрити застосунок ще раз через бота.
				</Centered>
			);
		case 'ready':
			return <Navigate to={landing} replace />;
	}
}

function Centered({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen flex items-center justify-center p-6 text-center">
			{children}
		</div>
	);
}
