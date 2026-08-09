interface PaginationProps {
    total: number;
    page: number;
    pageSize: number;
    onChange: (page: number) => void;
}

export function Pagination({ total, page, pageSize, onChange }: PaginationProps) {
    const totalPage = Math.ceil(total / pageSize);

    // Не показуємо якщо сторінка одна
    if (totalPage < 1) return null;

    // Генеруємо масив номерів сторінок
    // Array.from({ length: n }, (_, i) => i + 1) → [1, 2, 3, ..., n]
    const pages = Array.from({ length: totalPage }).map((_, i) => i+1);

    return (
        <div className="flex items-center justify-between py-3">
            {/* Інформація: "1-10 з 47" */}
            <span className="text-sm text-gray-500">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} з {total}
      </span>

            {/* Кнопки навігації */}
            <div className="flex gap-1">
                <button
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                    className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                    ‹
                </button>

                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`px-3 py-1 rounded text-sm ${
                            p === page
                                ? "bg-blue-600 text-white"
                                : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                        {p}
                    </button>
                ))}

                <button
                    onClick={() => onChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-100"
                >
                    ›
                </button>
            </div>
        </div>
    );
}
