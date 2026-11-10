import api from "./api";

export const chatService = {
  // Gửi 1 tin nhắn; sessionToken có thể null ở lần đầu (server sẽ cấp mã phiên mới)
  send: (sessionToken, message) =>
    api.post("/chat/messages", { sessionToken, message }),
  // Lấy lại lịch sử của phiên chat sau khi tải lại trang
  history: (sessionToken) =>
    api.get("/chat/history", { params: { sessionToken } }),
};
