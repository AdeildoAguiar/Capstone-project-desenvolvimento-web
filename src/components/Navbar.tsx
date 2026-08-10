import { NavLink, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import Icon from './Icon';

export default function Navbar() {
  const { state: libState } = useLibrary();
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();

  const activeLoans = libState.loans.filter((l) => !l.returned).length;
  const firstName = authState.user?.name.split(' ')[0] ?? '';
  const isAdmin = authState.user?.role === 'admin';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar" aria-label="Navegação principal">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="BiblioJala — página inicial">
          <Logo size={38} />
        </NavLink>

        <div className="navbar__links" role="list">
          <NavLink to="/" end className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            <Icon name="grid" />
            <span className="nav-label">Catálogo</span>
          </NavLink>

          <NavLink to="/loans" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            <Icon name="upload" />
            <span className="nav-label">Empréstimos</span>
            {activeLoans > 0 && (
              <span className="navbar__badge" aria-label={`${activeLoans} ativos`}>{activeLoans}</span>
            )}
          </NavLink>

          <NavLink to="/wishlist" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            <Icon name="star" />
            <span className="nav-label">Lista de Desejos</span>
            {libState.wishlist.length > 0 && (
              <span className="navbar__badge">{libState.wishlist.length}</span>
            )}
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
              <Icon name="chart" />
              <span className="nav-label">Painel</span>
            </NavLink>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.55rem', marginLeft: 'auto' }}>
          <ThemeToggle />

          <NavLink
            to="/profile"
            className={({ isActive }) => `navbar__user${isActive ? ' active' : ''}`}
            title="Ver meu perfil"
            aria-label="Ver meu perfil"
          >
            <span className="navbar__avatar">{firstName[0]?.toUpperCase()}</span>
            <span className="navbar__username">{firstName}</span>
            {isAdmin && <span className="navbar__role">ADMIN</span>}
          </NavLink>

          <button
            onClick={handleLogout}
            className="navbar__iconbtn"
            aria-label="Sair da conta"
            title="Sair"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
}
