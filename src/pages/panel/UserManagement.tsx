import { useState } from "react";
import { useAdminUsers, useUpdateAdminUser, useRejectAdminUser, useLinkTelegramUser } from "../../hocks/useAdminUsers";
import { useCurrentUser } from "../../hocks/useCurrentUser";
import { Spinner } from "../../components/ui/Spinner";
import { ErrorBanner } from "../../components/ui/ErrorBanner";
import { EmptyState } from "../../components/ui/EmptyState";
import { Button } from "../../components/ui/Button";
import { formatRole, formatDateTime } from "../../utils/formatters";
import type { AdminUser, UserRole } from "../../types";

const ROLE_OPTIONS: UserRole[] = ["driver", "logist", "manager", "head"];

function RoleSelect({ value, onChange, disabled }: { value: UserRole; onChange: (r: UserRole) => void; disabled?: boolean }) {
	return (
		<select
			value={value}
			onChange={(e) => onChange(e.target.value as UserRole)}
			disabled={disabled}
			className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 disabled:opacity-50 [&>option]:bg-slate-900 [&>option]:text-white"
		>
			{ROLE_OPTIONS.map((r) => (
				<option key={r} value={r}>{formatRole(r)}</option>
			))}
		</select>
	);
}

// Заявка (нова реєстрація АБО раніше деактивований користувач — обидва
// мають isActive=false і однаково потребують нового підтвердження ролі)
function PendingUserRow({ user }: { user: AdminUser }) {
	const [role, setRole] = useState<UserRole>(user.role);
	const updateUser = useUpdateAdminUser();
	const rejectUser = useRejectAdminUser();

	return (
		<tr className="border-b border-white/5">
			<td className="py-2">
				{user.username}
				{user.telegramId && <span className="ml-1 text-sky-300 text-xs">Telegram</span>}
			</td>
			<td className="py-2 text-white/70">{user.email || "—"}</td>
			<td className="py-2"><RoleSelect value={role} onChange={setRole} disabled={updateUser.isPending} /></td>
			<td className="py-2 text-white/50">{formatDateTime(user.dateJoined)}</td>
			<td className="py-2">
				<div className="flex gap-2">
					<Button
						type="button"
						size="sm"
						isLoading={updateUser.isPending}
						onClick={() => updateUser.mutate({ id: user.id, data: { isActive: true, role } })}
					>
						✅ Підтвердити
					</Button>
					<Button
						type="button"
						size="sm"
						variant="danger"
						isLoading={rejectUser.isPending}
						onClick={() => {
							if (confirm(`Відхилити заявку «${user.username}»? Акаунт буде видалено назавжди.`)) {
								rejectUser.mutate(user.id);
							}
						}}
					>
						❌ Відхилити
					</Button>
				</div>
			</td>
			{(updateUser.isError || rejectUser.isError) && (
				<td colSpan={5} className="pb-2">
					<p className="text-xs text-rose-400">{((updateUser.error ?? rejectUser.error) as Error).message}</p>
				</td>
			)}
		</tr>
	);
}

