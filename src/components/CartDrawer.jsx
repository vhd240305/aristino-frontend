import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, Trash2, X } from "lucide-react";
import ProductImage from "./ProductImage";
import QuantityStepper from "./QuantityStepper";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../lib/format";

// Giỏ hàng nhỏ trượt từ bên phải, mở khi bấm biểu tượng giỏ hoặc sau khi thêm sản phẩm
export default function CartDrawer() {
  const { user } = useAuth();
  const { cart, drawerOpen, closeDrawer, updateItem, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [busyId, setBusyId] = useState(null);

  // Đổi trang thì đóng giỏ; khóa cuộn trang nền và đóng bằng phím Esc khi đang mở
  useEffect(() => {
    closeDrawer();
  }, [location.pathname, closeDrawer]);

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, closeDrawer]);

  const run = async (id, action) => {
    setBusyId(id);
    try {
      await action();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const items = cart?.items || [];
  const count = items.reduce((s, i) => s + i.quantity, 0);

  const goCheckout = () => {
    closeDrawer();
    navigate("/checkout");
  };

  return (
    <div className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-label="Giỏ hàng"
        inert={!drawerOpen}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white transition-transform duration-300 ${
          drawerOpen ? "translate-x-0 shadow-2xl" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">Giỏ hàng ({count})</h2>
          <button onClick={closeDrawer} aria-label="Đóng giỏ hàng" className="cursor-pointer p-1 hover:text-accent">
            <X size={22} />
          </button>
        </div>

        {!user ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={44} strokeWidth={1.2} className="text-ink-soft" />
            <p className="mt-4 text-sm text-ink-soft">Vui lòng đăng nhập để xem giỏ hàng của bạn.</p>
            <Link to="/login" state={{ from: location }} className="btn btn-primary mt-6">
              Đăng nhập
            </Link>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <ShoppingBag size={44} strokeWidth={1.2} className="text-ink-soft" />
            <p className="mt-4 text-sm text-ink-soft">Giỏ hàng của bạn đang trống.</p>
            <Link to="/products" className="btn btn-primary mt-6">
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-5">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 py-4">
                  <div className="aspect-[3/4] w-20 shrink-0 overflow-hidden bg-mist">
                    <ProductImage src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.productName}</p>
                        <p className="mt-1 text-xs text-ink-soft">
                          {item.color} / {item.size}
                        </p>
                      </div>
                      <button
                        aria-label={`Xóa ${item.productName}`}
                        disabled={busyId === item.id}
                        onClick={() => run(item.id, () => removeItem(item.id))}
                        className="cursor-pointer p-1 text-ink-soft hover:text-accent disabled:opacity-40"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <QuantityStepper
                        small
                        value={item.quantity}
                        disabled={busyId === item.id}
                        onChange={(q) => run(item.id, () => updateItem(item.id, q))}
                      />
                      <p className="text-sm font-bold">{formatMoney(item.lineTotal)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-5 py-5">
              <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wide">
                <span>Tổng tiền</span>
                <span className="text-lg text-accent">{formatMoney(cart.totalAmount)}</span>
              </div>
              <p className="mt-1 text-xs text-ink-soft">Miễn phí vận chuyển toàn quốc.</p>
              <button onClick={goCheckout} className="btn btn-accent mt-4 w-full">
                Thanh toán
              </button>
              <Link to="/cart" className="btn btn-outline mt-2 w-full">
                Xem giỏ hàng
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
