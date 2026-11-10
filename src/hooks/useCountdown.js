import { useEffect, useState } from "react";

// Đếm ngược theo số giây còn lại do backend trả về (không phụ thuộc đồng hồ/múi giờ của trình duyệt).
// Trả về số giây còn lại (tối thiểu 0), hoặc null nếu không có đếm ngược.
export function useCountdown(initialSeconds) {
  const [target, setTarget] = useState(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const current = Date.now();
    setNow(current);
    setTarget(initialSeconds == null ? null : current + initialSeconds * 1000);
  }, [initialSeconds]);

  useEffect(() => {
    if (target == null) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [target]);

  if (target == null) return null;
  return Math.max(0, Math.round((target - now) / 1000));
}

// 1805 -> "30:05"
export function formatCountdown(totalSeconds) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
