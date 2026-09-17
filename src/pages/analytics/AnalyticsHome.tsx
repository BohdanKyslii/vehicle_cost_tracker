import { Link } from "react-router-dom";

// Хаб аналітики — 7 розрізів, які просив користувач (2026-09-17).
// Лише "Авто" повноцінна зараз — решта чекають на методологію
// розподілу вартості/дані ваги-об'єму (ProductLogistics), обговорюємо
// по одному розрізу за раз, а не вгадуємо все наперед.
const sections = [
	{ to: "/analytics/cars", label: "Авто", icon: "🚛", ready: true },
	{ to: "/analytics/carriers", label: "Служби доставки", icon: "🏢", ready: false },
	{ to: "/analytics/hired", label: "Найманий транспорт", icon: "📦", ready: false },
	{ to: "/analytics/companies", label: "Компанії", icon: "🏭", ready: false },
	{ to: "/analytics/categories", label: "Категорії", icon: "🗂️", ready: false },
	{ to: "/analytics/products", label: "Товари", icon: "🛒", ready: false },
	{ to: "/analytics/customers", label: "Клієнти", icon: "👥", ready: false },
];

export function AnalyticsHome() {
	return (
		<div className="p-6 space-y-4">
			<div>
				<h1 className="text-xl font-bold text-white">Аналітика</h1>
				<p className="text-sm text-white/50 mt-1">
					Вартість доставки і її вплив на вартість доставленого — по сумі, кількості
					(вага/об'єм — після заповнення довідника товарів).
				</p>
			</div>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
						{!ready && <span className="ml-auto text-xs text-white/30">в розробці</span>}
					</Link>
				))}
			</div>
		</div>
	);
}
