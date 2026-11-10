import api from "./api";

export const addressService = {
  getMine: () => api.get("/addresses/me"),
  create: (data) => api.post("/addresses", data),
  update: (id, data) => api.put(`/addresses/${id}`, data),
  setDefault: (id) => api.put(`/addresses/${id}/default`),
  remove: (id) => api.delete(`/addresses/${id}`),
};
