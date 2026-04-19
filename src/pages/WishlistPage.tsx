import { useNavigate } from 'react-router-dom';
import { useLibrary } from '../context/LibraryContext';
import { coverUrl } from '../hooks/useBookSearch';
import { useToast, ToastContainer } from '../components/Toast';

export default function WishlistPage() {
  const { state, removeWishlist } = useLibrary();
  const navigate = useNavigate();
  const { toasts, show } = useToast();
  const { wishlist } = state;

  function handleRemove(bookKey: string, title: string) {
    removeWishlist(bookKey);
    show('🗑', `"${title.slice(0, 30)}" removido da lista.`);
  }

  return (
    <main>
      <div className="container">
        <header className="page-header">
          <p className="page-header__eyebrow">Minha conta</p>
          <h1 className="page-header__title">Lista de Desejos</h1>
          <p className="page-header__subtitle">
            {wishlist.length > 0
              ? `${wishlist.length} livro${wishlist.length !== 1 ? 's' : ''} salvos para ler depois.`
              : 'Salve livros que você quer ler no futuro.'}
          </p>
        </header>

        {wishlist.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state__icon">⭐</div>
            <h2 className="empty-state__title">Lista de desejos vazia</h2>
            <p className="empty-state__text">
              Encontre livros no catálogo e clique em "Lista de desejos" para salvá-los aqui.
            </p>
            <button className="btn btn--primary" onClick={() => navigate('/')}>
              Explorar catálogo
            </button>
          </div>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((book, i) => (
              <article
                key={book.key}
                className="wishlist-card"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className="wishlist-card__cover"
                  onClick={() => navigate(`/book/${encodeURIComponent(book.key)}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/book/${encodeURIComponent(book.key)}`)}
                  aria-label={`Ver detalhes de ${book.title}`}
                >
                  {book.cover_i ? (
                    <img src={coverUrl(book.cover_i, 'M')} alt="" loading="lazy" decoding="async" />
                  ) : (
                    <div className="wishlist-card__placeholder">📖</div>
                  )}
                  <div className="wishlist-card__overlay">
                    <span className="wishlist-card__overlay-label">Ver detalhes →</span>
                  </div>
                </div>

                <div className="wishlist-card__body">
                  <p
                    className="wishlist-card__title"
                    onClick={() => navigate(`/book/${encodeURIComponent(book.key)}`)}
                  >
                    {book.title}
                  </p>
                  {book.author_name?.[0] && (
                    <p className="wishlist-card__author">{book.author_name[0]}</p>
                  )}
                  <div className="wishlist-card__footer">
                    <button
                      className="btn btn--primary btn--sm"
                      onClick={() => navigate(`/book/${encodeURIComponent(book.key)}`)}
                      style={{ flex: 1 }}
                    >
                      Ver
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => handleRemove(book.key, book.title)}
                      aria-label={`Remover ${book.title} da lista de desejos`}
                      title="Remover da lista"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} />
    </main>
  );
}
