import { useState } from "react";
import Field from "./Field";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { getErrorMessage, getFieldErrors } from "../services/api";

const EMPTY = { currentPassword: "", newPassword: "", confirmPassword: "" };

// Form đổi mật khẩu: nhập mật khẩu hiện tại + mật khẩu mới 2 lần
export default function PasswordForm() {
  const toast = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.currentPassword)
      found.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
    if (!form.newPassword) found.newPassword = "Vui lòng nhập mật khẩu mới";
    else if (form.newPassword.length < 6)
      found.newPassword = "Mật khẩu mới phải có ít nhất 6 ký tự";
    else if (form.newPassword === form.currentPassword)
      found.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
    if (form.confirmPassword !== form.newPassword)
      found.confirmPassword = "Mật khẩu nhập lại không khớp";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      await userService.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(EMPTY);
      toast.success("Đã đổi mật khẩu thành công");
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (Object.keys(fieldErrors).length) {
        setErrors(fieldErrors);
      } else {
        const message = getErrorMessage(err);
        // Sai mật khẩu hiện tại thì báo ngay dưới ô đó
        if (/hiện tại/i.test(message) && /không đúng/i.test(message))
          setErrors({ currentPassword: message });
        else setErrors({ form: message });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="grid max-w-xl gap-5">
      <Field label="Mật khẩu hiện tại" error={errors.currentPassword}>
        <input
          type="password"
          className="input"
          value={form.currentPassword}
          onChange={set("currentPassword")}
          autoComplete="current-password"
        />
      </Field>
      <Field label="Mật khẩu mới" error={errors.newPassword}>
        <input
          type="password"
          className="input"
          value={form.newPassword}
          onChange={set("newPassword")}
          autoComplete="new-password"
        />
      </Field>
      <Field label="Nhập lại mật khẩu mới" error={errors.confirmPassword}>
        <input
          type="password"
          className="input"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          autoComplete="new-password"
        />
      </Field>

      {errors.form && <p className="text-sm text-danger">{errors.form}</p>}

      <div>
        <button type="submit" disabled={submitting} className="btn btn-primary">
          {submitting ? "Đang lưu..." : "Cập nhật mật khẩu"}
        </button>
      </div>
    </form>
  );
}
