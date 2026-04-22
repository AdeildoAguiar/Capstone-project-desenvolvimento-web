import { useState, useEffect, useRef } from 'react';
import { useBookSearch } from '../hooks/useBookSearch';
import BookCard, { BookCardSkeleton } from '../components/BookCard';

const SUBJECTS = [
  { value: '', label: 'Todos os gêneros' },
  { value: 'fiction', label: 'Ficção' },
  { value: 'science', label: 'Ciência' },
  { value: 'history', label: 'História' },
  { value: 'philosophy', label: 'Filosofia' },
  { value: 'technology', label: 'Tecnologia' },
  { value: 'art', label: 'Arte' },
  { value: 'biography', label: 'Biografia' },
];

const SORTS = [
  { value: 'rating', label: 'Mais populares' },
  { value: 'new', label: 'Mais recentes' },
  { value: 'old', label: 'Mais antigos' },
  { value: 'editions', label: 'Mais edições' },
];

const DEFAULT_QUERIES = ['literatura', 'science fiction', 'history', 'philosophy'];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [sort, setSort] = useState('rating');
  const { books, total, loading, error, search } = useBookSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = DEFAULT_QUERIES[Math.floor(Math.random() * DEFAULT_QUERIES.length)];
    search(q, '', 'rating');
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    search(query.trim() || 'livros', subject, sort);
  }

  function handleSubjectChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSubject(e.target.value);
    const newSubject = e.target.value;
    search(query.trim() || 'books', newSubject, sort);
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setSort(e.target.value);
    search(query.trim() || 'books', subject, e.target.value);
  }

  return (
    <main>
      <div className="container">
        <header className="page-header">
          <p className="page-header__eyebrow">Universidade Jala · Acervo Digital</p>
          <h1 className="page-header__title">Catálogo de Livros</h1>
          <p className="page-header__subtitle">
            Explore, empreste e acompanhe suas leituras em um só lugar.
          </p>
        </header>

        <div className="search-wrap">
          <form className="search-form" onSubmit={handleSearch} role="search">
            <div className="search-input-wrap">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                ref={inputRef}
                type="search"
                className="search-input"
                placeholder="Buscar por título, autor ou palavra-chave…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Buscar livros"
                autoComplete="off"
              />
            </div>

            <select
              className="search-select"
              value={subject}
              onChange={handleSubjectChange}
              aria-label="Filtrar por gênero"
            >
              {SUBJECTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select
              className="search-select"
              value={sort}
              onChange={handleSortChange}
              aria-label="Ordenar por"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <button type="submit" className="search-btn" aria-label="Buscar">
              Buscar
            </button>
          </form>
        </div>

        {error && (
          <div className="error-alert" role="alert">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {!loading && total > 0 && (
          <p className="results-meta">
            {total.toLocaleString('pt-BR')} livro{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
        )}

        {loading ? (
          <div className="books-grid" aria-label="Carregando livros…" aria-busy="true">
            {Array.from({ length: 20 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 && !error ? (
          <div className="empty-state">
            <div className="empty-state__icon">📭</div>
            <h2 className="empty-state__title">Nenhum livro encontrado</h2>
            <p className="empty-state__text">
              Tente outros termos de busca ou explore categorias diferentes.
            </p>
            <button
              className="btn btn--primary"
              onClick={() => { setQuery(''); search('literatura', '', 'rating'); }}
            >
              Ver catálogo completo
            </button>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book.key} book={book} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
