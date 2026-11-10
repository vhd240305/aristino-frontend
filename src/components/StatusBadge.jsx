import { ORDER_STATUS, PAYMENT_STATUS } from "../lib/status";

// Tên class đầy đủ để Tailwind quét được
const TONES = {
  amber: "bg-amber-100 text-amber-900",
  blue: "bg-sky-100 text-sky-900",
  green: "bg-emerald-100 text-emerald-900",
  red: "bg-red-100 text-red-900",
  gray: "bg-stone-200 text-stone-700",
};

// kind = "order" | "payment"
export default function StatusBadge({ kind = "order", status }) {
  const map = kind === "payment" ? PAYMENT_STATUS : ORDER_STATUS;
  const info = map[status] || { label: status, tone: "gray" };
  return (
    <span className={`inline-block px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] ${TONES[info.tone]}`}>
      {info.label}
    </span>
  );
}
