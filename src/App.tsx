// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { DriverLayout } from "./components/layouts/DriverLayout";
import { MainLayout } from "./components/layouts/MainLayout";
import { PlaceholderPage } from "./pages/PlaceholderPage";
import { WaybillList } from "./components/waybills/WaybillList";
import { DriverMiniApp } from "./pages/DriverMiniApp";

// Далі будемо замінювати PlaceholderPage на реальні компоненти

export default function App() {
    return (
        <Routes>
            {/* ── Водій (мобільний) ────────────────────────── */}
            <Route path="/driver" element={<DriverLayout />}>
                <Route index element={<PlaceholderPage title="Маршрут водія" />} />
                <Route path="event/new" element={<PlaceholderPage title="Нова подія" />} />
                <Route path="scan" element={<PlaceholderPage title="Сканер QR" />} />
                <Route path="history" element={<PlaceholderPage title="Історія" />} />
            </Route>

            {/* ── Автопарк ─────────────────────────────────── */}
            <Route path="/fleet" element={<MainLayout />}>
                <Route index element={<PlaceholderPage title="Автопарк" />} />
                <Route path=":carId" element={<PlaceholderPage title="Деталі авто" />} />
            </Route>

            {/* ── Накладні ─────────────────────────────────── */}
            <Route path="/waybills" element={<MainLayout />}>
                <Route index element={<WaybillList />} />
                <Route path=":waybillNumber" element={<PlaceholderPage title="Деталі накладної" />} />
                <Route path="import" element={<PlaceholderPage title="Імпорт із 1С" />} />
                <Route path="unassigned" element={<PlaceholderPage title="Не призначені" />} />
                <Route path="returns" element={<PlaceholderPage title="Матчинг повернень" />} />
            </Route>

            {/* ── Найманий транспорт ───────────────────────── */}
            <Route path="/hired" element={<MainLayout />}>
                <Route index element={<PlaceholderPage title="Найманий транспорт" />} />
                <Route path="new" element={<PlaceholderPage title="Новий рейс" />} />
                <Route path=":tripId" element={<PlaceholderPage title="Деталі рейсу" />} />
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

            {/* ── Адміністрування ──────────────────────────── */}
            <Route path="/admin" element={<MainLayout />}>
                <Route index element={<PlaceholderPage title="Адміністрування" />} />
                <Route path="cars" element={<PlaceholderPage title="Авто" />} />
                <Route path="drivers" element={<PlaceholderPage title="Водії" />} />
                <Route path="products" element={<PlaceholderPage title="Товари" />} />
                <Route path="customers" element={<PlaceholderPage title="Клієнти" />} />
                <Route path="stores" element={<PlaceholderPage title="Магазини" />} />
                <Route path="monthly-costs" element={<PlaceholderPage title="Місячні витрати" />} />
            </Route>

            {/* ⚠️ НЕ ВИДАЛЯТИ при рефакторингу роутів (вже двічі губили при
                переписуванні App.tsx — d792cfa, 2026-08-10 фікс). Це реальний
                продакшн-маршрут: BotFather Menu Button у @driver_car_bot
                веде саме сюди. Telegram Mini App — логінить через initData,
                окремо від DriverLayout (без TopNav). Деталі — TELEGRAM_BOT_SETUP.md
                у vehicle_tracker_api. */}
            <Route path="/driver-app" element={<DriverMiniApp />} />

            {/* Редирект з / на /driver */}
            <Route path="/" element={<Navigate to="/driver" replace />} />

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
