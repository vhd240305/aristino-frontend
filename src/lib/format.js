// Định dạng tiền Việt: 399000 -> "399.000₫"
export const formatMoney = (value) =>
  `${Math.round(Number(value) || 0).toLocaleString("vi-VN")}₫`;

// Định dạng ngày giờ từ chuỗi ISO (hoặc mảng nếu backend trả dạng mảng)
export function formatDate(value) {
  if (!value) return "";
  const d = Array.isArray(value)
    ? new Date(value[0], value[1] - 1, value[2], value[3] || 0, value[4] || 0, value[5] || 0)
    : new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Sắp xếp size: S < M < L < XL ..., size số (29, 30...) tăng dần
const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL", "4XL", "5XL"];
export function compareSizes(a, b) {
  const ia = SIZE_ORDER.indexOf(String(a).toUpperCase());
  const ib = SIZE_ORDER.indexOf(String(b).toUpperCase());
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
  return String(a).localeCompare(String(b), "vi");
}

// Tên màu (tiếng Việt) -> mã màu để vẽ chấm tròn màu trên trang chi tiết
const COLOR_HEX = {
  "trắng": "#f4f1ea",
  "đen": "#16181d",
  "nâu": "#6a4630",
  "ghi": "#8a8d92",
  "xám": "#9b9da1",
  "xanh navy": "#1c2b4d",
  "xanh caro": "#5f82ad",
  "xanh": "#3d6ea8",
  "đỏ": "#9c2f2f",
  "be": "#d8c7a6",
  "kem": "#efe4cc",
};
export function colorToHex(name) {
  const key = String(name || "").toLowerCase();
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  const hit = Object.keys(COLOR_HEX).find((k) => key.includes(k));
  return hit ? COLOR_HEX[hit] : "#cfc7b6";
}
