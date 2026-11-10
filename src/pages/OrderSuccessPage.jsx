import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { orderService } from "../services/orderService";
import { formatDate, formatMoney } from "../lib/format";
import { PAYMENT_METHOD } from "../lib/status";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderService
      .getById(id)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(false));
  }, [id]);

  return (
    <div className="page-container max-w-3xl py-14 sm:py-20">
      <div className="text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-moss text-white">
          <Check size={32} strokeWidth={3} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">
          Đặt hàng thành công
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
          Cảm ơn bạn đã mua sắm tại Aristino. Đơn hàng đã được ghi nhận và sẽ
          được xử lý trong thời gian sớm nhất.
        </p>
      </div>

      {order && (
        <div className="mt-10 border border-line p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Mã đơn hàng
              </p>
              <p className="mt-1 text-xl font-bold">{order.orderCode}</p>
            </div>
            <StatusBadge status={order.orderStatus} />
          </div>
          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-ink-soft">Ngày đặt</dt>
              <dd className="mt-1 font-medium">
                {formatDate(order.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">Thanh toán</dt>
              <dd className="mt-1 flex flex-wrap items-center gap-3 font-medium">
                {PAYMENT_METHOD[order.paymentMethod] || order.paymentMethod}
                {order.paymentMethod !== "COD" && (
                  <StatusBadge kind="payment" status={order.paymentStatus} />
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-ink-soft">Giao tới</dt>
              <dd className="mt-1 font-medium">
                {order.recipientName} · {order.recipientPhone}
                <br />
                <span className="font-normal text-ink-soft">
                  {order.shippingAddress}
                </span>
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex items-center justify-between border-t border-line pt-5">
            <span className="font-bold uppercase">Tổng thanh toán</span>
            <span className="text-xl font-bold text-accent">
              {formatMoney(order.totalAmount)}
            </span>
          </div>
        </div>
      )}

      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {order && (
          <Link to={`/orders/${id}`} className="btn btn-primary">
            Xem chi tiết đơn hàng
          </Link>
        )}
        <Link to="/products" className="btn btn-outline">
          Tiếp tục mua sắm
        </Link>
      </div>
    </div>
  );
}
