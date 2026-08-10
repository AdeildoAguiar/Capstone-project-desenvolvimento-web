import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AppState, Book, LoanRecord, ReadingStatus } from '../types';
import { useAuth } from './AuthContext';
import { logEvent } from '../lib/events';

const initialState: AppState = {
  loans: [],
  wishlist: [],
  readingStatus: {},
};

type Action =
  | { type: 'BORROW_BOOK'; payload: Omit<LoanRecord, 'returned'> }
  | { type: 'RETURN_BOOK'; payload: { bookKey: string; at: string } }
  | { type: 'ADD_WISHLIST'; payload: Book }
  | { type: 'REMOVE_WISHLIST'; payload: { bookKey: string } }
  | { type: 'SET_READING_STATUS'; payload: { bookKey: string; status: ReadingStatus } };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'BORROW_BOOK':
      return {
        ...state,
        loans: [...state.loans, { ...action.payload, returned: false }],
      };
    case 'RETURN_BOOK':
      return {
        ...state,
        loans: state.loans.map((l) =>
          l.bookKey === action.payload.bookKey && !l.returned
            ? { ...l, returned: true, returnedAt: action.payload.at }
            : l
        ),
      };
    case 'ADD_WISHLIST':
      if (state.wishlist.find((b) => b.key === action.payload.key)) return state;
      return { ...state, wishlist: [...state.wishlist, action.payload] };
    case 'REMOVE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.filter((b) => b.key !== action.payload.bookKey),
      };
    case 'SET_READING_STATUS':
      return {
        ...state,
        readingStatus: {
          ...state.readingStatus,
          [action.payload.bookKey]: action.payload.status,
        },
      };
    default:
      return state;
  }
}

/** Extra metadata captured at borrow time purely to power analytics. */
type BorrowInput = Omit<LoanRecord, 'returned'> & { subject?: string };

interface LibraryContextType {
  state: AppState;
  borrowBook: (loan: BorrowInput) => void;
  returnBook: (bookKey: string) => void;
  addWishlist: (book: Book) => void;
  removeWishlist: (bookKey: string) => void;
  setReadingStatus: (bookKey: string, status: ReadingStatus) => void;
  isOnLoan: (bookKey: string) => boolean;
  isOnWishlist: (bookKey: string) => boolean;
  activeLoan: (bookKey: string) => LoanRecord | undefined;
}

const LibraryContext = createContext<LibraryContextType | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { state: auth } = useAuth();
  const user = auth.user;
  // Each account gets its own library; falls back to a shared key if somehow
  // rendered without a user (it never is — it lives behind ProtectedRoute).
  const storageKey = `biblio_jala_state_${user?.id ?? 'guest'}`;

  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? (JSON.parse(stored) as AppState) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const borrowBook = (loan: BorrowInput) => {
    const { subject, ...record } = loan;
    dispatch({ type: 'BORROW_BOOK', payload: record });
    if (user) {
      logEvent({
        type: 'borrow',
        userId: user.id,
        userName: user.name,
        bookKey: record.bookKey,
        bookTitle: record.bookTitle,
        bookAuthor: record.bookAuthor,
        subject,
        coverI: record.coverI,
      });
    }
  };

  const returnBook = (bookKey: string) => {
    const loan = state.loans.find((l) => l.bookKey === bookKey && !l.returned);
    dispatch({ type: 'RETURN_BOOK', payload: { bookKey, at: new Date().toISOString() } });
    if (user && loan) {
      logEvent({
        type: 'return',
        userId: user.id,
        userName: user.name,
        bookKey: loan.bookKey,
        bookTitle: loan.bookTitle,
        bookAuthor: loan.bookAuthor,
        coverI: loan.coverI,
      });
    }
  };

  const addWishlist = (book: Book) => dispatch({ type: 'ADD_WISHLIST', payload: book });
  const removeWishlist = (bookKey: string) =>
    dispatch({ type: 'REMOVE_WISHLIST', payload: { bookKey } });
  const setReadingStatus = (bookKey: string, status: ReadingStatus) =>
    dispatch({ type: 'SET_READING_STATUS', payload: { bookKey, status } });

  const isOnLoan = (bookKey: string) =>
    state.loans.some((l) => l.bookKey === bookKey && !l.returned);
  const isOnWishlist = (bookKey: string) =>
    state.wishlist.some((b) => b.key === bookKey);
  const activeLoan = (bookKey: string) =>
    state.loans.find((l) => l.bookKey === bookKey && !l.returned);

  return (
    <LibraryContext.Provider
      value={{
        state,
        borrowBook,
        returnBook,
        addWishlist,
        removeWishlist,
        setReadingStatus,
        isOnLoan,
        isOnWishlist,
        activeLoan,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside LibraryProvider');
  return ctx;
}
