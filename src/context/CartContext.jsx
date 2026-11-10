import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false); // giỏ hàng nhỏ trượt từ bên phải

  const refreshCart = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const { data } = await cartService.getCart();
      setCart(data);
    } catch {
      // Lỗi token hết hạn đã được api.js xử lý; lỗi khác để trống giỏ
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Mỗi thao tác trả về giỏ hàng mới nhất từ backend -> cập nhật luôn vào state
  const apply = async (request) => {
    const { data } = await request;
    setCart(data);
    return data;
  };

  const addToCart = (variantId, quantity) => apply(cartService.addItem(variantId, quantity));
  const updateItem = (itemId, quantity) => apply(cartService.updateItem(itemId, quantity));
  const removeItem = (itemId) => apply(cartService.removeItem(itemId));

  // Sau khi đặt hàng thành công backend đã dọn giỏ, chỉ cần làm trống bản trên giao diện
  const clearCartLocal = () => setCart((prev) => (prev ? { ...prev, items: [], totalAmount: 0 } : prev));

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const value = useMemo(
    () => ({
      cart, loading, itemCount, refreshCart, addToCart, updateItem, removeItem, clearCartLocal,
      drawerOpen, openDrawer, closeDrawer,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, loading, itemCount, refreshCart, drawerOpen, openDrawer, closeDrawer]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
