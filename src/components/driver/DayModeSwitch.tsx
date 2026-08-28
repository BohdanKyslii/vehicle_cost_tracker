import type { TrackingMode } from "../../types";

interface Props {
	mode: TrackingMode;
	onChange: (mode: TrackingMode) => void;
	isOverridden: boolean;
	// compact — менший розмір для розміщення поруч з карткою авто (дашборд водія)
	compact?: boolean;
}

export function DayModeSwitch({ mode, onChange, isOverridden, compact = false }: Props) {
	return (
		<div>
			<div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1">
				{(["daily", "full"] as const).map((m) => (
					<button
						key={m}
						type="button"
						onClick={() => onChange(m)}
						className={`rounded-full font-semibold transition-all ${compact ? "px-3 py-1.5 text-xs" : "px-5 py-2 text-sm"} ${
							mode === m
								? "bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-md shadow-violet-500/25"
								: "text-white/50 hover:text-white/80"
						}`}
					>
						{m === "daily" ? "Щоденний" : "Повний"}
					</button>
				))}
			</div>
			{isOverridden && (
				<p className="mt-2 text-xs text-amber-300/80">⚡ Змінено вручну на сьогодні</p>
			)}
		</div>
	);
}
