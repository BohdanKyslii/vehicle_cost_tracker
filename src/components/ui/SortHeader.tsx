import type { SortField } from "../../types";

interface SortHeaderProps {
    label: string;
    field: SortField;
    currentField: SortField;
    direction: "asc" | "desc";
    onSort: (field: SortField) => void;
}

export function SortHeader({
    label,
    field,
    currentField,
    direction,
    onSort
}: SortHeaderProps) {
    const isActive = field === currentField;

    return (
        <th
            className="px-4 py-3 text-left text-xs font-medium text-white/50 uppercase tracking-wider cursor-pointer hover:bg-white/5 select-none"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                {/* Іконка сортування */}
                <span className={`text-xs ${isActive ? "text-violet-300" : "text-white/20"}`}>
          {isActive ? (direction === "asc" ? "▲" : "▼") : "⇅"}
        </span>
            </div>
        </th>
    );
}
