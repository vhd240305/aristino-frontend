import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { formatDate, formatMoney } from "../../lib/format";
import { AccountStatusBadge, RoleBadge } from "./AdminUsersPage";

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

// Chi tiết tài khoản: thông tin, tổng tiền đã mua, đơn gần đây; khóa/mở khóa, cấp/thu hồi quyền quản trị
export default function AdminUserDetailPage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const toast = useToast();
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    setDetail(null);
    setError("");
    adminService
      .getUser(id)
      .then((res) => active && setDetail(res.data))
      .catch(
        (err) =>
          active && setError(getErrorMessage(err, "Không tìm thấy tài khoản")),
      );
    return () => {
      active = false;
    };
  }, [id]);

  if (error) {
    return (
      <div>
        <p className="text-sm text-danger">{error}</p>
        <Link to="/admin/users" className="btn btn-primary mt-6">
          Về danh sách tài khoản
        </Link>
      </div>
    );
  }
  if (!detail) return <div className="h-64 animate-pulse bg-white" />;

  const u = detail.user;
  const self = u.id === me?.id;
  const locked = u.status === "LOCKED";

  const run = async (confirmMessage, action, successMessage) => {
    if (!window.confirm(confirmMessage)) return;
    setBusy(true);
    try {
      const { data } = await action();
      setDetail(data);
      toast.success(successMessage);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <Link
        to="/admin/users"
        className="text-xs font-semibold uppercase tracking-wide hover:text-accent"
      >
        ← Danh sách tài khoản
      </Link>

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">{u.fullName}</h1>
          <p className="mt-1 text-sm text-ink-soft">{u.email}</p>
        </div>
        <div className="flex gap-2">
          <RoleBadge admin={u.admin} />
          <AccountStatusBadge status={u.status} />
        </div>
      </div>

      {self ? (
        <p className="mt-6 border border-line bg-mist p-4 text-sm text-ink-soft">
          Đây là tài khoản của bạn nên không thể tự khóa hoặc tự thu hồi quyền
          quản trị.
        </p>
      ) : (
        <section className="mt-6 border border-line bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Thao tác
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              disabled={busy}
              onClick={() =>
                run(
                  locked
                    ? `Mở khóa tài khoản "${u.email}"?`
                    : `Khóa tài khoản "${u.email}"? Người này sẽ không đăng nhập và không dùng được website nữa.`,
                  () =>
                    adminService.updateUserStatus(
                      u.id,
                      locked ? "ACTIVE" : "LOCKED",
                    ),
                  locked ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản",
                )
              }
              className="btn btn-primary"
            >
              {locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
            </button>
            <button
              disabled={busy}
              onClick={() =>
                run(
                  u.admin
                    ? `Thu hồi quyền quản trị của "${u.email}"?`
                    : `Cấp quyền quản trị cho "${u.email}"? Người này sẽ quản lý được toàn bộ đơn hàng, sản phẩm và tài khoản.`,
                  () => adminService.setUserAdmin(u.id, !u.admin),
                  u.admin
                    ? "Đã thu hồi quyền quản trị"
                    : "Đã cấp quyền quản trị",
                )
              }
              className="btn btn-outline"
            >
              {u.admin ? "Thu hồi quyền quản trị" : "Cấp quyền quản trị"}
            </button>
          </div>
          <p className="mt-3 text-xs text-ink-soft">
            Việc khóa có hiệu lực ngay. Giao diện của người bị đổi quyền chỉ cập
            nhật sau khi họ đăng nhập lại.
          </p>
        </section>
      )}

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section className="border border-line bg-white p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            Thông tin
          </h2>
          <dl className="mt-4 space-y-4">
            <Info label="Số điện thoại">{u.phone || "Chưa cập nhật"}</Info>
            <Info label="Ngày đăng ký">{formatDate(u.createdAt)}</Info>
            <Info label="Đăng ký bằng">
              {u.provider === "GOOGLE"
                ? "Tài khoản Google"
                : "Email và mật khẩu"}
            </Info>
          </dl>
        </section>
        <section className="border border-line bg-white p-6">
          <h2 className="text-sm font-extrabold uppercase tracking-wide">
            Mua hàng
          </h2>
          <dl className="mt-4 space-y-4">
            <Info label="Tổng số đơn">{u.orderCount}</Info>
            <Info label="Tổng tiền đã mua (đơn hoàn tất)">
              {formatMoney(detail.totalSpent)}
            </Info>
          </dl>
        </section>
      </div>

      <section className="mt-6 border border-line bg-white p-6">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">
          Đơn hàng gần đây
        </h2>
        {detail.recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            Tài khoản này chưa có đơn hàng nào.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="pb-2 pr-4 font-semibold">Mã đơn</th>
                  <th className="pb-2 pr-4 font-semibold">Ngày đặt</th>
                  <th className="pb-2 pr-4 text-right font-semibold">
                    Tổng tiền
                  </th>
                  <th className="pb-2 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {detail.recentOrders.map((o) => (
                  <tr key={o.id}>
                    <td className="py-3 pr-4 font-semibold">
                      <Link
                        to={`/admin/orders/${o.id}`}
                        className="hover:text-accent"
                      >
                        {o.orderCode}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-ink-soft">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {formatMoney(o.totalAmount)}
                    </td>
                    <td className="py-3">
                      <StatusBadge status={o.orderStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
