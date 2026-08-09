interface ErrorBannerProps {
    message?: string;
    onRetry?: () => void;
}

export function ErrorBanner({
                                message = "Сталася помилка. Спробуйте ще раз.",
                                onRetry,
                            }: ErrorBannerProps) {
    return (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <span className="text-red-500 text-xl">⚠️</span>
            <div className="flex-1">
                <p className="text-sm text-red-700">{message}</p>
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                    >
                        Повторити
                    </button>
                )}
            </div>
        </div>
    );
}
