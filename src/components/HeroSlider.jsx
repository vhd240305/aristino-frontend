import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "./ProductImage";

// Nội dung các banner. Màu nền đặt tên đầy đủ để Tailwind quét được.
const SLIDES = [
  {
    bg: "bg-[#111111]",
    eyebrow: "Bộ sưu tập mới",
    title: ["LỊCH LÃM", "TỪNG ĐƯỜNG MAY"],
    text: "Sơ mi công sở, quần âu, vest và phụ kiện được chọn lọc cho phái mạnh hiện đại.",
    cta: "Mua ngay",
    to: "/products",
  },
  {
    bg: "bg-[#1d2f4a]",
    eyebrow: "Ưu đãi giao hàng",
    title: ["MIỄN PHÍ", "VẬN CHUYỂN"],
    text: "Giao hàng toàn quốc không phụ phí. Thanh toán tiện lợi khi nhận hàng (COD).",
    cta: "Khám phá ngay",
    to: "/products",
  },
  {
    bg: "bg-[#8c1c2b]",
    eyebrow: "Phong cách công sở",
    title: ["SƠ MI & QUẦN ÂU", "CHỈNH TỀ MỖI NGÀY"],
    text: "Form dáng chuẩn, chất liệu thoáng mát, dễ phối đồ cho mọi dịp.",
    cta: "Xem bộ sưu tập",
    to: "/products",
  },
];

// Banner trượt tự động. images = danh sách ảnh sản phẩm để trang trí bên phải (nếu có)
export default function HeroSlider({ images = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, [index]);

  const go = (i) => setIndex((i + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative h-[440px] overflow-hidden sm:h-[500px] lg:h-[580px]" aria-roledescription="carousel">
      {SLIDES.map((s, i) => {
        const pics = images.length ? [images[i % images.length], images[(i + 1) % images.length]] : [];
        return (
          <div
            key={s.eyebrow}
            aria-hidden={i !== index}
            className={`absolute inset-0 ${s.bg} text-white transition-opacity duration-700 ${
              i === index ? "z-10 opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="page-container grid h-full items-center gap-8 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">{s.eyebrow}</p>
                <h2 className="mt-5 text-4xl font-extrabold leading-[1.1] sm:text-5xl lg:text-6xl">
                  {s.title[0]}
                  <br />
                  {s.title[1]}
                </h2>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-white/80 sm:text-base">{s.text}</p>
                <Link to={s.to} className="btn btn-light mt-8 !px-8 !py-4">
                  {s.cta}
                </Link>
              </div>

              {pics.length > 0 && (
                <div className="relative hidden h-full items-center justify-center gap-5 lg:col-span-5 lg:flex">
                  <div className="aspect-[3/4] w-52 -translate-y-6 overflow-hidden shadow-2xl ring-1 ring-white/20">
                    <ProductImage src={pics[0]} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="aspect-[3/4] w-52 translate-y-8 overflow-hidden shadow-2xl ring-1 ring-white/20">
                    <ProductImage src={pics[1]} alt="" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      <button
        onClick={() => go(index - 1)}
        aria-label="Banner trước"
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer bg-white/15 p-2 text-white backdrop-blur transition-colors hover:bg-white hover:text-ink sm:block"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => go(index + 1)}
        aria-label="Banner sau"
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 cursor-pointer bg-white/15 p-2 text-white backdrop-blur transition-colors hover:bg-white hover:text-ink sm:block"
      >
        <ChevronRight size={24} />
      </button>

      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2.5">
        {SLIDES.map((s, i) => (
          <button
            key={s.eyebrow}
            onClick={() => setIndex(i)}
            aria-label={`Chuyển tới banner ${i + 1}`}
            aria-current={i === index}
            className={`h-2.5 cursor-pointer rounded-full transition-all ${i === index ? "w-7 bg-white" : "w-2.5 bg-white/40 hover:bg-white/70"}`}
          />
        ))}
      </div>
    </section>
  );
}
