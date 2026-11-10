import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import ProductImage from "./ProductImage";
import useCategories from "../hooks/useCategories";
import { productService } from "../services/productService";
import { formatMoney } from "../lib/format";

// Ô tìm kiếm toàn màn hình: gõ đến đâu gợi ý sản phẩm đến đó (gọi API tìm kiếm của backend, chờ 300ms sau khi ngừng gõ)
export default function SearchOverlay({ open, onClose }) {
  const navigate = useNavigate();
  const categories = useCategories();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null); // { content, totalElements } hoặc null
  const [loading, setLoading] = useState(false);

  const term = query.trim();

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !term) {
      setResult(null);
      return;
    }
    let active = true;
    setLoading(true);
    const timer = setTimeout(() => {
      productService
        .search({ q: term, size: 6 })
        .then((res) => active && setResult(res.data))
        .catch(() => active && setResult({ content: [], totalElements: 0 }))
        .finally(() => active && setLoading(false));
    }, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [term, open]);

  if (!open) return null;

  // Enter hoặc "Xem tất cả kết quả": sang trang danh sách đã lọc theo từ khóa
  const goResults = (e) => {
    e?.preventDefault();
    if (!term) return;
    navigate(`/products?q=${encodeURIComponent(term)}`);
    onClose();
  };

  const products = result?.content || [];

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Tìm kiếm sản phẩm">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[85vh] overflow-y-auto bg-white shadow-xl">
        <div className="page-container py-6">
          <form onSubmit={goResults} className="flex items-center gap-3 border-b-2 border-ink pb-3">
            <Search size={22} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
              className="flex-1 bg-transparent text-lg font-medium outline-none placeholder:text-ink-soft/60"
            />
            <button type="button" onClick={onClose} aria-label="Đóng tìm kiếm" className="cursor-pointer p-1 hover:text-accent">
              <X size={24} />
            </button>
          </form>

          {!term ? (
            <div className="py-6">
              <p className="text-xs font-bold uppercase tracking-wide">Gợi ý cho bạn</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    to={`/products?category=${c.id}`}
                    onClick={onClose}
                    className="border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-ink hover:bg-ink hover:text-white"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : result === null || loading ? (
            <p className="py-8 text-sm text-ink-soft">Đang tìm...</p>
          ) : products.length === 0 ? (
            <p className="py-8 text-sm text-ink-soft">Không tìm thấy sản phẩm phù hợp với "{term}".</p>
          ) : (
            <>
              <ul className="grid gap-x-8 pt-4 sm:grid-cols-2">
                {products.map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/products/${p.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-4 border-b border-line py-3 transition-colors hover:text-accent"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden bg-mist">
                        <ProductImage src={p.thumbnailUrl} alt={p.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="line-clamp-2 text-sm font-medium leading-snug">{p.name}</p>
                        <p className="mt-1 text-sm font-bold text-ink">{formatMoney(p.basePrice)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="pb-2 pt-5 text-center">
                <button onClick={goResults} className="btn btn-outline">
                  Xem tất cả {result.totalElements} kết quả
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
