export type SparepartApiItem = {
  id: string;
  id_supplier: string;
  nama_sparepart: string;
  kode_sparepart: string;
  merk_sparepart: string | null;
  deskripsi: string | null;
  harga: string;
  stock: string;
  gambar: string | null;
  suppliers?: {
    id: string;
    nama_supplier: string;
    alamat: string | null;
    phone: string | null;
  };
};

export type SparepartPayload = {
  id_supplier: string;
  nama_sparepart: string;
  kode_sparepart: string;
  merk_sparepart?: string | null;
  deskripsi?: string | null;
  harga: number | string;
  stock: number | string;
  gambar?: string | null;
};

const BASE_URL = "/api/admin-gudang/sparepart";

export async function getSparepart() {
  const response = await fetch(BASE_URL, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data sparepart");
  }

  return result;
}

export async function createSparepart(payload: SparepartPayload) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan sparepart");
  }

  return result;
}

export async function updateSparepart(id: string, payload: SparepartPayload) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui sparepart");
  }

  return result;
}

export async function deleteSparepart(id: string) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus sparepart");
  }

  return result;
}