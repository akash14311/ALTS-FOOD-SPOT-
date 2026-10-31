import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { AiAssistantProvider } from './context/AiAssistantContext';

import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import Home from './pages/Home';

// Route-level code splitting: heavy routes loaded on-demand
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const Restaurants = lazy(() => import('./pages/Restaurants'));
const RestaurantDetail = lazy(() => import('./pages/RestaurantDetail'));
const SearchPage = lazy(() => import('./pages/SearchPage'));
const OffersPage = lazy(() => import('./pages/OffersPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Smooth, non-blocking page transition placeholder
const PageLoader = () => (
  <div style={{ padding: '4rem 1rem', textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
  </div>
);

import './styles/variables.css';
import './styles/global.css';
import './styles/components.css';
import './styles/deliveryAddress.css';

// Protected Route Guard with return destination memory
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '24px', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

// Admin Route Guard
export const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '5rem 0', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '200px', height: '24px', margin: '0 auto' }}></div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
};

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <AiAssistantProvider>
              <Router>
                <div className="app-container">
                  <Navbar />
                  <main>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/restaurants" element={<Restaurants />} />
                        <Route path="/restaurants/:id" element={<RestaurantDetail />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/offers" element={<OffersPage />} />
                        <Route path="/cart" element={<CartPage />} />

                        {/* Static informational pages */}
                        <Route path="/about" element={<StaticPage />} />
                        <Route path="/contact" element={<StaticPage />} />
                        <Route path="/careers" element={<StaticPage />} />
                        <Route path="/privacy" element={<StaticPage />} />
                        <Route path="/terms" element={<StaticPage />} />
                        <Route path="/help" element={<StaticPage />} />

                        {/* User routes */}
                        <Route path="/favorites" element={<FavoritesPage />} />
                        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                        <Route path="/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                        {/* Admin routes */}
                        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/restaurants" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/foods" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                        <Route path="/admin/orders" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

                        {/* 404 Catch-all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                  <Footer />
                </div>
              </Router>
            </AiAssistantProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
