import { NavLink, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { state: libState } = useLibrary();
  const { state: authState, logout } = useAuth();
  const navigate = useNavigate();

  const activeLoans = libState.loans.filter((l) => !l.returned).length;
  const firstName   = authState.user?.name.split(' ')[0] ?? '';

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar" aria-label="Navegação principal">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="BiblioJala — página inicial">
          <div className="navbar__brand-icon" aria-hidden="true">📚</div>
          BiblioJala
        </NavLink>

        <div className="navbar__links" role="list">
          <NavLink to="/" end className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            <span aria-hidden="true">🗂</span>
            <span className="nav-label">Catálogo</span>
          </NavLink>

          <NavLink to="/loans" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            <span aria-hidden="true">📤</span>
            <span className="nav-label">Empréstimos</span>
            {activeLoans > 0 && (
              <span className="navbar__badge" aria-label={`${activeLoans} ativos`}>{activeLoans}</span>
            )}
          </NavLink>

          <NavLink to="/wishlist" className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}>
            <span aria-hidden="true">⭐</span>
            <span className="nav-label">Lista de Desejos</span>
            {libState.wishlist.length > 0 && (
              <span className="navbar__badge">{libState.wishlist.length}</span>
            )}
          </NavLink>
        </div>

        {}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', marginLeft: 'auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.5rem',
            padding: '.35rem .75rem',
            background: 'var(--cream-2)', borderRadius: 'var(--radius-sm)',
            fontSize: '.82rem', color: 'var(--ink-2)',
          }}>
            <span style={{
              width: '26px', height: '26px',
              background: 'var(--amber)', color: '#fff',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '.75rem',
            }}>
              {firstName[0]?.toUpperCase()}
            </span>
            <span className="nav-label">{firstName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="navbar__link"
            aria-label="Sair da conta"
            title="Sair"
            style={{ fontSize: '.82rem', color: 'var(--ink-3)' }}
          >
            <span>🚪</span>
            <span className="nav-label">Sair</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
