import { TopNav } from '../components/layouts/TopNav';
import { useAuthModal } from '../hocks/useAuthModal';
import { AuthModal } from '../components/auth/AuthModal';
import '../styles/landing.css';

interface Props {
  title: string;
}

export function UnderConstruction({ title }: Props) {
  const auth = useAuthModal();

  return (
    <div className="landing">
      <TopNav onOpenAuth={auth.openSignup} />
      <main className="page">
        <div>
          <h1>{title}</h1>
          <p>Ця сторінка ще в розробці.</p>
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
