import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2 } from "lucide-react";
import ProductImage from "../components/ProductImage";
import QuantityStepper from "../components/QuantityStepper";
import EmptyState from "../components/EmptyState";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../lib/format";

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  const run = async (itemId, action, successMessage) => {
    setBusyId(itemId);
    try {
      await action();
      if (successMessage) toast.success(successMessage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !cart) {
    return <div className="page-container py-20 text-center text-sm text-ink-soft">Đang tải giỏ hàng...</div>;
  }

  const items = cart?.items || [];

  return (
    <div className="page-container py-10 sm:py-12">
      <h1 className="section-title">Giỏ hàng của bạn</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            icon={ShoppingBag}
            title="Giỏ hàng đang trống"
            text="Hãy khám phá bộ sưu tập và chọn cho mình những món đồ ưng ý."
            actionLabel="Tiếp tục mua sắm"
            actionTo="/products"
          />
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="hidden grid-cols-[1fr_120px_130px_120px_32px] gap-4 border-b border-ink pb-3 text-xs font-extrabold uppercase tracking-wide md:grid">
              <span>Sản phẩm</span>
              <span className="text-right">Đơn giá</span>
              <span className="text-center">Số lượng</span>
              <span className="text-right">Thành tiền</span>
              <span />
            </div>
            <ul className="divide-y divide-line border-b border-line">
              {items.map((item) => (
                <li key={item.id} className="grid grid-cols-[88px_1fr] items-center gap-4 py-5 md:grid-cols-[1fr_120px_130px_120px_32px]">
                  <div className="flex items-center gap-4 md:col-span-1">
                    <div className="aspect-[3/4] w-[88px] shrink-0 overflow-hidden bg-mist">
                      <ProductImage src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                    </div>
                    <div className="hidden md:block">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.productName}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {item.color} / {item.size}
                      </p>
                    </div>
                  </div>

                  {/* Điện thoại: gộp thông tin vào 1 cột bên phải ảnh */}
                  <div className="md:contents">
                    <div className="md:hidden">
                      <p className="line-clamp-2 text-sm font-semibold leading-snug">{item.productName}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {item.color} / {item.size}
                      </p>
                    </div>
                    <p className="mt-2 text-sm md:mt-0 md:text-right">{formatMoney(item.price)}</p>
                    <div className="mt-3 flex items-center justify-between md:mt-0 md:justify-center">
                      <QuantityStepper
                        small
                        value={item.quantity}
                        disabled={busyId === item.id}
                        onChange={(q) => run(item.id, () => updateItem(item.id, q))}
                      />
                      <button
                        aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
                        disabled={busyId === item.id}
                        onClick={() => run(item.id, () => removeItem(item.id), "Đã xóa sản phẩm khỏi giỏ hàng")}
                        className="cursor-pointer p-1 text-ink-soft transition-colors hover:text-accent disabled:opacity-40 md:hidden"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="mt-2 text-sm font-bold md:mt-0 md:text-right">{formatMoney(item.lineTotal)}</p>
                    <button
                      aria-label={`Xóa ${item.productName} khỏi giỏ hàng`}
                      disabled={busyId === item.id}
                      onClick={() => run(item.id, () => removeItem(item.id), "Đã xóa sản phẩm khỏi giỏ hàng")}
                      className="hidden cursor-pointer p-1 text-ink-soft transition-colors hover:text-accent disabled:opacity-40 md:block"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/products" className="mt-6 inline-block text-xs font-semibold uppercase tracking-wide underline underline-offset-4 hover:text-accent">
              ← Tiếp tục mua sắm
            </Link>
          </div>

          <aside className="h-fit bg-mist p-6 lg:sticky lg:top-28 lg:col-span-4">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">Tổng tiền</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-ink-soft">Tạm tính</dt>
                <dd className="font-medium">{formatMoney(cart.totalAmount)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-ink-soft">Phí vận chuyển</dt>
                <dd className="font-medium text-moss">Miễn phí</dd>
              </div>
              <div className="flex items-center justify-between border-t border-line pt-4">
                <dt className="font-bold uppercase">Tổng cộng</dt>
                <dd className="text-xl font-bold text-accent">{formatMoney(cart.totalAmount)}</dd>
              </div>
            </dl>
            <Link to="/checkout" className="btn btn-accent mt-6 w-full !py-4">
              Thanh toán
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
