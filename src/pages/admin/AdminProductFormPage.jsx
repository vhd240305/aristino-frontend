import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Field from "../../components/Field";
import ProductImage from "../../components/ProductImage";
import { useToast } from "../../context/ToastContext";
import { adminService } from "../../services/adminService";
import { getErrorMessage, getFieldErrors } from "../../services/api";

const MAX_IMAGE_MB = 5;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const emptyVariant = (price = "") => ({
  id: null,
  size: "",
  color: "",
  sku: "",
  price,
  stockQuantity: 0,
});

function Section({ title, hint, children }) {
  return (
    <section className="border border-line bg-white p-6">
      <h2 className="text-sm font-extrabold uppercase tracking-wide">
        {title}
      </h2>
      {hint && <p className="mt-1 text-xs text-ink-soft">{hint}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

// Form thêm / sửa sản phẩm: thông tin chung, ảnh, biến thể (size, màu, SKU, giá, tồn kho)
export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const fileRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    categoryId: "",
    name: "",
    description: "",
    material: "",
    basePrice: "",
    status: "ACTIVE",
  });
  const [images, setImages] = useState([]); // [{ url, thumbnail }]
  const [variants, setVariants] = useState([emptyVariant()]);
  const [loading, setLoading] = useState(isEdit);
  const [loadError, setLoadError] = useState("");
  const [errors, setErrors] = useState({});
  const [variantErrors, setVariantErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  useEffect(() => {
    let active = true;
    const requests = [adminService.getCategories()];
    if (isEdit) requests.push(adminService.getProduct(id));
    Promise.all(requests)
      .then(([cats, product]) => {
        if (!active) return;
        setCategories(cats.data);
        if (product) {
          const p = product.data;
          setForm({
            categoryId: String(p.categoryId),
            name: p.name,
            description: p.description || "",
            material: p.material || "",
            basePrice: String(p.basePrice),
            status: p.status === "HIDDEN" ? "HIDDEN" : "ACTIVE",
          });
          setImages(
            p.images.map((i) => ({ url: i.url, thumbnail: i.thumbnail })),
          );
          setVariants(
            p.variants.map((v) => ({
              id: v.id,
              size: v.size || "",
              color: v.color || "",
              sku: v.sku,
              price: String(v.price),
              stockQuantity: v.stockQuantity,
            })),
          );
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(getErrorMessage(err, "Không tải được dữ liệu"));
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, isEdit]);

  const setField = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // ===== Ảnh =====
  const addImage = (url) =>
    setImages((list) => [...list, { url, thumbnail: list.length === 0 }]);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (files.length === 0) return;
    setUploading(true);
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        toast.error(`"${file.name}": chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF`);
        continue;
      }
      if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
        toast.error(`"${file.name}" vượt quá ${MAX_IMAGE_MB}MB`);
        continue;
      }
      try {
        const { data } = await adminService.uploadImage(file);
        addImage(data.url);
      } catch (err) {
        toast.error(getErrorMessage(err));
      }
    }
    setUploading(false);
  };

  const handleAddUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) {
      toast.error("Đường dẫn ảnh phải bắt đầu bằng http:// hoặc https://");
      return;
    }
    addImage(url);
    setUrlInput("");
  };

  const setThumbnail = (index) =>
    setImages((list) =>
      list.map((img, i) => ({ ...img, thumbnail: i === index })),
    );

  const removeImage = (index) =>
    setImages((list) => {
      const next = list.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((img) => img.thumbnail))
        next[0] = { ...next[0], thumbnail: true };
      return next;
    });

  const moveImage = (index, delta) =>
    setImages((list) => {
      const target = index + delta;
      if (target < 0 || target >= list.length) return list;
      const next = [...list];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });

  // ===== Biến thể =====
  const updateVariant = (index, key, value) =>
    setVariants((list) =>
      list.map((v, i) => (i === index ? { ...v, [key]: value } : v)),
    );
  const addVariant = () =>
    setVariants((list) => [...list, emptyVariant(form.basePrice)]);
  const removeVariant = (index) =>
    setVariants((list) =>
      list.length > 1 ? list.filter((_, i) => i !== index) : list,
    );

  // ===== Kiểm tra và lưu =====
  const validate = () => {
    const e = {};
    const ve = {};
    if (!form.categoryId) e.categoryId = "Vui lòng chọn danh mục";
    if (!form.name.trim()) e.name = "Vui lòng nhập tên sản phẩm";
    if (
      form.basePrice === "" ||
      Number.isNaN(Number(form.basePrice)) ||
      Number(form.basePrice) < 0
    )
      e.basePrice = "Vui lòng nhập giá hợp lệ";

    const skus = new Set();
    const pairs = new Set();
    variants.forEach((v, i) => {
      const sku = v.sku.trim().toLowerCase();
      const pair = `${v.size.trim().toLowerCase()}|${v.color.trim().toLowerCase()}`;
      if (!v.size.trim() || !v.color.trim()) ve[i] = "Nhập đủ size và màu";
      else if (!sku) ve[i] = "Nhập mã SKU";
      else if (
        v.price === "" ||
        Number.isNaN(Number(v.price)) ||
        Number(v.price) < 0
      )
        ve[i] = "Giá không hợp lệ";
      else if (
        v.stockQuantity === "" ||
        !Number.isInteger(Number(v.stockQuantity)) ||
        Number(v.stockQuantity) < 0
      )
        ve[i] = "Tồn kho phải là số nguyên không âm";
      else if (skus.has(sku)) ve[i] = "SKU bị trùng với biến thể khác";
      else if (pairs.has(pair)) ve[i] = "Trùng size và màu với biến thể khác";
      skus.add(sku);
      pairs.add(pair);
    });
    setErrors(e);
    setVariantErrors(ve);
    return Object.keys(e).length === 0 && Object.keys(ve).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setFormError("");
    if (!validate()) {
      setFormError("Vui lòng kiểm tra lại các ô báo lỗi bên dưới.");
      return;
    }
    const payload = {
      categoryId: Number(form.categoryId),
      name: form.name.trim(),
      description: form.description,
      material: form.material,
      basePrice: Number(form.basePrice),
      status: form.status,
      images: images.map((img) => ({ url: img.url, thumbnail: img.thumbnail })),
      variants: variants.map((v) => ({
        id: v.id,
        size: v.size.trim(),
        color: v.color.trim(),
        sku: v.sku.trim(),
        price: Number(v.price),
        stockQuantity: Number(v.stockQuantity),
      })),
    };

    setSaving(true);
    try {
      if (isEdit) await adminService.updateProduct(id, payload);
      else await adminService.createProduct(payload);
      toast.success(isEdit ? "Đã cập nhật sản phẩm" : "Đã thêm sản phẩm");
      navigate("/admin/products");
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      const keys = Object.keys(fieldErrors);
      if (keys.length === 0) {
        setFormError(getErrorMessage(err));
      } else {
        const top = {};
        const rows = {};
        const others = [];
        keys.forEach((key) => {
          const match = key.match(/^variants\[(\d+)\]\./);
          if (match) rows[match[1]] = fieldErrors[key];
          else if (["categoryId", "name", "basePrice"].includes(key))
            top[key] = fieldErrors[key];
          else others.push(fieldErrors[key]);
        });
        setErrors(top);
        setVariantErrors(rows);
        setFormError(
          others.join(". ") || "Vui lòng kiểm tra lại các ô báo lỗi bên dưới.",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 animate-pulse bg-white" />;
  if (loadError) {
    return (
      <div>
        <p className="text-sm text-danger">{loadError}</p>
        <Link to="/admin/products" className="btn btn-primary mt-6">
          Về danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="max-w-5xl space-y-6">
      <div>
        <Link
          to="/admin/products"
          className="text-xs font-semibold uppercase tracking-wide hover:text-accent"
        >
          ← Danh sách sản phẩm
        </Link>
        <h1 className="mt-3 text-2xl font-extrabold">
          {isEdit ? "Sửa sản phẩm" : "Thêm sản phẩm"}
        </h1>
      </div>

      <Section title="Thông tin chung">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Tên sản phẩm" error={errors.name}>
              <input
                className="input"
                value={form.name}
                onChange={setField("name")}
                maxLength={200}
              />
            </Field>
          </div>
          <Field label="Danh mục" error={errors.categoryId}>
            <select
              className="input"
              value={form.categoryId}
              onChange={setField("categoryId")}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Chất liệu">
            <input
              className="input"
              value={form.material}
              onChange={setField("material")}
              maxLength={150}
            />
          </Field>
          <Field label="Giá niêm yết (đ)" error={errors.basePrice}>
            <input
              className="input"
              type="number"
              min="0"
              step="1000"
              value={form.basePrice}
              onChange={setField("basePrice")}
            />
          </Field>
          <Field label="Trạng thái">
            <select
              className="input"
              value={form.status}
              onChange={setField("status")}
            >
              <option value="ACTIVE">Đang bán (hiện trên cửa hàng)</option>
              <option value="HIDDEN">Ẩn khỏi cửa hàng</option>
            </select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Mô tả">
              <textarea
                className="input"
                rows={5}
                value={form.description}
                onChange={setField("description")}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="Hình ảnh"
        hint={`Ảnh JPG, PNG, WEBP hoặc GIF, tối đa ${MAX_IMAGE_MB}MB mỗi ảnh. Ảnh có dấu chọn "Ảnh đại diện" sẽ hiện ở danh sách sản phẩm.`}
      >
        {images.length === 0 ? (
          <p className="text-sm text-ink-soft">Chưa có ảnh nào.</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, i) => (
              <li
                key={`${img.url}-${i}`}
                className="flex gap-3 border border-line p-3"
              >
                <ProductImage
                  src={img.url}
                  alt={`Ảnh ${i + 1}`}
                  className="h-28 w-24 shrink-0 object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col justify-between text-xs">
                  <label className="flex cursor-pointer items-center gap-2 font-semibold">
                    <input
                      type="radio"
                      name="thumbnail"
                      checked={img.thumbnail}
                      onChange={() => setThumbnail(i)}
                      className="accent-ink"
                    />
                    Ảnh đại diện
                  </label>
                  <p className="truncate text-ink-soft" title={img.url}>
                    {img.url}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 font-semibold uppercase tracking-wide">
                    <button
                      type="button"
                      onClick={() => moveImage(i, -1)}
                      disabled={i === 0}
                      className="cursor-pointer disabled:opacity-30"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={() => moveImage(i, 1)}
                      disabled={i === images.length - 1}
                      className="cursor-pointer disabled:opacity-30"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="cursor-pointer text-danger"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            multiple
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="btn btn-outline"
          >
            {uploading ? "Đang tải ảnh lên..." : "Tải ảnh từ máy"}
          </button>
          <span className="text-xs text-ink-soft">hoặc dán đường dẫn ảnh:</span>
          <input
            className="input !w-72"
            placeholder="https://..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="btn btn-outline"
          >
            Thêm
          </button>
        </div>
      </Section>

      <Section
        title="Biến thể (size, màu) và tồn kho"
        hint={
          isEdit
            ? "Biến thể đã có đơn hàng không xóa được: hãy đặt tồn kho bằng 0 để ngừng bán. Giá của biến thể là giá khách thực trả."
            : "Mỗi dòng là một biến thể (một cặp size + màu). Giá của biến thể là giá khách thực trả."
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="pb-2 pr-3 font-semibold">Size</th>
                <th className="pb-2 pr-3 font-semibold">Màu</th>
                <th className="pb-2 pr-3 font-semibold">Mã SKU</th>
                <th className="pb-2 pr-3 font-semibold">Giá (đ)</th>
                <th className="pb-2 pr-3 font-semibold">Tồn kho</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v, i) => (
                <tr key={v.id ?? `new-${i}`} className="align-top">
                  <td className="pb-3 pr-3">
                    <input
                      className="input !py-2"
                      value={v.size}
                      onChange={(e) => updateVariant(i, "size", e.target.value)}
                      maxLength={10}
                      aria-label="Size"
                    />
                    {variantErrors[i] && (
                      <p className="mt-1 text-xs text-danger">
                        {variantErrors[i]}
                      </p>
                    )}
                  </td>
                  <td className="pb-3 pr-3">
                    <input
                      className="input !py-2"
                      value={v.color}
                      onChange={(e) =>
                        updateVariant(i, "color", e.target.value)
                      }
                      maxLength={50}
                      aria-label="Màu"
                    />
                  </td>
                  <td className="pb-3 pr-3">
                    <input
                      className="input !py-2"
                      value={v.sku}
                      onChange={(e) => updateVariant(i, "sku", e.target.value)}
                      maxLength={50}
                      aria-label="SKU"
                    />
                  </td>
                  <td className="pb-3 pr-3">
                    <input
                      className="input !py-2"
                      type="number"
                      min="0"
                      step="1000"
                      value={v.price}
                      onChange={(e) =>
                        updateVariant(i, "price", e.target.value)
                      }
                      aria-label="Giá"
                    />
                  </td>
                  <td className="pb-3 pr-3">
                    <input
                      className="input !py-2 !w-24"
                      type="number"
                      min="0"
                      step="1"
                      value={v.stockQuantity}
                      onChange={(e) =>
                        updateVariant(i, "stockQuantity", e.target.value)
                      }
                      aria-label="Tồn kho"
                    />
                  </td>
                  <td className="pb-3 text-right">
                    <button
                      type="button"
                      onClick={() => removeVariant(i)}
                      disabled={variants.length === 1}
                      className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-danger disabled:opacity-30"
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="btn btn-outline mt-2"
        >
          + Thêm biến thể
        </button>
      </Section>

      {formError && (
        <p className="border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {formError}
        </p>
      )}

      <div className="flex flex-wrap gap-3 pb-10">
        <button
          type="submit"
          disabled={saving || uploading}
          className="btn btn-primary"
        >
          {saving ? "Đang lưu..." : isEdit ? "Lưu thay đổi" : "Thêm sản phẩm"}
        </button>
        <Link to="/admin/products" className="btn btn-outline">
          Hủy
        </Link>
      </div>
    </form>
  );
}
