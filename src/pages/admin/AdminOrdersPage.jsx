import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import StatusBadge from "../../components/StatusBadge";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { formatDate, formatMoney } from "../../lib/format";
import { ORDER_STATUS, PAYMENT_METHOD } from "../../lib/status";

const PAGE_SIZE = 10;

// Danh sách đơn hàng cho cửa hàng: lọc theo trạng thái, tìm theo mã đơn / tên / số điện thoại người nhận
export default function AdminOrdersPage() {
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page")) || 0);
  const status = params.get("status") || "";
  const q = params.get("q") || "";

  const [keyword, setKeyword] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    adminService
      .getOrders({
        page,
        size: PAGE_SIZE,
        status: status || undefined,
        q: q || undefined,
      })
      .then((res) => active && setData(res.data))
      .catch((err) => active && setError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [page, status, q]);

  // Đổi bộ lọc luôn quay về trang đầu
  const update = (changes) => {
    const next = { status, q, ...changes };
    const clean = Object.fromEntries(Object.entries(next).filter(([, v]) => v));
    setParams(clean);
  };

  const orders = data?.content || [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Quản lý đơn hàng</h1>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="label" htmlFor="f-status">
            Trạng thái
          </label>
          <select
            id="f-status"
            className="input !w-52"
            value={status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Tất cả</option>
            {Object.entries(ORDER_STATUS).map(([key, info]) => (
              <option key={key} value={key}>
                {info.label}
              </option>
            ))}
          </select>
        </div>
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            update({ q: keyword.trim() });
          }}
        >
          <div>
            <label className="label" htmlFor="f-q">
              Tìm kiếm
            </label>
            <input
              id="f-q"
              className="input !w-72"
              placeholder="Mã đơn, tên hoặc số điện thoại người nhận"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Tìm
          </button>
          {(q || status) && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setKeyword("");
                setParams({});
              }}
            >
              Xóa lọc
            </button>
          )}
        </form>
      </div>

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        {error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : data === null ? (
          <div className="h-64 animate-pulse bg-white" />
        ) : orders.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-soft">
            Không có đơn hàng nào phù hợp.
          </p>
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khách hàng</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3">Thanh toán</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-mist/60">
                  <td className="px-4 py-3 font-semibold">{o.orderCode}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.recipientName}</p>
                    <p className="text-xs text-ink-soft">{o.recipientPhone}</p>
                  </td>
                  <td className="px-4 py-3 text-ink-soft">
                    {formatDate(o.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatMoney(o.totalAmount)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="mb-1 text-xs text-ink-soft">
                      {PAYMENT_METHOD[o.paymentMethod] || o.paymentMethod}
                    </p>
                    <StatusBadge kind="payment" status={o.paymentStatus} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={o.orderStatus} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/admin/orders/${o.id}`}
                      className="text-xs font-semibold uppercase tracking-wide hover:text-accent"
                    >
                      Xem
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <p className="mt-3 text-xs text-ink-soft">
          Tổng cộng {data.totalElements} đơn hàng
        </p>
      )}
      {data && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onChange={(p) =>
            setParams({ ...Object.fromEntries(params), page: String(p) })
          }
        />
      )}
    </div>
  );
}
