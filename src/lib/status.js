// Nhãn tiếng Việt cho các trạng thái trả về từ backend
export const ORDER_STATUS = {
  PENDING: { label: "Chờ xác nhận", tone: "amber" },
  CONFIRMED: { label: "Đã xác nhận", tone: "blue" },
  SHIPPING: { label: "Đang giao hàng", tone: "blue" },
  COMPLETED: { label: "Hoàn tất", tone: "green" },
  CANCELLED: { label: "Đã hủy", tone: "red" },
  RETURN_REQUESTED: { label: "Yêu cầu đổi/trả", tone: "amber" },
  RETURNED: { label: "Đã nhận hàng trả", tone: "gray" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "gray" },
};

export const PAYMENT_STATUS = {
  PENDING: { label: "Chưa thanh toán", tone: "amber" },
  PAID: { label: "Đã thanh toán", tone: "green" },
  FAILED: { label: "Thanh toán thất bại", tone: "red" },
  REFUNDED: { label: "Đã hoàn tiền", tone: "gray" },
};

export const PAYMENT_METHOD = {
  COD: "Thanh toán khi nhận hàng (COD)",
  VNPAY: "VNPay",
  MOMO: "Ví MoMo",
};

// Các mốc hiển thị trên thanh theo dõi đơn hàng
export const TIMELINE_STEPS = [
  { key: "PENDING", label: "Đặt hàng" },
  { key: "CONFIRMED", label: "Xác nhận" },
  { key: "SHIPPING", label: "Đang giao" },
  { key: "COMPLETED", label: "Hoàn tất" },
];

// Lý do hủy đơn (mã do backend lưu -> nhãn hiển thị)
export const CANCEL_REASONS = {
  CHANGED_MIND: "Tôi đổi ý, không muốn mua nữa",
  WRONG_ITEM: "Đặt nhầm sản phẩm, size hoặc màu",
  CHANGE_ADDRESS: "Muốn thay đổi địa chỉ giao hàng",
  BETTER_PRICE: "Tìm được nơi bán giá tốt hơn",
  PAYMENT_PROBLEM: "Gặp sự cố khi thanh toán",
  OTHER: "Lý do khác",
  PAYMENT_EXPIRED: "Quá hạn thanh toán (hệ thống tự hủy)",
  SHOP_OUT_OF_STOCK: "Cửa hàng hết hàng",
  SHOP_CUSTOMER_REQUEST: "Hủy theo yêu cầu của khách hàng",
  SHOP_OTHER: "Cửa hàng hủy đơn (lý do khác)",
};

// Các lý do khách được chọn khi tự hủy đơn (không gồm PAYMENT_EXPIRED vì đó là hệ thống tự hủy)
export const CUSTOMER_CANCEL_REASONS = [
  "CHANGED_MIND",
  "WRONG_ITEM",
  "CHANGE_ADDRESS",
  "BETTER_PRICE",
  "PAYMENT_PROBLEM",
  "OTHER",
];

// Các lý do cửa hàng (admin) được chọn khi hủy đơn
export const SHOP_CANCEL_REASONS = [
  "SHOP_OUT_OF_STOCK",
  "SHOP_CUSTOMER_REQUEST",
  "SHOP_OTHER",
];
