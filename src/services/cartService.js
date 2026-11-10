import api from "./api";

export const cartService = {
  getCart: () => api.get("/cart"),
  addItem: (variantId, quantity) => api.post("/cart/items", { variantId, quantity }),
  updateItem: (itemId, quantity) => api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId) => api.delete(`/cart/items/${itemId}`),
};
