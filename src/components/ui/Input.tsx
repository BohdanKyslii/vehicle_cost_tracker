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
                <label htmlFor={inputId} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={inputId}
                className={`
          w-full rounded-lg border px-3 py-2 text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500
          ${error ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"}
          ${className}
        `.trim()}
                {...rest}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            {helpText && !error && <p className="text-xs text-gray-500">{helpText}</p>}
        </div>
    );
}
