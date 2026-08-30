import { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useCurrentUser } from "../../hocks/useCurrentUser";
import { ROLE_ROUTES } from "../../utils/roleAccess";

const allNavItems = [
    { to: "/fleet",     label: "Автопарк",      icon: "🚛" },
    { to: "/costs",     label: "Витрати",        icon: "🧾" },
    { to: "/waybills",  label: "Накладні",       icon: "📄" },
    { to: "/hired",     label: "Найманий",       icon: "🔄" },
    { to: "/carriers",  label: "Служби",         icon: "📮" },
    { to: "/analytics", label: "Аналітика",      icon: "📊" },
    { to: "/panel",     label: "Адміністрування", icon: "⚙️" },
];

export function MainLayout() {
    const { user } = useCurrentUser();
    const [menuOpen, setMenuOpen] = useState(false);

    // Той самий ROLE_ROUTES, що гейтує самі маршрути в App.tsx (RequireRole) —
    // тут лише фільтрує видимий список посилань, одне джерело правди на обидва.
    const allowed = user?.profile ? ROLE_ROUTES[user.profile.role] : [];
    const navItems = allNavItems.filter((item) => allowed.includes(item.to));

    return (
        <div
            className="min-h-screen flex flex-col md:flex-row text-white"
            style={{ background: "linear-gradient(180deg, #2b1330 0%, #0f1724 100%)" }}
        >
            {/* Мобільний хедер з гамбургером — тільки < md, на десктопі його
            заміняє бічне меню нижче */}
            <header className="md:hidden sticky top-0 z-20 backdrop-blur-md bg-white/5 border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <h1 className="font-bold text-sm bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
                    Vehicle Tracker
                </h1>
                <button
                    onClick={() => setMenuOpen((v) => !v)}
                    className="text-white/70 text-2xl leading-none px-1"
                    aria-label={menuOpen ? "Закрити меню" : "Відкрити меню"}
                >
                    {menuOpen ? "✕" : "☰"}
                </button>
            </header>

            {/* Випадне меню на мобільному — той самий список посилань, що
            й бічне меню на десктопі, звужений за роллю (NAV_BY_ROLE) */}
            {menuOpen && (
                <nav className="md:hidden bg-[#0f1724]/95 backdrop-blur-md border-b border-white/10 px-2 py-2 space-y-1">
                    {navItems.map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            onClick={() => setMenuOpen(false)}
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
            )}

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
