import { TopNav } from '../components/layouts/TopNav';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuthModal } from '../hocks/useAuthModal';
import { APP_VERSION } from '../version';
import '../styles/landing.css';

const FEATURES = [
  {
    icon: '🚛',
    title: 'Автопарк',
    text: 'Облік власних авто: пробіг, техобслуговування та витрати на кожен транспортний засіб.',
  },
  {
    icon: '📄',
    title: 'Накладні',
    text: 'Автоматичний імпорт накладних із 1С з розподілом по каналах доставки.',
  },
  {
    icon: '📷',
    title: 'QR-сканування',
    text: 'Водій сканує накладну камерою телефону — дані одразу потрапляють у систему.',
  },
  {
    icon: '🚚',
    title: 'Найманий транспорт',
    text: 'Логіст вносить рейси зовнішніх перевізників і їхню вартість.',
  },
  {
    icon: '🏢',
    title: 'Служби доставки',
    text: 'Довідник перевізників, тарифів і умов співпраці.',
  },
  {
    icon: '📊',
    title: 'Аналітика',
    text: 'Наочні графіки витрат по авто, маршрутах і періодах.',
  },
];

const ROLES = [
  {
    className: 'role-driver',
    title: 'Водій',
    text: 'Сканує накладні QR-кодом у мобільному застосунку та бачить свої рейси.',
  },
  {
    className: 'role-logist',
    title: 'Логіст',
    text: 'Вносить рейси найманого транспорту й розподіляє накладні по каналах.',
  },
  {
    className: 'role-manager',
    title: 'Менеджер',
    text: 'Бачить повну аналітику витрат і керує довідниками системи.',
  },
];

export function LandingPage() {
  const auth = useAuthModal();

  return (
    <div className="landing">
      <TopNav onOpenAuth={auth.openLogin} />
      <main className="page">
        <section className="hero">
          <div className="hero-blob hero-blob-1" aria-hidden="true" />
          <div className="hero-blob hero-blob-2" aria-hidden="true" />

          <div className="hero-text">
            <span className="hero-tag">ОБЛІК · АНАЛІТИКА · АВТОПАРК</span>
            <h1>Vehicle Cost Tracker</h1>
            <p className="hero-sub">
              Веди облік транспортних витрат в одному місці: власний автопарк, накладні
              з 1С, наймані перевізники та наочна аналітика — без хаосу в Excel-таблицях.
            </p>
          </div>

          <div className="hero-art" aria-hidden="true">
            <svg viewBox="0 0 400 300" role="img">
              <defs>
                <linearGradient id="barGrad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0%" stopColor="#6b41f0" />
                  <stop offset="100%" stopColor="#f06292" />
                </linearGradient>
                <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                </linearGradient>
              </defs>

              <rect x="10" y="10" width="380" height="280" rx="20" fill="url(#cardGrad)" stroke="rgba(255,255,255,0.12)" />

              <circle cx="45" cy="45" r="6" fill="#f06292" />
              <circle cx="65" cy="45" r="6" fill="#facc15" />
              <circle cx="85" cy="45" r="6" fill="#4ade80" />

              <rect x="40" y="80" width="90" height="34" rx="8" fill="rgba(255,255,255,0.06)" />
              <text x="52" y="102" fill="#fff" fontSize="14" fontFamily="system-ui" opacity="0.85">₴ 84 200</text>

              <rect x="140" y="80" width="90" height="34" rx="8" fill="rgba(255,255,255,0.06)" />
              <text x="152" y="102" fill="#fff" fontSize="14" fontFamily="system-ui" opacity="0.85">128 рейсів</text>

              <g>
                <rect x="45" y="200" width="34" height="60" rx="4" fill="url(#barGrad)" opacity="0.55" />
                <rect x="95" y="175" width="34" height="85" rx="4" fill="url(#barGrad)" opacity="0.7" />
                <rect x="145" y="150" width="34" height="110" rx="4" fill="url(#barGrad)" opacity="0.8" />
                <rect x="195" y="190" width="34" height="70" rx="4" fill="url(#barGrad)" opacity="0.7" />
                <rect x="245" y="130" width="34" height="130" rx="4" fill="url(#barGrad)" />
                <rect x="295" y="160" width="34" height="100" rx="4" fill="url(#barGrad)" opacity="0.85" />
              </g>

              <polyline
                points="62,190 112,165 162,140 212,178 262,120 312,150"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.75"
              />
              {[
                [62, 190],
                [112, 165],
                [162, 140],
                [212, 178],
                [262, 120],
                [312, 150],
              ].map(([cx, cy]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="#fff" />
              ))}
            </svg>
          </div>
        </section>

        <section id="features" className="features">
          <h2>Що вміє система</h2>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <span className="feature-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="roles">
          <h2>Ролі користувачів</h2>
          <div className="role-grid">
            {ROLES.map((r) => (
              <div className={`role-card ${r.className}`} key={r.title}>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="cta-banner">
          <h2>Готові спробувати?</h2>
          <p>Створіть акаунт — доступ підтвердить адміністратор після реєстрації.</p>
          <button type="button" className="btn-grad" onClick={auth.openSignup}>
            Зареєструватися
          </button>
        </section>
      </main>
      <footer className="site-footer">
        <div className="footer-inner">
          <span className="footer-company">ТОВ «ТД РУБІН»</span>
          <a href="https://rubin.kyiv.ua/" target="_blank" rel="noreferrer">rubin.kyiv.ua</a>
          <a href="tel:+380672092701">+38 067 209 27 01</a>
          <a href="mailto:td.rubintov@gmail.com">td.rubintov@gmail.com</a>
          <span className="footer-version">v{APP_VERSION}</span>
        </div>
      </footer>
      <AuthModal
        open={auth.isOpen}
        signup={auth.isSignup}
        onClose={auth.close}
        onSwitch={auth.switchTo}
      />
    </div>
  );
}
