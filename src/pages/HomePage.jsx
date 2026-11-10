import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import HeroSlider from "../components/HeroSlider";
import ProductCard, { ProductCardSkeleton } from "../components/ProductCard";
import ProductImage from "../components/ProductImage";
import useCategories from "../hooks/useCategories";
import { useAuth } from "../context/AuthContext";
import { productService } from "../services/productService";

export default function HomePage() {
  const categories = useCategories();
  const { user } = useAuth();

  const [newest, setNewest] = useState(null); // sản phẩm mới nhất
  const [thumbs, setThumbs] = useState({}); // ảnh đại diện từng danh mục: { idDanhMuc: url }
  const [activeTab, setActiveTab] = useState(null);
  const [tabProducts, setTabProducts] = useState(null);

  // 8 sản phẩm mới nhất (backend sắp xếp mới nhất trước)
  useEffect(() => {
    productService
      .search({ sort: "newest", size: 8 })
      .then((res) => setNewest(res.data.content || []))
      .catch(() => setNewest([]));
  }, []);

  // Mỗi danh mục lấy 1 sản phẩm đầu để làm ảnh đại diện
  useEffect(() => {
    categories.forEach((c) => {
      productService
        .byCategory(c.id, 0, 1)
        .then((res) => {
          const url = res.data.content?.[0]?.thumbnailUrl;
          if (url) setThumbs((t) => ({ ...t, [c.id]: url }));
        })
        .catch(() => {});
    });
  }, [categories]);

  // Tab sản phẩm nổi bật: mặc định tab đầu tiên, đổi tab thì tải lại
  useEffect(() => {
    if (activeTab === null && categories.length) setActiveTab(categories[0].id);
  }, [categories, activeTab]);

  useEffect(() => {
    if (activeTab === null) return;
    let active = true;
    setTabProducts(null);
    productService
      .byCategory(activeTab, 0, 4)
      .then((res) => active && setTabProducts(res.data.content || []))
      .catch(() => active && setTabProducts([]));
    return () => {
      active = false;
    };
  }, [activeTab]);

  const heroImages = (newest || []).map((p) => p.thumbnailUrl).filter(Boolean).slice(0, 3);

  return (
    <>
      <HeroSlider images={heroImages} />

      {/* Danh mục sản phẩm */}
      {categories.length > 0 && (
        <section className="page-container pt-14 sm:pt-16">
          <h2 className="section-title">Danh mục sản phẩm</h2>
          <div className="mt-9 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.id}`} className="group relative block aspect-square overflow-hidden bg-mist">
                <ProductImage
                  src={thumbs[c.id]}
                  alt={c.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-center text-sm font-extrabold uppercase tracking-wide text-white sm:p-5 sm:text-base">
                  {c.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sản phẩm mới */}
      <section className="page-container pt-14 sm:pt-20">
        <h2 className="section-title">Sản phẩm mới</h2>
        <div className="mt-9 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
          {newest === null
            ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newest.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {newest !== null && newest.length === 0 && <p className="mt-6 text-center text-sm text-ink-soft">Chưa có sản phẩm để hiển thị.</p>}
        <div className="mt-10 text-center">
          <Link to="/products" className="btn btn-outline !px-10">
            Xem tất cả
          </Link>
        </div>
      </section>

      {/* Sản phẩm nổi bật theo danh mục */}
      {categories.length > 0 && (
        <section className="page-container pt-14 sm:pt-20">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-3 border-b border-line">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveTab(c.id)}
                className={`-mb-px cursor-pointer border-b-2 pb-3 text-[13px] font-bold uppercase tracking-wide transition-colors ${
                  activeTab === c.id ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">
            {tabProducts === null
              ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : tabProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {tabProducts !== null && tabProducts.length === 0 && (
            <p className="mt-6 text-center text-sm text-ink-soft">Danh mục này chưa có sản phẩm.</p>
          )}
          <div className="mt-10 text-center">
            <Link to={activeTab ? `/products?category=${activeTab}` : "/products"} className="btn btn-outline !px-10">
              Xem thêm
            </Link>
          </div>
        </section>
      )}

      {/* Mời đăng ký */}
      {!user && (
        <section className="page-container pt-16 sm:pt-20">
          <div className="flex flex-col items-center justify-between gap-6 bg-ink px-8 py-10 text-center text-white sm:flex-row sm:px-12 sm:text-left">
            <div>
              <h2 className="text-xl font-extrabold uppercase tracking-wide sm:text-2xl">Trở thành thành viên Aristino</h2>
              <p className="mt-2 text-sm text-white/70">Lưu giỏ hàng, quản lý địa chỉ giao hàng và theo dõi đơn hàng dễ dàng.</p>
            </div>
            <Link to="/register" className="btn btn-light shrink-0 !px-8 !py-4">
              Đăng ký ngay
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
