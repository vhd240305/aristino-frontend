import { Minus, Plus } from "lucide-react";

export default function QuantityStepper({ value, min = 1, max = 99, onChange, disabled = false, small = false }) {
  const box = small ? "h-8 w-8" : "h-11 w-11";
  const btn = `flex ${box} cursor-pointer items-center justify-center transition-colors hover:bg-mist disabled:cursor-not-allowed disabled:opacity-30`;
  return (
    <div className="inline-flex items-center border border-line bg-white">
      <button type="button" aria-label="Giảm số lượng" disabled={disabled || value <= min} onClick={() => onChange(value - 1)} className={btn}>
        <Minus size={small ? 12 : 14} />
      </button>
      <span className={`${small ? "w-8 text-xs" : "w-11 text-sm"} text-center font-medium tabular-nums`}>{value}</span>
      <button type="button" aria-label="Tăng số lượng" disabled={disabled || value >= max} onClick={() => onChange(value + 1)} className={btn}>
        <Plus size={small ? 12 : 14} />
      </button>
    </div>
  );
}
