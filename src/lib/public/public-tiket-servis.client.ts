export type PublicTicketStatusVerifikasi = "Menunggu" | "Diterima" | "Ditolak";
export type PublicTicketStatusServis =
  | "Belum_Diproses"
  | "Diproses"
  | "Menunggu_Sparepart"
  | "Selesai"
  | "Diambil"
  | "Dibatalkan";

export type PublicTicketRow = {
  id: string;
  nomor_tiket: string;
  tanggal_masuk: string;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string | null;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  gunakan_drop_point: boolean;
  drop_point_id: string | null;
  drop_point_nama: string | null;
  sumber_tiket: "Guest" | "Admin_Penjualan";
  status_verifikasi: PublicTicketStatusVerifikasi;
  status_servis: PublicTicketStatusServis;
  guest_session_id: string | null;
};

export type GetPublicTiketServisListResponse =
  | {
      success: true;
      message: string;
      tickets: PublicTicketRow[];
    }
  | {
      success: false;
      message: string;
    };

export type CreatePublicTiketServisResponse =
  | {
      success: true;
      message: string;
      ticket: PublicTicketRow;
    }
  | {
      success: false;
      message: string;
    };

export type UpdatePublicTiketServisResponse =
  | {
      success: true;
      message: string;
      ticket: PublicTicketRow;
    }
  | {
      success: false;
      message: string;
    };

export async function getPublicTiketServisListRequest(): Promise<GetPublicTiketServisListResponse> {
  const response = await fetch("/api/public/tiket-servis", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal mengambil tiket servis.",
    };
  }

  return data as GetPublicTiketServisListResponse;
}

export async function createPublicTiketServisRequest(payload: {
  tanggal_masuk: string;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string | null;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  gunakan_drop_point: boolean;
  drop_point_id: string | null;
}): Promise<CreatePublicTiketServisResponse> {
  const response = await fetch("/api/public/tiket-servis", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal membuat tiket servis.",
    };
  }

  return data as CreatePublicTiketServisResponse;
}

export async function updatePublicTiketServisRequest(
  nomorTiket: string,
  payload: {
    tanggal_masuk: string;
    nama_cust: string;
    phone_cust: string;
    alamat_cust: string | null;
    jenis_perangkat: string;
    merk_perangkat: string | null;
    keluhan: string;
    gunakan_drop_point: boolean;
    drop_point_id: string | null;
  }
): Promise<UpdatePublicTiketServisResponse> {
  const response = await fetch(
    `/api/public/tiket-servis/${encodeURIComponent(nomorTiket)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal memperbarui tiket servis.",
    };
  }

  return data as UpdatePublicTiketServisResponse;
}