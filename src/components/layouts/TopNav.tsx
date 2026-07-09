import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

interface Props {
  onOpenAuth: () => void;
}

export function TopNav({ onOpenAuth }: Props) {
  return (
    <nav className="top-nav">
      <div className="nav-inner">
        <div className="logo">
          <Link to="/">
            <img src={logo} alt="Logo" />
          </Link>
        </div>
        <ul className="menu">
          <li>
            <Link to="/fleet">Автопарк</Link>
          </li>
          <li>
            <Link to="/waybills">Накладні</Link>
          </li>
          <li>
            <Link to="/driver">Водії</Link>
          </li>
          <li>
            <Link to="/analytics">Аналітика</Link>
          </li>
          <li className="has-submenu">
            <span>Ще</span>
            <ul className="submenu">
              <li>
                <Link to="/hired">Найманий транспорт</Link>
              </li>
              <li>
                <Link to="/carriers">Служби доставки</Link>
              </li>
              <li>
                <Link to="/admin">Адмін</Link>
              </li>
            </ul>
          </li>
        </ul>
        <div className="actions">
          <button type="button" className="signup-btn" onClick={onOpenAuth}>
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
}
