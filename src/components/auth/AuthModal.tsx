import {useEffect, useState} from 'react';
import type { SubmitEvent } from 'react';
import  { useCurrentUser} from "../../hocks/useCurrentUser";

interface Props {
  open: boolean;
  signup: boolean;
  onClose: () => void;
  onSwitch: (signup: boolean) => void;
}

export function AuthModal({ open, signup, onClose, onSwitch }: Props) {
  const { login, register, loginError, registerError } = useCurrentUser();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('driver');
  const [registerMessage, setRegisterMessage] = useState('');

  async function handleLogin(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    await login({username, password});
    onClose();
  }

  async function handleRegister(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await register({username, email, password, role});
    setRegisterMessage(result.message);
    onSwitch(false); // перекидаємо на вхід — акаунт чекає на підтвердження
  }
  
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
          <form className="auth-form" noValidate onSubmit={handleLogin}>
            <div className="field-wrap">
              <span className="field-ico">&#128100;</span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field-row">
              <label>
                <input type="checkbox" /> Remember me
              </label>
              <button type="button" className="link-accent">
                Forgot password?
              </button>
            </div>
            {registerMessage && <p className="success">{registerMessage}</p>}
            {loginError && <p className="error">{loginError.message}</p>}
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
          <form className="auth-form" noValidate onSubmit={handleRegister}>
            <div className="field-wrap">
              <span className="field-ico">&#128100;</span>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <span className="field-ico">✉</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input type="password" placeholder="Confirm password" />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128100;</span>
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="driver">Водій</option>
                <option value="logist">Логіст</option>
                <option value="manager">Менеджер</option>
              </select>
            </div>
            <label className="terms-check">
              <input type="checkbox" /> I agree to the{' '}
              <button type="button" className="link-accent">
                Terms
              </button>
            </label>
            {registerError && <p className="error">{registerError.message}</p>}
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
