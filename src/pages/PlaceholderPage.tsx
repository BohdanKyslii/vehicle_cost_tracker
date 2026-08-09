// Тимчасова заглушка — замінимо на реальні сторінки пізніше

interface PlaceholderProps {
    title: string;
}

export function PlaceholderPage({ title }: PlaceholderProps) {
    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="mt-2 text-white/50">Сторінка в розробці...</p>
        </div>
    );
}
