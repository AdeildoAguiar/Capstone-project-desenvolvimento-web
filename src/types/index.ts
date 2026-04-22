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
}

export interface AppState {
  loans: LoanRecord[];
  wishlist: Book[];
  readingStatus: Record<string, ReadingStatus>;
}
