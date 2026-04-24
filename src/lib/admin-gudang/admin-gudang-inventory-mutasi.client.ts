export type InventoryDetailPayload = {
  tipe_item: "Barang" | "Sparepart";
  id_barang?: string | null;
  id_sparepart?: string | null;
  jumlah: number;
};

export type BarangMasukPayload = {
  id_user: string;
  id_supplier: string;
  tanggal_mutasi: string;
  keterangan?: string | null;
  detail_items: InventoryDetailPayload[];
};

export type BarangKeluarPayload = {
  id_user: string;
  tanggal_mutasi: string;
  tujuan: string;
  keterangan?: string | null;
  detail_items: InventoryDetailPayload[];
};

const BARANG_MASUK_URL = "/api/admin-gudang/inventory/barang-masuk";
const BARANG_KELUAR_URL = "/api/admin-gudang/inventory/barang-keluar";

export async function createBarangMasuk(payload: BarangMasukPayload) {
  const response = await fetch(BARANG_MASUK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menyimpan barang masuk");
  }

  return result;
}

export async function createBarangKeluar(payload: BarangKeluarPayload) {
  const response = await fetch(BARANG_KELUAR_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menyimpan barang keluar");
  }

  return result;
}