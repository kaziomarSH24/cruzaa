import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { UserAuthProvider } from "./contexts/UserAuthContext";

// Page Imports
import DynamicMeta from "./components/layout/DynamicMeta";
import TrackingPixels from "./components/layout/TrackingPixels";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import FAQPage from "./pages/FAQPage";
import OrderSuccess from "./pages/OrderSuccess";
import StripeDiagnostics from "./pages/StripeDiagnostics";
import NotFound from "./pages/NotFound";
import AccountDashboard from "./pages/account/AccountDashboard";
import AccountOrders from "./pages/account/AccountOrders";
import AccountProfile from "./pages/account/AccountProfile";
import AccountAddresses from "./pages/account/AccountAddresses";
import AccountPayment from "./pages/account/AccountPayment";
import AccountNotifications from "./pages/account/AccountNotifications";
import AccountSecurity from "./pages/account/AccountSecurity";
import OrderDetail from "./pages/account/OrderDetail";

// Admin Imports
import AdminLayout from "./components/admin/AdminLayout";
import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProductListPage from "./pages/admin/ProductListPage";
import ProductFormPage from "./pages/admin/ProductFormPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import ContactManagementPage from "./pages/admin/ContactManagementPage";
import ContentManagementPage from "./pages/admin/ContentManagementPage";
import NavigationManagementPage from "./pages/admin/NavigationManagementPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import OrderManagementPage from "./pages/admin/OrderManagementPage";
import SliderManagementPage from "./pages/admin/SliderManagementPage";
import PaymentMethodsPage from "./pages/admin/PaymentMethodsPage";
import SettingsPage from "./pages/admin/SettingsPage";
import ProfilePage from "./pages/admin/ProfilePage";
import FAQManagementPage from "./pages/admin/FAQManagementPage";
import TestimonialManagementPage from "./pages/admin/TestimonialManagementPage";
import NewsletterManagementPage from "./pages/admin/NewsletterManagementPage";
import PagesManagementPage from "./pages/admin/PagesManagementPage";
import DynamicPage from "./pages/DynamicPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <UserAuthProvider>
          <BrowserRouter
            future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
          >
            <AdminAuthProvider>
              <TrackingPixels />
              <DynamicMeta />
              <Toaster />
              <Sonner position="top-right" closeButton richColors />
              <Routes>
                {/* Public Store Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route
                  path="/e-scooters"
                  element={<Products defaultCategory="e-scooters" />}
                />
                <Route
                  path="/e-byke"
                  element={<Products defaultCategory="e-byke" />}
                />
                <Route
                  path="/cruzaa-scoota"
                  element={<Products defaultCategory="cruzaa-scoota" />}
                />
                <Route path="/:slug" element={<DynamicPage />} />

                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/our-story" element={<About />} />
                <Route
                  path="/about"
                  element={<Navigate to="/our-story" replace />}
                />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/stripe-test" element={<StripeDiagnostics />} />
                <Route path="/login" element={<Login />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                {/* Account Routes */}
                <Route path="/account" element={<AccountDashboard />} />
                <Route path="/account/orders" element={<AccountOrders />} />
                <Route path="/account/orders/:id" element={<OrderDetail />} />
                <Route path="/account/profile" element={<AccountProfile />} />
                <Route
                  path="/account/addresses"
                  element={<AccountAddresses />}
                />
                <Route path="/account/payment" element={<AccountPayment />} />
                <Route
                  path="/account/notifications"
                  element={<AccountNotifications />}
                />
                <Route path="/account/security" element={<AccountSecurity />} />

                {/* Admin Auth */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin Panel Routes */}
                <Route element={<ProtectedAdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route
                      path="/admin/products"
                      element={<ProductListPage />}
                    />
                    <Route
                      path="/admin/products/create"
                      element={<ProductFormPage />}
                    />
                    <Route
                      path="/admin/products/edit/:id"
                      element={<ProductFormPage />}
                    />
                    <Route
                      path="/admin/categories"
                      element={<CategoryManagementPage />}
                    />
                    <Route
                      path="/admin/contacts"
                      element={<ContactManagementPage />}
                    />
                    <Route
                      path="/admin/newsletter"
                      element={<NewsletterManagementPage />}
                    />
                    <Route
                      path="/admin/content"
                      element={<ContentManagementPage />}
                    />
                    <Route
                      path="/admin/navigation"
                      element={<NavigationManagementPage />}
                    />
                    <Route
                      path="/admin/users"
                      element={<UserManagementPage />}
                    />
                    <Route
                      path="/admin/orders"
                      element={<OrderManagementPage />}
                    />
                    <Route
                      path="/admin/slider"
                      element={<SliderManagementPage />}
                    />
                    <Route
                      path="/admin/payments"
                      element={<PaymentMethodsPage />}
                    />
                    <Route path="/admin/faqs" element={<FAQManagementPage />} />
                    <Route
                      path="/admin/testimonials"
                      element={<TestimonialManagementPage />}
                    />
                    <Route
                      path="/admin/pages"
                      element={<PagesManagementPage />}
                    />
                    <Route path="/admin/settings" element={<SettingsPage />} />
                    <Route path="/admin/profile" element={<ProfilePage />} />
                  </Route>
                </Route>

                {/* Global Redirects */}
                <Route
                  path="/admin-panel"
                  element={<Navigate to="/admin" replace />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AdminAuthProvider>
          </BrowserRouter>
        </UserAuthProvider>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
