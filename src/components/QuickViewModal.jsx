import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingBag, X } from "lucide-react";
import ProductImage from "./ProductImage";
import VariantPicker from "./VariantPicker";
import useVariantSelection from "../hooks/useVariantSelection";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useQuickView } from "../context/QuickViewContext";
import { useToast } from "../context/ToastContext";
import { productService } from "../services/productService";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../lib/format";

// Cửa sổ "Xem nhanh": chọn màu/size/số lượng và thêm vào giỏ mà không rời trang hiện tại
export default function QuickViewModal() {
  const { slug, closeQuickView } = useQuickView();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setProduct(null);
    setError("");
    productService
      .getBySlug(slug)
      .then((res) => active && setProduct(res.data))
      .catch((err) => active && setError(getErrorMessage(err, "Không tải được sản phẩm")));
    const onKey = (e) => e.key === "Escape" && closeQuickView();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      active = false;
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [slug, closeQuickView]);

  if (!slug) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Xem nhanh sản phẩm">
      <div className="absolute inset-0 bg-black/60" onClick={closeQuickView} />
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-white shadow-2xl">
        <button onClick={closeQuickView} aria-label="Đóng" className="absolute right-3 top-3 z-10 cursor-pointer bg-white p-1.5 hover:text-accent">
          <X size={22} />
        </button>
        {error ? (
          <p className="p-12 text-center text-sm text-ink-soft">{error}</p>
        ) : !product ? (
          <div className="grid animate-pulse gap-8 p-6 sm:grid-cols-2 sm:p-8">
            <div className="aspect-[3/4] bg-mist" />
            <div className="space-y-4">
              <div className="h-6 w-4/5 bg-mist" />
              <div className="h-6 w-1/3 bg-mist" />
              <div className="h-40 bg-mist" />
            </div>
          </div>
        ) : (
          <QuickViewContent key={product.id} product={product} onDone={closeQuickView} />
        )}
      </div>
    </div>
  );
}

function QuickViewContent({ product, onDone }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { user } = useAuth();
  const { addToCart, openDrawer } = useCart();
  const sel = useVariantSelection(product);
  const [adding, setAdding] = useState(false);

  const images = product.imageUrls?.length ? product.imageUrls : [null];
  const price = sel.selected?.price ?? product.basePrice;

  const handleAdd = async () => {
    if (!user) {
      onDone();
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!sel.selected || sel.stock < 1) return;
    setAdding(true);
    try {
      await addToCart(sel.selected.id, sel.quantity);
      onDone();
      openDrawer();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setAdding(false);
    }
  };

  return (
    <div className="grid gap-6 p-5 sm:grid-cols-2 sm:gap-10 sm:p-8">
      <div className="aspect-[3/4] overflow-hidden bg-mist">
        <ProductImage src={images[0]} alt={product.name} className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col">
        <h2 className="pr-8 text-xl font-bold leading-snug">{product.name}</h2>
        <p className="mt-3 text-2xl font-bold text-accent">{formatMoney(price)}</p>
        <div className="mt-6 flex-1">
          <VariantPicker sel={sel} />
        </div>
        <button onClick={handleAdd} disabled={adding || sel.stock < 1} className="btn btn-primary mt-7 w-full">
          <ShoppingBag size={16} />
          {adding ? "Đang thêm..." : sel.stock < 1 ? "Hết hàng" : "Thêm vào giỏ hàng"}
        </button>
        <Link
          to={`/products/${product.slug}`}
          onClick={onDone}
          className="mt-4 text-center text-xs font-semibold uppercase tracking-wide underline underline-offset-4 hover:text-accent"
        >
          Xem chi tiết sản phẩm
        </Link>
      </div>
    </div>
  );
}
