import { useEffect, useState } from "react";
import { categoryService } from "../services/productService";

// Danh mục ít thay đổi nên chỉ tải 1 lần rồi dùng lại ở Header, Trang chủ, Danh sách sản phẩm
let cache = null;
let inflight = null;

export default function useCategories() {
  const [categories, setCategories] = useState(cache || []);

  useEffect(() => {
    if (cache) return;
    inflight =
      inflight ||
      categoryService
        .getAll()
        .then((res) => (cache = res.data))
        .catch(() => [])
        .finally(() => {
          inflight = null;
        });
    let active = true;
    inflight.then((data) => active && setCategories(data || []));
    return () => {
      active = false;
    };
  }, []);

  return categories;
}
