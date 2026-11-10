import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AdminCancelDialog from "../../components/admin/AdminCancelDialog";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { formatDate, formatMoney } from "../../lib/format";
import { CANCEL_REASONS, PAYMENT_METHOD } from "../../lib/status";

// Nút chuyển trạng thái theo từng bước tiếp theo của đơn
const ACTIONS = {
  CONFIRMED: { label: "Xác nhận đơn hàng", confirm: "Xác nhận đơn hàng này?" },
  SHIPPING: {
    label: "Bắt đầu giao hàng",
    confirm: "Chuyển đơn sang trạng thái đang giao hàng?",
  },
  COMPLETED: {
    label: "Xác nhận đã giao thành công",
    confirm:
      "Xác nhận khách đã nhận hàng? Với đơn COD, hệ thống sẽ ghi nhận đã thu tiền.",
  },
};

function Info({ label, children }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  useEffect(() => {
    let active = true;
    setDetail(null);
    setError("");
    adminService
      .getOrder(id)
      .then((res) => active && setDetail(res.data))
      .catch(
        (err) =>
          active && setError(getErrorMessage(err, "Không tìm thấy đơn hàng")),
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div>
        <p className="text-sm text-danger">{error}</p>
        <Link to="/admin/orders" className="btn btn-primary mt-6">
          Về danh sách đơn hàng
        </Link>
      </div>
    );
  }
  if (!detail) return <div className="h-64 animate-pulse bg-white" />;

  const order = detail.order;

  const changeStatus = async (status) => {
    if (!window.confirm(ACTIONS[status].confirm)) return;
    setBusy(true);
    try {
      const { data } = await adminService.updateOrderStatus(order.id, status);
      setDetail(data);
      toast.success("Đã cập nhật trạng thái đơn hàng");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl">
      <Link
        to="/admin/orders"
        className="text-xs font-semibold uppercase tracking-wide hover:text-accent"
      >
        ← Danh sách đơn hàng
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">
            Đơn hàng {order.orderCode}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            Đặt lúc {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.orderStatus} />
      </div>

      {/* Thao tác của cửa hàng */}
      {(detail.nextStatuses.length > 0 ||
        detail.blockedReason ||
        detail.canCancel) && (
        <section className="mt-6 border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Thao tác
          </p>
          {detail.blockedReason === "AWAITING_PAYMENT" && (
            <p className="mt-3 border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              Đơn thanh toán online này chưa được thanh toán nên chưa thể xác
              nhận. Nếu quá hạn thanh toán, hệ thống sẽ tự hủy đơn.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {detail.nextStatuses.map((s) => (
              <button
                key={s}
                disabled={busy}
                onClick={() => changeStatus(s)}
                className="btn btn-primary"
              >
                {ACTIONS[s].label}
              </button>
            ))}
            {detail.canCancel && (
              <button
                disabled={busy}
                onClick={() => setShowCancel(true)}
                className="btn btn-outline"
              >
                Hủy đơn hàng
              </button>
            )}
          </div>
        </section>
      )}

      {order.orderStatus === "CANCELLED" && (
        <section className="mt-6 border border-red-200 bg-red-50 p-5 text-sm leading-relaxed">
          <p className="font-bold text-red-900">
            Đơn hàng đã bị hủy
            {order.cancelledAt ? ` lúc ${formatDate(order.cancelledAt)}` : ""}
          </p>
          <p className="mt-1 text-red-900/80">
            Lý do: {CANCEL_REASONS[order.cancelReason] || "Không rõ"}
            {order.cancelNote ? ` — ${order.cancelNote}` : ""}
          </p>
          {order.paymentStatus === "REFUNDED" && (
            <p className="mt-1 text-red-900/80">
              Đã hoàn {formatMoney(order.totalAmount)} cho khách (hoàn tiền giả
              lập).
            </p>
          )}
        </section>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="border border-line bg-white p-6 lg:col-span-2">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            Sản phẩm
          </h2>
          <ul className="mt-4 divide-y divide-line">
            {order.items.map((item, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">{item.productName}</p>
                  <p className="mt-0.5 text-ink-soft">
                    {item.color} / {item.size} · {formatMoney(item.price)} ×{" "}
                    {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 font-medium">
                  {formatMoney(item.price * item.quantity)}
                </p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Phí vận chuyển</dt>
              <dd>
                {Number(order.shippingFee) > 0
                  ? formatMoney(order.shippingFee)
                  : "Miễn phí"}
              </dd>
            </div>
            <div className="flex justify-between text-base font-extrabold">
              <dt>Tổng thanh toán</dt>
              <dd>{formatMoney(order.totalAmount)}</dd>
            </div>
          </dl>
        </section>

        <div className="space-y-6">
          <section className="border border-line bg-white p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Khách hàng
            </h2>
            <dl className="mt-4 space-y-4">
              <Info label="Tài khoản">
                {detail.customerName}
                <br />
                <span className="text-ink-soft">{detail.customerEmail}</span>
              </Info>
              <Info label="Số điện thoại tài khoản">
                {detail.customerPhone || "Chưa cập nhật"}
              </Info>
            </dl>
          </section>

          <section className="border border-line bg-white p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Giao hàng
            </h2>
            <dl className="mt-4 space-y-4">
              <Info label="Người nhận">
                {order.recipientName}
                <br />
                <span className="text-ink-soft">{order.recipientPhone}</span>
              </Info>
              <Info label="Địa chỉ">{order.shippingAddress}</Info>
            </dl>
          </section>

          <section className="border border-line bg-white p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wide">
              Thanh toán
            </h2>
            <dl className="mt-4 space-y-4">
              <Info label="Phương thức">
                {PAYMENT_METHOD[order.paymentMethod] || order.paymentMethod}
              </Info>
              <Info label="Trạng thái">
                <StatusBadge kind="payment" status={order.paymentStatus} />
              </Info>
            </dl>
          </section>
        </div>
      </div>

      {showCancel && (
        <AdminCancelDialog
          detail={detail}
          onClose={() => setShowCancel(false)}
          onCancelled={(updated) => {
            setDetail(updated);
            setShowCancel(false);
          }}
        />
      )}
    </div>
  );
}
