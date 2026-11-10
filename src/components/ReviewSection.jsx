import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { StarInput, Stars } from "./StarRating";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { reviewService } from "../services/reviewService";
import { getErrorMessage, getFieldErrors } from "../services/api";
import { formatDate } from "../lib/format";

const PAGE_SIZE = 5;
const RATING_LABELS = ["", "Rất tệ", "Tệ", "Bình thường", "Tốt", "Tuyệt vời"];

// Khu vực đánh giá ở trang chi tiết sản phẩm: tổng hợp sao, form viết đánh giá, danh sách đánh giá
export default function ReviewSection({ productId, slug }) {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();

  const [summary, setSummary] = useState(null); // { averageRating, totalReviews, distribution }
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");

  const [eligibility, setEligibility] = useState(null); // { canReview, reason }
  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Tải trang đầu (cũng dùng để làm mới sau khi vừa gửi đánh giá)
  const loadFirstPage = useCallback(async () => {
    try {
      const { data } = await reviewService.getForProduct(slug, 0, PAGE_SIZE);
      setSummary({
        averageRating: data.averageRating,
        totalReviews: data.totalReviews,
        distribution: data.distribution,
      });
      setItems(data.reviews.content);
      setPage(0);
      setHasMore(!data.reviews.last);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err, "Không tải được đánh giá"));
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // Khách đã đăng nhập: kiểm tra có được đánh giá không
  useEffect(() => {
    if (!user) {
      setEligibility(null);
      return undefined;
    }
    let active = true;
    reviewService
      .getEligibility(productId)
      .then((res) => active && setEligibility(res.data))
      .catch(() => active && setEligibility(null));
    return () => {
      active = false;
    };
  }, [user, productId]);

  // Đi từ trang đơn hàng sang bằng liên kết "#reviews": cuộn tới khu vực này khi đã tải xong
  useEffect(() => {
    if (!loading && location.hash === "#reviews") {
      document
        .getElementById("reviews")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, location.hash]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const { data } = await reviewService.getForProduct(
        slug,
        page + 1,
        PAGE_SIZE,
      );
      setItems((list) => [...list, ...data.reviews.content]);
      setPage((p) => p + 1);
      setHasMore(!data.reviews.last);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating < 1) {
      setFormError("Vui lòng chọn số sao đánh giá");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await reviewService.create({
        productId,
        rating: form.rating,
        comment: form.comment.trim(),
      });
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm");
      setForm({ rating: 0, comment: "" });
      setEligibility({ canReview: false, reason: "ALREADY_REVIEWED" });
      await loadFirstPage();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setFormError(Object.values(fieldErrors)[0] || getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const total = summary?.totalReviews || 0;

  return (
    <section
      id="reviews"
      className="mt-14 scroll-mt-24 border-t border-line pt-10"
    >
      <h2 className="text-sm font-extrabold uppercase tracking-wide">
        Đánh giá sản phẩm
      </h2>

      {loading ? (
        <div className="mt-6 h-32 max-w-3xl animate-pulse bg-mist" />
      ) : error ? (
        <p className="mt-6 text-sm text-danger">{error}</p>
      ) : (
        <div className="mt-6 grid gap-10 lg:grid-cols-12">
          {/* Tổng hợp + viết đánh giá */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold leading-none">
                  {total > 0 ? summary.averageRating.toFixed(1) : "—"}
                </p>
                <div className="mt-2">
                  <Stars value={summary.averageRating} size={18} />
                </div>
                <p className="mt-1 text-xs text-ink-soft">{total} đánh giá</p>
              </div>
              <ul className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = summary.distribution[stars] || 0;
                  return (
                    <li key={stars} className="flex items-center gap-2 text-xs">
                      <span className="w-8 shrink-0 text-ink-soft">
                        {stars} sao
                      </span>
                      <span className="h-2 flex-1 bg-mist">
                        <span
                          className="block h-full bg-amber-500"
                          style={{
                            width:
                              total > 0 ? `${(count / total) * 100}%` : "0%",
                          }}
                        />
                      </span>
                      <span className="w-6 shrink-0 text-right text-ink-soft">
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-8 border-t border-line pt-6">
              {!user ? (
                <p className="text-sm text-ink-soft">
                  <Link
                    to="/login"
                    state={{ from: location }}
                    className="font-semibold text-ink underline underline-offset-4"
                  >
                    Đăng nhập
                  </Link>{" "}
                  để đánh giá sản phẩm bạn đã mua.
                </p>
              ) : eligibility === null ? (
                <div className="h-10 animate-pulse bg-mist" />
              ) : eligibility.reason === "ALREADY_REVIEWED" ? (
                <p className="text-sm text-ink-soft">
                  Bạn đã đánh giá sản phẩm này. Cảm ơn bạn!
                </p>
              ) : eligibility.reason === "NOT_PURCHASED" ? (
                <p className="text-sm text-ink-soft">
                  Chỉ khách hàng đã mua và nhận sản phẩm này mới có thể viết
                  đánh giá.
                </p>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <p className="text-sm font-semibold">Đánh giá của bạn</p>
                  <div className="mt-2 flex items-center gap-3">
                    <StarInput
                      value={form.rating}
                      onChange={(rating) => setForm((f) => ({ ...f, rating }))}
                    />
                    <span className="text-sm text-ink-soft">
                      {RATING_LABELS[form.rating]}
                    </span>
                  </div>
                  <textarea
                    value={form.comment}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, comment: e.target.value }))
                    }
                    maxLength={1000}
                    rows={4}
                    placeholder="Chia sẻ cảm nhận về chất liệu, form dáng, size... (không bắt buộc)"
                    className="input mt-4 w-full"
                  />
                  {formError && (
                    <p className="mt-2 text-sm text-danger">{formError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary mt-4"
                  >
                    {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                  </button>
                  <p className="mt-2 text-xs text-ink-soft">
                    Mỗi sản phẩm chỉ đánh giá được một lần và không thể sửa sau
                    khi gửi.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Danh sách */}
          <div className="lg:col-span-7">
            {items.length === 0 ? (
              <p className="text-sm text-ink-soft">
                Sản phẩm này chưa có đánh giá nào.
              </p>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((r) => (
                  <li key={r.id} className="py-5 first:pt-0">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <Stars value={r.rating} size={14} />
                      <span className="text-sm font-semibold">
                        {r.reviewerName || "Khách hàng"}
                      </span>
                      <span className="bg-mist px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-soft">
                        Đã mua hàng
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-ink-soft">
                      {formatDate(r.createdAt)}
                    </p>
                    {r.comment && (
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink/80">
                        {r.comment}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="btn btn-outline mt-4"
              >
                {loadingMore ? "Đang tải..." : "Xem thêm đánh giá"}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
