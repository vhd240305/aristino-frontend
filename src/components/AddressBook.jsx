import { useCallback, useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import AddressForm from "./AddressForm";
import { useToast } from "../context/ToastContext";
import { addressService } from "../services/addressService";
import { getErrorMessage } from "../services/api";

const linkBtn =
  "cursor-pointer text-xs font-semibold uppercase tracking-wide hover:text-accent disabled:cursor-not-allowed disabled:opacity-40";

// Sổ địa chỉ: xem, thêm, sửa, xóa, đặt mặc định
export default function AddressBook({ defaultName }) {
  const toast = useToast();
  const [addresses, setAddresses] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Tải lại danh sách từ server (server tự xếp địa chỉ mặc định lên đầu)
  const load = useCallback(async () => {
    try {
      const { data } = await addressService.getMine();
      setAddresses(data);
    } catch (err) {
      setAddresses((current) => current ?? []);
      toast.error(getErrorMessage(err));
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdded = async () => {
    setShowForm(false);
    await load();
    toast.success("Đã thêm địa chỉ mới");
  };

  const handleEdited = async () => {
    setEditingId(null);
    await load();
    toast.success("Đã cập nhật địa chỉ");
  };

  const handleSetDefault = async (id) => {
    setBusyId(id);
    try {
      await addressService.setDefault(id);
      await load();
      toast.success("Đã đặt làm địa chỉ mặc định");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await addressService.remove(id);
      setConfirmDeleteId(null);
      await load();
      toast.success("Đã xóa địa chỉ");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between gap-4 border-b border-ink pb-3">
        <h2 className="text-sm font-extrabold uppercase tracking-wide">
          Sổ địa chỉ
        </h2>
        {!showForm && (
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
            }}
            className={`inline-flex items-center gap-2 ${linkBtn}`}
          >
            <Plus size={14} /> Thêm địa chỉ
          </button>
        )}
      </div>

      {showForm && (
        <div className="mt-6">
          <AddressForm
            defaultName={defaultName}
            onSaved={handleAdded}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {addresses === null ? (
          <div className="h-28 animate-pulse bg-mist" />
        ) : addresses.length === 0 && !showForm ? (
          <p className="text-sm text-ink-soft sm:col-span-2">
            Bạn chưa lưu địa chỉ nào.
          </p>
        ) : (
          addresses.map((a) =>
            editingId === a.id ? (
              <div key={a.id} className="sm:col-span-2">
                <AddressForm
                  address={a}
                  onSaved={handleEdited}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <div
                key={a.id}
                className="flex flex-col justify-between border border-line p-5 text-sm leading-relaxed"
              >
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    <MapPin size={15} /> {a.recipientName}
                    {a.isDefault && (
                      <span className="bg-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                        Mặc định
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-ink-soft">{a.phone}</p>
                  <p className="text-ink-soft">
                    {[a.detailAddress, a.ward, a.district, a.province]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
                  {confirmDeleteId === a.id ? (
                    <>
                      <span className="text-xs text-ink-soft">
                        Xóa địa chỉ này?
                      </span>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={busyId === a.id}
                        className={`${linkBtn} text-danger`}
                      >
                        {busyId === a.id ? "Đang xóa..." : "Xác nhận xóa"}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className={linkBtn}
                      >
                        Không
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(a.id);
                          setShowForm(false);
                          setConfirmDeleteId(null);
                        }}
                        className={linkBtn}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(a.id)}
                        className={linkBtn}
                      >
                        Xóa
                      </button>
                      {!a.isDefault && (
                        <button
                          onClick={() => handleSetDefault(a.id)}
                          disabled={busyId === a.id}
                          className={linkBtn}
                        >
                          Đặt mặc định
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ),
          )
        )}
      </div>
    </section>
  );
}
