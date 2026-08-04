import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UnderConstruction } from './pages/UnderConstruction';
import { DriverMiniApp } from './pages/DriverMiniApp';
import { useCurrentUser } from './hocks/useCurrentUser';

// Шлях НЕ /admin — nginx на проді проксіює саме /admin/ на Django admin
// (див. CODING_GUIDE.md Крок 4.3), інша адреса тут потрібна, щоб не
// перекривати справжню адмінку заглушкою після деплою.
function AdminPanelRoute() {
  const { user, isLoading } = useCurrentUser();
  if (isLoading) return null;
  if (user?.profile?.role !== 'head') {
    return (
      <UnderConstruction
        title="Доступ заборонено"
        message="Ця сторінка доступна лише керівнику."
      />
    );
  }
  return <UnderConstruction title="Адмін" />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/fleet" element={<UnderConstruction title="Автопарк" />} />
      <Route path="/waybills" element={<UnderConstruction title="Накладні" />} />
      {/* /driver — особистий екран водія (DriverLayout+DriverDashboard, Крок 13
          CODING_GUIDE.md), ще не набраний руками — тому заглушка */}
      <Route path="/driver" element={<UnderConstruction title="Водії" />} />
      {/* Telegram Mini App — логінить через initData, після успіху веде саме в /driver */}
      <Route path="/driver-app" element={<DriverMiniApp />} />
      <Route path="/analytics" element={<UnderConstruction title="Аналітика" />} />
      <Route path="/hired" element={<UnderConstruction title="Найманий транспорт" />} />
      <Route path="/carriers" element={<UnderConstruction title="Служби доставки" />} />
      <Route path="/panel" element={<AdminPanelRoute />} />
      <Route path="*" element={<UnderConstruction title="Сторінку не знайдено" />} />
    </Routes>
  );
}

export default App
