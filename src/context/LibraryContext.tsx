import { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { AppState, Book, LoanRecord, ReadingStatus } from '../types';

const STORAGE_KEY = 'biblio_jala_state';

const initialState: AppState = {
  loans: [],
  wishlist: [],
  readingStatus: {},
};

type Action =
  | { type: 'BORROW_BOOK'; payload: Omit<LoanRecord, 'returned'> }
  | { type: 'RETURN_BOOK'; payload: { bookKey: string } }
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
          l.bookKey === action.payload.bookKey ? { ...l, returned: true } : l
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

interface LibraryContextType {
  state: AppState;
  borrowBook: (loan: Omit<LoanRecord, 'returned'>) => void;
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
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : init;
    } catch {
      return init;
    }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const borrowBook = (loan: Omit<LoanRecord, 'returned'>) =>
    dispatch({ type: 'BORROW_BOOK', payload: loan });

  const returnBook = (bookKey: string) =>
    dispatch({ type: 'RETURN_BOOK', payload: { bookKey } });

  const addWishlist = (book: Book) =>
    dispatch({ type: 'ADD_WISHLIST', payload: book });

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
