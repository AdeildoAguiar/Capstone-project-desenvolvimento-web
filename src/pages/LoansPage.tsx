import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { coverUrl } from '../hooks/useBookSearch';
import { useToast, ToastContainer } from '../components/Toast';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function getDueInfo(dueDate: string) {
  const now = Date.now();
  const due = new Date(dueDate).getTime();
  const daysLeft = Math.ceil((due - now) / 86400000);

  if (daysLeft < 0)  return { label: `${Math.abs(daysLeft)}d em atraso`, cls: 'late', pct: 100 };
  if (daysLeft <= 3) return { label: `${daysLeft}d restante${daysLeft !== 1 ? 's' : ''}`, cls: 'warn', pct: Math.max(5, (daysLeft / 14) * 100) };
  return { label: `${daysLeft}d restantes`, cls: 'ok', pct: Math.max(5, (daysLeft / 14) * 100) };
}

export default function LoansPage() {
  const { state, returnBook } = useLibrary();
  const navigate = useNavigate();
  const { toasts, show } = useToast();

  const active  = state.loans.filter((l) => !l.returned);
  const history = state.loans.filter((l) => l.returned);
  const overdue = active.filter((l) => new Date(l.dueDate) < new Date());

  function handleReturn(bookKey: string, title: string) {
    returnBook(bookKey);
    show('📦', `"${title.slice(0, 30)}…" devolvido!`);
  }

  return (
    <main>
      <div className="container">
        <header className="page-header">
          <p className="page-header__eyebrow">Minha conta</p>
          <h1 className="page-header__title">Empréstimos</h1>
          <p className="page-header__subtitle">Gerencie seus livros emprestados e histórico.</p>
        </header>

        {}
        <div className="loans-stats">
          <div className="stat-card">
            <span className="stat-card__value">{active.length}</span>
            <span className="stat-card__label">Emprestados agora</span>
          </div>
          <div className={`stat-card${overdue.length > 0 ? ' stat-card--amber' : ''}`}>
            <span className="stat-card__value">{overdue.length}</span>
            <span className="stat-card__label">Em atraso</span>
          </div>
          <div className="stat-card">
            <span className="stat-card__value">{history.length}</span>
            <span className="stat-card__label">Devolvidos</span>
          </div>
        </div>

        {}
        <h2 className="section-heading">Empréstimos ativos</h2>

        {active.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h3 className="empty-state__title">Nenhum empréstimo ativo</h3>
            <p className="empty-state__text">
              Explore o catálogo e empreste um livro para começar.
            </p>
            <button className="btn btn--primary" onClick={() => navigate('/')}>
              Ir ao catálogo
            </button>
          </div>
        ) : (
          <div className="loan-list" style={{ marginBottom: '2.5rem' }}>
            {active.map((loan, i) => {
              const { label, cls, pct } = getDueInfo(loan.dueDate);
              return (
                <div
                  key={loan.bookKey}
                  className={`loan-card${cls === 'late' ? ' loan-card--overdue' : ''}`}
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div
                    className="loan-card__cover"
                    onClick={() => navigate(`/book/${encodeURIComponent(loan.bookKey)}`)}
                    aria-label={`Ver detalhes de ${loan.bookTitle}`}
                  >
                    {loan.coverI
                      ? <img src={coverUrl(loan.coverI, 'S')} alt="" loading="lazy" />
                      : <span>📖</span>
                    }
                  </div>

                  <div className="loan-card__info">
                    <p
                      className="loan-card__title"
                      onClick={() => navigate(`/book/${encodeURIComponent(loan.bookKey)}`)}
                    >
                      {loan.bookTitle}
                    </p>
                    <p className="loan-card__meta">Emprestado em {formatDate(loan.loanDate)}</p>
                    <p className={`loan-card__due loan-card__due--${cls}`}>
                      {cls === 'late' ? '⚠️ ' : cls === 'warn' ? '⏳ ' : '✅ '}
                      {label} · até {formatDate(loan.dueDate)}
                    </p>
                    <div className="due-bar">
                      <div className={`due-bar__fill due-bar__fill--${cls}`} style={{ width: `${cls === 'late' ? 100 : pct}%` }} />
                    </div>
                  </div>

                  <div className="loan-card__actions">
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleReturn(loan.bookKey, loan.bookTitle)}
                      aria-label={`Devolver ${loan.bookTitle}`}
                    >
                      Devolver
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {}
        {history.length > 0 && (
          <>
            <h2 className="section-heading" style={{ color: 'var(--ink-3)' }}>Histórico de devoluções</h2>
            <div className="loan-list">
              {history.map((loan, i) => (
                <div
                  key={`${loan.bookKey}-${loan.loanDate}`}
                  className="loan-card"
                  style={{ opacity: .65, animationDelay: `${i * 0.04}s` }}
                >
                  <div className="loan-card__cover">
                    {loan.coverI
                      ? <img src={coverUrl(loan.coverI, 'S')} alt="" loading="lazy" />
                      : <span>📖</span>
                    }
                  </div>
                  <div className="loan-card__info">
                    <p className="loan-card__title" style={{ cursor: 'default' }}>{loan.bookTitle}</p>
                    <p className="loan-card__meta">
                      {formatDate(loan.loanDate)} → devolvido
                    </p>
                  </div>
                  <span className="badge badge--available">Devolvido</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </main>
  );
}
