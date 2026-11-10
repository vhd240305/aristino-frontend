import { Link } from "react-router-dom";
import ProductImage from "./ProductImage";
import { useQuickView } from "../context/QuickViewContext";
import { formatMoney } from "../lib/format";

export default function ProductCard({ product }) {
  const { openQuickView } = useQuickView();

  return (
    <div className="group">
      <div className="relative aspect-[3/4] overflow-hidden bg-mist">
        <Link to={`/products/${product.slug}`} className="block h-full w-full" aria-label={product.name}>
          <ProductImage
            src={product.thumbnailUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
        {/* Hai nút hiện khi rê chuột (chỉ trên máy tính) */}
        <div className="absolute inset-x-3 bottom-3 hidden translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex">
          <button
            onClick={() => openQuickView(product.slug)}
            className="flex-1 cursor-pointer bg-ink py-2.5 text-[11px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-accent"
          >
            Thêm vào giỏ
          </button>
          <button
            onClick={() => openQuickView(product.slug)}
            className="flex-1 cursor-pointer bg-white py-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ink hover:text-white"
          >
            Xem nhanh
          </button>
        </div>
      </div>
      <Link
        to={`/products/${product.slug}`}
        className="mt-3 line-clamp-2 min-h-10 text-sm font-medium leading-5 transition-colors hover:text-accent"
      >
        {product.name}
      </Link>
      <p className="mt-1.5 text-sm font-bold">{formatMoney(product.basePrice)}</p>
    </div>
  );
}

// Khung chờ hiển thị trong lúc tải dữ liệu
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] bg-mist" />
      <div className="mt-3 h-4 w-4/5 bg-mist" />
      <div className="mt-2 h-4 w-1/3 bg-mist" />
    </div>
  );
}
