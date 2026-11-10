import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, Package } from "lucide-react";
import EmptyState from "../components/EmptyState";
import Pagination from "../components/Pagination";
import StatusBadge from "../components/StatusBadge";
import { orderService } from "../services/orderService";
import { getErrorMessage } from "../services/api";
import { formatDate, formatMoney } from "../lib/format";

const PAGE_SIZE = 5;

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page")) || 0);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    orderService
      .getMine(page, PAGE_SIZE)
      .then((res) => active && setData(res.data))
      .catch((err) => active && setError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [page]);

  const orders = data?.content || [];

  return (
    <div className="page-container max-w-4xl py-10 sm:py-12">
      <h1 className="section-title">Đơn hàng của tôi</h1>

      <div className="mt-10">
        {error ? (
          <EmptyState icon={Package} title="Không tải được đơn hàng" text={error} />
        ) : data === null ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse bg-mist" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Bạn chưa có đơn hàng nào"
            text="Các đơn hàng bạn đặt sẽ xuất hiện ở đây để bạn tiện theo dõi."
            actionLabel="Bắt đầu mua sắm"
            actionTo="/products"
          />
        ) : (
          <>
            <ul className="space-y-4">
              {orders.map((o) => {
                const count = o.items.reduce((s, i) => s + i.quantity, 0);
                return (
                  <li key={o.id}>
                    <Link
                      to={`/orders/${o.id}`}
                      className="group flex items-center justify-between gap-6 border border-line p-5 transition-colors hover:border-ink"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <p className="text-base font-bold">{o.orderCode}</p>
                          <StatusBadge status={o.orderStatus} />
                        </div>
                        <p className="mt-2 text-sm text-ink-soft">
                          {formatDate(o.createdAt)} · {count} sản phẩm
                        </p>
                        <p className="mt-1 truncate text-sm text-ink-soft">{o.items.map((i) => i.productName).join(", ")}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <p className="font-bold">{formatMoney(o.totalAmount)}</p>
                        <ChevronRight size={18} className="text-ink-soft transition-transform group-hover:translate-x-1" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
            <Pagination
              page={page}
              totalPages={data.totalPages}
              onChange={(p) => {
                setParams({ page: p });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
