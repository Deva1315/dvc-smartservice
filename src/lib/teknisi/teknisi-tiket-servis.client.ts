export type StatusServis =
  | "Belum_Diproses"
  | "Diproses"
  | "Menunggu_Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan";

export type StatusVerifikasi = "Menunggu" | "Diterima" | "Ditolak";

export type TeknisiTiketServisApiItem = {
  id: string;
  nomor_tiket: string;
  sumber_tiket: string;
  alamat_cust: string | null;
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
  drop_point?: {
    id: string;
    nama_drop_point: string;
    alamat: string;
  } | null;
};

const BASE_URL = "/api/teknisi/antrian-tiket-servis";

export async function getAntrianTiketServis(status?: string | null) {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  const response = await fetch(`${BASE_URL}?${params.toString()}`, {
    method: "GET",
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal mengambil antrian tiket servis");
  }

  return result;
}

export async function getDetailTiketServis(nomorTiket: string) {
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

export async function updateStatusTiketServis(
  nomorTiket: string,
  statusServis: StatusServis
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status_servis: statusServis,
      }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal memperbarui status servis");
  }

  return result;
}

export async function createDiagnosaLanjutan(
  nomorTiket: string,
  payload: {
    id_user: string;
    hasil_diagnosa: string;
    catatan_teknisi?: string | null;
  }
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/diagnosa`,
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
    throw new Error(result.message || "Gagal menyimpan diagnosa lanjutan");
  }

  return result;
}

export async function tambahJasaKeTiket(
  nomorTiket: string,
  payload: {
    id_jasa_servis: string;
    jumlah?: number;
  }
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/jasa`,
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
    throw new Error(result.message || "Gagal menambahkan jasa servis");
  }

  return result;
}

export async function tambahSparepartKeTiket(
  nomorTiket: string,
  payload: {
    id_sparepart: string;
    jumlah?: number;
  }
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/sparepart`,
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
    throw new Error(result.message || "Gagal menambahkan sparepart");
  }

  return result;
}

export async function hapusSparepartDariTiket(
  nomorTiket: string,
  detailId: string
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/sparepart/${detailId}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus sparepart");
  }

  return result;
}