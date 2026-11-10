import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="page-container flex flex-col items-center py-24 text-center">
      <p className="text-8xl font-extrabold tracking-wider text-ink/10 sm:text-9xl">404</p>
      <h1 className="-mt-4 text-2xl font-extrabold uppercase tracking-wide">Không tìm thấy trang</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-soft">Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển.</p>
      <Link to="/" className="btn btn-primary mt-8">
        Về trang chủ
      </Link>
    </div>
  );
}
