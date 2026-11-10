import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  User,
  UserRound,
  X,
} from "lucide-react";
import SearchOverlay from "./SearchOverlay";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import useCategories from "../hooks/useCategories";

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount, openDrawer } = useCart();
  const categories = useCategories();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  // Đổi trang thì đóng các menu đang mở
  useEffect(() => {
    setMobileOpen(false);
    setMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search]);

  // Bấm ra ngoài thì đóng menu tài khoản
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const path = location.pathname;
  const activeCategory = new URLSearchParams(location.search).get("category");

  const navItems = [
    { label: "Trang chủ", to: "/", active: path === "/" },
    {
      label: "Sản phẩm",
      to: "/products",
      active: path === "/products" && !activeCategory,
    },
    ...categories.map((c) => ({
      label: c.name,
      to: `/products?category=${c.id}`,
      active: path === "/products" && activeCategory === String(c.id),
    })),
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Bấm giỏ hàng: đã đăng nhập thì mở giỏ trượt, chưa thì sang trang đăng nhập
  const handleCart = () => {
    if (user) openDrawer();
    else navigate("/login", { state: { from: location } });
  };

  const navClass = (active) =>
    `relative py-2 text-[13px] font-semibold uppercase tracking-wide transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-accent after:transition-transform after:duration-200 ${
      active
        ? "text-ink after:scale-x-100"
        : "text-ink/80 hover:text-ink after:scale-x-0 hover:after:scale-x-100"
    }`;

  const initial = (user?.fullName || user?.email || "A")
    .trim()
    .charAt(0)
    .toUpperCase();
  const iconBtn =
    "relative cursor-pointer p-2 transition-colors hover:text-accent";

  return (
    <>
      <div className="bg-ink px-4 py-2 text-center text-[11px] font-medium uppercase tracking-wider text-white">
        Miễn phí vận chuyển toàn quốc
        <span className="hidden sm:inline">
          {" "}
          · Thanh toán khi nhận hàng (COD)
        </span>
      </div>

      <header className="sticky top-0 z-40 border-b border-line bg-white">
        <div className="page-container flex h-16 items-center justify-between gap-4 lg:h-[76px]">
          <div className="flex items-center gap-1">
            <button
              aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
              onClick={() => setMobileOpen((v) => !v)}
              className="-ml-2 cursor-pointer p-2 lg:hidden"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link
              to="/"
              aria-label="Aristino - trang chủ"
              className="text-2xl font-extrabold tracking-[0.18em] sm:text-[28px]"
            >
              ARISTINO
            </Link>
          </div>

          <nav
            className="hidden items-center gap-7 xl:gap-9 lg:flex"
            aria-label="Danh mục"
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navClass(item.active)}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1.5">
            <button
              aria-label="Tìm kiếm"
              onClick={() => setSearchOpen(true)}
              className={iconBtn}
            >
              <Search size={21} />
            </button>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Menu tài khoản"
                  aria-expanded={menuOpen}
                  className="ml-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-ink text-xs font-bold text-white transition-colors hover:bg-accent"
                >
                  {initial}
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-60 border border-line bg-white shadow-xl">
                    <div className="border-b border-line px-5 py-4">
                      <p className="truncate text-sm font-bold">
                        {user.fullName}
                      </p>
                      <p className="truncate text-xs text-ink-soft">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/account"
                      className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-mist"
                    >
                      <UserRound size={16} /> Tài khoản
                    </Link>
                    <Link
                      to="/orders"
                      className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-mist"
                    >
                      <Package size={16} /> Đơn hàng của tôi
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 border-t border-line px-5 py-3 text-sm font-semibold hover:bg-mist"
                      >
                        <UserRound size={16} /> Trang quản trị
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex w-full cursor-pointer items-center gap-3 border-t border-line px-5 py-3 text-left text-sm hover:bg-mist"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" aria-label="Đăng nhập" className={iconBtn}>
                <User size={21} />
              </Link>
            )}

            <button
              onClick={handleCart}
              aria-label={`Giỏ hàng, ${itemCount} sản phẩm`}
              className={iconBtn}
            >
              <ShoppingBag size={21} />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <nav
            className="border-t border-line bg-white lg:hidden"
            aria-label="Menu di động"
          >
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`block border-b border-line px-5 py-3.5 text-sm font-semibold uppercase tracking-wide ${
                  item.active ? "bg-mist text-accent" : ""
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={closeSearch} />
    </>
  );
}
