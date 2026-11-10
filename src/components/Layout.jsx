import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import QuickViewModal from "./QuickViewModal";
import ChatWidget from "./ChatWidget";

// Khung chung của mọi trang: Header + nội dung + Footer, cùng giỏ hàng trượt và cửa sổ xem nhanh
export default function Layout() {
  const { pathname } = useLocation();

  // Chuyển trang thì cuộn về đầu trang
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <ChatWidget />
    </div>
  );
}
