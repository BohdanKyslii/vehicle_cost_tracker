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
		<div className={compact ? "flex flex-col items-end" : undefined}>
			{/* compact (дашборд водія, поруч з карткою авто) — вертикальний стек,
			    щоб перемикач не розширював картку по горизонталі */}
			<div className={`inline-flex bg-white/5 border border-white/10 p-1 ${compact ? "flex-col gap-0.5 rounded-xl" : "rounded-full"}`}>
				{(["daily", "full"] as const).map((m) => (
					<button
						key={m}
						type="button"
						onClick={() => onChange(m)}
						className={`font-semibold transition-all ${compact ? "px-3 py-1 text-xs rounded-lg" : "px-5 py-2 text-sm rounded-full"} ${
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
				<p className={`mt-2 text-xs text-amber-300/80 ${compact ? "text-right" : ""}`}>⚡ Змінено вручну</p>
			)}
		</div>
	);
}
