import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import UserLayout from "./components/layouts/UserLayout";
import HomePage from "./components/pages/HomePage";
import ProductsListPage from "./components/pages/productListPage";
import ProductDetailPage from "./components/pages/productDetailPage";
import WishListPage from "./components/pages/wishListPage";
import CartPage from "./components/pages/cartPage";
import CheckoutPage from "./components/pages/checkoutPage";
import OrderSuccessPage from "./components/pages/orderSuccessPage";
import ContactPage from "./components/pages/contactPage";
import BlogListPage from "./components/pages/blogListPage";
import BlogDetailPage from "./components/pages/blogDetailPage";
import Login from "./components/login_register/login";
import Register from "./components/login_register/register";
import AdminRoute from './components/AdminRoute';

import ForgotPassword from "./components/login_register/ForgotPassword";
import ProductCardQuickView from "./components/products/productCardQuickView";
import Profile from "./components/pages/Profile/Profile";

import DashBoard from "./components/admin/pages/DashBoard";
import ManageProduct from "./components/admin/pages/ManageProduct";
import ManageUser from "./components/admin/pages/ManageUser";
import AdminLayout from "./components/admin/commons/AdminLayout";
import BuyingHistoryPage from "./components/BuyingHistory/BuyingHistoryPage";
import OrderDetail from "./components/BuyingHistory/OrderDetail";
import SessionTimeoutWatcher from "./components/commons/SessionTimeoutWatcher";
import ManageOrder from "./components/admin/pages/ManageOrder";
import AdminProfile from "./components/admin/pages/AdminProfile";
import ChatWidget from "./components/chatbot/ChatWidget";
import LiveChat from "./components/admin/pages/LiveChat";

import userStatusMonitor from "./services/userStatusMonitor";
import { getToken } from "./services/authStorage";

function AppContent({ showOffcanvas, setShowOffcanvas }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAuthRoute = ["/login", "/register", "/forgot-password"].includes(
    location.pathname
  );
  const shouldShowChatWidget = !isAdminRoute && !isAuthRoute;

  useEffect(() => {
    // Bắt đầu monitoring nếu user đã login
    const token = getToken();
    if (token) {
      userStatusMonitor.startMonitoring();
    }

    // Lắng nghe sự kiện login/logout để bật/tắt monitoring
    const handleAuthChange = () => {
      const currentToken = getToken();
      if (currentToken) {
        userStatusMonitor.startMonitoring();
      } else {
        userStatusMonitor.stopMonitoring();
      }
    };

    window.addEventListener("cart:updated", handleAuthChange);

    return () => {
      window.removeEventListener("cart:updated", handleAuthChange);
      userStatusMonitor.stopMonitoring();
    };
  }, []);

  return (
    <>
      <SessionTimeoutWatcher />
      {shouldShowChatWidget && <ChatWidget />}
      <Routes>
        <Route element={<UserLayout />}>
          <Route
            path="/"
            element={
              <HomePage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/productsList"
            element={
              <ProductsListPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/productDetail/:id"
            element={
              <ProductDetailPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/wishList"
            element={
              <WishListPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/checkout"
            element={
              <CheckoutPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/order-success"
            element={
              <OrderSuccessPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/contact"
            element={
              <ContactPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/blogList"
            element={
              <BlogListPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/blogDetail"
            element={
              <BlogDetailPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/login"
            element={
              <Login
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/productQuickView"
            element={
              <ProductCardQuickView
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <Profile
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/buying-history"
            element={
              <BuyingHistoryPage
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
          <Route
            path="/order-detail/:id"
            element={
              <OrderDetail
                showOffcanvas={showOffcanvas}
                setShowOffcanvas={setShowOffcanvas}
              />
            }
          />
        </Route>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashBoard />} />
            <Route path="product" element={<ManageProduct />} />
            <Route path="user" element={<ManageUser />} />
            <Route path="order" element={<ManageOrder />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="livechat" element={<LiveChat />} />

          </Route>
        </Route>
      </Routes>
    </>
  );
}

function App() {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

  return (
    <Router>
      <AppContent
        showOffcanvas={showOffcanvas}
        setShowOffcanvas={setShowOffcanvas}
      />
    </Router>
  );
}

export default App;
