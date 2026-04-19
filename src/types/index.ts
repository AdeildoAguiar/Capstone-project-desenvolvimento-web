// Book from Open Library API
export interface Book {
  key: string;           // e.g. "/works/OL82563W"
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
  loanDate: string;   // ISO string
  dueDate: string;    // ISO string
  returned: boolean;
}

export interface AppState {
  loans: LoanRecord[];
  wishlist: Book[];
  readingStatus: Record<string, ReadingStatus>;
}
