import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { QuickViewProvider } from "./context/QuickViewContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import ProductListPage from "./pages/ProductListPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailPage from "./pages/OrderDetailPage";
import PaymentPage from "./pages/PaymentPage";
import AccountPage from "./pages/AccountPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminProductFormPage from "./pages/admin/AdminProductFormPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminUserDetailPage from "./pages/admin/AdminUserDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

// Trang cần đăng nhập được bọc bởi <ProtectedRoute>
const secure = (page) => <ProtectedRoute>{page}</ProtectedRoute>;

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <QuickViewProvider>
              <Routes>
                {/* Cổng thanh toán giả lập: đặt ngoài Layout để không có Header của cửa hàng */}
                <Route path="payment/:id" element={secure(<PaymentPage />)} />
                {/* Khu vực quản trị: chỉ tài khoản ROLE_ADMIN, giao diện riêng (không dùng Layout cửa hàng) */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboardPage />} />
                  <Route path="orders" element={<AdminOrdersPage />} />
                  <Route path="orders/:id" element={<AdminOrderDetailPage />} />
                  <Route path="categories" element={<AdminCategoriesPage />} />
                  <Route path="products" element={<AdminProductsPage />} />
                  <Route
                    path="products/new"
                    element={<AdminProductFormPage />}
                  />
                  <Route
                    path="products/:id/edit"
                    element={<AdminProductFormPage />}
                  />
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="users/:id" element={<AdminUserDetailPage />} />
                </Route>
                <Route element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="products" element={<ProductListPage />} />
                  <Route
                    path="products/:slug"
                    element={<ProductDetailPage />}
                  />
                  <Route path="cart" element={secure(<CartPage />)} />
                  <Route path="checkout" element={secure(<CheckoutPage />)} />
                  <Route
                    path="order-success/:id"
                    element={secure(<OrderSuccessPage />)}
                  />
                  <Route path="orders" element={secure(<OrdersPage />)} />
                  <Route
                    path="orders/:id"
                    element={secure(<OrderDetailPage />)}
                  />
                  <Route path="account" element={secure(<AccountPage />)} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </QuickViewProvider>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
