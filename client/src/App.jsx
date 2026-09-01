import { useCallback, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import Login from './pages/Login';
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
  return (
    <div className="app-container">
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
      <Route path="/register" element={<Register />} />
      <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
      <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
      <Route path="/saved" element={<AppLayout><Saved /></AppLayout>} />
      <Route path="/messages" element={<AppLayout><Messages /></AppLayout>} />
      <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
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