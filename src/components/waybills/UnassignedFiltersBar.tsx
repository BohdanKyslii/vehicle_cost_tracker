import type { WaybillFilters } from "../../types";

interface UnassignedFiltersBarProps {
	filters: WaybillFilters;
	onChange: (key: string, value: string | undefined) => void;
}

// Спрощена панель фільтрів для "Не призначені" — лише те, що просив
// користувач (дата/клієнт/компанія). Канал тут завжди "unassigned"
// (сама суть сторінки), тому фільтр каналу/статусу не показуємо —
// на відміну від WaybillFiltersBar на повному реєстрі.
export function UnassignedFiltersBar({ filters, onChange }: UnassignedFiltersBarProps) {
	return (
		<div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4 space-y-3">
			<input
				type="search"
				placeholder="Пошук по клієнту або номеру накладної..."
				value={filters.search ?? ""}
				onChange={e => onChange("search", e.target.value || undefined)}
				className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
			/>

			<div className="flex flex-wrap items-center gap-2">
				<select
					value={filters.legalEntity ?? ""}
					onChange={e => onChange("legal", e.target.value || undefined)}
					className="rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="">Всі компанії</option>
					<option value="ESP">ESP</option>
					<option value="OPT">OPT</option>
					<option value="Rubin">Rubin</option>
				</select>

				<span className="text-xs text-white/50">Дата:</span>
				<input
					type="date"
					value={filters.dateFrom ?? ""}
					onChange={e => onChange("from", e.target.value || undefined)}
					className="rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [color-scheme:dark]"
				/>
				<span className="text-xs text-white/30">—</span>
				<input
					type="date"
					value={filters.dateTo ?? ""}
					onChange={e => onChange("to", e.target.value || undefined)}
					className="rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [color-scheme:dark]"
				/>

				{(filters.search || filters.legalEntity || filters.dateFrom || filters.dateTo) && (
					<button
						onClick={() => {
							["search", "legal", "from", "to"].forEach(k => onChange(k, undefined));
						}}
						className="px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10 rounded-lg"
					>
						Скинути фільтри
					</button>
				)}
			</div>
		</div>
	);
}
