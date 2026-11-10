import api from "./api";

export const reviewService = {
  // Tổng hợp + danh sách đánh giá của một sản phẩm (công khai, không cần đăng nhập)
  getForProduct: (slug, page = 0, size = 5) =>
    api.get(`/products/${slug}/reviews`, { params: { page, size } }),
  // Khách đang đăng nhập có được đánh giá sản phẩm này không: { canReview, reason }
  getEligibility: (productId) =>
    api.get("/reviews/eligibility", { params: { productId } }),
  // Viết đánh giá: { productId, rating (1-5), comment }
  create: (data) => api.post("/reviews", data),
};
