import { TopNav } from '../components/layouts/TopNav';
import { AuthModal } from '../components/auth/AuthModal';
import { useAuthModal } from '../hocks/useAuthModal';
import '../styles/landing.css';

export function LandingPage() {
  const auth = useAuthModal();

  return (
    <div className="landing">
      <TopNav onOpenAuth={auth.openLogin} />
      <main className="page">
        <div>
          <h1>Vehicle Cost Tracker</h1>
          <p>Облік транспортних витрат — автопарк, накладні, аналітика.</p>
        </div>
      </main>
      <AuthModal
        open={auth.isOpen}
        signup={auth.isSignup}
        onClose={auth.close}
        onSwitch={auth.switchTo}
      />
    </div>
  );
}
