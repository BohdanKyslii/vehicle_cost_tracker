import type {
	WaybillFilters,
} from "../../types";

interface WaybillFiltersBarProps {
	filters: WaybillFilters;
	onChange: (key: string, value: string | undefined) => void;
}

export function WaybillFiltersBar({ filters, onChange }: WaybillFiltersBarProps) {
	return (
		<div className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4 space-y-3">
			{/* Пошук */}
			<input
				type="search"
				placeholder="Пошук по клієнту або номеру накладної..."
				value={filters.search ?? ""}
				onChange={e => onChange("search", e.target.value || undefined)}
				className="w-full rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
			/>
			
			{/* Рядок фільтрів */}
			<div className="flex flex-wrap gap-2">
				{/* Статус */}
				<select
					value={filters.status ?? ""}
					onChange={e => onChange("status", e.target.value || undefined)}
					className="rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="">Всі статуси</option>
					<option value="pending">Очікує</option>
					<option value="scanned">Відскановано</option>
					<option value="delivered">Доставлено</option>
					<option value="cancelled">Скасовано</option>
				</select>
				
				{/* Канал доставки */}
				<select
					value={filters.deliveryChannel ?? ""}
					onChange={e => onChange("channel", e.target.value || undefined)}
					className="rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="">Всі канали</option>
					<option value="own">Власне авто</option>
					<option value="hired">Найманий транспорт</option>
					<option value="carrier">Служба доставки</option>
					<option value="unassigned">⚠️ Не призначено</option>
				</select>
				
				{/* Юридична особа */}
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
				
				{/* Тип рядка */}
				<select
					value={filters.lineType ?? ""}
					onChange={e => onChange("line", e.target.value || undefined)}
					className="rounded-lg border border-white/10 bg-white/5 text-white placeholder:text-white/30 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
				>
					<option value="">Відвантаження і повернення</option>
					<option value="shipment">Тільки відвантаження</option>
					<option value="return">Тільки повернення</option>
				</select>
				
				{/* Кнопка скидання */}
				{Object.values(filters).some(Boolean) && (
					<button
						onClick={() => {
							// Скидаємо всі фільтри
							["search", "status", "channel", "legal", "line", "store", "from", "to"].forEach(
								k => onChange(k, undefined)
							);
						}}
						className="px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10 rounded-lg"
					>
						Скинути фільтри
					</button>
				)}
			</div>
			
			{/* Дати */}
			<div className="flex gap-2 items-center">
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
			</div>
		</div>
	);
}
