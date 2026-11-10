import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Check, Package } from "lucide-react";
import EmptyState from "../components/EmptyState";
import StatusBadge from "../components/StatusBadge";
import { orderService } from "../services/orderService";
import { getErrorMessage } from "../services/api";
import { formatDate, formatMoney } from "../lib/format";
import { CANCEL_REASONS, PAYMENT_METHOD, TIMELINE_STEPS } from "../lib/status";
import CancelOrderDialog from "../components/CancelOrderDialog";
import { formatCountdown, useCountdown } from "../hooks/useCountdown";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  // Đếm ngược thời hạn thanh toán (null nếu đơn không chờ thanh toán online)
  const secondsLeft = useCountdown(order?.paymentSecondsLeft ?? null);

  useEffect(() => {
    let active = true;
    setOrder(null);
    setError("");
    orderService
      .getById(id)
      .then((res) => active && setOrder(res.data))
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
      <div className="page-container py-12">
        <EmptyState
          icon={Package}
          title="Không xem được đơn hàng"
          text={error}
          actionLabel="Về danh sách đơn hàng"
          actionTo="/orders"
        />
      </div>
    );
  }
  if (!order) {
    return (
      <div className="page-container py-20 text-center text-sm text-ink-soft">
        Đang tải đơn hàng...
      </div>
    );
  }

  const remaining = secondsLeft ?? order.paymentSecondsLeft; // tránh nháy "quá hạn" ở lần render đầu
  const currentStep = TIMELINE_STEPS.findIndex(
    (s) => s.key === order.orderStatus,
  );
  const showTimeline = currentStep !== -1; // Các trạng thái hủy/đổi trả không nằm trong tiến trình giao hàng
  const box = "border border-line p-6 sm:p-7";
  const boxTitle = "text-sm font-extrabold uppercase tracking-wide";

  return (
    <div className="page-container max-w-4xl py-10 sm:py-12">
      <Link
        to="/orders"
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide hover:text-accent"
      >
        <ArrowLeft size={14} /> Đơn hàng của tôi
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">
            Đơn hàng {order.orderCode}
          </h1>
          <p className="mt-2 text-sm text-ink-soft">
            Đặt lúc {formatDate(order.createdAt)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={order.orderStatus} />
          {order.canCancel && (
            <button
              onClick={() => setShowCancel(true)}
              className="btn btn-outline !px-4 !py-2 !text-xs"
            >
              Hủy đơn hàng
            </button>
          )}
        </div>
      </div>

      {/* Đơn online đang chờ thanh toán */}
      {order.paymentSecondsLeft != null && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-amber-300 bg-amber-50 p-5 text-sm">
          <div>
            <p className="font-bold text-amber-900">
              Đơn hàng đang chờ thanh toán
            </p>
            {remaining > 0 ? (
              <p className="mt-1 text-amber-900/80">
                Vui lòng thanh toán trong{" "}
                <span className="font-bold tabular-nums">
                  {formatCountdown(remaining)}
                </span>
                . Quá hạn, đơn hàng sẽ tự động bị hủy.
              </p>
            ) : (
              <p className="mt-1 text-amber-900/80">
                Đã quá hạn thanh toán, đơn hàng sẽ được hệ thống tự động hủy
                trong ít phút.
              </p>
            )}
          </div>
          {order.canPay && remaining > 0 && (
            <Link to={`/payment/${order.id}`} className="btn btn-accent">
              {order.paymentStatus === "FAILED"
                ? "Thanh toán lại"
                : "Thanh toán ngay"}
            </Link>
          )}
        </div>
      )}

      {/* Thông tin hủy đơn */}
      {order.orderStatus === "CANCELLED" && (
        <section className="mt-8 border border-red-200 bg-red-50 p-5 text-sm leading-relaxed">
          <p className="font-bold text-red-900">
            Đơn hàng đã bị hủy
            {order.cancelledAt ? ` lúc ${formatDate(order.cancelledAt)}` : ""}
          </p>
          <p className="mt-1 text-red-900/80">
            Lý do: {CANCEL_REASONS[order.cancelReason] || "Không rõ"}
            {order.cancelNote ? ` — ${order.cancelNote}` : ""}
          </p>
          {order.paymentStatus === "REFUNDED" ? (
            <p className="mt-1 text-red-900/80">
              Số tiền {formatMoney(order.totalAmount)} đã được hoàn về phương
              thức thanh toán của bạn (hoàn tiền giả lập).
            </p>
          ) : order.paymentMethod !== "COD" ? (
            <p className="mt-1 text-red-900/80">
              Đơn chưa được thanh toán nên không phát sinh hoàn tiền.
            </p>
          ) : null}
        </section>
      )}

      {/* Cửa hàng đã xử lý: khách không tự hủy được nữa */}
      {["CONFIRMED", "SHIPPING"].includes(order.orderStatus) && (
        <p className="mt-8 border border-line bg-mist p-4 text-sm text-ink-soft">
          Đơn hàng đã được cửa hàng xử lý nên không thể tự hủy. Nếu cần hỗ trợ,
          vui lòng liên hệ cửa hàng.
        </p>
      )}

      {/* Theo dõi trạng thái */}
      <section className={`mt-8 ${box}`}>
        <h2 className={boxTitle}>Trạng thái đơn hàng</h2>
        {showTimeline ? (
          <ol className="mt-8 grid grid-cols-4">
            {TIMELINE_STEPS.map((step, i) => {
              const done = i <= currentStep;
              return (
                <li
                  key={step.key}
                  className="relative flex flex-col items-center text-center"
                >
                  {i > 0 && (
                    <span
                      className={`absolute right-1/2 top-4 h-0.5 w-full ${i <= currentStep ? "bg-ink" : "bg-line"}`}
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      done
                        ? "bg-ink text-white"
                        : "border border-line bg-white text-ink-soft"
                    }`}
                  >
                    {done ? <Check size={15} /> : i + 1}
                  </span>
                  <span
                    className={`mt-3 text-xs ${done ? "font-bold text-ink" : "text-ink-soft"}`}
                  >
                    {step.label}
                  </span>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-4 text-sm text-ink-soft">
            Đơn hàng đang ở trạng thái{" "}
            <StatusBadge status={order.orderStatus} />.
          </p>
        )}
      </section>

      {/* Sản phẩm */}
      <section className={`mt-6 ${box}`}>
        <h2 className={boxTitle}>Sản phẩm</h2>
        <ul className="mt-3 divide-y divide-line">
          {order.items.map((item, i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-6 py-4 text-sm"
            >
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="mt-0.5 text-ink-soft">
                  {item.color} / {item.size} · SL {item.quantity}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-medium">
                  {formatMoney(item.price * item.quantity)}
                </p>
                {order.orderStatus === "COMPLETED" && item.productSlug && (
                  <Link
                    to={`/products/${item.productSlug}#reviews`}
                    className="mt-1 inline-block text-xs font-semibold uppercase tracking-wide underline underline-offset-4 hover:text-accent"
                  >
                    Đánh giá sản phẩm
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-3 border-t border-line pt-5 text-sm">
          <div className="flex justify-between">
            <dt className="text-ink-soft">Phí vận chuyển</dt>
            <dd className="font-medium">
              {Number(order.shippingFee) > 0
                ? formatMoney(order.shippingFee)
                : "Miễn phí"}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-bold uppercase">Tổng thanh toán</dt>
            <dd className="text-xl font-bold text-accent">
              {formatMoney(order.totalAmount)}
            </dd>
          </div>
        </dl>
      </section>

      {/* Giao hàng + thanh toán */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className={box}>
          <h2 className={boxTitle}>Giao hàng tới</h2>
          <p className="mt-4 text-sm leading-relaxed">
            <span className="font-semibold">{order.recipientName}</span>
            <br />
            {order.recipientPhone}
            <br />
            <span className="text-ink-soft">{order.shippingAddress}</span>
          </p>
        </section>
        <section className={box}>
          <h2 className={boxTitle}>Thanh toán</h2>
          <p className="mt-4 text-sm">
            {PAYMENT_METHOD[order.paymentMethod] || order.paymentMethod}
          </p>
          <div className="mt-3">
            <StatusBadge kind="payment" status={order.paymentStatus} />
          </div>
        </section>
      </div>

      {showCancel && (
        <CancelOrderDialog
          order={order}
          onClose={() => setShowCancel(false)}
          onCancelled={(updated) => {
            setOrder(updated);
            setShowCancel(false);
          }}
        />
      )}
    </div>
  );
}
