import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "../../components/Pagination";
import ProductImage from "../../components/ProductImage";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/adminService";
import { getErrorMessage } from "../../services/api";
import { formatMoney } from "../../lib/format";

const PAGE_SIZE = 10;
const STATUS = {
  ACTIVE: { label: "Đang bán", cls: "bg-emerald-100 text-emerald-800" },
  HIDDEN: { label: "Đang ẩn", cls: "bg-stone-200 text-stone-700" },
  OUT_OF_STOCK: { label: "Hết hàng", cls: "bg-red-100 text-red-800" },
};

// Danh sách sản phẩm: lọc theo tên, danh mục, trạng thái; ẩn/hiện nhanh, sửa, xóa
export default function AdminProductsPage() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const page = Math.max(0, Number(params.get("page")) || 0);
  const q = params.get("q") || "";
  const categoryId = params.get("categoryId") || "";
  const status = params.get("status") || "";

  const [keyword, setKeyword] = useState(q);
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    adminService
      .getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const load = useCallback(async () => {
    try {
      const { data: result } = await adminService.getProducts({
        page,
        size: PAGE_SIZE,
        q: q || undefined,
        categoryId: categoryId || undefined,
        status: status || undefined,
      });
      setData(result);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [page, q, categoryId, status]);

  useEffect(() => {
    setData(null);
    load();
  }, [load]);

  const update = (changes) => {
    const next = { q, categoryId, status, ...changes };
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)));
  };

  const toggleStatus = async (product) => {
    const next = product.status === "ACTIVE" ? "HIDDEN" : "ACTIVE";
    setBusyId(product.id);
    try {
      await adminService.updateProductStatus(product.id, next);
      setData((d) => ({
        ...d,
        content: d.content.map((p) =>
          p.id === product.id ? { ...p, status: next } : p,
        ),
      }));
      toast.success(
        next === "ACTIVE"
          ? "Sản phẩm đã hiển thị trên cửa hàng"
          : "Đã ẩn sản phẩm khỏi cửa hàng",
      );
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (product) => {
    if (
      !window.confirm(
        `Xóa sản phẩm "${product.name}"? Thao tác này không thể hoàn tác.`,
      )
    )
      return;
    setBusyId(product.id);
    try {
      await adminService.deleteProduct(product.id);
      toast.success("Đã xóa sản phẩm");
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const products = data?.content || [];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold">Quản lý sản phẩm</h1>
        <Link to="/admin/products/new" className="btn btn-primary">
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="label" htmlFor="p-cat">
            Danh mục
          </label>
          <select
            id="p-cat"
            className="input !w-48"
            value={categoryId}
            onChange={(e) => update({ categoryId: e.target.value })}
          >
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="p-status">
            Trạng thái
          </label>
          <select
            id="p-status"
            className="input !w-40"
            value={status}
            onChange={(e) => update({ status: e.target.value })}
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="HIDDEN">Đang ẩn</option>
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
            <label className="label" htmlFor="p-q">
              Tìm theo tên
            </label>
            <input
              id="p-q"
              className="input !w-64"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tên sản phẩm"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Tìm
          </button>
          {(q || categoryId || status) && (
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
        ) : products.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-soft">
            Không có sản phẩm nào phù hợp.
          </p>
        ) : (
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Sản phẩm</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3 text-right">Giá</th>
                <th className="px-4 py-3 text-right">Tồn kho</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const st = STATUS[p.status] || STATUS.ACTIVE;
                return (
                  <tr key={p.id} className="hover:bg-mist/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage
                          src={p.thumbnailUrl}
                          alt={p.name}
                          className="h-14 w-11 shrink-0 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold">{p.name}</p>
                          <p className="text-xs text-ink-soft">
                            {p.variantCount} biến thể
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink-soft">
                      {p.categoryName}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatMoney(p.basePrice)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right ${p.totalStock === 0 ? "font-semibold text-danger" : ""}`}
                    >
                      {p.totalStock}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${st.cls}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-wide">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="hover:text-accent"
                        >
                          Sửa
                        </Link>
                        <button
                          disabled={busyId === p.id}
                          onClick={() => toggleStatus(p)}
                          className="cursor-pointer hover:text-accent disabled:opacity-40"
                        >
                          {p.status === "ACTIVE" ? "Ẩn" : "Hiện"}
                        </button>
                        <button
                          disabled={busyId === p.id}
                          onClick={() => handleDelete(p)}
                          className="cursor-pointer hover:text-accent disabled:opacity-40"
                        >
                          Xóa
                        </button>
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
          Tổng cộng {data.totalElements} sản phẩm
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
