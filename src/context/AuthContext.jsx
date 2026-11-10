import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "../services/authService";
import { useToast } from "./ToastContext";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return localStorage.getItem("token")
      ? JSON.parse(localStorage.getItem("user"))
      : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const toast = useToast();
  const [user, setUser] = useState(readStoredUser);

  const persist = ({ token, user: info }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(info));
    setUser(info);
    return info;
  };

  const login = async (email, password) => {
    const { data } = await authService.login(email, password);
    return persist(data);
  };

  const register = async (payload) => {
    const { data } = await authService.register(payload);
    return persist(data);
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // Cập nhật một phần thông tin user (ví dụ sau khi sửa họ tên) để Header, trang Tài khoản... đổi theo
  const updateUser = useCallback((patch) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch {
        // bỏ qua nếu trình duyệt chặn localStorage
      }
      return next;
    });
  }, []);

  // api.js phát sự kiện này khi token hết hạn -> tự đăng xuất
  useEffect(() => {
    const onExpired = () => {
      logout();
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, [logout, toast]);

  const value = useMemo(
    () => ({
      user,
      isAdmin: Boolean(user?.roles?.includes("ROLE_ADMIN")),
      login,
      register,
      logout,
      updateUser,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
