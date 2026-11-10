import { useState } from "react";
import Field from "./Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { getErrorMessage, getFieldErrors } from "../services/api";

// Form sửa họ tên và số điện thoại. Email chỉ để xem (không cho đổi).
export default function ProfileForm({ profile, onSaved }) {
  const { updateUser } = useAuth();
  const toast = useToast();
  const [form, setForm] = useState({
    fullName: profile.fullName ?? "",
    phone: profile.phone ?? "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.fullName.trim()) found.fullName = "Vui lòng nhập họ và tên";
    if (form.phone.trim() && !/^[0-9+\s.-]{9,15}$/.test(form.phone.trim()))
      found.phone = "Số điện thoại không hợp lệ";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const { data } = await userService.updateMe({
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
      });
      updateUser({ fullName: data.fullName });
      onSaved?.(data);
      setForm({ fullName: data.fullName ?? "", phone: data.phone ?? "" });
      toast.success("Đã cập nhật thông tin cá nhân");
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) setErrors(fieldErrors);
      else toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid max-w-xl gap-5">
      <Field label="Họ và tên" error={errors.fullName}>
        <input
          className="input"
          value={form.fullName}
          onChange={set("fullName")}
          autoComplete="name"
        />
      </Field>
      <Field label="Email">
        <input
          className="input cursor-not-allowed bg-mist text-ink-soft"
          value={profile.email}
          readOnly
          disabled
        />
        <p className="mt-1.5 text-xs text-ink-soft">
          Email dùng để đăng nhập nên không thể thay đổi.
        </p>
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
      <div>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
