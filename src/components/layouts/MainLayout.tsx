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
        <div
            className="min-h-screen flex text-white"
            style={{ background: "linear-gradient(180deg, #2b1330 0%, #0f1724 100%)" }}
        >
            {/* Sidebar — тільки на великих екранах (hidden на мобільному) */}
            <aside className="hidden md:flex w-56 backdrop-blur-md bg-white/5 border-r border-white/10 flex-col">
                <div className="p-4 border-b border-white/10">
                    <h1 className="font-bold bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                        Vehicle Tracker
                    </h1>
                    <p className="text-xs text-white/50 mt-0.5">Облік витрат</p>
                </div>
                <nav className="flex-1 p-2 space-y-1">
                    {navItems.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                ${isActive
                                    ? "bg-white/10 text-violet-300 font-medium"
                                    : "text-white/60 hover:bg-white/5 hover:text-white"
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
