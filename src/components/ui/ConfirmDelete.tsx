import { Button } from "./Button";

interface ConfirmDeleteProps {
	message: string;
	pending?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

// Явне підтвердження видалення — НЕ window.confirm() (блокує весь UI,
// чужорідний вигляд) — той самий принцип, що ConfirmDeleteMessage у
// driver/EventDetail.tsx, узагальнений для світлої/панельної частини
// застосунку. Використовується скрізь, де є кнопка видалення в /panel.
export function ConfirmDelete({ message, pending, onConfirm, onCancel }: ConfirmDeleteProps) {
	return (
		<div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 flex items-center gap-3 text-sm">
			<span className="text-rose-200 flex-1">{message}</span>
			<Button type="button" variant="ghost" size="sm" onClick={onCancel}>Скасувати</Button>
			<Button type="button" variant="danger" size="sm" onClick={onConfirm} isLoading={pending}>Так, видалити</Button>
		</div>
	);
}
