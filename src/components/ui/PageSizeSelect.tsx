import type { PageSize } from "../../hocks/usePagination";

const OPTIONS: PageSize[] = [25, 50, 100];

interface PageSizeSelectProps {
	value: PageSize;
	onChange: (size: PageSize) => void;
}

export function PageSizeSelect({ value, onChange }: PageSizeSelectProps) {
	return (
		<label className="flex items-center gap-2 text-xs text-white/50">
			Рядків на сторінці
			<select
				value={value}
				onChange={(e) => onChange(Number(e.target.value) as PageSize)}
				className="rounded-lg border border-white/10 bg-white/5 text-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-violet-400 [&>option]:bg-slate-900 [&>option]:text-white"
			>
				{OPTIONS.map((n) => (
					<option key={n} value={n}>{n}</option>
				))}
			</select>
		</label>
	);
}
