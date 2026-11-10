import api from "./api";

export const orderService = {
  create: (addressId, paymentMethod) =>
    api.post("/orders", { addressId, paymentMethod }),
  getMine: (page = 0, size = 5) =>
    api.get("/orders/me", { params: { page, size } }),
  getById: (id) => api.get(`/orders/${id}`),
  // reason: một trong CUSTOMER_CANCEL_REASONS; note bắt buộc khi reason = "OTHER"
  cancel: (id, reason, note) =>
    api.put(`/orders/${id}/cancel`, { reason, note }),
};
