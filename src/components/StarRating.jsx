import { useState } from "react";

const STAR_PATH =
  "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function StarRow({ size, className }) {
  return (
    <span className="inline-flex">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={className}
          aria-hidden="true"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

// Hiển thị số sao (có thể lẻ, ví dụ 4.3): hàng sao xám bên dưới, hàng sao vàng cắt theo tỷ lệ bên trên
export function Stars({ value = 0, size = 16 }) {
  const percent = (Math.max(0, Math.min(5, value)) / 5) * 100;
  return (
    <span
      className="relative inline-block align-middle"
      role="img"
      aria-label={`${value} trên 5 sao`}
    >
      <StarRow size={size} className="text-stone-300" />
      <span
        className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap"
        style={{ width: `${percent}%` }}
      >
        <StarRow size={size} className="text-amber-500" />
      </span>
    </span>
  );
}

// Chọn số sao khi viết đánh giá (rê chuột để xem trước, bấm để chọn)
export function StarInput({ value, onChange, size = 30 }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div
      role="radiogroup"
      aria-label="Chọn số sao"
      className="inline-flex gap-1"
      onMouseLeave={() => setHover(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} sao`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="cursor-pointer p-0.5"
        >
          <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={n <= shown ? "text-amber-500" : "text-stone-300"}
            aria-hidden="true"
          >
            <path d={STAR_PATH} />
          </svg>
        </button>
      ))}
    </div>
  );
}
