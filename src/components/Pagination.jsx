import { ChevronLeft, ChevronRight } from "lucide-react";

// page tính từ 0 (đúng với backend); hiển thị cho người dùng từ 1
export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const start = Math.max(0, Math.min(page - 2, totalPages - 5));
  const end = Math.min(totalPages, start + 5);
  const pages = [];
  for (let i = start; i < end; i++) pages.push(i);

  const base = "flex h-10 min-w-10 cursor-pointer items-center justify-center px-3 text-sm font-medium transition-colors";

  return (
    <nav className="mt-12 flex items-center justify-center gap-1.5" aria-label="Phân trang">
      <button
        aria-label="Trang trước"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
        className={`${base} border border-line hover:border-ink disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${base} ${p === page ? "bg-ink text-white" : "border border-line hover:border-ink"}`}
        >
          {p + 1}
        </button>
      ))}
      <button
        aria-label="Trang sau"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
        className={`${base} border border-line hover:border-ink disabled:cursor-not-allowed disabled:opacity-30`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
