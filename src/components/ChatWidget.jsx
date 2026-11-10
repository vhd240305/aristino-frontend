import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { chatService } from "../services/chatService";

const STORAGE_KEY = "aristino_chat_session";
const WELCOME =
  "Xin chào! Mình là trợ lý AI của Aristino. Bạn cần tư vấn sản phẩm, chọn size hay hỏi về chính sách mua hàng? Bạn đừng nhập thông tin cá nhân (số điện thoại, địa chỉ) vào khung chat nhé.";
const ERROR_TEXT =
  "Xin lỗi, mình đang gặp sự cố. Bạn vui lòng thử lại sau ít phút.";
const SUGGESTIONS = [
  "Áo sơ mi nào đang bán?",
  "Tư vấn giúp mình chọn size",
  "Chính sách đổi trả thế nào?",
  "Phí vận chuyển và thanh toán",
];

const readToken = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};
const writeToken = (token) => {
  try {
    localStorage.setItem(STORAGE_KEY, token);
  } catch {
    // trình duyệt chặn localStorage: bỏ qua, chat vẫn dùng được nhưng không nhớ phiên
  }
};

// Hiển thị chữ thuần: bấm được liên kết /products/<slug>, in đậm **chữ**, giữ xuống dòng
function RichText({ text, onNavigate }) {
  const parts = text.split(/(\/products\/[a-z0-9-]+|\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^\/products\/[a-z0-9-]+$/.test(part)) {
          return (
            <Link
              key={i}
              to={part}
              onClick={onNavigate}
              className="font-semibold underline underline-offset-2"
            >
              Xem sản phẩm →
            </Link>
          );
        }
        if (/^\*\*[^*]+\*\*$/.test(part))
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// Khung chat nổi ở góc phải cửa hàng. Khách chưa đăng nhập vẫn dùng được.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]); // [{ role: "user" | "bot", text, mode? }]
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const tokenRef = useRef(readToken());
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Lần đầu mở: khôi phục lịch sử (nếu có), không thì hiện lời chào
  useEffect(() => {
    if (!open || loaded) return;
    let active = true;
    const token = tokenRef.current;
    const finish = (list) => {
      if (!active) return;
      setMessages(list.length > 0 ? list : [{ role: "bot", text: WELCOME }]);
      setLoaded(true);
    };
    if (!token) {
      finish([]);
    } else {
      chatService
        .history(token)
        .then((res) =>
          finish(
            res.data.map((m) => ({
              role: m.sender === "USER" ? "user" : "bot",
              text: m.content,
            })),
          ),
        )
        .catch(() => finish([]));
    }
    return () => {
      active = false;
    };
  }, [open, loaded]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const send = async (raw) => {
    const text = raw.trim();
    if (!text || sending) return;
    setInput("");
    setMessages((list) => [...list, { role: "user", text }]);
    setSending(true);
    try {
      const { data } = await chatService.send(tokenRef.current, text);
      if (data.sessionToken) {
        tokenRef.current = data.sessionToken;
        writeToken(data.sessionToken);
      }
      setMessages((list) => [
        ...list,
        { role: "bot", text: data.reply, mode: data.mode },
      ]);
    } catch {
      setMessages((list) => [...list, { role: "bot", text: ERROR_TEXT }]);
    } finally {
      setSending(false);
    }
  };

  const showSuggestions = messages.length <= 1 && !sending;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="Trợ lý tư vấn Aristino"
          className="fixed bottom-24 right-4 z-40 flex h-[32rem] max-h-[calc(100vh-8rem)] w-[calc(100vw-2rem)] flex-col overflow-hidden border border-line bg-white shadow-2xl sm:right-6 sm:w-96"
        >
          <div className="flex items-center justify-between bg-ink px-5 py-4 text-white">
            <div>
              <p className="text-sm font-extrabold uppercase tracking-wide">
                Trợ lý Aristino
              </p>
              <p className="text-[11px] text-white/70">
                Tư vấn sản phẩm · Trả lời tự động
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng khung chat"
              className="cursor-pointer p-1 text-xl leading-none hover:opacity-70"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-mist px-4 py-4 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap px-4 py-2.5 leading-relaxed ${
                    m.role === "user"
                      ? "bg-ink text-white"
                      : "border border-line bg-white text-ink"
                  }`}
                >
                  {m.role === "bot" ? (
                    <RichText text={m.text} onNavigate={() => setOpen(false)} />
                  ) : (
                    m.text
                  )}
                  {m.mode === "AI" && (
                    <p className="mt-2 text-[10px] uppercase tracking-wide text-ink-soft">
                      Trả lời bởi AI · có thể chưa chính xác
                    </p>
                  )}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div
                  className="flex gap-1 border border-line bg-white px-4 py-3"
                  aria-label="Trợ lý đang trả lời"
                >
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-soft [animation-delay:300ms]" />
                </div>
              </div>
            )}
            {showSuggestions && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="cursor-pointer border border-ink/30 bg-white px-3 py-1.5 text-xs hover:border-ink"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex gap-2 border-t border-line bg-white p-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={500}
              placeholder="Nhập câu hỏi của bạn..."
              aria-label="Nhập câu hỏi"
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="btn btn-primary !px-4"
            >
              Gửi
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng khung chat" : "Mở khung chat tư vấn"}
        className="fixed bottom-5 right-4 z-40 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-ink text-white shadow-xl transition-transform hover:scale-105 sm:right-6"
      >
        {open ? (
          <span className="text-2xl leading-none">×</span>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 21 12Z" />
          </svg>
        )}
      </button>
    </>
  );
}
