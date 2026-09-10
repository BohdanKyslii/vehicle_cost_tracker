import { useState } from "react";

interface FilterableHeaderProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
	// Якщо задано — рендериться <select> з цими варіантами (для колонок з
	// невеликою множиною значень, напр. категорія/напрямок), інакше — вільний
	// текстовий пошук "містить"
	options?: string[];
	placeholder?: string;
}

// Клік по заголовку колонки відкриває/ховає інлайн-фільтр прямо під ним —
// той самий рядок <th>, без окремого рядка фільтрів над таблицею.
// Крапка біля назви — ознака, що фільтр цієї колонки зараз активний,
// навіть коли поле згорнуте.
export function FilterableHeader({ label, value, onChange, options, placeholder }: FilterableHeaderProps) {
	const [open, setOpen] = useState(false);
	const active = value !== "";

	return (
		<th className="py-2 align-top font-normal">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={`flex items-center gap-1 font-medium hover:text-white ${active ? "text-violet-300" : "text-white/50"}`}
			>
				{label}
				{active && <span className="text-violet-400">●</span>}
				<span className="text-white/30">▾</span>
			</button>
			{open && (
				options ? (
					<select
						value={value}
						onChange={(e) => onChange(e.target.value)}
						autoFocus
						className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
					>
						<option value="">Всі</option>
						{options.map((o) => (
							<option key={o} value={o}>{o}</option>
						))}
					</select>
				) : (
					<input
						type="text"
						value={value}
						onChange={(e) => onChange(e.target.value)}
						placeholder={placeholder}
						autoFocus
						className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-xs font-normal focus:outline-none focus:ring-2 focus:ring-violet-400"
					/>
				)
			)}
		</th>
	);
}
