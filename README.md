# Aristino Frontend

Giao diện website thời trang nam Aristino (React + Vite + Tailwind CSS), bố cục kiểu cửa hàng thời trang trực tuyến.

## Yêu cầu
- Node.js 20.19 trở lên (khuyên dùng bản LTS mới nhất) - tải tại https://nodejs.org
- Backend Spring Boot đang chạy ở http://localhost:8080

## Chạy
```
npm install
npm run dev
```
Mở địa chỉ hiện ra trong terminal (thường là http://localhost:5173).

## Cấu hình
Địa chỉ backend nằm trong file `.env` (biến `VITE_API_BASE_URL`). Sửa xong cần chạy lại `npm run dev`.

## Lệnh khác
- `npm run build`: đóng gói bản chính thức vào thư mục `dist`
- `npm run lint`: kiểm tra chất lượng code

## Ghi chú
- Tìm kiếm, lọc (danh mục, giá, size, màu) và sắp xếp dùng API `GET /api/products` của backend (cần backend đã cập nhật ProductController mới).
- Thanh toán VNPay / MoMo đang hiển thị "Sắp có".
