export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  subject?: string[];
  edition_count?: number;
  isbn?: string[];
}

export type ReadingStatus = 'reading' | 'completed' | 'wishlist' | null;

export interface LoanRecord {
  bookKey: string;
  bookTitle: string;
  bookAuthor: string;
  coverI?: number;
  loanDate: string;
  dueDate: string;
  returned: boolean;
  returnedAt?: string;
}

export interface AppState {
  loans: LoanRecord[];
  wishlist: Book[];
  readingStatus: Record<string, ReadingStatus>;
}

export type UserRole = 'admin' | 'member';

/**
 * Cross-user activity log used by the admin dashboard. In a client-only
 * demo every user on the device appends to a shared `biblio_events` key,
 * which stands in for what a real backend database would aggregate.
 */
export type EventType = 'borrow' | 'return';

export interface AppEvent {
  id: string;
  type: EventType;
  userId: string;
  userName: string;
  bookKey: string;
  bookTitle: string;
  bookAuthor: string;
  subject?: string;
  coverI?: number;
  at: string; // ISO timestamp
}
