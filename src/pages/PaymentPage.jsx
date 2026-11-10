import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useToast } from "../context/ToastContext";
import { formatCountdown, useCountdown } from "../hooks/useCountdown";
import { orderService } from "../services/orderService";
import { paymentService } from "../services/paymentService";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../lib/format";

const GATEWAYS = {
  VNPAY: {
    name: "VNPAY",
    color: "#0b4ea2",
    note: "Cổng thanh toán VNPAY (giả lập)",
  },
  MOMO: { name: "MoMo", color: "#a50064", note: "Ví điện tử MoMo (giả lập)" },
};

// Trang "cổng thanh toán giả lập": thay cho trang của VNPay/MoMo thật.
// Người dùng chọn kết quả giao dịch, trang gọi backend để cập nhật trạng thái thanh toán của đơn.
// Đơn có thời hạn thanh toán; quá hạn thì backend tự hủy đơn.
export default function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [phase, setPhase] = useState("ready"); // ready | processing | failed
  const [failReason, setFailReason] = useState("");
  const mounted = useRef(true);
  const secondsLeft = useCountdown(order?.paymentSecondsLeft ?? null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    orderService
      .getById(id)
      .then((res) => active && setOrder(res.data))
      .catch(
        (err) =>
          active && setError(getErrorMessage(err, "Không tìm thấy đơn hàng")),
      );
    return () => {
      active = false;
    };
  }, [id]);

  const shell = (children) => (
    <div className="flex min-h-screen items-center justify-center bg-mist px-4 py-10">
      {children}
    </div>
  );
  const notice = (message, linkTo, linkLabel) =>
    shell(
      <div className="w-full max-w-md bg-white p-8 text-center shadow-sm">
        <p className="text-sm leading-relaxed text-ink-soft">{message}</p>
        <Link to={linkTo} className="btn btn-primary mt-6">
          {linkLabel}
        </Link>
      </div>,
    );

  if (error) return notice(error, "/orders", "Về đơn hàng của tôi");
  if (!order)
    return shell(
      <p className="text-sm text-ink-soft">Đang kết nối cổng thanh toán...</p>,
    );
  if (order.paymentMethod === "COD")
    return <Navigate to={`/orders/${id}`} replace />;

  const remaining = secondsLeft ?? order.paymentSecondsLeft; // tránh nháy "hết hạn" ở lần render đầu
  const detailLink = `/orders/${id}`;

  if (phase !== "processing") {
    if (order.orderStatus === "CANCELLED") {
      return notice(
        order.cancelReason === "PAYMENT_EXPIRED"
          ? "Đơn hàng đã bị hủy do quá hạn thanh toán. Bạn có thể đặt lại đơn hàng mới."
          : "Đơn hàng này đã bị hủy nên không thể thanh toán.",
        detailLink,
        "Xem đơn hàng",
      );
    }
    if (order.paymentStatus === "PAID") {
      return notice(
        "Đơn hàng này đã được thanh toán.",
        detailLink,
        "Xem đơn hàng",
      );
    }
    if (order.orderStatus !== "PENDING") {
      return notice(
        "Đơn hàng này không còn ở trạng thái chờ thanh toán.",
        detailLink,
        "Xem đơn hàng",
      );
    }
    if (remaining === 0) {
      return notice(
        "Đã hết thời hạn thanh toán. Đơn hàng sẽ được hệ thống tự động hủy và hàng được trả lại kho.",
        detailLink,
        "Xem đơn hàng",
      );
    }
  }

  const gw = GATEWAYS[order.paymentMethod] || GATEWAYS.VNPAY;

  const simulate = async (result, reason) => {
    setPhase("processing");
    await new Promise((resolve) => setTimeout(resolve, 1500)); // giả lập thời gian cổng xử lý giao dịch
    try {
      const { data } = await paymentService.confirm(id, result);
      if (!mounted.current) return;
      setOrder(data);
      if (data.orderStatus === "CANCELLED") {
        // Backend phát hiện đã quá hạn thanh toán và vừa hủy đơn
        setPhase("ready");
      } else if (result === "SUCCESS") {
        toast.success("Thanh toán thành công");
        navigate(`/order-success/${id}`, { replace: true });
      } else {
        setFailReason(reason);
        setPhase("failed");
      }
    } catch (err) {
      if (!mounted.current) return;
      toast.error(getErrorMessage(err));
      setPhase("ready");
    }
  };

  const rows = [
    ["Đơn vị thụ hưởng", "Aristino"],
    ["Mã đơn hàng", order.orderCode],
    ["Nội dung", `Thanh toan don hang ${order.orderCode}`],
  ];

  return shell(
    <div className="w-full max-w-md overflow-hidden bg-white shadow-sm">
      <div
        className="px-8 py-6 text-white"
        style={{ backgroundColor: gw.color }}
      >
        <p className="text-2xl font-extrabold tracking-wide">{gw.name}</p>
        <p className="mt-1 text-xs opacity-80">{gw.note}</p>
      </div>

      <div className="bg-amber-100 px-8 py-3 text-xs leading-relaxed text-amber-900">
        Đây là <strong>cổng thanh toán giả lập</strong> dùng cho đồ án. Không
        nhập thông tin thẻ hay tài khoản thật, không có giao dịch tiền thật nào
        được thực hiện.
      </div>

      <div className="px-8 py-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Số tiền thanh toán
        </p>
        <p className="mt-1 text-3xl font-extrabold" style={{ color: gw.color }}>
          {formatMoney(order.totalAmount)}
        </p>

        {remaining != null && (
          <p
            className={`mt-3 text-sm ${remaining < 60 ? "font-semibold text-red-700" : "text-ink-soft"}`}
          >
            Giao dịch hết hạn sau{" "}
            <span className="font-bold tabular-nums">
              {formatCountdown(remaining)}
            </span>
          </p>
        )}

        <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-6">
              <dt className="text-ink-soft">{label}</dt>
              <dd className="text-right font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {phase === "processing" && (
          <div className="mt-8 flex flex-col items-center gap-4 py-4 text-sm text-ink-soft">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-line border-t-ink" />
            Đang xử lý giao dịch, vui lòng không đóng trang...
          </div>
        )}

        {phase === "failed" && (
          <div className="mt-8 border border-red-200 bg-red-50 p-5 text-sm">
            <p className="font-bold text-red-900">
              Thanh toán không thành công
            </p>
            <p className="mt-1 text-red-800">{failReason}</p>
            <p className="mt-2 text-xs text-red-800/80">
              Đơn hàng vẫn được giữ, bạn có thể thanh toán lại trong thời hạn.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => setPhase("ready")}
                className="btn btn-primary"
              >
                Thử thanh toán lại
              </button>
              <Link to={detailLink} className="btn btn-outline">
                Xem đơn hàng
              </Link>
            </div>
          </div>
        )}

        {phase === "ready" && (
          <div className="mt-8 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Chọn kết quả giao dịch giả lập
            </p>
            <button
              onClick={() => simulate("SUCCESS")}
              className="flex w-full cursor-pointer items-center justify-center gap-2 py-3.5 text-sm font-bold uppercase tracking-wide text-white"
              style={{ backgroundColor: gw.color }}
            >
              <Check size={16} /> Thanh toán thành công
            </button>
            <button
              onClick={() =>
                simulate(
                  "FAILED",
                  "Giao dịch bị từ chối (giả lập: tài khoản không đủ số dư).",
                )
              }
              className="w-full cursor-pointer border border-line py-3.5 text-sm font-bold uppercase tracking-wide hover:border-ink"
            >
              Thanh toán thất bại
            </button>
            <button
              onClick={() =>
                simulate("FAILED", "Bạn đã hủy giao dịch tại cổng thanh toán.")
              }
              className="block w-full cursor-pointer pt-2 text-center text-xs font-semibold uppercase tracking-wide text-ink-soft underline underline-offset-4 hover:text-ink"
            >
              Hủy giao dịch
            </button>
          </div>
        )}
      </div>
    </div>,
  );
}
