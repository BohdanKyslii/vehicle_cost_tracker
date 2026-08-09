// Record<string, string> — тип для словника рядків
const sizeClasses: Record<string, string> = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
};

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    label?: string;
}

// SVG анімований спіннер
// animate-spin — Tailwind клас для анімації обертання
export function Spinner({ size = "md", label = "Завантаження..." }: SpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <svg
                className={`animate-spin text-violet-300 ${sizeClasses[size]}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-label={label}
            >
                <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                />
                <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
            </svg>
            {label && <span className="text-sm text-white/50">{label}</span>}
        </div>
    );
}