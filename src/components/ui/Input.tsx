// InputHTMLAttributes<HTMLInputElement> — типи всіх стандартних атрибутів input
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
}

export function Input({ label, error, helpText, id, className = "", ...rest }: InputProps) {
    // Генеруємо унікальний id якщо не передано
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={inputId} className="text-sm font-medium text-white/70">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full rounded-lg border px-3 py-2 text-sm text-white bg-white/5
          placeholder:text-white/30 transition-colors
          focus:outline-none focus:ring-2 focus:ring-violet-400
          disabled:opacity-40 disabled:cursor-not-allowed
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
