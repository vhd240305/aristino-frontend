import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { to: "/admin", label: "Tổng quan", end: true },
  { to: "/admin/orders", label: "Đơn hàng" },
  { to: "/admin/categories", label: "Danh mục" },
  { to: "/admin/products", label: "Sản phẩm" },
  { to: "/admin/users", label: "Tài khoản" },
];

// Khung giao diện quản trị: thanh bên trái (trên điện thoại nằm ngang phía trên) + nội dung
export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-mist md:flex">
      <aside className="bg-ink text-white md:fixed md:inset-y-0 md:flex md:w-60 md:flex-col">
        <div className="px-6 py-5">
          <Link
            to="/admin"
            className="text-lg font-extrabold tracking-[0.25em]"
          >
            ARISTINO
          </Link>
          <p className="mt-1 text-[11px] uppercase tracking-widest text-white/60">
            Quản trị
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:overflow-visible md:pb-0">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-white font-bold text-ink"
                    : "text-white/80 hover:bg-white/10"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-white/15 px-6 py-5 text-sm md:block">
          <p className="truncate font-semibold">{user?.fullName}</p>
          <p className="truncate text-xs text-white/60">{user?.email}</p>
          <div className="mt-4 flex flex-col gap-2 text-xs uppercase tracking-wide">
            <Link to="/" className="text-white/80 hover:text-white">
              ← Về cửa hàng
            </Link>
            <button
              onClick={logout}
              className="cursor-pointer text-left text-white/80 hover:text-white"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 md:ml-60">
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3 text-xs md:hidden">
          <Link to="/" className="font-semibold uppercase tracking-wide">
            ← Về cửa hàng
          </Link>
          <button
            onClick={logout}
            className="cursor-pointer font-semibold uppercase tracking-wide"
          >
            Đăng xuất
          </button>
        </div>
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
