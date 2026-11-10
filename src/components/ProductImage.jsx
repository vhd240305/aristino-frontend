import { useState } from "react";

// Hiển thị ảnh sản phẩm; nếu thiếu ảnh hoặc ảnh lỗi thì hiện khung xám thay thế
export default function ProductImage({ src, alt, className = "" }) {
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div role="img" aria-label={alt} className={`flex items-center justify-center bg-mist ${className}`}>
        <span className="text-5xl font-extrabold tracking-widest text-ink/10">A</span>
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} className={className} />;
}
