interface EmptyStateProps {
    title: string;
    subtitle?: string;
    action?: React.ReactNode;   // опційна кнопка
}

export function EmptyState({ title, subtitle, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            {/* Іконка — великий символ */}
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {subtitle && (
                <p className="mt-1 text-sm text-white/50 max-w-sm">{subtitle}</p>
            )}
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}