import { useNavigate } from 'react-router-dom';
import { Book } from '../types';
import { coverUrl } from '../hooks/useBookSearch';
import { useLibrary } from '../context/LibraryContext';

interface Props { book: Book; }

export function BookCardSkeleton() {
  return (
    <div className="book-card-skeleton" aria-hidden="true">
      <div className="skeleton-cover" />
      <div className="skeleton-body">
        <div className="skeleton-line" />
        <div className="skeleton-line" />
        <div className="skeleton-line skeleton-line--short" />
      </div>
    </div>
  );
}

export default function BookCard({ book }: Props) {
  const navigate = useNavigate();
  const { isOnLoan, isOnWishlist } = useLibrary();

  const onLoan = isOnLoan(book.key);
  const onWish = isOnWishlist(book.key);
  const author = book.author_name?.[0] ?? 'Autor desconhecido';

  function handleClick() {
    navigate(`/book/${encodeURIComponent(book.key)}`);
  }

  const dotClass = onLoan
    ? 'book-card__status-dot book-card__status-dot--loaned'
    : onWish
    ? 'book-card__status-dot book-card__status-dot--wishlist'
    : 'book-card__status-dot book-card__status-dot--available';

  const statusLabel = onLoan ? 'Emprestado' : onWish ? 'Na lista de desejos' : 'Disponível';

  return (
    <article
      className="book-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${book.title} — ${author}. Status: ${statusLabel}. Ver detalhes.`}
    >
      <div className="book-card__cover">
        {book.cover_i ? (
          <img
            src={coverUrl(book.cover_i, 'M')}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="book-card__cover-placeholder">
            <span>📖</span>
            <p>sem capa</p>
          </div>
        )}
        <div className={dotClass} title={statusLabel} aria-hidden="true" />
      </div>

      <div className="book-card__body">
        <p className="book-card__title">{book.title}</p>
        <p className="book-card__author">{author}</p>
        {book.first_publish_year && (
          <p className="book-card__year">{book.first_publish_year}</p>
        )}
      </div>
    </article>
  );
}
