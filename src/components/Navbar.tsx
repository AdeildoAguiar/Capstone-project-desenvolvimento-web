import { NavLink } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';

export default function Navbar() {
  const { state } = useLibrary();
  const activeLoans = state.loans.filter((l) => !l.returned).length;

  return (
    <nav className="navbar" aria-label="Navegação principal">
      <div className="container navbar__inner">
        <NavLink to="/" className="navbar__brand" aria-label="BiblioJala — página inicial">
          <div className="navbar__brand-icon" aria-hidden="true">📚</div>
          BiblioJala
        </NavLink>

        <div className="navbar__links" role="list">
          <NavLink
            to="/"
            end
            className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
            role="listitem"
          >
            <span aria-hidden="true">🗂</span>
            <span className="nav-label">Catálogo</span>
          </NavLink>

          <NavLink
            to="/loans"
            className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
            role="listitem"
          >
            <span aria-hidden="true">📤</span>
            <span className="nav-label">Empréstimos</span>
            {activeLoans > 0 && (
              <span className="navbar__badge" aria-label={`${activeLoans} empréstimos ativos`}>
                {activeLoans}
              </span>
            )}
          </NavLink>

          <NavLink
            to="/wishlist"
            className={({ isActive }) => `navbar__link${isActive ? ' active' : ''}`}
            role="listitem"
          >
            <span aria-hidden="true">⭐</span>
            <span className="nav-label">Lista de Desejos</span>
            {state.wishlist.length > 0 && (
              <span className="navbar__badge" aria-label={`${state.wishlist.length} livros na lista`}>
                {state.wishlist.length}
              </span>
            )}
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
