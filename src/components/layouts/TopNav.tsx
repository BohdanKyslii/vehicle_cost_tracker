import { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

interface Props {
  onOpenAuth: () => void;
}

export function TopNav({ onOpenAuth }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <div className="logo">
          <Link to="/" onClick={closeMenu}>
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <button
          type="button"
          className="menu-toggle"
          aria-label="Меню"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
        <ul className={isMenuOpen ? 'menu is-open' : 'menu'}>
          <li>
            <Link to="/fleet" onClick={closeMenu}>Автопарк</Link>
          </li>
          <li>
            <Link to="/waybills" onClick={closeMenu}>Накладні</Link>
          </li>
          <li>
            <Link to="/driver" onClick={closeMenu}>Водії</Link>
          </li>
          <li>
            <Link to="/analytics" onClick={closeMenu}>Аналітика</Link>
          </li>
          <li className="has-submenu">
            <span>Ще</span>
            <ul className="submenu">
              <li>
                <Link to="/hired" onClick={closeMenu}>Найманий транспорт</Link>
              </li>
              <li>
                <Link to="/carriers" onClick={closeMenu}>Служби доставки</Link>
              </li>
              <li>
                <Link to="/admin" onClick={closeMenu}>Адмін</Link>
              </li>
            </ul>
          </li>
        </ul>
        <div className="actions">
          <button
            type="button"
            className="signup-btn"
            onClick={() => {
              closeMenu();
              onOpenAuth();
            }}
          >
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
