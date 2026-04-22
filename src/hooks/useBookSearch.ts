import { useState, useCallback, useRef } from 'react';
import { Book } from '../types';

const BASE = 'https://openlibrary.org';

interface SearchResult {
  books: Book[];
  total: number;
  loading: boolean;
  error: string | null;
}

export function useBookSearch() {
  const [result, setResult] = useState<SearchResult>({
    books: [],
    total: 0,
    loading: false,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(
    async (query: string, subject?: string, sort?: string, page = 1) => {
      if (!query.trim() && !subject) return;
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      setResult((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const params = new URLSearchParams({
          limit: '20',
          offset: String((page - 1) * 20),
          fields: 'key,title,author_name,cover_i,first_publish_year,subject,edition_count,isbn',
        });

        if (query.trim()) params.set('q', query.trim());
        if (subject) params.set('subject', subject);
        if (sort) params.set('sort', sort);

        const url = `${BASE}/search.json?${params}`;
        const res = await fetch(url, { signal: abortRef.current.signal });

        if (!res.ok) throw new Error('Erro ao buscar livros');

        const data = await res.json();

        setResult({
          books: (data.docs ?? []) as Book[],
          total: data.numFound ?? 0,
          loading: false,
          error: null,
        });
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setResult((prev) => ({
          ...prev,
          loading: false,
          error: 'Não foi possível carregar os livros. Verifique sua conexão.',
        }));
      }
    },
    []
  );

  return { ...result, search };
}

export function coverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M') {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
}

export async function fetchBookDetail(workKey: string) {
  const res = await fetch(`${BASE}${workKey}.json`);
  if (!res.ok) throw new Error('Livro não encontrado');
  return res.json();
}
