import { createContext, useCallback, useContext, useMemo, useState } from "react";

const QuickViewContext = createContext(null);

// Quản lý cửa sổ "Xem nhanh" sản phẩm dùng chung toàn site
export function QuickViewProvider({ children }) {
  const [slug, setSlug] = useState(null);
  const openQuickView = useCallback((s) => setSlug(s), []);
  const closeQuickView = useCallback(() => setSlug(null), []);
  const value = useMemo(() => ({ slug, openQuickView, closeQuickView }), [slug, openQuickView, closeQuickView]);
  return <QuickViewContext.Provider value={value}>{children}</QuickViewContext.Provider>;
}

export function useQuickView() {
  return useContext(QuickViewContext);
}
