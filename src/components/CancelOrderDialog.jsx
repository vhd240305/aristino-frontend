import { useEffect, useState } from "react";
import { useToast } from "../context/ToastContext";
import { orderService } from "../services/orderService";
import { getErrorMessage } from "../services/api";
import { formatMoney } from "../lib/format";
import { CANCEL_REASONS, CUSTOMER_CANCEL_REASONS } from "../lib/status";

// Hộp thoại hủy đơn: khách bắt buộc chọn lý do. Hủy xong gọi onCancelled(đơn đã cập nhật).
export default function CancelOrderDialog({ order, onClose, onCancelled }) {
  const toast = useToast();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Nhấn Esc để đóng (khi không đang gửi yêu cầu)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, submitting]);

  const willRefund = order.paymentStatus === "PAID";

  const handleConfirm = async () => {
    if (!reason) {
      setError("Vui lòng chọn lý do hủy đơn");
      return;
    }
    if (reason === "OTHER" && !note.trim()) {
      setError("Vui lòng nhập lý do hủy đơn");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const { data } = await orderService.cancel(order.id, reason, note.trim());
      toast.success("Đã hủy đơn hàng");
      onCancelled(data);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className="max-h-full w-full max-w-lg overflow-y-auto bg-white p-6 sm:p-8">
        <h2
          id="cancel-title"
          className="text-lg font-extrabold uppercase tracking-wide"
        >
          Hủy đơn hàng
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          Đơn <span className="font-semibold text-ink">{order.orderCode}</span>{" "}
          · {formatMoney(order.totalAmount)}
        </p>

        <fieldset className="mt-6" disabled={submitting}>
          <legend className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Lý do hủy đơn
          </legend>
          <div className="mt-3 space-y-2">
            {CUSTOMER_CANCEL_REASONS.map((code) => (
              <label
                key={code}
                className={`flex cursor-pointer items-center gap-3 border p-3 text-sm transition-colors ${
                  reason === code
                    ? "border-ink"
                    : "border-line hover:border-ink/50"
                }`}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  checked={reason === code}
                  onChange={() => {
                    setReason(code);
                    setError("");
                  }}
                  className="h-4 w-4 accent-ink"
                />
                {CANCEL_REASONS[code]}
              </label>
            ))}
          </div>

          {reason && (
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={255}
              rows={3}
              placeholder={
                reason === "OTHER"
                  ? "Nhập lý do của bạn (bắt buộc)"
                  : "Ghi chú thêm (không bắt buộc)"
              }
              className="input mt-3 w-full"
            />
          )}
        </fieldset>

        <p className="mt-5 bg-mist p-3 text-xs leading-relaxed text-ink-soft">
          {willRefund
            ? `Đơn đã thanh toán online. Sau khi hủy, số tiền ${formatMoney(order.totalAmount)} sẽ được hoàn về phương thức thanh toán của bạn (hoàn tiền giả lập, cập nhật ngay).`
            : "Đơn chưa thanh toán nên sẽ không phát sinh hoàn tiền. Sản phẩm trong đơn sẽ được trả lại kho."}{" "}
          Thao tác này không thể hoàn tác.
        </p>

        {error && <p className="mt-4 text-sm text-danger">{error}</p>}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="btn btn-outline"
          >
            Giữ đơn hàng
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? "Đang hủy..." : "Xác nhận hủy đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}
