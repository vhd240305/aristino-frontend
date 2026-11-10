import { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthShell from "../components/AuthShell";
import Field from "../components/Field";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { getErrorMessage } from "../services/api";

export default function LoginPage() {
  const { user, login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search || ""}` : "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Đã đăng nhập (hoặc vừa đăng nhập xong) thì chuyển về trang trước đó
  if (user) return <Navigate to={redirectTo} replace />;

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.email.trim()) found.email = "Vui lòng nhập email";
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) found.email = "Email không hợp lệ";
    if (!form.password) found.password = "Vui lòng nhập mật khẩu";
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    try {
      const info = await login(form.email.trim(), form.password);
      toast.success(`Chào mừng ${info.fullName} quay trở lại!`);
    } catch (err) {
      setErrors({ form: getErrorMessage(err, "Email hoặc mật khẩu không đúng") });
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Nhập email và mật khẩu của bạn để đăng nhập."
      footer={
        <>
          Chưa có tài khoản?{" "}
          <Link to="/register" state={location.state} className="font-medium text-ink underline underline-offset-4 hover:text-accent">
            Đăng ký ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <Field label="Email" error={errors.email}>
          <input type="email" className="input" value={form.email} onChange={set("email")} autoComplete="email" autoFocus />
        </Field>
        <Field label="Mật khẩu" error={errors.password}>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              className="input pr-12"
              value={form.password}
              onChange={set("password")}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 text-ink-soft hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        {errors.form && <p className="border-l-4 border-danger bg-red-50 px-4 py-3 text-sm text-danger">{errors.form}</p>}

        <button type="submit" disabled={submitting} className="btn btn-primary w-full">
          {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </AuthShell>
  );
}
