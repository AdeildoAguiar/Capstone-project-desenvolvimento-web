import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import LoansPage from './pages/LoansPage';
import WishlistPage from './pages/WishlistPage';

export default function App() {
  return (
    <BrowserRouter>
      <LibraryProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/book/:key" element={<BookDetailPage />} />
          <Route path="/loans" element={<LoansPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </LibraryProvider>
    </BrowserRouter>
  );
}
