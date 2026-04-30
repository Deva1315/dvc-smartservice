export type StatusVerifikasi = "Menunggu" | "Diterima" | "Ditolak";

export type StatusServis =
  | "Belum_Diproses"
  | "Diproses"
  | "Menunggu_Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan";

export type AdminPenjualanTiketApiItem = {
  id: string;
  nomor_tiket: string;
  sumber_tiket: string;
  id_drop_point: string | null;
  id_diagnosa_ai: string | null;
  alamat_cust: string | null;
  nama_cust: string;
  phone_cust: string;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  status_verifikasi: StatusVerifikasi;
  status_servis: StatusServis;
  alasan_penolakan: string | null;
  tanggal_masuk: string;
  tanggal_verifikasi: string | null;
  estimasi_waktu: string | null;
  estimasi_biaya: string;
  guest_session_id: string | null;
  drop_point?: {
    id: string;
    nama_drop_point: string;
    alamat: string;
    phone: string | null;
    jam_operasional: string | null;
  } | null;
};

export type CreateTiketServisPayload = {
  nomor_tiket?: string;
  nama_cust: string;
  phone_cust: string;
  alamat_cust?: string | null;
  jenis_perangkat: string;
  merk_perangkat?: string | null;
  keluhan: string;
  id_drop_point?: string | null;
};

export type GetAdminPenjualanNomorTiketResponse =
  | {
      success: true;
      message: string;
      nomor_tiket: string;
    }
  | {
      success: false;
      message: string;
    };

const BASE_URL = "/api/admin-penjualan/tiket-servis";

export async function getAdminPenjualanTiketServis(params?: {
  search?: string;
  status_verifikasi?: string | null;
  status_servis?: string | null;
}) {
  const searchParams = new URLSearchParams();

  if (params?.search) searchParams.set("search", params.search);
  if (params?.status_verifikasi) {
    searchParams.set("status_verifikasi", params.status_verifikasi);
  }
  if (params?.status_servis) {
    searchParams.set("status_servis", params.status_servis);
  }

  const url = searchParams.toString()
    ? `${BASE_URL}?${searchParams.toString()}`
    : BASE_URL;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data tiket servis");
  }

  return result;
}

export async function getAdminPenjualanNomorTiketRequest(params?: {
  tanggal_masuk?: string;
}): Promise<GetAdminPenjualanNomorTiketResponse> {
  const searchParams = new URLSearchParams();

  if (params?.tanggal_masuk) {
    searchParams.set("tanggal_masuk", params.tanggal_masuk);
  }

  const url = searchParams.toString()
    ? `/api/admin-penjualan/tiket-servis/nomor?${searchParams.toString()}`
    : "/api/admin-penjualan/tiket-servis/nomor";

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal membuat nomor tiket");
  }

  return result as GetAdminPenjualanNomorTiketResponse;
}

export async function createAdminPenjualanTiketServis(
  payload: CreateTiketServisPayload
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
    throw new Error(result.message || "Gagal membuat tiket servis");
  }

  return result;
}

export type DetailTiketServisApiItem = AdminPenjualanTiketApiItem & {
  drop_point?: {
    id: string;
    nama_drop_point: string;
    alamat: string;
    phone: string | null;
    jam_operasional: string | null;
  } | null;
  diagnosa_ai?: {
    id: string;
    gejala: string | null;
    gambar_gejala: string | null;
    kemungkinan_penyebab: string | null;
    kemungkinan_solusi: string | null;
    saran_tindakan: string | null;
  } | null;
  detail_tiket_servis: {
    id: string;
    id_jasa_servis: string | null;
    id_sparepart: string | null;
    jumlah: string;
    harga: string;
    subtotal: string;
    jasa_servis?: {
      id: string;
      nama_jasa_servis: string;
      harga: string;
    } | null;
    sparepart?: {
      id: string;
      nama_sparepart: string;
      kode_sparepart: string;
      harga: string;
    } | null;
  }[];
  diagnosa_lanjutan: {
    id: string;
    hasil_diagnosa: string;
    catatan_teknisi: string | null;
    users?: {
      id: string;
      nama: string;
      email: string;
    };
  }[];
  garansi: unknown[];
  pembayaran_servis: unknown[];
};

export type TeknisiApiItem = {
  id: string;
  nama: string;
  email: string;
};

export async function getDetailAdminPenjualanTiketServis(nomorTiket: string) {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(nomorTiket)}`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil detail tiket servis");
  }

  return result;
}

export async function verifikasiAdminPenjualanTiketServis(
  nomorTiket: string,
  payload:
    | {
        status_verifikasi: "Diterima";
        id_user: string;
      }
    | {
        status_verifikasi: "Ditolak";
        alasan_penolakan: string;
      }
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/verifikasi`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memverifikasi tiket servis");
  }

  return result;
}

export async function getTeknisiAdminPenjualan() {
  const response = await fetch("/api/admin-penjualan/teknisi", {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data teknisi");
  }

  return result;
}

export type PembayaranServisStatus = "Dibayar" | "Belum_Bayar" | "Dibatalkan";

export type PembayaranServisDetailData = {
  tiket: {
    id: string;
    nomor_tiket: string;
    nama_cust: string;
    phone_cust: string;
    jenis_perangkat: string;
    merk_perangkat: string | null;
    keluhan: string;
    status_verifikasi: StatusVerifikasi;
    status_servis: StatusServis;
    tanggal_masuk: string;
    estimasi_waktu: string | null;
    estimasi_biaya: string;
  };
  rincian_jasa: {
    id: string;
    id_jasa_servis: string;
    nama: string;
    jumlah: number;
    harga: number;
    subtotal: number;
  }[];
  rincian_sparepart: {
    id: string;
    id_sparepart: string;
    nama: string;
    kode_sparepart: string;
    jumlah: number;
    harga: number;
    subtotal: number;
  }[];
  subtotal_jasa: number;
  subtotal_sparepart: number;
  total_pembayaran: number;
  pembayaran: {
    id: string;
    tanggal_pembayaran: string;
    total_pembayaran: string;
    metode_pembayaran: string;
    status_pembayaran: PembayaranServisStatus;
    users: {
      id: string;
      nama: string;
      email: string;
    };
  } | null;
};

export async function getPembayaranServisDetail(nomorTiket: string) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/pembayaran`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil data pembayaran servis");
  }

  return result;
}

export async function simpanPembayaranServis(
  nomorTiket: string,
  payload: {
    metode_pembayaran: string;
  }
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/pembayaran`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menyimpan pembayaran servis");
  }

  return result;
}