export type JasaServisApiItem = {
  id: string;
  nama_jasa_servis: string;
  deskripsi: string | null;
  harga: string;
  jam_operasional: string;
  slug?: string;
  _count?: {
    detail_tiket_servis: number;
  };
};

export type JasaServisPayload = {
  nama_jasa_servis: string;
  deskripsi?: string | null;
  harga: number | string;
  jam_operasional: string;
};

const BASE_URL = "/api/admin-penjualan/jasa-servis";

export async function getJasaServis() {
  const response = await fetch(BASE_URL, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data jasa servis");
  }

  return result;
}

export async function createJasaServis(payload: JasaServisPayload) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menambahkan jasa servis");
  }

  return result;
}

export async function updateJasaServis(id: string, payload: JasaServisPayload) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui jasa servis");
  }

  return result;
}

export async function deleteJasaServis(id: string) {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus jasa servis");
  }

  return result;
}