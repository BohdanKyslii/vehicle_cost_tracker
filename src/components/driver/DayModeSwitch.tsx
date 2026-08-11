import type { TrackingMode } from "../../types";

interface Props {
	mode: TrackingMode;
	onChange: (mode: TrackingMode) => void;
	isOverridden: boolean;
}

export function DayModeSwitch({ mode, onChange, isOverridden }: Props) {
	return (
		<div>
			<div className="inline-flex rounded-full bg-white/5 border border-white/10 p-1">
				{(["daily", "full"] as const).map((m) => (
					<button
						key={m}
						type="button"
						onClick={() => onChange(m)}
						className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
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
