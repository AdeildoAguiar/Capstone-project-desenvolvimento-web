import { AppEvent } from '../types';

/** All analytics the admin dashboard needs, derived from the event log. */
export interface Analytics {
  totalBorrows: number;
  totalReturns: number;
  activeLoans: number;
  returnRate: number; // 0..1
  uniqueReaders: number;
  uniqueTitles: number;
  borrowsByMonth: { label: string; key: string; borrows: number; returns: number }[];
  topAuthorsMonth: RankedItem[];
  topAuthorsYear: RankedItem[];
  topBooks: RankedItem[];
  topGenres: RankedItem[];
  topReaders: RankedItem[];
  bookStatus: { label: string; value: number; color: string }[];
}

export interface RankedItem {
  label: string;
  value: number;
}

const MONTH_LABELS = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
];

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function rank(map: Map<string, number>, limit = 6): RankedItem[] {
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

function bump(map: Map<string, number>, key: string | undefined, by = 1) {
  if (!key) return;
  map.set(key, (map.get(key) ?? 0) + by);
}

export function computeAnalytics(
  events: AppEvent[],
  now = new Date()
): Analytics {
  const borrows = events.filter((e) => e.type === 'borrow');
  const returns = events.filter((e) => e.type === 'return');

  // Active loans = books borrowed but not yet returned (per user + book).
  const openLoans = new Set<string>();
  for (const e of [...events].sort((a, b) => a.at.localeCompare(b.at))) {
    const id = `${e.userId}::${e.bookKey}`;
    if (e.type === 'borrow') openLoans.add(id);
    else openLoans.delete(id);
  }

  // ── Borrows / returns over the last 12 months ────────────────────────
  const months: { label: string; key: string; borrows: number; returns: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ label: MONTH_LABELS[d.getMonth()], key: monthKey(d), borrows: 0, returns: 0 });
  }
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));
  for (const e of events) {
    const idx = monthIndex.get(monthKey(new Date(e.at)));
    if (idx === undefined) continue;
    if (e.type === 'borrow') months[idx].borrows++;
    else months[idx].returns++;
  }

  // ── Rankings ─────────────────────────────────────────────────────────
  const thisMonth = monthKey(now);
  const thisYear = now.getFullYear();
  const authorsMonth = new Map<string, number>();
  const authorsYear = new Map<string, number>();
  const books = new Map<string, number>();
  const genres = new Map<string, number>();
  const readers = new Map<string, number>();

  for (const e of borrows) {
    const d = new Date(e.at);
    const author = e.bookAuthor?.trim() || 'Autor desconhecido';
    if (d.getFullYear() === thisYear) bump(authorsYear, author);
    if (monthKey(d) === thisMonth) bump(authorsMonth, author);
    bump(books, e.bookTitle?.trim() || 'Sem título');
    bump(genres, e.subject?.trim());
    bump(readers, e.userName?.trim() || 'Anônimo');
  }

  const uniqueReaders = new Set(events.map((e) => e.userId)).size;
  const uniqueTitles = new Set(borrows.map((e) => e.bookKey)).size;

  return {
    totalBorrows: borrows.length,
    totalReturns: returns.length,
    activeLoans: openLoans.size,
    returnRate: borrows.length ? returns.length / borrows.length : 0,
    uniqueReaders,
    uniqueTitles,
    borrowsByMonth: months,
    topAuthorsMonth: rank(authorsMonth),
    topAuthorsYear: rank(authorsYear),
    topBooks: rank(books, 5),
    topGenres: rank(genres, 6),
    topReaders: rank(readers, 5),
    bookStatus: [
      { label: 'Emprestados agora', value: openLoans.size, color: 'var(--red)' },
      { label: 'Devolvidos', value: returns.length, color: 'var(--green)' },
      {
        label: 'Total de títulos',
        value: uniqueTitles,
        color: 'var(--amber)',
      },
    ],
  };
}
