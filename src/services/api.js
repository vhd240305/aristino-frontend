import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
});

// Các đường dẫn công khai: không gửi kèm token (tránh token cũ làm hỏng request công khai)
const PUBLIC_PATHS = /^\/(products|categories|auth)/;

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && !PUBLIC_PATHS.test(config.url || "")) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token hết hạn/không hợp lệ: backend trả 401, hoặc 403 với body trống.
// Phát sự kiện để AuthContext tự đăng xuất và chuyển về trang đăng nhập.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const hasMessage = Boolean(err.response?.data?.message);
    const hadToken = Boolean(localStorage.getItem("token"));
    const isPublic = PUBLIC_PATHS.test(err.config?.url || "");
    if (
      hadToken &&
      !isPublic &&
      (status === 401 || (status === 403 && !hasMessage))
    ) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    return Promise.reject(err);
  },
);

// Backend hiện trả thông báo tiếng Việt không dấu -> chuyển sang có dấu để hiển thị cho người dùng
const FIXES = [
  [
    /Gio hang dang trong, khong the dat hang/i,
    "Giỏ hàng đang trống, không thể đặt hàng",
  ],
  [/Email hoac mat khau khong dung/i, "Email hoặc mật khẩu không đúng"],
  [/Email da duoc su dung.*/i, "Email này đã được sử dụng"],
  [/khong du ton kho/i, "không đủ tồn kho"],
  [
    /San pham vua duoc cap nhat boi mot giao dich khac, vui long thu lai/i,
    "Sản phẩm vừa được cập nhật bởi giao dịch khác, vui lòng thử lại",
  ],
  [/^San pham /, "Sản phẩm "],
  [/Hinh thuc thanh toan khong hop le.*/i, "Hình thức thanh toán không hợp lệ"],
  [/Khong tim thay san pham/i, "Không tìm thấy sản phẩm"],
  [/Khong tim thay dia chi/i, "Không tìm thấy địa chỉ"],
  [/Khong tim thay don hang/i, "Không tìm thấy đơn hàng"],
  [/Khong tim thay bien the san pham/i, "Không tìm thấy biến thể sản phẩm"],
  [/Dia chi nay khong thuoc ve ban/i, "Địa chỉ này không thuộc về bạn"],
  [/Ban khong co quyen.*/i, "Bạn không có quyền thực hiện thao tác này"],
  [/Du lieu khong hop le/i, "Dữ liệu không hợp lệ"],
  [/Ten nguoi nhan khong duoc de trong/i, "Tên người nhận không được để trống"],
  [/So dien thoai khong duoc de trong/i, "Số điện thoại không được để trống"],
  [
    /Tinh\/thanh pho khong duoc de trong/i,
    "Tỉnh/thành phố không được để trống",
  ],
  [/Quan\/huyen khong duoc de trong/i, "Quận/huyện không được để trống"],
  [/Phuong\/xa khong duoc de trong/i, "Phường/xã không được để trống"],
  [
    /Dia chi chi tiet khong duoc de trong/i,
    "Địa chỉ chi tiết không được để trống",
  ],
  [/Ho ten khong duoc de trong/i, "Họ tên không được để trống"],
  [/Ho ten khong duoc qua 100 ky tu/i, "Họ tên không được quá 100 ký tự"],
  [/So dien thoai khong hop le/i, "Số điện thoại không hợp lệ"],
  [
    /Mat khau hien tai khong duoc de trong/i,
    "Mật khẩu hiện tại không được để trống",
  ],
  [/Mat khau moi khong duoc de trong/i, "Mật khẩu mới không được để trống"],
  [
    /Mat khau moi phai co it nhat 6 ky tu/i,
    "Mật khẩu mới phải có ít nhất 6 ký tự",
  ],
  [
    /Mat khau moi phai khac mat khau hien tai/i,
    "Mật khẩu mới phải khác mật khẩu hiện tại",
  ],
  [/Mat khau hien tai khong dung/i, "Mật khẩu hiện tại không đúng"],
  [/Vui long chon ly do huy don/i, "Vui lòng chọn lý do hủy đơn"],
  [/Ly do huy don khong hop le/i, "Lý do hủy đơn không hợp lệ"],
  [/Vui long nhap ly do huy don/i, "Vui lòng nhập lý do hủy đơn"],
  [/Ghi chu khong duoc qua 255 ky tu/i, "Ghi chú không được quá 255 ký tự"],
  [/Don hang nay da duoc huy truoc do/i, "Đơn hàng này đã được hủy trước đó"],
  [
    /Don hang da duoc cua hang xu ly, khong the tu huy\. Vui long lien he cua hang de duoc ho tro/i,
    "Đơn hàng đã được cửa hàng xử lý, không thể tự hủy. Vui lòng liên hệ cửa hàng để được hỗ trợ",
  ],
  [/Don hang nay da duoc thanh toan/i, "Đơn hàng này đã được thanh toán"],
  [
    /Don hang thanh toan khi nhan hang, khong can thanh toan online/i,
    "Đơn hàng thanh toán khi nhận hàng, không cần thanh toán online",
  ],
  [
    /Don hang da bi huy, khong the thanh toan/i,
    "Đơn hàng đã bị hủy, không thể thanh toán",
  ],
  [
    /Don hang khong con o trang thai cho thanh toan/i,
    "Đơn hàng không còn ở trạng thái chờ thanh toán",
  ],
  [/Thieu ket qua thanh toan/i, "Thiếu kết quả thanh toán"],
  [/Ket qua thanh toan khong hop le/i, "Kết quả thanh toán không hợp lệ"],
  [/Cong thanh toan gia lap dang tat/i, "Cổng thanh toán giả lập đang tắt"],
  [/Vui long chon trang thai don hang/i, "Vui lòng chọn trạng thái đơn hàng"],
  [/Trang thai don hang khong hop le/i, "Trạng thái đơn hàng không hợp lệ"],
  [
    /Khong the chuyen don tu trang thai hien tai sang trang thai nay/i,
    "Không thể chuyển đơn sang trạng thái này",
  ],
  [
    /Don thanh toan online chua duoc thanh toan, chua the xac nhan/i,
    "Đơn thanh toán online chưa được thanh toán nên chưa thể xác nhận",
  ],
  [
    /Chi huy duoc don dang cho xac nhan hoac da xac nhan/i,
    "Chỉ hủy được đơn đang chờ xác nhận hoặc đã xác nhận",
  ],
  [/Khong tim thay danh muc/i, "Không tìm thấy danh mục"],
  [/Ten danh muc khong duoc de trong/i, "Tên danh mục không được để trống"],
  [
    /Ten danh muc khong duoc qua 100 ky tu/i,
    "Tên danh mục không được quá 100 ký tự",
  ],
  [/Duong dan khong duoc qua 120 ky tu/i, "Đường dẫn không được quá 120 ký tự"],
  [/Duong dan \(slug\) da ton tai/i, "Đường dẫn (slug) đã tồn tại"],
  [
    /Danh muc dang co san pham, khong the xoa\. Hay chuyen san pham sang danh muc khac truoc/i,
    "Danh mục đang có sản phẩm, không thể xóa. Hãy chuyển sản phẩm sang danh mục khác trước",
  ],
  [
    /Danh muc dang co danh muc con, khong the xoa/i,
    "Danh mục đang có danh mục con, không thể xóa",
  ],
  [/Vui long chon danh muc/i, "Vui lòng chọn danh mục"],
  [/Ten san pham khong duoc de trong/i, "Tên sản phẩm không được để trống"],
  [
    /Ten san pham khong duoc qua 200 ky tu/i,
    "Tên sản phẩm không được quá 200 ký tự",
  ],
  [/Chat lieu khong duoc qua 150 ky tu/i, "Chất liệu không được quá 150 ký tự"],
  [/Gia san pham khong duoc de trong/i, "Giá sản phẩm không được để trống"],
  [/Gia bien the khong duoc de trong/i, "Giá biến thể không được để trống"],
  [/Gia khong duoc am/i, "Giá không được âm"],
  [/Trang thai san pham khong hop le/i, "Trạng thái sản phẩm không hợp lệ"],
  [/Phai co it nhat mot bien the/i, "Phải có ít nhất một biến thể"],
  [/SKU khong duoc de trong/i, "SKU không được để trống"],
  [/SKU khong duoc qua 50 ky tu/i, "SKU không được quá 50 ký tự"],
  [/Ton kho khong duoc de trong/i, "Tồn kho không được để trống"],
  [/Ton kho khong duoc am/i, "Tồn kho không được âm"],
  [/Duong dan anh khong duoc de trong/i, "Đường dẫn ảnh không được để trống"],
  [
    /Duong dan anh khong duoc qua 255 ky tu/i,
    "Đường dẫn ảnh không được quá 255 ký tự",
  ],
  [/^SKU da ton tai/i, "SKU đã tồn tại"],
  [
    /^SKU bi trung trong danh sach bien the/i,
    "SKU bị trùng trong danh sách biến thể",
  ],
  [/^Bien the trung size va mau/i, "Biến thể trùng size và màu"],
  [/Bien the khong thuoc san pham nay/i, "Biến thể không thuộc sản phẩm này"],
  [
    / da co don hang nen khong the xoa\. Hay dat ton kho bang 0/i,
    " đã có đơn hàng nên không thể xóa. Hãy đặt tồn kho bằng 0",
  ],
  [
    /San pham da co don hang nen khong the xoa\. Hay chuyen sang trang thai An/i,
    "Sản phẩm đã có đơn hàng nên không thể xóa. Hãy chuyển sang trạng thái Ẩn",
  ],
  [
    /hien khong con ban, vui long xoa khoi gio hang/i,
    "hiện không còn bán, vui lòng xóa khỏi giỏ hàng",
  ],
  [/Vui long chon file anh/i, "Vui lòng chọn file ảnh"],
  [
    /Chi nhan anh JPG, PNG, WEBP hoac GIF/i,
    "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF",
  ],
  [/Khong the luu file anh/i, "Không thể lưu file ảnh"],
  [/Anh vuot qua dung luong toi da 5MB/i, "Ảnh vượt quá dung lượng tối đa 5MB"],
  [/Khong tim thay nguoi dung/i, "Không tìm thấy người dùng"],
  [/Ban khong the khoa chinh minh/i, "Bạn không thể khóa chính mình"],
  [
    /Ban khong the tu thu hoi quyen quan tri cua minh/i,
    "Bạn không thể tự thu hồi quyền quản trị của mình",
  ],
  [/Trang thai tai khoan khong hop le/i, "Trạng thái tài khoản không hợp lệ"],
  [/Quyen khong hop le/i, "Quyền không hợp lệ"],
  [/Thieu thong tin quyen quan tri/i, "Thiếu thông tin quyền quản trị"],
  [
    /Chua seed du lieu ROLE_ADMIN trong bang roles/i,
    "Chưa có quyền ROLE_ADMIN trong bảng roles",
  ],
  [
    /Tai khoan cua ban da bi khoa\. Vui long lien he cua hang de duoc ho tro/i,
    "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng để được hỗ trợ",
    [/Thieu ma san pham/i, "Thiếu mã sản phẩm"],
    [/Vui long chon so sao danh gia/i, "Vui lòng chọn số sao đánh giá"],
    [/So sao danh gia phai tu 1 den 5/i, "Số sao đánh giá phải từ 1 đến 5"],
    [
      /Noi dung danh gia khong duoc qua 1000 ky tu/i,
      "Nội dung đánh giá không được quá 1000 ký tự",
    ],
    [/Ban da danh gia san pham nay roi/i, "Bạn đã đánh giá sản phẩm này rồi"],
    [
      /Chi khach hang da mua va nhan san pham moi duoc danh gia/i,
      "Chỉ khách hàng đã mua và nhận sản phẩm mới được đánh giá",
    ],
  ],
];
const restoreDiacritics = (msg) =>
  FIXES.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    msg,
  );

export function getErrorMessage(
  err,
  fallback = "Đã có lỗi xảy ra, vui lòng thử lại",
) {
  if (!err?.response)
    return "Không kết nối được máy chủ. Hãy kiểm tra backend đã chạy chưa.";
  const message = err.response.data?.message;
  return message ? restoreDiacritics(message) : fallback;
}

// Lỗi theo từng ô nhập (backend trả { errors: { tenTruong: "thông báo" } })
export function getFieldErrors(err) {
  const raw = err?.response?.data?.errors || {};
  return Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, restoreDiacritics(String(v))]),
  );
}

export default api;
