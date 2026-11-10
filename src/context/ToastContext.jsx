import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, message, action) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((list) => [...list.slice(-3), { id, type, message, action }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove]
  );

  // toast.success("..."), toast.error("..."), toast.success("...", { label, to })
  const api = useMemo(
    () => ({
      success: (message, action) => push("success", message, action),
      error: (message) => push("error", message),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-3 p-4 sm:items-end sm:p-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 border-l-4 bg-ink px-4 py-3.5 text-sm text-white shadow-xl ${
              t.type === "error" ? "border-danger" : "border-accent"
            }`}
          >
            {t.type === "error" ? (
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-300" />
            ) : (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-white" />
            )}
            <div className="flex-1">
              <p className="leading-relaxed">{t.message}</p>
              {t.action && (
                <Link
                  to={t.action.to}
                  onClick={() => remove(t.id)}
                  className="mt-1.5 inline-block text-[11px] font-medium uppercase tracking-[0.18em] text-white underline underline-offset-4 hover:text-white/80"
                >
                  {t.action.label}
                </Link>
              )}
            </div>
            <button onClick={() => remove(t.id)} aria-label="Đóng thông báo" className="cursor-pointer text-white/50 hover:text-white">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
