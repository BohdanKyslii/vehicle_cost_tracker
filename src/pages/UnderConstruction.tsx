import { TopNav } from '../components/layouts/TopNav';
import { useAuthModal } from '../hocks/useAuthModal';
import { AuthModal } from '../components/auth/AuthModal';
import '../styles/landing.css';

interface Props {
  title: string;
  message?: string;
}

export function UnderConstruction({ title, message = 'Ця сторінка ще в розробці.' }: Props) {
  const auth = useAuthModal();

  return (
    <div className="landing">
      <TopNav onOpenAuth={auth.openLogin} />
      <main className="page placeholder-page">
        <div>
          <h1>{title}</h1>
          <p>{message}</p>
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
