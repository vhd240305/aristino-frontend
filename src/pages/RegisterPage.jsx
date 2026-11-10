import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import AuthShell from "../components/AuthShell";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage, getFieldErrors } from "../services/api";

export default function RegisterPage() {
  const { user, register } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ""}` : "/";

  const [form, setForm] = useState({ fullName: "", email: "", phone: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const found = {};
    if (!form.fullName.trim()) found.fullName = "Vui lòng nhập họ tên";
    if (!form.email.trim()) found.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = "Email không hợp lệ";
    if (!form.phone.trim()) found.phone = "Vui lòng nhập số điện thoại";
    else if (!/^[0-9+\s.-]{9,15}$/.test(form.phone.trim())) found.phone = "Số điện thoại không hợp lệ";
    if (!form.password) found.password = "Vui lòng nhập mật khẩu";
    else if (form.password.length < 6) found.password = "Mật khẩu cần ít nhất 6 ký tự";
    if (form.confirm !== form.password) found.confirm = "Mật khẩu nhập lại không khớp";
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const info = await register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      toast.success(`Đăng ký thành công. Chào mừng ${info.fullName}!`);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(Object.keys(fieldErrors).length ? fieldErrors : { form: getErrorMessage(err) });
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Tạo tài khoản"
      subtitle="Đăng ký để lưu giỏ hàng, quản lý địa chỉ và theo dõi đơn hàng."
      footer={
        <>
          Đã có tài khoản?{" "}
          <Link to="/login" state={location.state} className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Đăng nhập
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <Field label="Họ và tên" error={errors.fullName}>
          <input className="input" value={form.fullName} onChange={set("fullName")} autoComplete="name" autoFocus />
        </Field>
        <Field label="Email" error={errors.email}>
          <input type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" />
        </Field>
        <Field label="Số điện thoại" error={errors.phone}>
          <input className="input" value={form.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Mật khẩu" error={errors.password}>
            <input type="password" className="input" value={form.password} onChange={set("password")} autoComplete="new-password" />
          </Field>
          <Field label="Nhập lại mật khẩu" error={errors.confirm}>
            <input type="password" className="input" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" />
          </Field>
        </div>

        {errors.form && <p className="border-l-4 border-danger bg-red-50 px-4 py-3 text-sm text-danger">{errors.form}</p>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting ? "Đang tạo tài khoản..." : "Đăng ký"}
        </button>
      </form>
    </AuthShell>
  );
}
