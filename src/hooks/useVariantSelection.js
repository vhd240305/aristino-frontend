import { useMemo, useState } from "react";
import { compareSizes } from "../lib/format";

const firstAvailable = (variants) => variants.find((v) => v.stockQuantity > 0) || variants[0];

// Quản lý việc chọn màu / size / số lượng của một sản phẩm.
// Gọi bên trong component chỉ render khi đã có product (dùng key={product.id} để reset khi đổi sản phẩm).
export default function useVariantSelection(product) {
  const variants = useMemo(() => product?.variants || [], [product]);
  const initial = firstAvailable(variants);

  const [color, setColor] = useState(initial?.color ?? null);
  const [size, setSize] = useState(initial?.size ?? null);
  const [quantity, setQuantity] = useState(1);

  const colors = useMemo(() => [...new Set(variants.map((v) => v.color))], [variants]);
  const sizesForColor = useMemo(
    () => variants.filter((v) => v.color === color).sort((a, b) => compareSizes(a.size, b.size)),
    [variants, color]
  );
  const selected = variants.find((v) => v.color === color && v.size === size) || null;
  const stock = selected?.stockQuantity ?? 0;

  const chooseColor = (c) => {
    setColor(c);
    const list = variants.filter((v) => v.color === c);
    // Giữ nguyên size đang chọn nếu màu mới cũng có size đó và còn hàng
    const next = list.find((v) => v.size === size && v.stockQuantity > 0) || list.find((v) => v.stockQuantity > 0) || list[0];
    setSize(next?.size ?? null);
    setQuantity(1);
  };
  const chooseSize = (s) => {
    setSize(s);
    setQuantity(1);
  };

  return { colors, color, chooseColor, sizesForColor, size, chooseSize, selected, stock, quantity, setQuantity };
}
