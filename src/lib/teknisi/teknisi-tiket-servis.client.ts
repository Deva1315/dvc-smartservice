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
  id_drop_point?: string | null;
  id_diagnosa_ai?: string | null;
  alamat_cust: string | null;
  nama_cust: string;
  phone_cust: string;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  status_verifikasi: StatusVerifikasi;
  status_servis: StatusServis;
  tanggal_masuk: string;
  tanggal_verifikasi?: string | null;
  estimasi_waktu: string | null;
  estimasi_biaya: string | number | null;
  drop_point?: {
    id: string;
    nama_drop_point: string;
    alamat: string;
    phone?: string | null;
    jam_operasional?: string | null;
  } | null;
};

export type DetailTiketServisApiItem = TeknisiTiketServisApiItem & {
  diagnosa_ai?: {
    id: string;
    gejala: string | null;
    gambar_gejala: string | null;
    kemungkinan_penyebab: string | null;
    kemungkinan_solusi: string | null;
    saran_tindakan: string | null;
  } | null;
  diagnosa_lanjutan: {
    id: string;
    id_tiket_servis?: string;
    id_user?: string;
    hasil_diagnosa: string;
    catatan_teknisi: string | null;
    users?: {
      id: string;
      nama: string;
      email: string;
    } | null;
  }[];
  detail_tiket_servis: {
    id: string;
    id_tiket_servis?: string;
    id_jasa_servis: string | null;
    id_sparepart: string | null;
    jumlah: string | number;
    harga: string | number;
    subtotal: string | number;
    jasa_servis?: {
      id: string;
      nama_jasa_servis: string;
      deskripsi?: string | null;
      harga: string | number;
      jam_operasional?: string | null;
    } | null;
    sparepart?: {
      id: string;
      nama_sparepart: string;
      kode_sparepart: string;
      merk_sparepart?: string | null;
      harga: string | number;
      stock?: string | number;
      suppliers?: {
        id: string;
        nama_supplier: string;
        alamat: string | null;
        phone: string | null;
      } | null;
    } | null;
  }[];
  pembayaran_servis?: unknown[];
  garansi?: unknown[];
};

const BASE_URL = "/api/teknisi/antrian-tiket-servis";

export async function getAntrianTiketServis(status?: string | null) {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  const url = params.toString()
    ? `${BASE_URL}?${params.toString()}`
    : BASE_URL;

  const response = await fetch(url, {
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
  payload: {
    status_servis: StatusServis;
    estimasi_waktu?: string | null;
  }
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/status`,
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

export async function hapusJasaDariTiket(
  nomorTiket: string,
  detailId: string
) {
  const response = await fetch(
    `${BASE_URL}/${encodeURIComponent(nomorTiket)}/jasa/${encodeURIComponent(
      detailId
    )}`,
    {
      method: "DELETE",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Gagal menghapus jasa servis");
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
    `${BASE_URL}/${encodeURIComponent(
      nomorTiket
    )}/sparepart/${encodeURIComponent(detailId)}`,
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

