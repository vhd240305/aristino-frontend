import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package } from "lucide-react";
import AddressBook from "../components/AddressBook";
import PasswordForm from "../components/PasswordForm";
import ProfileForm from "../components/ProfileForm";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { userService } from "../services/userService";
import { getErrorMessage } from "../services/api";

const TABS = [
  { key: "profile", label: "Thông tin cá nhân" },
  { key: "addresses", label: "Sổ địa chỉ" },
  { key: "password", label: "Đổi mật khẩu" },
];

export default function AccountPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState("profile");
  const [profile, setProfile] = useState(null);

  // Lấy thông tin đầy đủ (có số điện thoại) từ server, vì thông tin lưu lúc đăng nhập không có số điện thoại
  useEffect(() => {
    userService
      .getMe()
      .then((res) => setProfile(res.data))
      .catch((err) => toast.error(getErrorMessage(err)));
  }, [toast]);

  return (
    <div className="page-container max-w-4xl py-10 sm:py-12">
      <h1 className="section-title">Tài khoản của tôi</h1>
      <p className="mt-6 text-center text-sm text-ink-soft">
        Xin chào, <span className="font-bold text-ink">{user.fullName}</span>
      </p>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4 border-b border-line">
        <div role="tablist" className="flex flex-wrap gap-x-8">
          {TABS.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px cursor-pointer border-b-2 pb-3 text-xs font-extrabold uppercase tracking-wide transition-colors ${
                tab === t.key
                  ? "border-ink text-ink"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Link
          to="/orders"
          className="mb-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide hover:text-accent"
        >
          <Package size={14} /> Đơn hàng của tôi
        </Link>
      </div>

      <div className="mt-8" role="tabpanel">
        {tab === "profile" &&
          (profile ? (
            <ProfileForm profile={profile} onSaved={setProfile} />
          ) : (
            <div className="h-48 max-w-xl animate-pulse bg-mist" />
          ))}
        {tab === "addresses" && <AddressBook defaultName={user.fullName} />}
        {tab === "password" && <PasswordForm />}
      </div>
    </div>
  );
}
