import api from "./api";

// Các API dành cho quản trị (/api/admin/**) - cần tài khoản ROLE_ADMIN
export const adminService = {
  // Tổng quan / thống kê
  getStats: (days = 30) => api.get("/admin/stats", { params: { days } }),

  // Đơn hàng
  getOrders: (params) => api.get("/admin/orders", { params }),
  getOrder: (id) => api.get(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    api.put(`/admin/orders/${id}/status`, { status }),
  cancelOrder: (id, reason, note) =>
    api.put(`/admin/orders/${id}/cancel`, { reason, note }),

  // Danh mục
  getCategories: () => api.get("/admin/categories"),
  createCategory: (data) => api.post("/admin/categories", data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),

  // Sản phẩm
  getProducts: (params) => api.get("/admin/products", { params }),
  getProduct: (id) => api.get(`/admin/products/${id}`),
  createProduct: (data) => api.post("/admin/products", data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  updateProductStatus: (id, status) =>
    api.put(`/admin/products/${id}/status`, { status }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Tài khoản
  getUsers: (params) => api.get("/admin/users", { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, status) =>
    api.put(`/admin/users/${id}/status`, { status }),
  setUserAdmin: (id, admin) => api.put(`/admin/users/${id}/admin`, { admin }),

  // Tải ảnh lên (trả về { url })
  uploadImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/admin/uploads/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
