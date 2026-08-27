import { Outlet, NavLink } from "react-router-dom";

export function DriverLayout() {
    return (
        <div
            className="min-h-screen flex flex-col text-white"
            style={{ background: "linear-gradient(180deg, #2b1330 0%, #0f1724 100%)" }}
        >
            {/* Header — скляна панель поверх градієнта (backdrop-blur) */}
            <header className="sticky top-0 z-10 backdrop-blur-md bg-white/5 border-b border-white/10 px-5 py-4 flex items-center justify-between">
                <h1 className="font-bold text-lg flex items-center gap-2">
                    <span className="text-xl">🚛</span>
                    <span className="bg-gradient-to-r from-violet-300 to-pink-300 bg-clip-text text-transparent">
            Vehicle Tracker
          </span>
                </h1>
                <span className="text-sm text-white/50">
          {new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "long" })}
        </span>
            </header>

            {/* Основний контент */}
            {/* max-w-md — максимальна ширина для мобільного вигляду */}
            {/* mx-auto — центрування на великих екранах */}
            {/* pb-24 — відступ знизу щоб контент не перекривався bottom nav */}
            <main className="flex-1 w-full max-w-md mx-auto px-4 py-5 pb-24">
                <Outlet />
            </main>

            {/* Bottom Navigation — скляна панель, активний пункт — акцентний колір */}
            <nav className="fixed bottom-0 left-0 right-0 backdrop-blur-md bg-[#0f1724]/90 border-t border-white/10">
                <div className="max-w-md mx-auto flex">
                    {[
                        { to: "/driver", label: "Маршрут", icon: "🗺️", exact: true },
                        { to: "/driver/history", label: "Історія", icon: "📋", exact: false },
                    ].map(({ to, label, icon, exact }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={exact}  // end=true → активний тільки при точному збігу URL
                            className={({ isActive }) =>
                                `flex-1 flex flex-col items-center py-2.5 gap-0.5 text-xs transition-colors
                ${isActive ? "text-violet-300 font-semibold" : "text-white/40"}`
                            }
                        >
                            <span className="text-xl">{icon}</span>
                            {label}
                        </NavLink>
                    ))}
                </div>
            </nav>
        </div>
    );
}
