export type StatusGaransiApi = "Aktif" | "Expired" | "Diklaim";
export type StatusGaransiUi = "Aktif" | "Habis" | "Diklaim";

export type AdminPenjualanGaransiApiItem = {
  id: string;
  id_tiket_servis: string;
  id_user: string;
  nomor_tiket: string;
  nama_pelanggan: string;
  no_hp: string;
  perangkat: string;
  tanggal_servis: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  tanggal_klaim: string | null;
  periode_hari: number;
  keterangan_garansi: string | null;
  status_garansi: StatusGaransiApi;
  status_display: StatusGaransiUi;
  total_pembayaran: string | number;
  admin: {
    id: string;
    nama: string;
    email: string;
  };
};

export type GaransiTiketOptionApiItem = {
  value: string;
  label: string;
  id_tiket_servis: string;
  nomor_tiket: string;
  nama_pelanggan: string;
  namaPelanggan: string;
  no_hp: string;
  perangkat: string;
  tanggal_servis: string;
  tanggalServis: string;
  total_pembayaran: string | number;
  metode_pembayaran: string | null;
};

export type CreateGaransiServisPayload = {
  nomor_tiket: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  keterangan_garansi?: string | null;
};

const BASE_URL = "/api/admin-penjualan/garansi-servis";

export async function getAdminPenjualanGaransiServis(params?: {
  search?: string;
  status?: StatusGaransiApi | null;
  page?: number;
  limit?: number;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.status) searchParams.set("status", params.status);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const url = searchParams.toString()
    ? `${BASE_URL}?${searchParams.toString()}`
    : BASE_URL;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data garansi servis");
  }

  return result;
}

export async function getGaransiServisTiketOptions() {
  const response = await fetch(`${BASE_URL}/tiket-options`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil opsi tiket garansi");
  }

  return result;
}

export async function createAdminPenjualanGaransiServis(
  payload: CreateGaransiServisPayload
) {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal membuat garansi servis");
  }

  return result;
}

export async function getDetailAdminPenjualanGaransiServis(id: string) {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail garansi servis");
  }

  return result;
}

export async function updateAdminPenjualanGaransiServis(
  id: string,
  payload: {
    tanggal_mulai?: string;
    tanggal_akhir?: string;
    status_garansi?: StatusGaransiApi;
    keterangan_garansi?: string | null;
  }
) {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui garansi servis");
  }

  return result;
}

export type KlaimGaransiApiData = {
  id: string;
  nomor_tiket: string;
  nama_pelanggan: string;
  no_hp: string;
  perangkat: string;
  tanggal_servis: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  tanggal_klaim: string | null;
  periode_hari: number;
  status_garansi: StatusGaransiApi;
  status_display: StatusGaransiUi;
  keterangan_garansi: string | null;
  total_pembayaran: string | number;
  metode_pembayaran: string | null;
  admin_pembuat: {
    id: string;
    nama: string;
    email: string;
  };
  can_claim: boolean;
};

const KLAIM_GARANSI_BASE_URL = "/api/admin-penjualan/klaim-garansi";

export async function cekKlaimGaransiByNomorTiket(nomorTiket: string) {
  const response = await fetch(
    `${KLAIM_GARANSI_BASE_URL}/${encodeURIComponent(nomorTiket)}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengecek garansi servis");
  }

  return result;
}

export async function klaimGaransiByNomorTiket(nomorTiket: string) {
  const response = await fetch(
    `${KLAIM_GARANSI_BASE_URL}/${encodeURIComponent(nomorTiket)}`,
    {
      method: "POST",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal melakukan klaim garansi");
  }

  return result;
}