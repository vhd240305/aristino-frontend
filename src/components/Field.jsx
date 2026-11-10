// Một ô nhập có nhãn + dòng báo lỗi bên dưới
export default function Field({ label, error, children, className = "" }) {
  return (
    <div className={className}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
    </div>
  );
}
