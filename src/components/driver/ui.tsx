import type { ReactNode } from "react";

// ── Button ──────────────────────────────────────────────
const variantClasses = {
	primary:
		"bg-gradient-to-r from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/25 hover:opacity-90 active:scale-[0.98]",
	ghost: "text-white/70 hover:bg-white/5 hover:text-white active:scale-[0.98]",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: keyof typeof variantClasses;
	isLoading?: boolean;
	children: ReactNode;
}

export function Button({
	                       variant = "primary",
	                       isLoading = false,
	                       children,
	                       disabled,
	                       className = "",
	                       ...rest
                       }: ButtonProps) {
	return (
		<button
			disabled={disabled || isLoading}
			className={`
        inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm
        rounded-xl font-semibold transition-all duration-150
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantClasses[variant]} ${className}
      `.trim()}
			{...rest}
		>
			{isLoading && (
				<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
					<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
					<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
				</svg>
			)}
			{children}
		</button>
	);
}

// ── Input ───────────────────────────────────────────────
// Той самий .field-wrap патерн, що й у AuthModal (landing.css),
// перенесений у Tailwind: rgba(255,255,255,.05) фон, тонка світла рамка.
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: string;
	helpText?: string;
}

export function Input({ label, error, helpText, id, className = "", ...rest }: InputProps) {
	const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
	return (
		<div className="flex flex-col gap-1.5">
			{label && (
				<label htmlFor={inputId} className="text-sm font-medium text-white/70">
					{label}
				</label>
			)}
			<input
				id={inputId}
				className={`
          w-full rounded-xl px-4 py-3 text-sm text-white bg-white/5 border transition-colors
          placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/40
          ${error ? "border-rose-400/60 bg-rose-500/5" : "border-white/10 focus:border-violet-400/60"}
          ${className}
        `.trim()}
				{...rest}
			/>
			{error && <p className="text-xs text-rose-400">{error}</p>}
			{helpText && !error && <p className="text-xs text-white/40">{helpText}</p>}
		</div>
	);
}

// ── Spinner ─────────────────────────────────────────────
export function Spinner({ size = "md", label = "Завантаження..." }: { size?: "sm" | "md" | "lg"; label?: string }) {
	const sizeClasses = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };
	return (
		<div className="flex flex-col items-center justify-center gap-3 py-6">
			<svg className={`animate-spin text-violet-400 ${sizeClasses[size]}`} viewBox="0 0 24 24" fill="none" aria-label={label}>
				<circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
				<path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
			</svg>
			{label && <span className="text-sm text-white/40">{label}</span>}
		</div>
	);
}

// ── EmptyState ──────────────────────────────────────────
export function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
	return (
		<div className="flex flex-col items-center justify-center py-14 text-center rounded-2xl bg-white/[0.03] border border-white/5">
			<div className="text-5xl mb-4 opacity-80">📭</div>
			<h3 className="text-base font-semibold text-white/90">{title}</h3>
			{subtitle && <p className="mt-1 text-sm text-white/40 max-w-xs">{subtitle}</p>}
		</div>
	);
}

// ── ErrorBanner ─────────────────────────────────────────
export function ErrorBanner({ message = "Сталася помилка. Спробуйте ще раз." }: { message?: string }) {
	return (
		<div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 flex items-start gap-3">
			<span className="text-rose-400 text-xl">⚠️</span>
			<p className="text-sm text-rose-200">{message}</p>
		</div>
	);
}
