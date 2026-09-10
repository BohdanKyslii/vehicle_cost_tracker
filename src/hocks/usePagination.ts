import { useEffect, useState } from "react";

export type PageSize = 25 | 50 | 100;

// Спільна клієнтська пагінація для довідників (Товари/Клієнти/Магазини/
// Категорії, /panel) — усі вони вже вантажать ПОВНИЙ список одним запитом
// (fetchAllPages у src/api/*.ts), тож "сторінки" тут — це просто зріз уже
// завантаженого масиву, без додаткових запитів до бекенду.
export function usePagination(totalItems: number, defaultPageSize: PageSize = 25) {
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState<PageSize>(defaultPageSize);

	// Скидаємо на першу сторінку, якщо через зміну фільтра/розміру сторінки
	// поточна сторінка більше не існує (інакше можна застрягти на порожній
	// сторінці після звуження фільтром)
	useEffect(() => {
		const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
		if (page > maxPage) setPage(maxPage);
	}, [totalItems, pageSize, page]);

	function changePageSize(size: PageSize) {
		setPageSize(size);
		setPage(1);
	}

	return { page, setPage, pageSize, setPageSize: changePageSize };
}
