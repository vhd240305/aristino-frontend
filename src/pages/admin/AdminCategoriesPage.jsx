import { useCallback, useEffect, useState } from "react";
import Field from "../../components/Field";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/adminService";
import { getErrorMessage, getFieldErrors } from "../../services/api";

const EMPTY = { id: null, name: "", slug: "" };

// Quản lý danh mục: thêm, sửa, xóa (không xóa được danh mục đang có sản phẩm)
export default function AdminCategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await adminService.getCategories();
      setCategories(data);
      setError("");
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const isEdit = form.id !== null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Vui lòng nhập tên danh mục" });
      return;
    }
    setErrors({});
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), slug: form.slug.trim() };
      if (isEdit) await adminService.updateCategory(form.id, payload);
      else await adminService.createCategory(payload);
      toast.success(isEdit ? "Đã cập nhật danh mục" : "Đã thêm danh mục");
      setForm(EMPTY);
      await load();
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(
        Object.keys(fieldErrors).length
          ? fieldErrors
          : { form: getErrorMessage(err) },
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await adminService.deleteCategory(id);
      toast.success("Đã xóa danh mục");
      setConfirmId(null);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
      setConfirmId(null);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-extrabold">Quản lý danh mục</h1>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-6 border border-line bg-white p-6"
      >
        <h2 className="text-sm font-extrabold uppercase tracking-wide">
          {isEdit ? "Sửa danh mục" : "Thêm danh mục"}
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Tên danh mục" error={errors.name}>
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={100}
            />
          </Field>
          <Field label="Đường dẫn (slug)" error={errors.slug}>
            <input
              className="input"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder={
                isEdit ? "Để trống để giữ nguyên" : "Để trống để tự tạo từ tên"
              }
              maxLength={120}
            />
          </Field>
        </div>
        {errors.form && (
          <p className="mt-4 text-sm text-danger">{errors.form}</p>
        )}
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm danh mục"}
          </button>
          {isEdit && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setForm(EMPTY);
                setErrors({});
              }}
            >
              Hủy sửa
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto border border-line bg-white">
        {error ? (
          <p className="p-6 text-sm text-danger">{error}</p>
        ) : categories === null ? (
          <div className="h-40 animate-pulse bg-white" />
        ) : categories.length === 0 ? (
          <p className="p-8 text-center text-sm text-ink-soft">
            Chưa có danh mục nào.
          </p>
        ) : (
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-mist text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-4 py-3">Tên danh mục</th>
                <th className="px-4 py-3">Đường dẫn</th>
                <th className="px-4 py-3 text-right">Sản phẩm</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-mist/60">
                  <td className="px-4 py-3 font-semibold">{c.name}</td>
                  <td className="px-4 py-3 text-ink-soft">{c.slug}</td>
                  <td className="px-4 py-3 text-right">{c.productCount}</td>
                  <td className="px-4 py-3 text-right">
                    {confirmId === c.id ? (
                      <span className="inline-flex items-center gap-4 text-xs">
                        <span className="text-ink-soft">Xóa danh mục này?</span>
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={busyId === c.id}
                          className="cursor-pointer font-semibold uppercase tracking-wide text-danger"
                        >
                          {busyId === c.id ? "Đang xóa..." : "Xác nhận"}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="cursor-pointer font-semibold uppercase tracking-wide"
                        >
                          Không
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-4 text-xs font-semibold uppercase tracking-wide">
                        <button
                          onClick={() => {
                            setForm({ id: c.id, name: c.name, slug: "" });
                            setErrors({});
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="cursor-pointer hover:text-accent"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => setConfirmId(c.id)}
                          className="cursor-pointer hover:text-accent"
                        >
                          Xóa
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        Danh mục đang có sản phẩm không xóa được: hãy chuyển sản phẩm sang danh
        mục khác trước. Tên danh mục trên menu cửa hàng sẽ cập nhật sau khi tải
        lại trang cửa hàng.
      </p>
    </div>
  );
}
