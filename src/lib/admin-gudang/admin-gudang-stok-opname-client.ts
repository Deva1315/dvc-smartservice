export type StokOpnameApiItem = {
  id: string;
  id_user: string;
  tanggal_opname: string;
  selisih_stock: string;
  keterangan: string | null;
  users?: {
    id: string;
    nama: string;
    email: string;
  };
  detail_stock_opname: {
    id: string;
    id_stock_opname: string;
    id_barang: string | null;
    id_sparepart: string | null;
    stock_fisik: string;
    stock_sistem: string;
    selisih: string;
    keterangan: string | null;
    barang?: {
      id: string;
      nama_barang: string;
      kode_barang: string;
      stock: string;
    } | null;
    sparepart?: {
      id: string;
      nama_sparepart: string;
      kode_sparepart: string;
      stock: string;
    } | null;
  }[];
};

export type StokOpnameDetailPayload = {
  tipe_item: "Barang" | "Sparepart";
  id_barang?: string | null;
  id_sparepart?: string | null;
  stock_fisik: number;
  keterangan?: string | null;
};

export type StokOpnamePayload = {
  id_user: string;
  tanggal_opname: string;
  keterangan?: string | null;
  detail_items: StokOpnameDetailPayload[];
};

const STOK_OPNAME_URL = "/api/admin-gudang/inventory/stok-opname";

export async function getStokOpname() {
  const response = await fetch(STOK_OPNAME_URL, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data stok opname");
  }

  return result;
}

export async function createStokOpname(payload: StokOpnamePayload) {
  const response = await fetch(STOK_OPNAME_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menyimpan stok opname");
  }

  return result;
}