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
  const [showTerms, setShowTerms] = useState(false);

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
      if (e.key !== 'Escape') return;
      if (showTerms) setShowTerms(false);
      else onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, showTerms]);

  return (
    <div
      className={`auth-backdrop${open ? ' open' : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`auth-card${signup ? ' is-signup' : ''}`}>
        <div className="auth-pane pane-login">
          <span className="pane-tag">З ПОВЕРНЕННЯМ</span>
          <h2>Вхід</h2>
          <p className="pane-sub">Введіть свої дані, щоб продовжити.</p>
          <form className="auth-form" noValidate onSubmit={handleLogin}>
            <div className="field-wrap">
              <span className="field-ico">&#128100;</span>
              <input
                type="text"
                placeholder="Ім'я користувача"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field-row">
              <label>
                <input type="checkbox" /> Запам'ятати мене
              </label>
              <button type="button" className="link-accent">
                Забули пароль?
              </button>
            </div>
            {registerMessage && <p className="success">{registerMessage}</p>}
            {loginError && <p className="error">{loginError.message}</p>}
            <button type="submit" className="btn-grad">
              Увійти
            </button>
          </form>
          <p className="pane-or">або продовжити через</p>
          <div className="social-row">
            <button type="button" className="btn-social" aria-label="Google">
              G
            </button>
            <button type="button" className="btn-social" aria-label="Telegram">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>

        <div className="auth-pane pane-left-promo">
          <h3>Вже маєте акаунт?</h3>
          <p>Увійдіть знову і продовжте з того місця, де зупинились.</p>
          <button type="button" className="btn-ghost" onClick={() => onSwitch(false)}>
            Увійти
          </button>
        </div>

        <div className="auth-pane pane-right-promo">
          <h3>Вперше тут?</h3>
          <p>Створіть акаунт і отримайте повний доступ.</p>
          <button type="button" className="btn-ghost" onClick={() => onSwitch(true)}>
            Створити акаунт
          </button>
        </div>

        <div className="auth-pane pane-signup">
          <span className="pane-tag">ПРИЄДНУЙТЕСЯ</span>
          <h2>Створення акаунту</h2>
          <p className="pane-sub">Це займе лише кілька секунд.</p>
          <form className="auth-form" noValidate onSubmit={handleRegister}>
            <div className="field-wrap">
              <span className="field-ico">&#128100;</span>
              <input
                type="text"
                placeholder="Ім'я користувача"
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
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="field-wrap">
              <span className="field-ico">&#128274;</span>
              <input type="password" placeholder="Підтвердіть пароль" />
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
              <input type="checkbox" /> Я погоджуюсь з{' '}
              <button
                type="button"
                className="link-accent"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTerms(true);
                }}
              >
                умовами використання
              </button>
            </label>
            {registerError && <p className="error">{registerError.message}</p>}
            <button type="submit" className="btn-grad">
              Створити акаунт
            </button>
          </form>
        </div>

        <button type="button" className="auth-close" aria-label="Закрити" onClick={onClose}>
          ✕
        </button>
      </div>

      {showTerms && (
        <div
          className="terms-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowTerms(false);
          }}
        >
          <div className="terms-card">
            <h3>Умови використання</h3>
            <div className="terms-body">
              <p>
                Цей застосунок призначений виключно для співробітників ТОВ «ТД РУБІН»
                і використовується для внутрішнього обліку транспортних витрат компанії.
              </p>
              <p>
                Уся інформація в системі — накладні, маршрути, витрати, аналітика та інші
                дані — є комерційною таємницею компанії. Розголошення цієї інформації
                третім особам, а також передача власного доступу стороннім особам
                суворо заборонені.
              </p>
              <p>
                Реєструючись, ви підтверджуєте, що використовуватимете застосунок лише
                в робочих цілях і несете відповідальність за збереження конфіденційності
                даних, до яких отримуєте доступ.
              </p>
            </div>
            <button type="button" className="btn-grad" onClick={() => setShowTerms(false)}>
              Зрозуміло
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
