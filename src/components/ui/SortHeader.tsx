interface SortHeaderProps {
    label: string;
    field: string;
    currentField: string;
    direction: "asc" | "desc";
    onSort: (field: string) => void;
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
            className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
            onClick={() => onSort(field)}
        >
            <div className="flex items-center gap-1">
                {label}
                {/* Іконка сортування */}
                <span className={`text-xs ${isActive ? "text-blue-600" : "text-gray-300"}`}>
          {isActive ? (direction === "asc" ? "▲" : "▼") : "⇅"}
        </span>
            </div>
        </th>
    );
}
