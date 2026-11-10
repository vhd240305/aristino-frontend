import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Plus, ShoppingBag } from "lucide-react";
import AddressForm from "../components/AddressForm";
import EmptyState from "../components/EmptyState";
import ProductImage from "../components/ProductImage";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { addressService } from "../services/addressService";
import { orderService } from "../services/orderService";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../lib/format";

// disabled: true = tạm khóa phương thức đó
const PAYMENT_OPTIONS = [
  {
    value: "COD",
    label: "Thanh toán khi nhận hàng (COD)",
    note: "Trả tiền mặt cho nhân viên giao hàng",
    disabled: false,
  },
  {
    value: "VNPAY",
    label: "VNPay",
    note: "Cổng thanh toán giả lập (dùng cho đồ án). Đơn sẽ tự hủy nếu quá hạn thanh toán.",
    disabled: false,
  },
  {
    value: "MOMO",
    label: "Ví MoMo",
    note: "Cổng thanh toán giả lập (dùng cho đồ án). Đơn sẽ tự hủy nếu quá hạn thanh toán.",
    disabled: false,
  },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const { cart, loading: cartLoading, clearCartLocal } = useCart();

  const [addresses, setAddresses] = useState(null);
  const [addressId, setAddressId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [payment, setPayment] = useState("COD");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    addressService
      .getMine()
      .then((res) => {
        const list = res.data;
        setAddresses(list);
        setAddressId((list.find((a) => a.isDefault) || list[0])?.id ?? null);
        setShowForm(list.length === 0);
      })
      .catch((err) => {
        setAddresses([]);
        toast.error(getErrorMessage(err));
      });
  }, [toast]);

  const handleAddressCreated = (address) => {
    setAddresses((list) => [...(list || []), address]);
    setAddressId(address.id);
    setShowForm(false);
    toast.success("Đã lưu địa chỉ giao hàng");
  };

  const placeOrder = async () => {
    if (!addressId) {
      toast.error("Vui lòng chọn hoặc thêm địa chỉ giao hàng");
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await orderService.create(addressId, payment);
      // COD: xong luôn. VNPay/MoMo: chuyển sang cổng thanh toán giả lập để thanh toán
      navigate(
        payment === "COD" ? `/order-success/${data.id}` : `/payment/${data.id}`,
        { replace: true },
      );
      clearCartLocal();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  if ((cartLoading && !cart) || addresses === null) {
    return (
      <div className="page-container py-20 text-center text-sm text-ink-soft">
        Đang tải...
      </div>
    );
  }

  const items = cart?.items || [];
  if (items.length === 0) {
    return (
      <div className="page-container py-12">
        <EmptyState
          icon={ShoppingBag}
          title="Giỏ hàng đang trống"
          text="Bạn cần có sản phẩm trong giỏ hàng để đặt hàng."
          actionLabel="Đi mua sắm"
          actionTo="/products"
        />
      </div>
    );
  }

  const stepTitle =
    "flex items-center gap-3 text-sm font-extrabold uppercase tracking-wide";
  const stepNo =
    "flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-white";

  return (
    <div className="page-container py-10 sm:py-12">
      <h1 className="section-title">Thanh toán</h1>

      <div className="mt-10 grid gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          {/* 1. Địa chỉ */}
          <section>
            <h2 className={stepTitle}>
              <span className={stepNo}>1</span> Địa chỉ giao hàng
            </h2>

            <div className="mt-5 space-y-3">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors ${
                    addressId === a.id
                      ? "border-ink bg-white"
                      : "border-line hover:border-ink/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={addressId === a.id}
                    onChange={() => setAddressId(a.id)}
                    className="mt-1 h-4 w-4 accent-ink"
                  />
                  <div className="text-sm leading-relaxed">
                    <p className="font-semibold">
                      {a.recipientName}{" "}
                      <span className="font-normal text-ink-soft">
                        · {a.phone}
                      </span>
                      {a.isDefault && (
                        <span className="ml-3 bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                          Mặc định
                        </span>
                      )}
                    </p>
                    <p className="text-ink-soft">
                      {[a.detailAddress, a.ward, a.district, a.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {showForm ? (
              <div className="mt-4">
                <AddressForm
                  defaultName={user?.fullName}
                  onCreated={handleAddressCreated}
                  onCancel={
                    addresses.length > 0 ? () => setShowForm(false) : undefined
                  }
                />
              </div>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 inline-flex cursor-pointer items-center gap-2 text-xs font-semibold uppercase tracking-wide hover:text-accent"
              >
                <Plus size={14} /> Thêm địa chỉ mới
              </button>
            )}
          </section>

          {/* 2. Thanh toán */}
          <section>
            <h2 className={stepTitle}>
              <span className={stepNo}>2</span> Phương thức thanh toán
            </h2>
            <div className="mt-5 space-y-3">
              {PAYMENT_OPTIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-start gap-4 border p-4 transition-colors ${
                    o.disabled
                      ? "cursor-not-allowed border-line opacity-50"
                      : payment === o.value
                        ? "cursor-pointer border-ink bg-white"
                        : "cursor-pointer border-line hover:border-ink/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    disabled={o.disabled}
                    checked={payment === o.value}
                    onChange={() => setPayment(o.value)}
                    className="mt-1 h-4 w-4 accent-ink"
                  />
                  <div className="text-sm">
                    <p className="font-semibold">{o.label}</p>
                    <p className="text-ink-soft">{o.note}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Tóm tắt đơn */}
        <aside className="h-fit bg-mist p-6 lg:sticky lg:top-28 lg:col-span-5">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            Đơn hàng của bạn
          </h2>
          <ul className="mt-5 divide-y divide-line">
            {items.map((item) => (
              <li key={item.id} className="flex gap-4 py-4">
                <div className="relative aspect-[3/4] w-16 shrink-0 bg-white">
                  <ProductImage
                    src={item.imageUrl}
                    alt={item.productName}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-2 font-semibold leading-snug">
                    {item.productName}
                  </p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {item.color} / {item.size}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {formatMoney(item.lineTotal)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-3 border-t border-line pt-5 text-sm">
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
              <dd className="text-xl font-bold text-accent">
                {formatMoney(cart.totalAmount)}
              </dd>
            </div>
          </dl>
          <button
            onClick={placeOrder}
            disabled={submitting || !addressId}
            className="btn btn-accent mt-6 w-full !py-4"
          >
            {submitting ? "Đang xử lý..." : "Đặt hàng"}
          </button>
          {!addressId && (
            <p className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
              <MapPin size={13} /> Hãy chọn hoặc thêm địa chỉ giao hàng để đặt
              hàng.
            </p>
          )}
          <Link
            to="/cart"
            className="mt-4 block text-center text-xs font-semibold uppercase tracking-wide underline underline-offset-4 hover:text-accent"
          >
            Quay lại giỏ hàng
          </Link>
        </aside>
      </div>
    </div>
  );
}
