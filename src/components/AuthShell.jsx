// Khung dùng chung cho trang Đăng nhập / Đăng ký: tiêu đề giữa trang + form gọn trong khung
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="page-container py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <h1 className="section-title">{title}</h1>
        <p className="mt-6 text-center text-sm text-ink-soft">{subtitle}</p>
        <div className="mt-8 border border-line p-6 sm:p-8">{children}</div>
        <p className="mt-6 text-center text-sm text-ink-soft">{footer}</p>
      </div>
    </div>
  );
}
