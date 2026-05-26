export type BarangApiItem = {
  id: string;
  id_kategori: string;
  id_supplier: string;
  nama_barang: string;
  kode_barang: string;
  merk_barang: string | null;
  deskripsi: string | null;
  harga: string;
  stock: string;
  gambar: string | null;
  kategori_barang?: {
    id: string;
    nama_kategori: string;
    deskripsi: string | null;
  };
  suppliers?: {
    id: string;
    nama_supplier: string;
    alamat: string | null;
    phone: string | null;
  };
};

export type BarangPayload = {
  id_kategori: string;
  id_supplier: string;
  nama_barang: string;
  kode_barang: string;
  merk_barang?: string | null;
  deskripsi?: string | null;
  harga: number | string;
  stock: number | string;
  gambar?: string | null;
};

const BASE_URL = "/api/admin-gudang/barang";

export async function getBarang() {
  const response = await fetch(BASE_URL, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data barang");
  }

  return result;
}

export async function createBarang(payload: BarangPayload) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan barang");
  }

  return result;
}

export async function updateBarang(id: string, payload: BarangPayload) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui barang");
  }

  return result;
}

export async function deleteBarang(id: string) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus barang");
  }

  return result;
}
