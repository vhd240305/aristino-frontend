import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Trang cần đăng nhập: chưa đăng nhập thì chuyển sang /login, đăng nhập xong quay lại đúng trang này.
// adminOnly: chỉ tài khoản có quyền quản trị mới vào được, người khác bị đưa về trang chủ.
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}
