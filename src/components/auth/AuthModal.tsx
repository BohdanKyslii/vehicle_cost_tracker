import { useEffect } from 'react';
import type { FormEvent } from 'react';

interface Props {
  open: boolean;
  signup: boolean;
  onClose: () => void;
  onSwitch: (signup: boolean) => void;
}

// TODO: backend has no /api/auth endpoints yet — forms just prevent
// default submission until the real API exists.
function handleSubmit(e: FormEvent) {
  e.preventDefault();
}

export function AuthModal({ open, signup, onClose, onSwitch }: Props) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <div
      className={`auth-backdrop${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`auth-card${signup ? ' is-signup' : ''}`}>
        <div className="auth-pane pane-login">
          <span className="pane-tag">WELCOME BACK</span>
          <h2>Sign in</h2>
          <p className="pane-sub">Enter your details to continue.</p>
          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            <div className="field-wrap">
              <span className="field-ico">✉</span>
              <input type="email" placeholder="Email" />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input type="password" placeholder="Password" />
            </div>
            <div className="field-row">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="link-accent">
                Forgot password?
              </button>
            </div>
            <button type="submit" className="btn-grad">
              Sign in
            </button>
          </form>
          <p className="pane-or">or continue with</p>
          <div className="social-row">
            <button type="button" className="btn-social">
              G
            </button>
            <button type="button" className="btn-social">
              &#9675;
            </button>
          </div>
        </div>

        <div className="auth-pane pane-left-promo">
          <h3>Already a member?</h3>
          <p>Sign back in and pick up where you left off.</p>
          <button type="button" className="btn-ghost" onClick={() => onSwitch(false)}>
            Sign In
          </button>
        </div>

        <div className="auth-pane pane-right-promo">
          <h3>New around here?</h3>
          <p>Create an account and unlock the full experience.</p>
          <button type="button" className="btn-ghost" onClick={() => onSwitch(true)}>
            Create account
          </button>
        </div>

        <div className="auth-pane pane-signup">
          <span className="pane-tag">JOIN THE SPACE</span>
          <h2>Create account</h2>
          <p className="pane-sub">It only takes a few seconds.</p>
          <form className="auth-form" noValidate onSubmit={handleSubmit}>
            <div className="field-wrap">
              <span className="field-ico">&#128100;</span>
              <input type="text" placeholder="Full name" />
            </div>
            <div className="field-wrap">
              <span className="field-ico">✉</span>
              <input type="email" placeholder="you@example.com" />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input type="password" placeholder="Password" />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input type="password" placeholder="Confirm password" />
            </div>
            <label className="terms-check">
              <input type="checkbox" /> I agree to the{' '}
              <button type="button" className="link-accent">
                Terms
              </button>
            </label>
            <button type="submit" className="btn-grad">
              Create account
            </button>
          </form>
        </div>

        <button type="button" className="auth-close" aria-label="Close" onClick={onClose}>
          ✕
        </button>
      </div>
    </div>
  );
}
