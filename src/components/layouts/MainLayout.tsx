import { Outlet, NavLink } from "react-router-dom";

const navItems = [
    { to: "/fleet",     label: "Автопарк",      icon: "🚛" },
    { to: "/waybills",  label: "Накладні",       icon: "📄" },
    { to: "/hired",     label: "Найманий",       icon: "🔄" },
    { to: "/carriers",  label: "Служби",         icon: "📮" },
    { to: "/analytics", label: "Аналітика",      icon: "📊" },
    { to: "/admin",     label: "Адміністрування", icon: "⚙️" },
];

export function MainLayout() {
    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar — тільки на великих екранах (hidden на мобільному) */}
            <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col">
                <div className="p-4 border-b border-gray-200">
                    <h1 className="font-bold text-gray-800">Vehicle Tracker</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Облік витрат</p>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                                    ? "bg-blue-50 text-blue-700 font-medium"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`
                            }
                        >
                            <span>{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Основний контент */}
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
}
