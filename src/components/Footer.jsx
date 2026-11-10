import { Link } from "react-router-dom";
import { Truck, RefreshCcw, CreditCard, ShieldCheck } from "lucide-react";
import useCategories from "../hooks/useCategories";

const PERKS = [
  { icon: Truck, title: "Miễn phí vận chuyển", text: "Giao hàng toàn quốc" },
  { icon: RefreshCcw, title: "Đổi hàng dễ dàng", text: "Theo chính sách cửa hàng" },
  { icon: CreditCard, title: "Thanh toán khi nhận hàng", text: "Hình thức COD tiện lợi" },
  { icon: ShieldCheck, title: "Sản phẩm chính hãng", text: "Chất liệu tuyển chọn" },
];

export default function Footer() {
  const categories = useCategories();

  return (
    <footer className="mt-20">
      {/* Dải cam kết */}
      <div className="border-y border-line bg-mist">
        <div className="page-container grid grid-cols-2 gap-6 py-7 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3 lg:justify-center">
              <Icon size={28} strokeWidth={1.4} className="shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wide">{title}</p>
                <p className="mt-0.5 text-xs text-ink-soft">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-ink text-white/75">
        <div className="page-container grid gap-10 py-14 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-3xl font-extrabold tracking-[0.18em] text-white">ARISTINO</p>
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              Thời trang nam lịch lãm, hiện đại. Từng sản phẩm được chọn lọc kỹ để bạn tự tin ở mọi dịp, từ công sở đến sự kiện quan trọng.
            </p>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-xs font-bold uppercase tracking-wide text-white">Mua sắm</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link to="/products" className="hover:text-white">Tất cả sản phẩm</Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link to={`/products?category=${c.id}`} className="hover:text-white">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-xs font-bold uppercase tracking-wide text-white">Hỗ trợ khách hàng</h4>
            <ul className="mt-5 space-y-3 text-sm">
              <li>Phương thức vận chuyển</li>
              <li>Phương thức thanh toán</li>
              <li>Chính sách đổi hàng</li>
              <li>Chính sách bảo mật</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Aristino. Đồ án website thời trang nam.
        </div>
      </div>
    </footer>
  );
}
