# Aristino Frontend

Giao diện cửa hàng và trang quản trị cho **Aristino**, website thương mại điện tử thời trang nam. Xây dựng bằng React 19, Vite và Tailwind CSS 4.

> Repo backend: [aristino-backend](https://github.com/vhd240305/aristino-backend) (Spring Boot REST API)

<!-- Thêm ảnh chụp màn hình vào thư mục /docs rồi chèn vào đây, ví dụ:
![Trang chủ](docs/home.png)
![Trang sản phẩm](docs/product.png)
![Dashboard admin](docs/admin-dashboard.png)
-->

## Tính năng

**Cửa hàng**
- Trang chủ có slider và sản phẩm nổi bật
- Danh sách sản phẩm với tìm kiếm, bộ lọc và phân trang
- Trang chi tiết sản phẩm: chọn biến thể size/màu, xem nhanh (quick view) và đánh giá của khách hàng
- Giỏ hàng dạng ngăn kéo (drawer) và trang giỏ hàng đầy đủ
- Thanh toán với sổ địa chỉ, trang đặt hàng thành công và lịch sử đơn hàng
- Trang thanh toán online có đồng hồ đếm ngược cho đơn chờ (cổng giả lập), hộp thoại hủy đơn
- Trang tài khoản: hồ sơ, đổi mật khẩu, địa chỉ đã lưu
- Chatbot tư vấn mua sắm bằng AI (chat widget)
- Đăng nhập / đăng ký và các route được bảo vệ

**Trang quản trị**
- Dashboard thống kê doanh thu và đơn hàng
- Quản lý sản phẩm (thêm / sửa, tải ảnh lên), danh mục, đơn hàng và người dùng

## Công nghệ

- **React 19** với **React Router 7**
- **Vite** (dev server và build)
- **Tailwind CSS 4**
- **Axios** để gọi API
- Context API quản lý state toàn cục (xác thực, giỏ hàng, thông báo, quick view)
- Oxlint để kiểm tra mã nguồn

## Hướng dẫn chạy

### Yêu cầu
- Node.js 20 trở lên
- [Backend](https://github.com/vhd240305/aristino-backend) đang chạy tại `http://localhost:8080`

### Cài đặt và chạy

```bash
npm install
npm run dev
```

Ứng dụng chạy tại `http://localhost:5173` (backend đã cho phép origin này qua CORS).

### Biến môi trường
Tạo file `.env` nếu backend của bạn chạy ở địa chỉ khác:

```
VITE_API_BASE_URL=http://localhost:8080/api
```

Nếu không đặt, mặc định là `http://localhost:8080/api`.

### Các lệnh

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build bản production vào thư mục `dist/` |
| `npm run preview` | Xem thử bản build production |
| `npm run lint` | Chạy Oxlint |

## Cấu trúc dự án

```
src/
├── components/   Thành phần giao diện dùng chung (Header, CartDrawer, ChatWidget, ProductCard, ...)
│   └── admin/    Thành phần riêng cho trang quản trị
├── context/      AuthContext, CartContext, ToastContext, QuickViewContext
├── hooks/        Custom hook (useCategories, useCountdown, useVariantSelection)
├── lib/          Hàm định dạng và xử lý trạng thái
├── pages/        Các trang theo route
│   └── admin/    Trang quản trị (dashboard, sản phẩm, đơn hàng, người dùng, danh mục)
├── services/     API client và các service gọi API (Axios)
├── App.jsx       Khai báo route
└── main.jsx      Điểm khởi chạy
```

## Lưu ý

- Thanh toán chỉ là mô phỏng phục vụ demo.
- Dự án được xây dựng cho mục đích học tập và portfolio.

## Tác giả

**TEN_BAN** – [GitHub](https://github.com/vhd240305)
