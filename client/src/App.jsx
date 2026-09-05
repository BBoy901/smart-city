import { useCallback, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import BottomNav from './components/BottomNav';
import Loading from './components/Loading';
import SplashScreen from './components/SplashScreen';

import Welcome from './pages/Welcome';
import Home from './pages/Home';
import Search from './pages/Search';
import Saved from './pages/Saved';
import Messages from './pages/Messages';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import About from './pages/About';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import ProductDetail from './pages/ProductDetail';
import ShopProfile from './pages/ShopProfile';

import SellerHome from './pages/seller/SellerHome';
import SellerSetup from './pages/seller/SellerSetup';
import SellerProducts from './pages/seller/SellerProducts';
import AddProduct from './pages/seller/AddProduct';

import AdminLayout from './pages/admin/AdminLayout';

function AppLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const touchStart = useRef(null);
  const swipeRoutes = ['/', '/search', '/saved', '/messages', '/profile'];
  const currentRoute = location.pathname === '/explore' ? '/' : location.pathname;

  const handleTouchStart = (event) => {
    if (!swipeRoutes.includes(currentRoute) || event.target.closest('.chat-thread, .chat-composer, .home-category-row')) return;
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event) => {
    if (!touchStart.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStart.current.x;
    const deltaY = touch.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) <= Math.abs(deltaY) * 1.3) return;

    const routeIndex = swipeRoutes.indexOf(currentRoute);
    const nextIndex = deltaX < 0 ? routeIndex + 1 : routeIndex - 1;
    if (nextIndex >= 0 && nextIndex < swipeRoutes.length) navigate(swipeRoutes[nextIndex]);
  };

  return (
    <div className="app-container" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {children}
      <BottomNav />
    </div>
  );
}

function ProtectedRoute({ children, requireSeller }) {
  const { isAuthenticated, isSeller, loading } = useAuth();

  if (loading) return <Loading />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (requireSeller && !isSeller) return <Navigate to="/seller/setup" />;

  return children;
}

function AppRoutes() {
  const { loading, isAuthenticated, isSellerMode } = useAuth();

  if (loading) {
    return (
      <div className="app-container">
        <Loading />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated && isSellerMode
            ? <Navigate to="/seller" />
            : <AppLayout><Home /></AppLayout>
        }
      />

      <Route path="/explore" element={<AppLayout><Home /></AppLayout>} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
      <Route path="/saved" element={<AppLayout><Saved /></AppLayout>} />
      <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
      <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
      <Route path="/about" element={<AppLayout><About /></AppLayout>} />
      <Route path="/product/:id" element={<AppLayout><ProductDetail /></AppLayout>} />
      <Route path="/shop/:id" element={<AppLayout><ShopProfile /></AppLayout>} />

      <Route
        path="/seller"
        element={
          <ProtectedRoute requireSeller>
            <AppLayout><SellerHome /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/setup"
        element={<ProtectedRoute><SellerSetup /></ProtectedRoute>}
      />

      <Route
        path="/seller/products"
        element={
          <ProtectedRoute requireSeller>
            <AppLayout><SellerProducts /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/add-product"
        element={
          <ProtectedRoute requireSeller>
            <AppLayout><AddProduct /></AppLayout>
          </ProtectedRoute>
        }
      />

      <Route path="/admin/*" element={<AdminLayout />} />

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/welcome'} />}
      />
    </Routes>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const finishSplash = useCallback(() => {
    setShowSplash(false);
  }, []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={finishSplash} />}

      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </>
  );
}