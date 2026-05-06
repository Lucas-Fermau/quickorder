import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { ToastViewport } from './components/ui/Toast';
import { ProtectedRoute } from './components/routes/ProtectedRoute';
import { AdminRoute } from './components/routes/AdminRoute';
import { AdminLayout } from './components/admin/AdminLayout';

import { HomePage } from './pages/Home';
import { ProductDetailPage } from './pages/ProductDetail';
import { CartPage } from './pages/Cart';
import { CheckoutPage } from './pages/Checkout';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { MyOrdersPage } from './pages/MyOrders';
import { AdminDashboard } from './pages/admin/Dashboard';
import { AdminProducts } from './pages/admin/Products';
import { AdminOrders } from './pages/admin/Orders';

function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <CartDrawer />
      <div className="min-h-[60vh]">{children}</div>
      <Footer />
    </>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Auth pages (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Customer pages (with header/footer) */}
            <Route
              path="/"
              element={
                <CustomerLayout>
                  <HomePage />
                </CustomerLayout>
              }
            />
            <Route
              path="/product/:id"
              element={
                <CustomerLayout>
                  <ProductDetailPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/cart"
              element={
                <CustomerLayout>
                  <CartPage />
                </CustomerLayout>
              }
            />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <CheckoutPage />
                  </CustomerLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <CustomerLayout>
                    <MyOrdersPage />
                  </CustomerLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <CustomerLayout>
                    <AdminLayout />
                  </CustomerLayout>
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <ToastViewport />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
