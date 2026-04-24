export type InventoryMutasiApiItem = {
  id: string;
  id_user: string;
  id_supplier: string | null;
  jenis_mutasi: string;
  tanggal_mutasi: string;
  keterangan: string | null;
  suppliers?: {
    id: string;
    nama_supplier: string;
    alamat: string | null;
    phone: string | null;
  } | null;
  users?: {
    id: string;
    nama: string;
    email: string;
  };
  detail_stock_mutasi: {
    id: string;
    id_stock_mutasi: string;
    id_barang: string | null;
    id_sparepart: string | null;
    jumlah: string;
    barang?: {
      id: string;
      nama_barang: string;
      kode_barang: string;
    } | null;
    sparepart?: {
      id: string;
      nama_sparepart: string;
      kode_sparepart: string;
    } | null;
  }[];
};

const INVENTORY_MUTASI_URL = "/api/admin-gudang/inventory";

export async function getInventoryMutasi() {
  const response = await fetch(INVENTORY_MUTASI_URL, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data inventory");
  }

  return result;
}