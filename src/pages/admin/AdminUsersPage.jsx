import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { formatDate } from "../../lib/format";

const PAGE_SIZE = 10;

export function RoleBadge({ admin }) {
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        admin ? "bg-ink text-white" : "bg-stone-200 text-stone-700"
      }`}
    >
      {admin ? "Quản trị" : "Khách hàng"}
    </span>
  );
}

export function AccountStatusBadge({ status }) {
  const locked = status === "LOCKED";
  return (
    <span
      className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${
        locked ? "bg-red-100 text-red-800" : "bg-emerald-100 text-emerald-800"
      }`}
    >
      {locked ? "Đã khóa" : "Hoạt động"}
    </span>
  );
}

// Danh sách tài khoản: lọc theo vai trò, trạng thái, tìm theo tên / email / số điện thoại; khóa, mở khóa nhanh
export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page")) || 0);
  const q = params.get("q") || "";
  const role = params.get("role") || "";
  const status = params.get("status") || "";

  const [keyword, setKeyword] = useState(q);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError("");
    adminService
      .getUsers({
        page,
        size: PAGE_SIZE,
        q: q || undefined,
        role: role || undefined,
        status: status || undefined,
      })
      .then((res) => active && setData(res.data))
      .catch((err) => active && setError(getErrorMessage(err)));
    return () => {
      active = false;
    };
  }, [page, q, role, status]);

  const update = (changes) => {
    const next = { q, role, status, ...changes };
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)));
  };

  const toggleLock = async (u) => {
    const lock = u.status !== "LOCKED";
    const message = lock
      ? `Khóa tài khoản "${u.email}"? Người này sẽ không đăng nhập và không dùng được website nữa.`
      : `Mở khóa tài khoản "${u.email}"?`;
    if (!window.confirm(message)) return;
    setBusyId(u.id);
    try {
      const { data: detail } = await adminService.updateUserStatus(
        u.id,
        lock ? "LOCKED" : "ACTIVE",
      );
      setData((d) => ({
        ...d,
        content: d.content.map((x) =>
          x.id === u.id ? { ...x, status: detail.user.status } : x,
        ),
      }));
      toast.success(lock ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const users = data?.content || [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold">Quản lý tài khoản</h1>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="label" htmlFor="u-role">
            Vai trò
          </label>
          <select
            id="u-role"
            className="input !w-44"
            value={role}
            onChange={(e) => update({ role: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="CUSTOMER">Khách hàng</option>
            <option value="ADMIN">Quản trị</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="u-status">
            Trạng thái
          </label>
          <select
            id="u-status"
            className="input !w-44"
            value={status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Hoạt động</option>
            <option value="LOCKED">Đã khóa</option>
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
            <label className="label" htmlFor="u-q">
              Tìm kiếm
            </label>
            <input
              id="u-q"
              className="input !w-72"
              placeholder="Họ tên, email hoặc số điện thoại"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Tìm
          </button>
          {(q || role || status) && (
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
        ) : users.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-soft">
            Không có tài khoản nào phù hợp.
          </p>
        ) : (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Tài khoản</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày đăng ký</th>
                <th className="px-4 py-3 text-right">Số đơn</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => {
                const self = u.id === me?.id;
                return (
                  <tr key={u.id} className="hover:bg-mist/60">
                    <td className="px-4 py-3">
                      <p className="font-semibold">
                        {u.fullName}
                        {self && (
                          <span className="ml-2 text-xs font-normal text-ink-soft">
                            (bạn)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-ink-soft">{u.email}</p>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {u.phone || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <RoleBadge admin={u.admin} />
                    </td>
                    <td className="px-4 py-3">
                      <AccountStatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">{u.orderCount}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-wide">
                        <Link
                          to={`/admin/users/${u.id}`}
                          className="hover:text-accent"
                        >
                          Xem
                        </Link>
                        {!self && (
                          <button
                            disabled={busyId === u.id}
                            onClick={() => toggleLock(u)}
                            className="cursor-pointer hover:text-accent disabled:opacity-40"
                          >
                            {u.status === "LOCKED" ? "Mở khóa" : "Khóa"}
                          </button>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {data && (
        <p className="mt-3 text-xs text-ink-soft">
          Tổng cộng {data.totalElements} tài khoản
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
