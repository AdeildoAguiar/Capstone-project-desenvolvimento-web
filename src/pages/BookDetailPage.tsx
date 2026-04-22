import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { coverUrl, fetchBookDetail } from '../hooks/useBookSearch';
import { Book, ReadingStatus } from '../types';
import { useToast, ToastContainer } from '../components/Toast';

function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BookDetailPage() {
  const { key } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const {
    borrowBook, returnBook, addWishlist, removeWishlist,
    setReadingStatus, isOnLoan, isOnWishlist, activeLoan, state,
  } = useLibrary();
  const { toasts, show } = useToast();
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const workKey = decodeURIComponent(key ?? '');
  const onLoan = isOnLoan(workKey);
  const onWish = isOnWishlist(workKey);
  const loan = activeLoan(workKey);
  const currentStatus = state.readingStatus[workKey] ?? '';

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!workKey) return;
    setLoading(true);
    setError('');
    fetchBookDetail(workKey)
      .then(setDetail)
      .catch(() => setError('Não foi possível carregar os detalhes deste livro.'))
      .finally(() => setLoading(false));
  }, [workKey]);

  function handleBorrow() {
    if (!detail) return;
    const book: Book = {
      key: workKey,
      title: detail.title,
      cover_i: detail.covers?.[0],
    };
    borrowBook({
      bookKey: workKey,
      bookTitle: detail.title,
      bookAuthor: 'Biblioteca Jala',
      coverI: detail.covers?.[0],
      loanDate: new Date().toISOString(),
      dueDate: addDays(14),
    });
    if (!onWish) addWishlist(book);
    show('✅', 'Livro emprestado! Devolução em 14 dias.');
  }

  function handleReturn() {
    returnBook(workKey);
    show('📦', 'Livro devolvido com sucesso!');
  }

  function handleWishlist() {
    if (onWish) {
      removeWishlist(workKey);
      show('🗑', 'Removido da lista de desejos.');
    } else {
      addWishlist({ key: workKey, title: detail?.title ?? 'Livro', cover_i: detail?.covers?.[0] });
      show('⭐', 'Adicionado à lista de desejos!');
    }
  }

  function handleStatus(e: React.ChangeEvent<HTMLSelectElement>) {
    const s = e.target.value as ReadingStatus;
    setReadingStatus(workKey, s);
    const labels: Record<string, string> = {
      reading: 'Status: Lendo 📖',
      completed: 'Status: Concluído ✅',
      wishlist: 'Status: Quero ler 📝',
    };
    show('✏️', labels[s ?? ''] ?? 'Status atualizado');
  }

  const description =
    typeof detail?.description === 'string'
      ? detail.description
      : (detail?.description?.value ?? 'Sem descrição disponível.');

  const subjects: string[] = (detail?.subjects ?? []).slice(0, 8);

  const daysUntilDue = loan
    ? Math.ceil((new Date(loan.dueDate).getTime() - Date.now()) / 86400000)
    : null;

  if (loading) {
    return (
      <main>
        <div className="container detail-page">
          <button className="detail-back" onClick={() => navigate(-1)}>← Voltar</button>
          <div className="detail-layout">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div className="skeleton-cover" style={{ aspectRatio: '2/3', borderRadius: 'var(--radius-lg)', animation: 'shimmer 1.4s ease infinite', background: 'linear-gradient(90deg,var(--cream-2) 25%,var(--cream-3) 50%,var(--cream-2) 75%)', backgroundSize: '600px 100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {[100, 60, 80, 40, 95, 70].map((w, i) => (
                <div key={i} className="skeleton-line" style={{ width: `${w}%`, height: i === 0 ? '2rem' : '.85rem' }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <div className="container detail-page">
          <div className="error-alert">⚠️ {error}</div>
          <button className="btn btn--ghost" onClick={() => navigate(-1)}>← Voltar ao catálogo</button>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div className="container detail-page">
        <button className="detail-back" onClick={() => navigate(-1)} aria-label="Voltar">
          ← Voltar ao catálogo
        </button>

        <div className="detail-layout">
          {}
          <div className="detail-cover-col">
            <div className="detail-cover">
              {detail?.covers?.[0] ? (
                <img src={coverUrl(detail.covers[0], 'L')} alt={`Capa de ${detail?.title}`} />
              ) : (
                <div className="detail-cover-placeholder">
                  <span>📖</span>
                </div>
              )}
            </div>

            <div className="detail-col-actions">
              {onLoan ? (
                <button className="btn btn--danger" onClick={handleReturn} style={{ width: '100%' }}>
                  📦 Devolver Livro
                </button>
              ) : (
                <button className="btn btn--primary" onClick={handleBorrow} style={{ width: '100%' }}>
                  📤 Emprestar (14 dias)
                </button>
              )}

              <button
                className={`btn ${onWish ? 'btn--ghost' : 'btn--outline'}`}
                onClick={handleWishlist}
                style={{ width: '100%' }}
                aria-pressed={onWish}
              >
                {onWish ? '✕ Remover da lista' : '⭐ Lista de desejos'}
              </button>

              <div>
                <p className="detail-section-label" style={{ marginBottom: '.4rem' }}>Status de leitura</p>
                <select
                  className="reading-select"
                  value={currentStatus ?? ''}
                  onChange={handleStatus}
                  aria-label="Selecionar status de leitura"
                >
                  <option value="">— Selecionar —</option>
                  <option value="reading">📖 Lendo</option>
                  <option value="completed">✅ Concluído</option>
                  <option value="wishlist">📝 Quero ler</option>
                </select>
              </div>
            </div>
          </div>

          {}
          <div className="detail-info">
            <div>
              <p className="detail-eyebrow">Biblioteca Universitária · Detalhes</p>
              <h1 className="detail-title">{detail?.title}</h1>
              {detail?.authors && (
                <p className="detail-author">
                  por{' '}
                  {detail.authors
                    .map((a: any) => a.author?.key ?? '')
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>

            {}
            <div className="detail-status-row">
              {onLoan
                ? <span className="badge badge--loaned">📤 Emprestado</span>
                : <span className="badge badge--available">✅ Disponível</span>
              }
              {onWish && <span className="badge badge--wishlist">⭐ Lista de desejos</span>}
              {currentStatus === 'reading'   && <span className="badge badge--reading">📖 Lendo</span>}
              {currentStatus === 'completed' && <span className="badge badge--available">✔ Concluído</span>}
              {currentStatus === 'wishlist'  && <span className="badge badge--neutral">📝 Quero ler</span>}
            </div>

            {}
            {loan && (
              <div className="detail-loan-card">
                <span style={{ fontSize: '1.2rem' }}>📅</span>
                <div>
                  <p>
                    Emprestado em <strong>{formatDate(loan.loanDate)}</strong>
                  </p>
                  <p style={{ marginTop: '.2rem' }}>
                    {daysUntilDue !== null && daysUntilDue < 0
                      ? <><strong style={{ color: 'var(--red)' }}>⚠️ Atrasado!</strong> Devolver imediatamente.</>
                      : <>Devolver até <strong>{formatDate(loan.dueDate)}</strong>{daysUntilDue !== null ? ` (${daysUntilDue} dia${daysUntilDue !== 1 ? 's' : ''})` : ''}</>
                    }
                  </p>
                </div>
              </div>
            )}

            <div className="detail-divider" />

            {}
            <div>
              <p className="detail-section-label">Descrição</p>
              <p className="detail-description">
                {description.length > 800 ? description.slice(0, 800) + '…' : description}
              </p>
            </div>

            {}
            {subjects.length > 0 && (
              <div>
                <p className="detail-section-label">Categorias</p>
                <div className="detail-subjects">
                  {subjects.map((s) => (
                    <span key={s} className="badge badge--neutral">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </main>
  );
}
