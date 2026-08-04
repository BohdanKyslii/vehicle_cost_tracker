import { Routes, Route } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { UnderConstruction } from './pages/UnderConstruction';
import { DriverMiniApp } from './pages/DriverMiniApp';

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
      <Route path="/admin" element={<UnderConstruction title="Адмін" />} />
      <Route path="*" element={<UnderConstruction title="Сторінку не знайдено" />} />
    </Routes>
  );
}

export default App
