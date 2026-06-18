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

export type GetTiketServisNomorResponse =
  | {
      success: true;
      message: string;
      nomor_tiket: string;
    }
  | {
      success: false;
      message: string;
    };

export type CreatePublicTiketServisPayload = {
  nomor_tiket?: string;
  tanggal_masuk: string;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string | null;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  gunakan_drop_point: boolean;
  drop_point_id: string | null;
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

export type UpdatePublicTiketServisPayload = {
  tanggal_masuk: string;
  nama_cust: string;
  phone_cust: string;
  alamat_cust: string | null;
  jenis_perangkat: string;
  merk_perangkat: string | null;
  keluhan: string;
  gunakan_drop_point: boolean;
  drop_point_id: string | null;
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

export type PulihkanPublicTiketServisResponse =
  | {
      success: true;
      message: string;
      tickets: PublicTicketRow[];
    }
  | {
      success: false;
      message: string;
    };

function normalizeTanggalMasuk(value?: string) {
  if (!value) {
    return undefined;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

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

export async function getTiketServisNomorRequest(params?: {
  tanggal_masuk?: string;
}): Promise<GetTiketServisNomorResponse> {
  const searchParams = new URLSearchParams();
  const tanggalMasuk = normalizeTanggalMasuk(params?.tanggal_masuk);

  if (tanggalMasuk) {
    searchParams.set("tanggal_masuk", tanggalMasuk);
  }

  const url = searchParams.toString()
    ? `/api/public/tiket-servis/nomor?${searchParams.toString()}`
    : "/api/public/tiket-servis/nomor";

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      success: false,
      message: data?.message ?? "Gagal membuat nomor tiket.",
    };
  }

  return data as GetTiketServisNomorResponse;
}

export async function createPublicTiketServisRequest(
  payload: CreatePublicTiketServisPayload
): Promise<CreatePublicTiketServisResponse> {
  const normalizedPayload = {
    ...payload,
    tanggal_masuk:
      normalizeTanggalMasuk(payload.tanggal_masuk) ?? payload.tanggal_masuk,
  };

  const response = await fetch("/api/public/tiket-servis", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(normalizedPayload),
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
  payload: UpdatePublicTiketServisPayload
): Promise<UpdatePublicTiketServisResponse> {
  const normalizedPayload = {
    ...payload,
    tanggal_masuk:
      normalizeTanggalMasuk(payload.tanggal_masuk) ?? payload.tanggal_masuk,
  };

  const response = await fetch(
    `/api/public/tiket-servis/${encodeURIComponent(nomorTiket)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(normalizedPayload),
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

export async function pulihkanPublicTiketServisRequest(payload: {
  nomor_tiket: string | null;
  nama_cust: string | null;
  phone_cust: string;
}): Promise<PulihkanPublicTiketServisResponse> {
  const response = await fetch("/api/public/tiket-servis/restore", {
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
      message: data?.message ?? "Gagal memulihkan tiket servis",
    };
  }

  return data as PulihkanPublicTiketServisResponse;
}