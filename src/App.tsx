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
import { MonthlyCostsList } from "./pages/admin/MonthlyCostsList";
import { MonthlyCostsForm } from "./pages/admin/MonthlyCostsForm";

// Далі будемо замінювати PlaceholderPage на реальні компоненти

export default function App() {
    return (
        <Routes>
            {/* ── Накладні ─────────────────────────────────── */}
            <Route path="/waybills" element={<MainLayout />}>
                <Route index element={<WaybillList />} />
                <Route path=":waybillNumber" element={<PlaceholderPage title="Деталі накладної" />} />
                <Route path="import" element={<PlaceholderPage title="Імпорт із 1С" />} />
                <Route path="unassigned" element={<PlaceholderPage title="Не призначені" />} />
                <Route path="returns" element={<PlaceholderPage title="Матчинг повернень" />} />
            </Route>

            {/* ── Служби доставки ──────────────────────────── */}
            <Route path="/carriers" element={<MainLayout />}>
                <Route index element={<PlaceholderPage title="Служби доставки" />} />
                <Route path="new" element={<PlaceholderPage title="Нове відправлення" />} />
                <Route path="import-costs" element={<PlaceholderPage title="Імпорт реєстру витрат" />} />
            </Route>

            {/* ── Аналітика ────────────────────────────────── */}
            <Route path="/analytics" element={<MainLayout />}>
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
            
            {/* Офісні розділи — logist/manager/head, той самий гейт на кожен */}
            <Route
                path="/fleet"
                element={
                    <RequireRole roles={["logist", "manager", "head"]}>
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

            {/* Найманий транспорт — окрема гілка/фаза від /admin (Фаза 19),
            спільний з нею лише цей файл */}
            <Route
                path="/hired"
                element={
                    <RequireRole roles={["logist", "manager", "head"]}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<HiredTripList />} />
                <Route path="new" element={<HiredTripForm />} />
                <Route path=":tripId" element={<HiredTripForm />} />
            </Route>

            {/* Адміністрування (Фаза 19) — окрема гілка від /hired вище
            (Фаза 18), спільний з нею лише цей файл */}
            <Route
                path="/admin"
                element={
                    <RequireRole roles={["logist", "manager", "head"]}>
                        <MainLayout />
                    </RequireRole>
                }
            >
                <Route index element={<PlaceholderPage title="Адміністрування" />} />
                <Route path="cars" element={<PlaceholderPage title="Авто" />} />
                <Route path="drivers" element={<PlaceholderPage title="Водії" />} />
                <Route path="products" element={<PlaceholderPage title="Товари" />} />
                <Route path="customers" element={<PlaceholderPage title="Клієнти" />} />
                <Route path="stores" element={<PlaceholderPage title="Магазини" />} />
                <Route path="monthly-costs" element={<MonthlyCostsList />} />
                <Route path="monthly-costs/new" element={<MonthlyCostsForm />} />
                <Route path="monthly-costs/:costId" element={<MonthlyCostsForm />} />
            </Route>
            {/* /waybills, /carriers, /analytics — та сама обгортка RequireRole, поки не реалізовані */}
            
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
