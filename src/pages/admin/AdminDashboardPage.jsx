import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { formatMoney } from "../../lib/format";
import { ORDER_STATUS } from "../../lib/status";

const RANGES = [7, 30, 90];
const BAR_COLORS = {
  PENDING: "bg-amber-400",
  CONFIRMED: "bg-sky-500",
  SHIPPING: "bg-sky-700",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-red-400",
};

const dayLabel = (iso) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;

function Kpi({ label, value, note }) {
  return (
    <div className="border border-line bg-white p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
        {label}
      </p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
      {note && <p className="mt-1 text-xs text-ink-soft">{note}</p>}
    </div>
  );
}

// Trang tổng quan: số liệu chính, doanh thu theo ngày, đơn theo trạng thái, sản phẩm bán chạy
export default function AdminDashboardPage() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setStats(null);
    setError("");
    adminService
      .getStats(days)
      .then((res) => active && setStats(res.data))
      .catch((err) => active && setError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [days]);

  if (error) return <p className="text-sm text-danger">{error}</p>;
  if (!stats) return <div className="h-64 animate-pulse bg-white" />;

  const { kpis, daily, ordersByStatus, topProducts } = stats;
  const maxRevenue = Math.max(...daily.map((d) => Number(d.revenue)), 1);
  const totalStatus = ordersByStatus.reduce((s, x) => s + x.count, 0) || 1;
  const labelStep = Math.max(1, Math.ceil(daily.length / 7));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Tổng quan</h1>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setDays(r)}
              className={`cursor-pointer px-4 py-2 text-xs font-semibold uppercase tracking-wide ${
                days === r
                  ? "bg-ink text-white"
                  : "border border-line bg-white hover:border-ink"
              }`}
            >
              {r} ngày
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label={`Doanh thu ${days} ngày`}
          value={formatMoney(kpis.revenueInPeriod)}
          note={`${kpis.completedOrdersInPeriod} đơn hoàn tất`}
        />
        <Kpi
          label="Doanh thu tổng cộng"
          value={formatMoney(kpis.revenueAllTime)}
          note="Các đơn đã hoàn tất"
        />
        <Kpi label="Đơn mới hôm nay" value={kpis.newOrdersToday} />
        <Link
          to="/admin/orders?status=PENDING"
          className="block transition-colors hover:bg-amber-50"
        >
          <Kpi
            label="Chờ xác nhận"
            value={kpis.pendingOrders}
            note="Bấm để xử lý"
          />
        </Link>
        <Kpi label="Tổng số đơn hàng" value={kpis.totalOrders} />
        <Kpi label="Khách hàng" value={kpis.totalCustomers} />
        <Kpi label="Sản phẩm" value={kpis.totalProducts} />
      </div>

      <section className="mt-8 border border-line bg-white p-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">
          Doanh thu theo ngày
        </h2>
        <p className="mt-1 text-xs text-ink-soft">
          Chỉ tính các đơn đã hoàn tất, theo ngày đặt hàng.
        </p>
        <div className="mt-6 flex h-56 items-end gap-[3px]">
          {daily.map((d) => {
            const height = Math.round((Number(d.revenue) / maxRevenue) * 100);
            return (
              <div
                key={d.date}
                title={`${dayLabel(d.date)}: ${formatMoney(d.revenue)} (${d.orders} đơn)`}
                className="flex h-full flex-1 items-end"
              >
                <div
                  className={`w-full ${Number(d.revenue) > 0 ? "bg-ink hover:bg-accent" : "bg-line"}`}
                  style={{
                    height: `${Math.max(height, Number(d.revenue) > 0 ? 3 : 1)}%`,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex gap-[3px] text-[10px] text-ink-soft">
          {daily.map((d, i) => (
            <span
              key={d.date}
              className="flex-1 overflow-visible whitespace-nowrap"
            >
              {i % labelStep === 0 ? dayLabel(d.date) : ""}
            </span>
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="border border-line bg-white p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            Đơn hàng theo trạng thái
          </h2>
          <ul className="mt-5 space-y-4">
            {ordersByStatus.length === 0 && (
              <li className="text-sm text-ink-soft">Chưa có đơn hàng nào.</li>
            )}
            {ordersByStatus.map((s) => (
              <li key={s.status}>
                <div className="flex justify-between text-sm">
                  <span>{ORDER_STATUS[s.status]?.label || s.status}</span>
                  <span className="font-semibold">{s.count}</span>
                </div>
                <div className="mt-1.5 h-2 bg-mist">
                  <div
                    className={`h-full ${BAR_COLORS[s.status] || "bg-stone-400"}`}
                    style={{ width: `${(s.count / totalStatus) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="border border-line bg-white p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            Sản phẩm bán chạy ({days} ngày)
          </h2>
          {topProducts.length === 0 ? (
            <p className="mt-5 text-sm text-ink-soft">
              Chưa có đơn hoàn tất trong khoảng thời gian này.
            </p>
          ) : (
            <ol className="mt-5 space-y-4">
              {topProducts.map((p, i) => (
                <li key={p.name} className="flex items-center gap-4 text-sm">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center bg-ink text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {p.name}
                  </span>
                  <span className="shrink-0 text-right text-xs text-ink-soft">
                    {p.quantity} cái
                    <br />
                    <span className="font-semibold text-ink">
                      {formatMoney(p.revenue)}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
