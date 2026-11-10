import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronRight, PackageSearch, SlidersHorizontal, X } from "lucide-react";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import useCategories from "../hooks/useCategories";
import { productService } from "../services/productService";
import { getErrorMessage } from "../services/api";
import { colorToHex, compareSizes } from "../lib/format";

const PAGE_SIZE = 8;

const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "price_asc", label: "Giá thấp đến cao" },
  { value: "price_desc", label: "Giá cao đến thấp" },
  { value: "name_asc", label: "Tên A → Z" },
];

const PRICE_RANGES = [
  { label: "Dưới 300.000₫", min: null, max: 300000 },
  { label: "300.000₫ - 500.000₫", min: 300000, max: 500000 },
  { label: "500.000₫ - 1.000.000₫", min: 500000, max: 1000000 },
  { label: "Trên 1.000.000₫", min: 1000000, max: null },
];

const csv = (value) => (value ? value.split(",").filter(Boolean) : []);
const toggleIn = (list, value) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export default function ProductListPage() {
  const [params, setParams] = useSearchParams();
  const categories = useCategories();

  // Toàn bộ trạng thái lọc nằm trên địa chỉ trang: /products?q=ao&category=1&sizes=M,L&sort=price_asc
  const q = params.get("q") || "";
  const category = params.get("category");
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const sizes = csv(params.get("sizes"));
  const colors = csv(params.get("colors"));
  const sort = params.get("sort") || "newest";
  const page = Math.max(0, Number(params.get("page")) || 0);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [options, setOptions] = useState({ sizes: [], colors: [] });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Đổi một vài tham số, tự về trang 1 (trừ khi đang đổi trang)
  const update = (changes) => {
    const next = new URLSearchParams(params);
    Object.entries(changes).forEach(([key, value]) => {
      const empty =
        value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0) ||
        (key === "page" && value === 0) || (key === "sort" && value === "newest");
      if (empty) next.delete(key);
      else next.set(key, Array.isArray(value) ? value.join(",") : String(value));
    });
    if (!("page" in changes)) next.delete("page");
    setParams(next);
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    productService
      .search({
        q: q || undefined,
        category: category || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        sizes: sizes.join(",") || undefined,
        colors: colors.join(",") || undefined,
        sort,
        page,
        size: PAGE_SIZE,
      })
      .then((res) => active && setData(res.data))
      .catch((err) => active && setError(getErrorMessage(err)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.toString()]);

  // Các size/màu có sẵn để chọn (theo danh mục đang xem)
  useEffect(() => {
    let active = true;
    productService
      .filters(category || undefined)
      .then((res) => active && setOptions(res.data))
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [category]);

  const currentCategory = categories.find((c) => String(c.id) === category);
  const title = q ? `Kết quả tìm kiếm cho "${q}"` : currentCategory ? currentCategory.name : "Tất cả sản phẩm";
  const products = data?.content || [];

  const activePrice = PRICE_RANGES.find((r) => String(r.min ?? "") === (minPrice ?? "") && String(r.max ?? "") === (maxPrice ?? ""));
  const activeCount = (category ? 1 : 0) + (minPrice || maxPrice ? 1 : 0) + sizes.length + colors.length;

  // Các "thẻ" bộ lọc đang áp dụng, bấm dấu x để bỏ
  const chips = [
    ...(q ? [{ key: "q", label: `Từ khóa: ${q}`, remove: () => update({ q: null }) }] : []),
    ...(currentCategory ? [{ key: "cat", label: currentCategory.name, remove: () => update({ category: null }) }] : []),
    ...(minPrice || maxPrice
      ? [{ key: "price", label: activePrice ? activePrice.label : "Khoảng giá", remove: () => update({ minPrice: null, maxPrice: null }) }]
      : []),
    ...sizes.map((s) => ({ key: `s-${s}`, label: `Size ${s}`, remove: () => update({ sizes: sizes.filter((x) => x !== s) }) })),
    ...colors.map((c) => ({ key: `c-${c}`, label: c, remove: () => update({ colors: colors.filter((x) => x !== c) }) })),
  ];

  const clearAll = () => setParams(new URLSearchParams(sort !== "newest" ? { sort } : {}));

  const panel = (
    <FilterPanel
      categories={categories}
      category={category}
      onCategory={(id) => update({ category: id, sizes: null, colors: null })}
      activePrice={activePrice}
      onPrice={(r) => update({ minPrice: r?.min ?? null, maxPrice: r?.max ?? null })}
      sizeOptions={[...(options.sizes || [])].sort(compareSizes)}
      colorOptions={options.colors || []}
      sizes={sizes}
      colors={colors}
      onSizes={(s) => update({ sizes: toggleIn(sizes, s) })}
      onColors={(c) => update({ colors: toggleIn(colors, c) })}
    />
  );

  return (
    <div className="page-container py-8 sm:py-10">
      <nav className="flex items-center gap-2 text-xs text-ink-soft" aria-label="Đường dẫn">
        <Link to="/" className="hover:text-ink">Trang chủ</Link>
        <ChevronRight size={12} />
        <span className="font-medium text-ink">{title}</span>
      </nav>

      <h1 className="mt-5 text-2xl font-extrabold uppercase tracking-wide sm:text-3xl">{title}</h1>

      <div className="mt-8 grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block">{panel}</aside>

        <div>
          {/* Thanh công cụ: nút Bộ lọc (điện thoại), số kết quả, sắp xếp */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="flex cursor-pointer items-center gap-2 border border-ink px-4 py-2 text-xs font-semibold uppercase tracking-wide lg:hidden"
              >
                <SlidersHorizontal size={15} /> Bộ lọc{activeCount > 0 && ` (${activeCount})`}
              </button>
              {data && <p className="text-sm text-ink-soft">{data.totalElements} sản phẩm</p>}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <span className="hidden text-ink-soft sm:inline">Sắp xếp:</span>
              <select
                value={sort}
                onChange={(e) => update({ sort: e.target.value })}
                aria-label="Sắp xếp sản phẩm"
                className="cursor-pointer border border-line bg-white px-3 py-2 text-sm font-medium outline-none focus:border-ink"
              >
                {SORTS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {filtersOpen && <div className="mt-4 border border-line p-5 lg:hidden">{panel}</div>}

          {chips.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <button
                  key={c.key}
                  onClick={c.remove}
                  aria-label={`Bỏ lọc ${c.label}`}
                  className="flex cursor-pointer items-center gap-1.5 bg-mist px-3 py-1.5 text-xs font-medium transition-colors hover:bg-ink hover:text-white"
                >
                  {c.label} <X size={12} />
                </button>
              ))}
              <button onClick={clearAll} className="cursor-pointer px-2 text-xs font-semibold uppercase tracking-wide underline underline-offset-4 hover:text-accent">
                Xóa tất cả
              </button>
            </div>
          )}

          <div className="mt-6">
            {error ? (
              <EmptyState icon={PackageSearch} title="Không tải được sản phẩm" text={error} />
            ) : loading ? (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="Không tìm thấy sản phẩm"
                text="Hãy thử đổi từ khóa hoặc bỏ bớt bộ lọc."
                actionLabel="Xem tất cả sản phẩm"
                actionTo="/products"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
                <Pagination
                  page={page}
                  totalPages={data.totalPages}
                  onChange={(p) => {
                    update({ page: p });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Bảng bộ lọc: danh mục, khoảng giá, kích thước, màu sắc
function FilterPanel({ categories, category, onCategory, activePrice, onPrice, sizeOptions, colorOptions, sizes, colors, onSizes, onColors }) {
  const heading = "border-b border-line pb-3 text-xs font-extrabold uppercase tracking-wide";
  const row = (active) =>
    `block w-full cursor-pointer border-l-2 py-2 pl-4 text-left text-sm transition-colors ${
      active ? "border-accent font-bold text-ink" : "border-transparent text-ink-soft hover:text-ink"
    }`;

  return (
    <div className="space-y-8">
      <section>
        <h2 className={heading}>Danh mục</h2>
        <div className="mt-3">
          <button onClick={() => onCategory(null)} className={row(!category)}>
            Tất cả sản phẩm
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => onCategory(c.id)} className={row(category === String(c.id))}>
              {c.name}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className={heading}>Khoảng giá</h2>
        <div className="mt-3">
          <button onClick={() => onPrice(null)} className={row(!activePrice)}>
            Tất cả mức giá
          </button>
          {PRICE_RANGES.map((r) => (
            <button key={r.label} onClick={() => onPrice(r)} className={row(activePrice === r)}>
              {r.label}
            </button>
          ))}
        </div>
      </section>

      {sizeOptions.length > 0 && (
        <section>
          <h2 className={heading}>Kích thước</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizeOptions.map((s) => (
              <button
                key={s}
                onClick={() => onSizes(s)}
                aria-pressed={sizes.includes(s)}
                className={`h-10 min-w-11 cursor-pointer border px-3 text-sm font-medium transition-colors ${
                  sizes.includes(s) ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>
      )}

      {colorOptions.length > 0 && (
        <section>
          <h2 className={heading}>Màu sắc</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => onColors(c)}
                aria-pressed={colors.includes(c)}
                className={`flex cursor-pointer items-center gap-2 border px-3 py-2 text-xs font-medium transition-colors ${
                  colors.includes(c) ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                }`}
              >
                <span className="h-3.5 w-3.5 rounded-full border border-black/20" style={{ backgroundColor: colorToHex(c) }} />
                {c}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
