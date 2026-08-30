// src/App.tsx
import { Routes, Route } from "react-router-dom";
import { DriverLayout } from "./components/layouts/DriverLayout";
import { DriverDashboard } from "./pages/driver/DriverDashboard";
import { EventForm } from "./pages/driver/EventForm";
import { MainLayout } from "./components/layouts/MainLayout";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { WaybillList } from "./components/waybills/WaybillList";
import {DriverMiniApp } from "./pages/DriverMiniApp.tsx";
import { RequireRole } from "./components/auth/RequireRole";
import { RoleRedirect } from "./pages/RoleRedirect";
import { DriverHistory } from "./pages/driver/DriverHistory";
import { EventDetail } from "./pages/driver/EventDetail";
import { FleetList } from "./pages/fleet/FleetList";
import { CarForm } from "./pages/fleet/CarForm";
import { DriverForm } from "./pages/fleet/DriverForm";
import { HiredTripList } from "./pages/hired/HiredTripList";
import { HiredTripForm } from "./pages/hired/HiredTripForm";
import { MonthlyCostsList } from "./pages/costs/MonthlyCostsList";
import { MonthlyCostsForm } from "./pages/costs/MonthlyCostsForm";
import { BulkMonthlyCostsForm } from "./pages/costs/BulkMonthlyCostsForm";
import { PanelHome } from "./pages/panel/PanelHome";
import { rolesForRoute } from "./utils/roleAccess";

// Далі будемо замінювати PlaceholderPage на реальні компоненти

export default function App() {
    return (
        <Routes>
            {/* ── Накладні — тільки manager/head (логіст сюди не ходить) ─── */}
            <Route
                path="/waybills"
                element={
                    <RequireRole roles={rolesForRoute("/waybills")}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<WaybillList />} />
                <Route path=":waybillNumber" element={<PlaceholderPage title="Деталі накладної" />} />
                <Route path="import" element={<PlaceholderPage title="Імпорт із 1С" />} />
                <Route path="unassigned" element={<PlaceholderPage title="Не призначені" />} />
                <Route path="returns" element={<PlaceholderPage title="Матчинг повернень" />} />
            </Route>

            {/* ── Служби доставки ──────────────────────────── */}
            <Route
                path="/carriers"
                element={
                    <RequireRole roles={rolesForRoute("/carriers")}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<PlaceholderPage title="Служби доставки" />} />
                <Route path="new" element={<PlaceholderPage title="Нове відправлення" />} />
                <Route path="import-costs" element={<PlaceholderPage title="Імпорт реєстру витрат" />} />
            </Route>

            {/* ── Аналітика ────────────────────────────────── */}
            <Route
                path="/analytics"
                element={
                    <RequireRole roles={rolesForRoute("/analytics")}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<PlaceholderPage title="Аналітика" />} />
                <Route path="transport-costs" element={<PlaceholderPage title="Транспортна собівартість" />} />
                <Route path="customers" element={<PlaceholderPage title="По клієнтах" />} />
                <Route path="channels" element={<PlaceholderPage title="Порівняння каналів" />} />
            </Route>

            <Route path="/" element={<RoleRedirect />} />
            
            {/* Водій — мобільний, лишається доступним і для head (тестування/підтримка) */}
            <Route
                path="/driver"
                element={
                    <RequireRole roles={["driver", "head"]}>
                        <DriverLayout />
                    </RequireRole>
                }
            >
                <Route index element={<DriverDashboard />} />
                <Route path="event/new" element={<EventForm />} />
                <Route path="event/:eventId" element={<EventDetail />} />
                <Route path="history" element={<DriverHistory />} />
            </Route>
            
            {/* Автопарк — тільки logist/head (менеджер сюди не ходить) */}
            <Route
                path="/fleet"
                element={
                    <RequireRole roles={rolesForRoute("/fleet")}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<FleetList />} />
                <Route path="new" element={<CarForm />} />
                <Route path="drivers/new" element={<DriverForm />} />
                <Route path="drivers/:driverId" element={<DriverForm />} />
                <Route path=":carId" element={<CarForm />} />
            </Route>

            {/* Найманий транспорт — доступний усім трьом офісним ролям */}
            <Route
                path="/hired"
                element={
                    <RequireRole roles={rolesForRoute("/hired")}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<HiredTripList />} />
                <Route path="new" element={<HiredTripForm />} />
                <Route path=":tripId" element={<HiredTripForm />} />
            </Route>

            {/* Витрати по своїх авто — окремий розділ, не під /panel: ним
            щодня користується логіст, а /panel нижче — лише для head */}
            <Route
                path="/costs"
                element={
                    <RequireRole roles={rolesForRoute("/costs")}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<MonthlyCostsList />} />
                <Route path="new" element={<MonthlyCostsForm />} />
                <Route path="bulk" element={<BulkMonthlyCostsForm />} />
                <Route path=":costId" element={<MonthlyCostsForm />} />
            </Route>

            {/* Адміністрування — кастомний UI замість Django admin, тільки
            head. НЕ "/admin": nginx на проді проксіює "/admin/" напряму
            на Django admin (nginx.conf) — SPA-роут з такою назвою був би
            недосяжний */}
            <Route
                path="/panel"
                element={
                    <RequireRole roles={rolesForRoute("/panel")}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<PanelHome />} />
                <Route path="cars" element={<PlaceholderPage title="Авто" />} />
                <Route path="drivers" element={<PlaceholderPage title="Водії" />} />
                <Route path="products" element={<PlaceholderPage title="Товари" />} />
                <Route path="customers" element={<PlaceholderPage title="Клієнти" />} />
                <Route path="stores" element={<PlaceholderPage title="Магазини" />} />
            </Route>

            {/* Telegram Mini App — залишається ЄДИНИМ маршрутом, без RequireRole
            (сам логінить через initData ще до того, як роль відома) */}
            <Route path="/driver-app" element={<DriverMiniApp />} />

            {/* 404 */}
            <Route path="*" element={
                <div className="p-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-400">404</h2>
                    <p className="text-gray-500 mt-2">Сторінку не знайдено</p>
                </div>
            } />
        </Routes>
    );
}
