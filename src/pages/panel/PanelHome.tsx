import { Link } from "react-router-dom";

// Кастомний адмін-розділ застосунку (не Django admin — той на "/admin/",
// проксійований nginx-ом напряму на бекенд, звідси інша назва шляху,
// "/panel"). Доступ лише для head — усе, чим користується логіст щодня
// (Автопарк, Витрати, Найманий...), живе окремими верхньорівневими
// розділами, не тут.
// "Автопарк" веде на /fleet, а не на окремі /panel-сторінки — це вже
// повнофункціональне керування авто ТА водіями (CarForm/FleetList/
// DriverForm, Фаза 16), дублювати його тут не було сенсу.
const sections = [
	{ to: "/fleet", label: "Автопарк (авто, водії)", icon: "🚛", ready: true },
	{ to: "/panel/events", label: "Події водіїв", icon: "🧾", ready: true },
	{ to: "/panel/products", label: "Товари", icon: "📦", ready: true },
	{ to: "/panel/customers", label: "Клієнти", icon: "🧑‍💼", ready: true },
	{ to: "/panel/stores", label: "Магазини", icon: "🏬", ready: true },
	{ to: "/panel/users", label: "Користувачі", icon: "👤", ready: true },
];

export function PanelHome() {
	return (
		<div className="p-6 space-y-4">
			<h1 className="text-xl font-bold text-white">Адміністрування</h1>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{sections.map(({ to, label, icon, ready }) => (
					<Link
						key={to + label}
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
