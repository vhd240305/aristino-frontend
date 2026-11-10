import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight,
  PackageSearch,
  RefreshCcw,
  ShoppingBag,
  Truck,
  CreditCard,
} from "lucide-react";
import ProductCard from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import ReviewSection from "../components/ReviewSection";
import VariantPicker from "../components/VariantPicker";
import EmptyState from "../components/EmptyState";
import useCategories from "../hooks/useCategories";
import useVariantSelection from "../hooks/useVariantSelection";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { productService } from "../services/productService";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../lib/format";

export default function ProductDetailPage() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    productService
      .getBySlug(slug)
      .then((res) => active && setProduct(res.data))
      .catch(
        (err) =>
          active && setError(getErrorMessage(err, "Không tìm thấy sản phẩm")),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="page-container grid animate-pulse gap-10 py-10 lg:grid-cols-2">
        <div className="aspect-[3/4] bg-mist" />
        <div className="space-y-5 pt-4">
          <div className="h-8 w-4/5 bg-mist" />
          <div className="h-7 w-1/3 bg-mist" />
          <div className="h-48 bg-mist" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="page-container py-16">
        <EmptyState
          icon={PackageSearch}
          title="Không tìm thấy sản phẩm"
          text={error}
          actionLabel="Quay lại cửa hàng"
          actionTo="/products"
        />
      </div>
    );
  }

  // key={product.id}: đổi sang sản phẩm khác thì khởi tạo lại phần chọn màu/size
  return <ProductView key={product.id} product={product} />;
}

function ProductView({ product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const categories = useCategories();
  const { user } = useAuth();
  const { addToCart, openDrawer } = useCart();
  const sel = useVariantSelection(product);

  const [imageIndex, setImageIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [related, setRelated] = useState([]);

  const images = product.imageUrls?.length ? product.imageUrls : [null];
  const price = sel.selected?.price ?? product.basePrice;
  const category = categories.find((c) => c.name === product.categoryName);

  // Sản phẩm cùng danh mục (trừ sản phẩm đang xem)
  useEffect(() => {
    if (!category) return;
    let active = true;
    productService
      .byCategory(category.id, 0, 5)
      .then(
        (res) =>
          active &&
          setRelated(
            (res.data.content || [])
              .filter((p) => p.slug !== product.slug)
              .slice(0, 4),
          ),
      )
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [category, product.slug]);

  // buyNow = true: thêm xong chuyển thẳng sang thanh toán; false: mở giỏ hàng trượt
  const handleAdd = async (buyNow) => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    if (!sel.selected || sel.stock < 1) return;
    setBusy(true);
    try {
      await addToCart(sel.selected.id, sel.quantity);
      if (buyNow) navigate("/checkout");
      else openDrawer();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || sel.stock < 1;

  return (
    <div className="page-container py-8 sm:py-10">
      <nav
        className="flex flex-wrap items-center gap-2 text-xs text-ink-soft"
        aria-label="Đường dẫn"
      >
        <Link to="/" className="hover:text-ink">
          Trang chủ
        </Link>
        <ChevronRight size={12} />
        {category ? (
          <Link
            to={`/products?category=${category.id}`}
            className="hover:text-ink"
          >
            {category.name}
          </Link>
        ) : (
          <Link to="/products" className="hover:text-ink">
            Sản phẩm
          </Link>
        )}
        <ChevronRight size={12} />
        <span className="font-medium text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* Ảnh */}
        <div className="lg:col-span-7">
          <div className="flex flex-col-reverse gap-3 lg:flex-row">
            {images.length > 1 && (
              <div className="flex gap-3 lg:w-20 lg:flex-col">
                {images.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setImageIndex(i)}
                    aria-label={`Xem ảnh ${i + 1}`}
                    className={`aspect-[3/4] w-20 shrink-0 cursor-pointer overflow-hidden border-2 bg-mist transition-colors lg:w-full ${
                      i === imageIndex
                        ? "border-ink"
                        : "border-transparent hover:border-line"
                    }`}
                  >
                    <ProductImage
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            <div className="aspect-[3/4] flex-1 overflow-hidden bg-mist">
              <ProductImage
                src={images[imageIndex]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Thông tin */}
        <div className="lg:col-span-5">
          <h1 className="text-2xl font-bold leading-snug sm:text-[26px]">
            {product.name}
          </h1>
          <p className="mt-2 text-xs text-ink-soft">
            Mã sản phẩm:{" "}
            <span className="font-medium text-ink">
              {sel.selected?.sku || "—"}
            </span>
          </p>
          <p className="mt-4 text-3xl font-bold text-accent">
            {formatMoney(price)}
          </p>

          <div className="mt-7 border-t border-line pt-7">
            <VariantPicker sel={sel} />
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => handleAdd(false)}
              disabled={disabled}
              className="btn btn-outline !py-4"
            >
              <ShoppingBag size={16} /> Thêm vào giỏ hàng
            </button>
            <button
              onClick={() => handleAdd(true)}
              disabled={disabled}
              className="btn btn-accent !py-4"
            >
              {sel.stock < 1 ? "Hết hàng" : "Mua ngay"}
            </button>
          </div>
          {!user && (
            <p className="mt-3 text-xs text-ink-soft">
              Bạn cần đăng nhập để mua hàng.
            </p>
          )}

          <ul className="mt-8 space-y-4 border-t border-line pt-7 text-sm">
            <li className="flex items-start gap-3">
              <Truck size={20} strokeWidth={1.5} className="mt-0.5 shrink-0" />
              <span>Miễn phí vận chuyển toàn quốc</span>
            </li>
            <li className="flex items-start gap-3">
              <RefreshCcw
                size={20}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0"
              />
              <span>Hỗ trợ đổi hàng theo chính sách cửa hàng</span>
            </li>
            <li className="flex items-start gap-3">
              <CreditCard
                size={20}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0"
              />
              <span>Thanh toán khi nhận hàng (COD)</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Mô tả */}
      <section className="mt-14 border-t border-line pt-10">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">
          Mô tả sản phẩm
        </h2>
        <div className="mt-5 max-w-3xl space-y-4 text-sm leading-[1.9] text-ink/80">
          {product.description && (
            <p className="whitespace-pre-line">{product.description}</p>
          )}
          {product.material && (
            <p>
              <span className="font-semibold text-ink">Chất liệu:</span>{" "}
              {product.material}
            </p>
          )}
        </div>
      </section>

      {/* Đánh giá của khách hàng */}
      <ReviewSection productId={product.id} slug={product.slug} />

      {/* Sản phẩm liên quan */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="section-title">Sản phẩm liên quan</h2>
          <div className="mt-9 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
