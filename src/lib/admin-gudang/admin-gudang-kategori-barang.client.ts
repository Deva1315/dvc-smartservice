export type KategoriBarang = {
  id: string;
  nama_kategori: string;
  deskripsi: string | null;
  _count?: {
    barang: number;
  };
};

export type KategoriBarangPayload = {
  nama_kategori: string;
  deskripsi?: string | null;
};

const BASE_URL = "/api/admin-gudang/kategori-barang";

export async function getKategoriBarang(search = "") {
  const params = new URLSearchParams();

  if (search) {
    params.set("search", search);
  }

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data kategori barang");
  }

  return result;
}

export async function createKategoriBarang(payload: KategoriBarangPayload) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan kategori barang");
  }

  return result;
}

export async function updateKategoriBarang(
  id: string,
  payload: KategoriBarangPayload
) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui kategori barang");
  }

  return result;
}

export async function deleteKategoriBarang(id: string) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus kategori barang");
  }

  return result;
}