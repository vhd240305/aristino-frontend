import api from "./api";

export const paymentService = {
  // result: "SUCCESS" | "FAILED" - kết quả do cổng thanh toán giả lập trả về
  confirm: (orderId, result) =>
    api.post(`/payments/${orderId}/confirm`, { result }),
};
