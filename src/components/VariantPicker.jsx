import QuantityStepper from "./QuantityStepper";
import { colorToHex } from "../lib/format";

// Giao diện chọn màu, size, số lượng. sel = kết quả của useVariantSelection(product)
export default function VariantPicker({ sel }) {
  const { colors, color, chooseColor, sizesForColor, size, chooseSize, stock, quantity, setQuantity } = sel;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide">
          Màu sắc: <span className="font-medium normal-case text-ink-soft">{color}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {colors.map((c) => (
            <button
              key={c}
              title={c}
              aria-label={`Màu ${c}`}
              aria-pressed={c === color}
              onClick={() => chooseColor(c)}
              className={`h-10 w-10 cursor-pointer rounded-full border-2 p-0.5 transition-colors ${
                c === color ? "border-ink" : "border-transparent hover:border-line"
              }`}
            >
              <span className="block h-full w-full rounded-full border border-black/15" style={{ backgroundColor: colorToHex(c) }} />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide">
          Kích thước: <span className="font-medium normal-case text-ink-soft">{size}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((v) => (
            <button
              key={v.id}
              onClick={() => chooseSize(v.size)}
              disabled={v.stockQuantity < 1}
              aria-pressed={v.size === size}
              className={`h-11 min-w-12 cursor-pointer border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:text-ink-soft/40 disabled:line-through ${
                v.size === size ? "border-ink bg-ink text-white" : "border-line hover:border-ink disabled:hover:border-line"
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
        <p className={`mt-3 text-xs font-medium ${stock < 1 ? "text-danger" : stock <= 5 ? "text-accent" : "text-moss"}`}>
          {stock < 1 ? "Hết hàng" : stock <= 5 ? `Chỉ còn ${stock} sản phẩm` : "Còn hàng"}
        </p>
      </div>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide">Số lượng</p>
        <QuantityStepper value={quantity} max={Math.max(stock, 1)} onChange={setQuantity} disabled={stock < 1} />
      </div>
    </div>
  );
}