function ActiveUserRow({
	user,
	telegramCandidates,
	isSelf,
}: {
	user: AdminUser;
	telegramCandidates: AdminUser[];
	isSelf: boolean;
}) {
	const updateUser = useUpdateAdminUser();
	const linkTelegram = useLinkTelegramUser();
	const [linking, setLinking] = useState(false);
	const [sourceId, setSourceId] = useState<number | "">("");

	return (
		<tr className="border-b border-white/5 hover:bg-white/5">
			<td className="py-2">
				{user.username}
				{isSelf && <span className="text-white/30 text-xs"> (ви)</span>}
			</td>
			<td className="py-2 text-white/70">{user.email || "—"}</td>
			<td className="py-2">
				<RoleSelect
					value={user.role}
					disabled={isSelf || updateUser.isPending}
					onChange={(role) => updateUser.mutate({ id: user.id, data: { role } })}
				/>
			</td>
			<td className="py-2 text-white/70">{user.driverName ?? "—"}</td>
			<td className="py-2">
				{user.telegramId ? (
					<span className="text-sky-300">✅ {user.telegramId}</span>
				) : linking ? (
					<div className="flex gap-1 items-center">
						<select
							value={sourceId}
							onChange={(e) => setSourceId(e.target.value ? Number(e.target.value) : "")}
							className="rounded-lg border border-white/10 bg-white/5 text-white px-1 py-1 text-xs [&>option]:bg-slate-900 [&>option]:text-white"
						>
							<option value="">— заявка —</option>
							{telegramCandidates.map((c) => (
								<option key={c.id} value={c.id}>{c.driverName ?? c.username}</option>
							))}
						</select>
						<Button
							type="button"
							size="sm"
							disabled={sourceId === ""}
							isLoading={linkTelegram.isPending}
							onClick={() => {
								if (sourceId === "") return;
								linkTelegram.mutate({ id: user.id, sourceUserId: sourceId }, { onSuccess: () => setLinking(false) });
							}}
						>
							OK
						</Button>
						<Button type="button" size="sm" variant="ghost" onClick={() => setLinking(false)}>✕</Button>
					</div>
				) : telegramCandidates.length > 0 ? (
					<Button type="button" size="sm" variant="ghost" onClick={() => setLinking(true)}>
						🔗 Прив'язати
					</Button>
				) : (
					<span className="text-white/30">—</span>
				)}
			</td>
			<td className="py-2">
				{!isSelf && (
					<Button
						type="button"
						size="sm"
						variant="ghost"
						isLoading={updateUser.isPending}
						onClick={() => {
							if (confirm(`Деактивувати «${user.username}»? Доступ буде закрито, заявка з'явиться в списку очікування.`)) {
								updateUser.mutate({ id: user.id, data: { isActive: false } });
							}
						}}
					>
						Деактивувати
					</Button>
				)}
			</td>
			{(updateUser.isError || linkTelegram.isError) && (
				<td colSpan={5} className="pb-2">
					<p className="text-xs text-rose-400">{((updateUser.error ?? linkTelegram.error) as Error).message}</p>
				</td>
			)}
		</tr>
	);
}

export function UserManagement() {
	const { data: users, isLoading, isError, refetch } = useAdminUsers();
	const { user: currentUser } = useCurrentUser();

	const pending = users?.filter((u) => !u.isActive) ?? [];
	const active = users?.filter((u) => u.isActive) ?? [];
	// Джерела для об'єднання Telegram — лише непідтверджені заявки з бота
	// (username "tg_..."), обмеження те саме, що на бекенді (link_telegram)
	const telegramCandidates = pending.filter((u) => u.username.startsWith("tg_") && u.telegramId);

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-xl font-bold text-white">Користувачі</h1>

			{isLoading && <Spinner size="lg" label="Завантаження користувачів..." />}
			{isError && !isLoading && <ErrorBanner message="Не вдалось завантажити користувачів" onRetry={refetch} />}

			{!isLoading && !isError && (
				<>
					<section className="space-y-2">
						<h2 className="text-sm font-semibold text-white/80">
							Очікують підтвердження {pending.length > 0 && `(${pending.length})`}
						</h2>
						{pending.length === 0 ? (
							<p className="text-sm text-white/40">Немає заявок, що очікують підтвердження.</p>
						) : (
							<table className="w-full text-sm">
								<thead className="text-left text-white/50 border-b border-white/10">
									<tr>
										<th className="py-2">Юзернейм</th>
										<th className="py-2">Email</th>
										<th className="py-2">Роль (підтвердити як)</th>
										<th className="py-2">Заявка від</th>
										<th className="py-2">Дії</th>
									</tr>
								</thead>
								<tbody>
									{pending.map((u) => <PendingUserRow key={u.id} user={u} />)}
								</tbody>
							</table>
						)}
					</section>

					<section className="space-y-2">
						<h2 className="text-sm font-semibold text-white/80">Активні користувачі ({active.length})</h2>
						{active.length === 0 ? (
							<EmptyState title="Активних користувачів немає" />
						) : (
							<table className="w-full text-sm">
								<thead className="text-left text-white/50 border-b border-white/10">
									<tr>
										<th className="py-2">Юзернейм</th>
										<th className="py-2">Email</th>
										<th className="py-2">Роль</th>
										<th className="py-2">Картка водія</th>
										<th className="py-2">Telegram</th>
										<th className="py-2">Дії</th>
									</tr>
								</thead>
								<tbody>
									{active.map((u) => (
										<ActiveUserRow
											key={u.id}
											user={u}
											telegramCandidates={telegramCandidates}
											isSelf={u.id === currentUser?.id}
										/>
									))}
								</tbody>
							</table>
						)}
					</section>
				</>
			)}
		</div>
	);
}
