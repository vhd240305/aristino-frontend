import api from "./api";

export const productService = {
  // Tìm kiếm + lọc + sắp xếp + phân trang. params: { q, category, minPrice, maxPrice, sizes, colors, sort, page, size }
  // Giá trị rỗng/undefined sẽ tự bị bỏ qua khi gửi lên backend
  search: (params = {}) => api.get("/products", { params }),
  // Các lựa chọn của bộ lọc (size, màu, khoảng giá), có thể giới hạn theo danh mục
  filters: (category) => api.get("/products/filters", { params: { category } }),
  list: (page = 0, size = 12) => api.get("/products", { params: { page, size } }),
  byCategory: (categoryId, page = 0, size = 12) =>
    api.get(`/categories/${categoryId}/products`, { params: { page, size } }),
  getBySlug: (slug) => api.get(`/products/${slug}`),
};

export const categoryService = {
  getAll: () => api.get("/categories"),
};
