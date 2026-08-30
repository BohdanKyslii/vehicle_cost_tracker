import { Link } from "react-router-dom";

// Кастомний адмін-розділ застосунку (не Django admin — той на "/admin/",
// проксійований nginx-ом напряму на бекенд, звідси інша назва шляху,
// "/panel"). Доступ лише для head — усе, чим користується логіст щодня
// (Автопарк, Витрати, Найманий...), живе окремими верхньорівневими
// розділами, не тут. Поки всі пункти нижче — PlaceholderPage-заглушки
// (Крок 6-8 "Що далі" CODING_GUIDE.md), `ready` вмикати по мірі готовності.
const sections = [
	{ to: "/panel/cars", label: "Авто", icon: "🚛", ready: false },
	{ to: "/panel/drivers", label: "Водії", icon: "🧑‍✈️", ready: false },
	{ to: "/panel/products", label: "Товари", icon: "📦", ready: false },
	{ to: "/panel/customers", label: "Клієнти", icon: "🧑‍💼", ready: false },
	{ to: "/panel/stores", label: "Магазини", icon: "🏬", ready: false },
];

export function PanelHome() {
	return (
		<div className="p-6 space-y-4">
			<h1 className="text-xl font-bold text-white">Адміністрування</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{sections.map(({ to, label, icon, ready }) => (
					<Link
						key={to}
						to={to}
						className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors
              ${ready
							? "border-white/10 bg-white/5 hover:bg-white/10 text-white"
							: "border-white/5 bg-white/[0.02] text-white/40 hover:text-white/60"
						}`}
					>
						<span className="text-xl">{icon}</span>
						<span className="text-sm font-medium">{label}</span>
						{!ready && <span className="ml-auto text-xs text-white/30">скоро</span>}
					</Link>
				))}
			</div>
		</div>
	);
}
