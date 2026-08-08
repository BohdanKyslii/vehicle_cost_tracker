import { useSearchParams} from "react-router-dom";
import type {
    WaybillFilters,
    SortParams,
    SortField,
    SortDirection,
    WaybillStatus,
    LegalEntity,
    DeliveryChannel
} from "../types";

// Зберігає фільтри у URL query string
// Переваги: фільтри не зникають при оновленні сторінки,
// можна поділитись посиланням з конкретним фільтром
export function useWaybillFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Зчитуємо фільтри з URL
    const filters: WaybillFilters = {
        search: searchParams.get("search") ?? undefined,
        status: (searchParams.get("status") as WaybillStatus) ?? undefined,
        deliveryChannel: (searchParams.get("channel") as DeliveryChannel | "unassigned" | "all") ?? undefined,
        legalEntity: (searchParams.get("legal") as LegalEntity) ?? undefined,
        lineType: (searchParams.get("line") as "shipment" | "return" | "all") ?? undefined,
        storeId: searchParams.get("storeId") ?? undefined,
        dateFrom: searchParams.get("from") ?? undefined,
        dateTo: searchParams.get("to") ?? undefined,
    };

    const sort: SortParams = {
        field: (searchParams.get("sortBy") as SortField) ?? "date",
        direction: (searchParams.get("sortDir") as SortDirection) ?? "desc",
    };

    const page = Number(searchParams.get("page") ?? "1");

    // Оновлення одного фільтру
    const setFilter = (key: string, value: string | undefined) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value) {
                next.set(key, value);
            } else {
                next.delete(key);
            }
            next.set("page", "1");  // при зміні фільтру — скидаємо на першу сторінку
            return next;
        });
    };

    const setSort = (field: SortField)=> {
        const currentDir = sort.field === field ? sort.direction : "asc";
        const newDir: SortDirection = currentDir === "asc" ? "desc" : "asc";
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("sortBy", field);
            next.set("sortDir", newDir);
            return next;
        });
    };

    const setPage = (p: number) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            next.set("page", String(p));
            return next;
        });
    };

    return { filters, sort, page, setFilter, setSort, setPage };
}
