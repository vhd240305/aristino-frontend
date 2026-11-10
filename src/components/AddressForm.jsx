import { useState } from "react";
import Field from "./Field";
import { addressService } from "../services/addressService";
import { getErrorMessage, getFieldErrors } from "../services/api";

const REQUIRED = {
  recipientName: "Vui lòng nhập tên người nhận",
  phone: "Vui lòng nhập số điện thoại",
  province: "Vui lòng nhập tỉnh/thành phố",
  district: "Vui lòng nhập quận/huyện",
  ward: "Vui lòng nhập phường/xã",
  detailAddress: "Vui lòng nhập địa chỉ chi tiết",
};

// Form thêm hoặc sửa địa chỉ giao hàng.
// - Thêm mới: không truyền `address`. Lưu xong gọi onSaved(địa chỉ) (hoặc onCreated - tên cũ, CheckoutPage vẫn dùng)
// - Sửa: truyền `address` đang sửa. Lưu xong cũng gọi onSaved(địa chỉ đã sửa)
export default function AddressForm({
  address = null,
  defaultName = "",
  onSaved,
  onCreated,
  onCancel,
}) {
  const isEdit = Boolean(address);
  const [form, setForm] = useState({
    recipientName: address?.recipientName ?? defaultName,
    phone: address?.phone ?? "",
    province: address?.province ?? "",
    district: address?.district ?? "",
    ward: address?.ward ?? "",
    detailAddress: address?.detailAddress ?? "",
    isDefault: address?.isDefault ?? false,
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    Object.entries(REQUIRED).forEach(([key, msg]) => {
      if (!String(form[key]).trim()) found[key] = msg;
    });
    if (form.phone && !/^[0-9+\s.-]{9,15}$/.test(form.phone.trim()))
      found.phone = "Số điện thoại không hợp lệ";
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = {
      ...form,
      recipientName: form.recipientName.trim(),
      phone: form.phone.trim(),
      province: form.province.trim(),
      district: form.district.trim(),
      ward: form.ward.trim(),
      detailAddress: form.detailAddress.trim(),
    };

    setSubmitting(true);
    try {
      const { data } = isEdit
        ? await addressService.update(address.id, payload)
        : await addressService.create(payload);
      (onSaved || onCreated)?.(data);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(
        Object.keys(fieldErrors).length
          ? fieldErrors
          : { form: getErrorMessage(err) },
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="grid gap-5 border border-line bg-mist p-6 sm:grid-cols-2"
    >
      <Field label="Người nhận" error={errors.recipientName}>
        <input
          className="input"
          value={form.recipientName}
          onChange={set("recipientName")}
          autoComplete="name"
        />
      </Field>
      <Field label="Số điện thoại" error={errors.phone}>
        <input
          className="input"
          value={form.phone}
          onChange={set("phone")}
          inputMode="tel"
          autoComplete="tel"
        />
      </Field>
      <Field label="Tỉnh / Thành phố" error={errors.province}>
        <input
          className="input"
          value={form.province}
          onChange={set("province")}
        />
      </Field>
      <Field label="Quận / Huyện" error={errors.district}>
        <input
          className="input"
          value={form.district}
          onChange={set("district")}
        />
      </Field>
      <Field label="Phường / Xã" error={errors.ward}>
        <input className="input" value={form.ward} onChange={set("ward")} />
      </Field>
      <Field label="Địa chỉ chi tiết" error={errors.detailAddress}>
        <input
          className="input"
          value={form.detailAddress}
          onChange={set("detailAddress")}
          placeholder="Số nhà, tên đường..."
        />
      </Field>

      {/* Địa chỉ đang là mặc định thì không cho bỏ tick: muốn đổi, hãy đặt địa chỉ khác làm mặc định */}
      {address?.isDefault ? (
        <p className="text-sm text-ink-soft sm:col-span-2">
          Đây là địa chỉ mặc định của bạn.
        </p>
      ) : (
        <label className="flex cursor-pointer items-center gap-3 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isDefault}
            onChange={set("isDefault")}
            className="h-4 w-4 accent-ink"
          />
          Đặt làm địa chỉ mặc định
        </label>
      )}

      {errors.form && (
        <p className="text-sm text-danger sm:col-span-2">{errors.form}</p>
      )}

      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting
            ? "Đang lưu..."
            : isEdit
              ? "Cập nhật địa chỉ"
              : "Lưu địa chỉ"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn btn-outline">
            Hủy
          </button>
        )}
      </div>
    </form>
  );
}
