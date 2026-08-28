// Record<Variant, string> — Tailwind класи для кожного варіанту кнопк
const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800",
    secondary: "bg-white/10 text-white hover:bg-white/15 active:bg-white/20",
    ghost: "text-white/70 hover:bg-white/5 hover:text-white active:bg-white/10",
    danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800",
};

const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof variantClasses;
    size?: keyof typeof sizeClasses;
    isLoading?: boolean;
    children: React.ReactNode;
}

// React.ButtonHTMLAttributes<HTMLButtonElement> — включаємо всі стандартні
// атрибути кнопки (onClick, disabled, type тощо)
// ...rest — spread operator: передаємо решту props у <button>
export function Button({
                           variant = "primary",
                           size = "md",
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
        inline-flex items-center justify-center gap-2
        rounded-lg font-medium
        transition-colors duration-150
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `.trim()}
            {...rest}
        >
            {isLoading && (
                // Маленький спіннер всередині кнопки
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
