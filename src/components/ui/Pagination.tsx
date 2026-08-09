interface PaginationProps {
    total: number;
    page: number;
    pageSize: number;
    onChange: (page: number) => void;
}

const WINDOW_SIZE = 5;

export function Pagination({ total, page, pageSize, onChange }: PaginationProps) {
    const totalPage = Math.ceil(total / pageSize);

    // Не показуємо якщо сторінка одна
    if (totalPage < 1) return null;

    // Ковзне вікно з WINDOW_SIZE номерів навколо поточної сторінки,
    // притиснуте до країв [1, totalPage]
    const half = Math.floor(WINDOW_SIZE / 2);
    const start = Math.max(1, Math.min(page - half, totalPage - WINDOW_SIZE + 1));
    const end = Math.min(totalPage, start + WINDOW_SIZE - 1);
    const pages = Array.from({ length: end - start + 1 }).map((_, i) => start + i);

    return (
        <div className="grid grid-cols-3 items-center py-3">
            {/* Інформація: "1-10 з 47" */}
            <span className="text-sm text-white/50 justify-self-start">
        {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} з {total}
      </span>

            {/* Кнопки навігації — по центру рядка */}
            <div className="flex gap-1 justify-self-center col-start-2">
                <button
                    onClick={() => onChange(1)}
                    disabled={page === 1}
                    className="px-2 py-1 rounded text-sm text-white/70 disabled:opacity-40 hover:bg-white/10"
                    title="Перша сторінка"
                >
                    «
                </button>
                <button
                    onClick={() => onChange(page - 1)}
                    disabled={page === 1}
                    className="px-2 py-1 rounded text-sm text-white/70 disabled:opacity-40 hover:bg-white/10"
                    title="Попередня сторінка"
                >
                    ‹
                </button>

                {pages.map(p => (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`px-3 py-1 rounded text-sm ${
                            p === page
                                ? "bg-violet-600 text-white"
                                : "hover:bg-white/10 text-white/70"
                        }`}
                    >
                        {p}
                    </button>
                ))}

                <button
                    onClick={() => onChange(page + 1)}
                    disabled={page === totalPage}
                    className="px-2 py-1 rounded text-sm text-white/70 disabled:opacity-40 hover:bg-white/10"
                    title="Наступна сторінка"
                >
                    ›
                </button>
                <button
                    onClick={() => onChange(totalPage)}
                    disabled={page === totalPage}
                    className="px-2 py-1 rounded text-sm text-white/70 disabled:opacity-40 hover:bg-white/10"
                    title="Остання сторінка"
                >
                    »
                </button>
            </div>
        </div>
    );
}
