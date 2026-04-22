import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LibraryProvider } from './context/LibraryContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import BookDetailPage from './pages/BookDetailPage';
import LoansPage from './pages/LoansPage';
import WishlistPage from './pages/WishlistPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './auth.css';
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  if (!state.isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuth();
  if (state.isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {}
      <Route path="/login" element={
        <GuestRoute><LoginPage /></GuestRoute>
      } />
      <Route path="/register" element={
        <GuestRoute><RegisterPage /></GuestRoute>
      } />

      {}
      <Route path="/*" element={
        <ProtectedRoute>
          <LibraryProvider>
            <Navbar />
            <Routes>
              <Route path="/"           element={<HomePage />} />
              <Route path="/book/:key"  element={<BookDetailPage />} />
              <Route path="/loans"      element={<LoansPage />} />
              <Route path="/wishlist"   element={<WishlistPage />} />
              <Route path="*"           element={<Navigate to="/" replace />} />
            </Routes>
          </LibraryProvider>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
